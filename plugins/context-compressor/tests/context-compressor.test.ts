import { promises as fs } from "node:fs";
import { execFile } from "node:child_process";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { describe, expect, it } from "vitest";
import { analyzeProject } from "../src/analyzers/project.js";
import { scoreScan } from "../src/analyzers/score.js";
import { renderBrief } from "../src/reporters/brief.js";
import { checkMemory } from "../src/reporters/check.js";
import { readManualNotes, renderMemory, writeMemory } from "../src/reporters/memory.js";

const root = path.resolve("examples");
const fixtures = path.resolve("tests", "fixtures");
const execFileAsync = promisify(execFile);

describe("Context Compressor", () => {
  it("detects frameworks and package managers", async () => {
    const next = await analyzeProject(path.join(root, "nextjs-supabase-app"));
    expect(next.frameworks.map((item) => item.name)).toContain("Next.js");
    expect(next.databases.map((item) => item.name)).toContain("Supabase");
    expect(next.packageManager).toBe("pnpm");

    const vite = await analyzeProject(path.join(root, "vite-react-app"));
    expect(vite.frameworks.map((item) => item.name)).toContain("Vite");
    expect(vite.packageManager).toBe("npm");
  });

  it("extracts env vars and API routes", async () => {
    const next = await analyzeProject(path.join(root, "nextjs-supabase-app"));
    expect(next.envVars.map((item) => item.name)).toContain("NEXT_PUBLIC_SUPABASE_URL");
    expect(next.routes.map((item) => item.route)).toContain("/api/health");
    expect(next.routes.map((item) => item.route)).toContain("/api/users/:id");
    expect(next.envVars.map((item) => item.name)).not.toContain("HTTP_OK");

    const express = await analyzeProject(path.join(root, "node-express-api"));
    expect(express.routes.map((item) => item.route)).toContain("GET /users");
    expect(express.routes.map((item) => item.route)).toContain("POST /users");
  });

  it("normalizes Next.js dynamic, catch-all, optional catch-all, and route-group segments", async () => {
    const scan = await analyzeProject(path.join(fixtures, "nextjs-supabase-app"));
    expect(scan.routes.map((item) => item.route)).toContain("/api/users/:id*?");
    expect(scan.routes.map((item) => item.route)).toContain("/api/posts/:slug*");
    expect(scan.routes.map((item) => item.route)).toContain("/api/legacy/:id");
    expect(scan.routes.every((item) => !item.route.includes("(dashboard)"))).toBe(true);
    expect(scan.routes.every((item) => item.confidence)).toBe(true);
    expect(scan.frameworkAnalyses.map((item) => item.name)).toContain("Next.js App Router");
    expect(scan.frameworkAnalyses.map((item) => item.name)).toContain("Next.js Pages Router");
  });

  it("detects env vars from AST access, destructuring, zod env files, and env examples without values", async () => {
    const next = await analyzeProject(path.join(fixtures, "nextjs-supabase-app"));
    expect(next.envVars.map((item) => item.name)).toContain("NEXT_PUBLIC_SUPABASE_URL");
    expect(next.envVars.map((item) => item.name)).toContain("SUPABASE_SERVICE_ROLE_KEY");
    expect(next.envVars.find((item) => item.name === "SUPABASE_SERVICE_ROLE_KEY")?.files).toContain(".env.example");

    const express = await analyzeProject(path.join(fixtures, "express-prisma-api"));
    expect(express.envVars.map((item) => item.name)).toContain("DATABASE_URL");
    expect(express.envVars.map((item) => item.name)).toContain("JWT_SECRET");
    expect(express.envVars.every((item) => !item.evidence.some((value) => value.includes("postgres://")))).toBe(true);

    const vite = await analyzeProject(path.join(fixtures, "vite-react-app"));
    expect(vite.envVars.map((item) => item.name)).toContain("VITE_API_URL");
  });

  it("handles route and env edge cases conservatively", async () => {
    const temp = await fs.mkdtemp(path.join(os.tmpdir(), "context-compressor-edge-"));
    await fs.mkdir(path.join(temp, "app", "api"), { recursive: true });
    await fs.mkdir(path.join(temp, "src"), { recursive: true });
    await fs.writeFile(path.join(temp, "package.json"), JSON.stringify({ dependencies: { express: "latest", next: "latest" } }), "utf8");
    await fs.writeFile(path.join(temp, "app", "api", "route.ts"), "export function GET() {}", "utf8");
    await fs.writeFile(path.join(temp, ".env.example"), "API_KEY = example\n", "utf8");
    await fs.writeFile(path.join(temp, "src", "server.ts"), [
      "import express from 'express';",
      "const app = express();",
      "app.route('/status').get((_req, res) => res.end()).post((_req, res) => res.end());",
      "const { DATABASE_URL, JWT_SECRET: secret, ...rest } = process.env;",
      "console.log(process.env['FEATURE_FLAG'], secret, rest);"
    ].join("\n"), "utf8");
    const scan = await analyzeProject(temp);
    expect(scan.routes.map((item) => item.route)).toContain("/api");
    expect(scan.routes.map((item) => item.route)).toContain("GET /status");
    expect(scan.routes.map((item) => item.route)).toContain("POST /status");
    expect(scan.envVars.map((item) => item.name)).toEqual(expect.arrayContaining(["API_KEY", "DATABASE_URL", "FEATURE_FLAG", "JWT_SECRET"]));
    expect(scan.envVars.map((item) => item.name)).not.toContain("rest");
  });

  it("detects package managers and monorepo workspace package summaries", async () => {
    const pnpm = await analyzeProject(path.join(fixtures, "nextjs-supabase-app"));
    expect(pnpm.packageManager).toBe("pnpm");

    const npm = await analyzeProject(path.join(fixtures, "vite-react-app"));
    expect(npm.packageManager).toBe("npm");

    const monorepo = await analyzeProject(path.join(fixtures, "monorepo-basic"));
    expect(monorepo.frameworks.map((item) => item.name)).toContain("pnpm workspaces");
    expect(monorepo.frameworks.map((item) => item.name)).toContain("Turborepo");
    expect(monorepo.workspacePackages.map((pkg) => pkg.path)).toEqual(["packages/api", "packages/web"]);
  });

  it("ranks important files and extracts TODOs", async () => {
    const scan = await analyzeProject(path.join(root, "nextjs-supabase-app"));
    expect(scan.importantFiles.map((item) => item.file)).toContain("package.json");
    expect(scan.todos.some((todo) => todo.text.includes("TODO"))).toBe(true);
  });

  it("ranks files by real agent-useful signals and marks high-risk files", async () => {
    const scan = await analyzeProject(path.join(root, "nextjs-supabase-app"));
    const env = scan.importantFiles.find((file) => file.file === "src/lib/env.ts");
    const auth = scan.importantFiles.find((file) => file.file === "src/lib/auth.ts");
    const payments = scan.importantFiles.find((file) => file.file === "src/lib/payments.ts");
    const policy = scan.importantFiles.find((file) => file.file === "supabase/migrations/001_policy.sql");
    expect(env?.signals).toContain("environment validation");
    expect(env?.signals.some((signal) => signal.startsWith("imported by"))).toBe(true);
    expect(auth?.signals).toContain("auth logic");
    expect(payments?.signals).toContain("payment logic");
    expect(policy?.highRisk).toBe(true);
    expect(scan.highRiskFiles.map((file) => file.file)).toContain("src/lib/env.ts");
  });

  it("builds a dependency graph summary", async () => {
    const scan = await analyzeProject(path.join(root, "nextjs-supabase-app"));
    expect(scan.dependencyMap.coreEntry).toContain("app/dashboard/page.tsx");
    expect(scan.dependencyMap.apiLayer).toContain("app/api/health/route.ts");
    expect(scan.dependencyMap.dataLayer).toContain("src/lib/db.ts");
    expect(scan.dependencyMap.uiLayer).toContain("app/dashboard/page.tsx");
    expect(scan.dependencyMap.configLayer).toContain("vercel.json");
  });

  it("renders token-budget modes under their target line counts", async () => {
    const scan = await analyzeProject(path.join(root, "nextjs-supabase-app"));
    expect(renderMemory(scan, "", "tiny").split(/\r?\n/).length).toBeLessThanOrEqual(100);
    expect(renderMemory(scan, "", "standard").split(/\r?\n/).length).toBeLessThanOrEqual(250);
    expect(renderMemory(scan, "", "detailed").split(/\r?\n/).length).toBeLessThanOrEqual(500);
  });

  it("renders confidence/evidence formatting and honest generated sections", async () => {
    const scan = await analyzeProject(path.join(fixtures, "express-prisma-api"));
    const memory = renderMemory(scan, "", "standard");
    expect(memory).toContain("## Detected Facts");
    expect(memory).toContain("## Reasonable Assumptions");
    expect(memory).toContain("## Unknowns / Needs Confirmation");
    expect(memory).toContain("confidence:");
    expect(memory).toContain("Evidence:");
    expect(memory).toContain("may be");
  });

  it("keeps generated memory compact without duplicate evidence prose", async () => {
    const scan = await analyzeProject(path.join(root, "nextjs-supabase-app"));
    const memory = renderMemory(scan, "", "standard");
    expect(memory).not.toContain("Evidence: environment validation");
    expect(memory).toContain("Values omitted.");
    expect(memory.split(/\r?\n/).length).toBeLessThanOrEqual(250);
  });

  it("supports CLI json and explain commands", async () => {
    await execFileAsync(process.execPath, ["dist/cli.js", "scan", "--json", "--path", path.join(fixtures, "vite-react-app")], { cwd: path.resolve(".") });
    const json = await execFileAsync(process.execPath, ["dist/cli.js", "scan", "--json", "--path", path.join(fixtures, "vite-react-app")], { cwd: path.resolve(".") });
    expect(JSON.parse(json.stdout).frameworks.map((item: { name: string }) => item.name)).toContain("Vite");
    const explain = await execFileAsync(process.execPath, ["dist/cli.js", "explain"], { cwd: path.resolve(".") });
    expect(explain.stdout).toContain("Confidence levels");
  });

  it("rejects broken CLI flags", async () => {
    await expect(execFileAsync(process.execPath, ["dist/cli.js", "scan", "--bogus"], { cwd: path.resolve(".") })).rejects.toMatchObject({
      stderr: expect.stringContaining('Unknown option "--bogus"')
    });
    await expect(execFileAsync(process.execPath, ["dist/cli.js", "scan", "--path"], { cwd: path.resolve(".") })).rejects.toMatchObject({
      stderr: expect.stringContaining("Missing value for --path")
    });
  });

  it("creates task briefings with relevant files and touch warnings", async () => {
    const scan = await analyzeProject(path.join(root, "nextjs-supabase-app"));
    const brief = renderBrief(scan, "fix login bug");
    expect(brief).toContain("src/lib/auth.ts");
    expect(brief).toContain("Things Not To Touch Casually");
    expect(brief).toContain("Commands To Run");
  });

  it("includes git metadata when git is available", async () => {
    const temp = await fs.mkdtemp(path.join(os.tmpdir(), "context-compressor-git-"));
    await copyDir(path.join(root, "vite-react-app"), temp);
    const gitReady = await initGit(temp);
    const scan = await analyzeProject(temp);
    if (gitReady) {
      expect(scan.git.available).toBe(true);
      expect(scan.git.branch).not.toBe("Unknown");
      expect(scan.git.recentCommits.length).toBeGreaterThan(0);
      expect(scan.git.hasUncommittedChanges).toBe(true);
      expect(scan.git.changedFiles).toContain("src/main.tsx");
    } else {
      expect(scan.git.available).toBe(false);
    }
  });

  it("handles git renames and strict stale checks", async () => {
    const temp = await fs.mkdtemp(path.join(os.tmpdir(), "context-compressor-git-"));
    await copyDir(path.join(root, "vite-react-app"), temp);
    const gitReady = await initGit(temp);
    if (!gitReady) return;
    await execFileAsync("git", ["mv", "src/main.tsx", "src/app.tsx"], { cwd: temp });
    let scan = await analyzeProject(temp);
    expect(scan.git.changedFiles).toContain("src/app.tsx");
    await writeMemory(temp, scan, false);
    await new Promise((resolve) => setTimeout(resolve, 20));
    await fs.appendFile(path.join(temp, "src", "app.tsx"), "\nconsole.log('newer');\n", "utf8");
    scan = await analyzeProject(temp);
    const check = await checkMemory(temp, scan, 300, true);
    expect(check.ok).toBe(false);
    expect(check.report).toContain("older than recent important file changes");
  });

  it("scopes git changed files to the scanned root", async () => {
    const temp = await fs.mkdtemp(path.join(os.tmpdir(), "context-compressor-nested-git-"));
    await fs.mkdir(path.join(temp, "packages", "app", "src"), { recursive: true });
    await fs.writeFile(path.join(temp, "README.md"), "root\n", "utf8");
    await fs.writeFile(path.join(temp, "packages", "app", "package.json"), JSON.stringify({ dependencies: { vite: "latest" } }), "utf8");
    await fs.writeFile(path.join(temp, "packages", "app", "src", "main.tsx"), "console.log('app');\n", "utf8");
    const gitReady = await initGit(temp);
    if (!gitReady) return;
    await fs.appendFile(path.join(temp, "README.md"), "changed outside app\n", "utf8");
    const scan = await analyzeProject(path.join(temp, "packages", "app"));
    expect(scan.git.changedFiles).not.toContain("README.md");
  });

  it("detects stale SQL references", async () => {
    const temp = await fs.mkdtemp(path.join(os.tmpdir(), "context-compressor-sql-"));
    await copyDir(path.join(root, "nextjs-supabase-app"), temp);
    const scan = await analyzeProject(temp);
    await writeMemory(temp, scan, false);
    await fs.appendFile(path.join(temp, "PROJECT_MEMORY.md"), "\n`supabase/migrations/missing.sql`\n", "utf8");
    const check = await checkMemory(temp, scan, 300, false);
    expect(check.ok).toBe(false);
    expect(check.report).toContain("missing.sql");
  });

  it("generates memory and preserves manual notes on update", async () => {
    const temp = await fs.mkdtemp(path.join(os.tmpdir(), "context-compressor-"));
    await copyDir(path.join(root, "vite-react-app"), temp);
    let scan = await analyzeProject(temp);
    await writeMemory(temp, scan, false);
    const memoryPath = path.join(temp, "PROJECT_MEMORY.md");
    let text = await fs.readFile(memoryPath, "utf8");
    text = text.replace("Add durable human notes here. These lines are preserved by `context-compress update`.", "Manual deployment note.");
    await fs.writeFile(memoryPath, text, "utf8");
    scan = await analyzeProject(temp);
    await writeMemory(temp, scan, true);
    expect(await readManualNotes(memoryPath)).toBe("Manual deployment note.");
  });

  it("detects stale memory references and scores context quality", async () => {
    const temp = await fs.mkdtemp(path.join(os.tmpdir(), "context-compressor-"));
    await copyDir(path.join(root, "node-express-api"), temp);
    const scan = await analyzeProject(temp);
    await writeMemory(temp, scan, false);
    await fs.appendFile(path.join(temp, "PROJECT_MEMORY.md"), "\n`src/missing.ts`\n", "utf8");
    const check = await checkMemory(temp, scan, 300, false);
    expect(check.ok).toBe(false);
    expect(check.report).toContain("missing file");
    const { score: _score, ...withoutScore } = scan;
    expect(scoreScan(withoutScore)).toBeGreaterThan(50);
  });
});

async function copyDir(source: string, target: string): Promise<void> {
  await fs.mkdir(target, { recursive: true });
  for (const entry of await fs.readdir(source, { withFileTypes: true })) {
    const from = path.join(source, entry.name);
    const to = path.join(target, entry.name);
    if (entry.isDirectory()) await copyDir(from, to);
    else await fs.copyFile(from, to);
  }
}

async function initGit(rootDir: string): Promise<boolean> {
  try {
    await execFileAsync("git", ["init"], { cwd: rootDir });
    await execFileAsync("git", ["config", "user.email", "test@example.com"], { cwd: rootDir });
    await execFileAsync("git", ["config", "user.name", "Test User"], { cwd: rootDir });
    await execFileAsync("git", ["add", "."], { cwd: rootDir });
    await execFileAsync("git", ["commit", "-m", "initial fixture"], { cwd: rootDir });
    await fs.appendFile(path.join(rootDir, "src", "main.tsx"), "\nconsole.log('changed');\n", "utf8");
    return true;
  } catch {
    return false;
  }
}
