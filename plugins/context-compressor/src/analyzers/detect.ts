import path from "node:path";
import type { DependencyMap, DetectedTool, EnvVarInfo, ImportantFile, RepoFile, RouteInfo, TodoItem } from "../types.js";
import { detectEnvVarsFromAst } from "./static.js";

function hasFile(files: RepoFile[], file: string): boolean {
  return files.some((item) => item.path === file || item.path.endsWith(`/${file}`));
}

function depNames(packageJson: Record<string, unknown>): string[] {
  const deps = {
    ...(packageJson.dependencies as Record<string, string> | undefined),
    ...(packageJson.devDependencies as Record<string, string> | undefined)
  };
  return Object.keys(deps).sort();
}

export function readPackage(files: RepoFile[]): { json: Record<string, unknown>; dependencies: string[] } {
  const pkg = files.find((file) => file.path === "package.json");
  if (!pkg?.text) return { json: {}, dependencies: [] };
  try {
    const json = JSON.parse(pkg.text) as Record<string, unknown>;
    return { json, dependencies: depNames(json) };
  } catch {
    return { json: {}, dependencies: [] };
  }
}

export function detectPackageManager(files: RepoFile[]): string {
  if (hasFile(files, "pnpm-lock.yaml")) return "pnpm";
  if (hasFile(files, "yarn.lock")) return "yarn";
  if (hasFile(files, "bun.lockb") || hasFile(files, "bun.lock")) return "bun";
  if (hasFile(files, "package-lock.json")) return "npm";
  return hasFile(files, "package.json") ? "npm (assumed)" : "Unknown";
}

function tool(name: string, confidence: DetectedTool["confidence"], evidence: string[], explanation?: string): DetectedTool {
  return { name, confidence, evidence, explanation };
}

export function detectLanguages(files: RepoFile[]): DetectedTool[] {
  const found: DetectedTool[] = [];
  if (files.some((file) => [".ts", ".tsx"].includes(path.extname(file.path)))) found.push(tool("TypeScript", "high", ["*.ts/*.tsx files"], "TypeScript source files were found."));
  if (files.some((file) => [".js", ".jsx", ".mjs", ".cjs"].includes(path.extname(file.path)))) found.push(tool("JavaScript", "high", ["*.js/*.jsx files"], "JavaScript source files were found."));
  if (files.some((file) => path.extname(file.path) === ".py")) found.push(tool("Python", "medium", ["*.py files"], "Python files were found."));
  return found.length ? found : [tool("Unknown", "low", ["No common language files found"], "No common source file extensions were found.")];
}

export function detectByDependencies(files: RepoFile[], dependencies: string[]): {
  frameworks: DetectedTool[];
  databases: DetectedTool[];
  auth: DetectedTool[];
  deployment: DetectedTool[];
  testing: DetectedTool[];
  styling: DetectedTool[];
} {
  const has = (name: string) => dependencies.includes(name);
  const frameworks: DetectedTool[] = [];
  if (has("next")) frameworks.push(tool("Next.js", "high", ["package.json dependency: next"]));
  if (has("vite")) frameworks.push(tool("Vite", "high", ["package.json dependency: vite"]));
  if (has("react")) frameworks.push(tool("React", "high", ["package.json dependency: react"]));
  if (has("express")) frameworks.push(tool("Express", "high", ["package.json dependency: express"]));
  if (has("@nestjs/core")) frameworks.push(tool("NestJS", "high", ["package.json dependency: @nestjs/core"]));
  if (has("@remix-run/node") || has("@remix-run/react")) frameworks.push(tool("Remix", "high", ["Remix dependencies"]));
  if (has("astro")) frameworks.push(tool("Astro", "high", ["package.json dependency: astro"]));
  if (has("@sveltejs/kit")) frameworks.push(tool("SvelteKit", "high", ["package.json dependency: @sveltejs/kit"]));

  const databases: DetectedTool[] = [];
  if (has("@supabase/supabase-js")) databases.push(tool("Supabase", "high", ["@supabase/supabase-js"]));
  if (has("prisma") || has("@prisma/client") || hasFile(files, "schema.prisma")) databases.push(tool("Prisma", "high", ["Prisma package or schema"]));
  if (has("drizzle-orm") || hasFile(files, "drizzle.config.ts")) databases.push(tool("Drizzle", "high", ["Drizzle package or config"]));
  if (has("firebase")) databases.push(tool("Firebase", "medium", ["firebase dependency"]));
  if (dependencies.some((dep) => dep.includes("neon"))) databases.push(tool("Neon", "medium", ["Neon dependency"]));
  if (dependencies.some((dep) => dep.includes("turso") || dep.includes("libsql"))) databases.push(tool("Turso", "medium", ["Turso/libsql dependency"]));

  const auth: DetectedTool[] = [];
  if (has("@supabase/supabase-js")) auth.push(tool("Supabase Auth", "medium", ["Supabase client dependency"]));
  if (has("next-auth") || has("@auth/core")) auth.push(tool("NextAuth/Auth.js", "high", ["Auth dependency"]));
  if (has("firebase")) auth.push(tool("Firebase Auth", "medium", ["firebase dependency"]));
  if (has("@clerk/nextjs") || has("@clerk/clerk-js")) auth.push(tool("Clerk", "high", ["Clerk dependency"]));
  if (files.some((file) => /auth|session|jwt|passport/i.test(file.path))) auth.push(tool("Custom auth", "low", ["Auth-like file names"]));

  const deployment: DetectedTool[] = [];
  if (hasFile(files, "vercel.json")) deployment.push(tool("Vercel", "high", ["vercel.json"]));
  if (hasFile(files, "netlify.toml")) deployment.push(tool("Netlify", "high", ["netlify.toml"]));
  if (hasFile(files, "wrangler.toml")) deployment.push(tool("Cloudflare", "high", ["wrangler.toml"]));
  if (files.some((file) => file.path.includes("Dockerfile") || file.path === "docker-compose.yml")) deployment.push(tool("Docker", "high", ["Docker files"]));
  if (files.some((file) => file.path.startsWith(".github/workflows/"))) deployment.push(tool("GitHub Actions", "high", [".github/workflows"]));
  if (files.some((file) => file.path === "turbo.json")) deployment.push(tool("Turborepo", "high", ["turbo.json"], "Turbo build pipeline config detected."));
  if (files.some((file) => file.path === "pnpm-workspace.yaml")) deployment.push(tool("pnpm workspace", "high", ["pnpm-workspace.yaml"], "pnpm workspace manifest detected."));

  const testing: DetectedTool[] = [];
  if (has("vitest")) testing.push(tool("Vitest", "high", ["vitest dependency"]));
  if (has("jest")) testing.push(tool("Jest", "high", ["jest dependency"]));
  if (has("@playwright/test")) testing.push(tool("Playwright", "high", ["@playwright/test dependency"]));
  if (has("cypress")) testing.push(tool("Cypress", "high", ["cypress dependency"]));

  const styling: DetectedTool[] = [];
  if (has("tailwindcss") || hasFile(files, "tailwind.config.ts") || hasFile(files, "tailwind.config.js")) styling.push(tool("Tailwind", "high", ["Tailwind config or dependency"]));
  if (files.some((file) => file.path.endsWith(".module.css"))) styling.push(tool("CSS modules", "high", ["*.module.css files"]));
  if (files.some((file) => file.path.endsWith(".css"))) styling.push(tool("Plain CSS", "medium", ["*.css files"]));
  if (dependencies.some((dep) => dep.includes("shadcn") || dep === "class-variance-authority")) styling.push(tool("shadcn/ui", "medium", ["shadcn-adjacent dependencies"]));

  return { frameworks, databases, auth, deployment, testing, styling };
}

export function detectEnvVars(files: RepoFile[]): EnvVarInfo[] {
  const map = new Map<string, Set<string>>();
  const confidence = new Map<string, EnvVarInfo["confidence"]>();
  const codePatterns = [/process\.env\.([A-Z0-9_]+)/g, /import\.meta\.env\.([A-Z0-9_]+)/g];
  const destructuringPattern = /\b(?:const|let|var)\s*\{([^}]+)\}\s*=\s*process\.env/g;
  const envFilePattern = /^\s*(?:export\s+)?([A-Z][A-Z0-9_]{2,})\s*=/gm;
  for (const astVar of detectEnvVarsFromAst(files)) {
    map.set(astVar.name, new Set(astVar.files));
    confidence.set(astVar.name, "high");
  }
  for (const file of files) {
    if (!file.text) continue;
    const patterns = file.path.split("/").pop()?.startsWith(".env") ? [...codePatterns, envFilePattern] : codePatterns;
    for (const pattern of patterns) {
      for (const match of file.text.matchAll(pattern)) {
        const name = match[1];
        if (!name || name === "NODE_ENV") continue;
        if (!map.has(name)) map.set(name, new Set());
        map.get(name)?.add(file.path);
        if (!confidence.has(name)) confidence.set(name, file.path.includes(".example") ? "high" : "medium");
      }
    }
    for (const match of file.text.matchAll(destructuringPattern)) {
      for (const raw of match[1].split(",")) {
        const name = raw.trim().replace(/^\.\.\./, "").split(/:|\s|=/)[0];
        if (!name || name === "NODE_ENV" || raw.trim().startsWith("...")) continue;
        if (!map.has(name)) map.set(name, new Set());
        map.get(name)?.add(file.path);
        if (!confidence.has(name)) confidence.set(name, "medium");
      }
    }
    if (/zod|envalid|envsafe/i.test(file.text) && /env/i.test(file.path)) {
      for (const match of file.text.matchAll(/\b([A-Z][A-Z0-9_]{2,})\b/g)) {
        const name = match[1];
        if (["NODE_ENV", "HTTP_OK"].includes(name)) continue;
        if (!map.has(name)) map.set(name, new Set());
        map.get(name)?.add(file.path);
        if (!confidence.has(name)) confidence.set(name, "medium");
      }
    }
  }
  return [...map.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([name, paths]) => ({
    name,
    files: [...paths].sort(),
    likelyPurpose: inferEnvPurpose(name),
    confidence: confidence.get(name) ?? "low",
    evidence: [...paths].sort(),
    explanation: confidence.get(name) === "high" ? "Detected from AST parsing or env example files; values are intentionally omitted." : "Detected from environment variable patterns; values are intentionally omitted."
  }));
}

function inferEnvPurpose(name: string): string {
  if (/DATABASE|DB|POSTGRES/i.test(name)) return "Database connection/configuration";
  if (/AUTH|JWT|SESSION|SECRET/i.test(name)) return "Authentication or secret material";
  if (/SUPABASE/i.test(name)) return "Supabase configuration";
  if (/API|TOKEN|KEY/i.test(name)) return "External API credential or endpoint";
  if (/URL|HOST/i.test(name)) return "Service URL/host";
  return "Needs confirmation";
}

export function detectRoutes(files: RepoFile[]): RouteInfo[] {
  const routes: RouteInfo[] = [];
  for (const file of files) {
    if (!file.text) continue;
    const normalized = file.path;
    const nextApp = normalized.match(/(?:^|\/)app\/api(?:\/(.*))?\/route\.(ts|js)$/);
    if (nextApp) routes.push({ route: normalizeNextRoute(`/api/${nextApp[1] ?? ""}`), file: normalized, kind: "next-app-api", confidence: "high", evidence: [normalized], explanation: "File matches Next.js app/api/**/route convention." });
    const nextPages = normalized.match(/(?:^|\/)pages\/api\/(.+)\.(ts|js|tsx|jsx)$/);
    if (nextPages) routes.push({ route: normalizeNextRoute(`/api/${stripIndex(nextPages[1])}`), file: normalized, kind: "next-pages-api", confidence: "high", evidence: [normalized], explanation: "File matches Next.js pages/api convention." });
    if (/(?:router|app)\.(get|post|put|patch|delete|options|all)\(|app\.route\(/.test(file.text)) {
      for (const match of file.text.matchAll(/\b(?:router|app)\.(get|post|put|patch|delete|options|all)\(\s*["'`]([^"'`]+)["'`]/g)) {
        const receiver = match[0].startsWith("router.") ? "router" : "app";
        routes.push({ route: `${match[1].toUpperCase()} ${match[2]}`, file: normalized, kind: "express", confidence: "high", evidence: [normalized, `${match[1]}(${match[2]})`], explanation: receiver === "router" ? "Literal Express router route detected; final mounted path may include an app.use prefix." : "Literal Express app route registration detected." });
      }
      for (const match of file.text.matchAll(/\bapp\.route\(\s*["'`]([^"'`]+)["'`]\s*\)([\s\S]*?)(?=;\s*|\n\s*\n|$)/g)) {
        for (const method of match[2].matchAll(/\.(get|post|put|patch|delete|options|all)\s*\(/g)) {
          routes.push({ route: `${method[1].toUpperCase()} ${match[1]}`, file: normalized, kind: "express", confidence: "high", evidence: [normalized, `app.route(${match[1]}).${method[1]}()`], explanation: "Literal Express app.route chain detected." });
        }
      }
    }
    for (const match of file.text.matchAll(/\bapp\.use\(\s*["'`]([^"'`]+)["'`]/g)) {
      routes.push({ route: `USE ${match[1]}`, file: normalized, kind: "express", confidence: "medium", evidence: [normalized, `app.use(${match[1]})`], explanation: "Express middleware mount detected; child routes may be composed elsewhere." });
    }
  }
  return routes.sort((a, b) => `${a.route}${a.file}`.localeCompare(`${b.route}${b.file}`));
}

function normalizeNextRoute(route: string): string {
  return route
    .split("/")
    .filter((part) => part && !/^\(.+\)$/.test(part))
    .map(normalizeNextSegment)
    .join("/")
    .replace(/^/, "/");
}

function normalizeNextSegment(part: string): string {
  if (/^\[\[\.\.\.[^\]]+\]\]$/.test(part)) return `:${part.slice(5, -2)}*?`;
  if (/^\[\.\.\.[^\]]+\]$/.test(part)) return `:${part.slice(4, -1)}*`;
  if (/^\[[^\]]+\]$/.test(part)) return `:${part.slice(1, -1)}`;
  return part;
}

function stripIndex(route: string): string {
  return route === "index" ? "" : route.replace(/\/index$/, "");
}

export function detectTodos(files: RepoFile[]): TodoItem[] {
  const todos: TodoItem[] = [];
  for (const file of files) {
    if (!file.text) continue;
    file.text.split(/\r?\n/).forEach((line, index) => {
      if (/\b(TODO|FIXME|HACK)\b/i.test(line)) {
        todos.push({ file: file.path, line: index + 1, text: line.trim().slice(0, 180) });
      }
    });
  }
  return todos;
}

export function rankImportantFiles(files: RepoFile[], routes: RouteInfo[], envVars: EnvVarInfo[]): ImportantFile[] {
  const importCounts = countIncomingImports(files);
  const envFiles = new Set(envVars.flatMap((env) => env.files));
  return files
    .filter((file) => isCandidate(file))
    .map((file) => {
      const signals = fileSignals(file, routes, importCounts.get(file.path) ?? 0, envFiles.has(file.path));
      const highRisk = signals.some((signal) => [
        "auth logic",
        "payment logic",
        "migration/security policy",
        "environment validation",
        "deployment config",
        "production deployment config"
      ].includes(signal));
      return {
        file: file.path,
        reason: reasonForSignals(file.path, signals),
        risk: riskForSignals(file.path, signals, highRisk),
        mtimeMs: file.mtimeMs,
        score: scoreSignals(signals, importCounts.get(file.path) ?? 0),
        signals,
        highRisk,
        doNotEditReason: highRisk ? doNotEditReason(signals) : undefined
      };
    })
    .sort((a, b) => b.score - a.score || a.file.localeCompare(b.file))
    .slice(0, 30);
}

function isCandidate(file: RepoFile): boolean {
  const base = path.basename(file.path);
  return [
    "package.json",
    "next.config.js",
    "next.config.ts",
    "vite.config.ts",
    "tsconfig.json",
    "schema.prisma",
    "drizzle.config.ts",
    "supabase.ts",
    "middleware.ts",
    "Dockerfile",
    "docker-compose.yml",
    "docker-compose.yaml",
    ".env.example",
    ".env.local.example",
    "netlify.toml",
    "vercel.json",
    "wrangler.toml",
    "env.ts",
    "env.js"
  ].includes(base) || /(^|\/)(app|src|server|routes|pages|lib|utils|types|db|prisma|supabase|migrations)\/.*\.(ts|tsx|js|jsx|sql|prisma)$/.test(file.path);
}

function fileSignals(file: RepoFile, routes: RouteInfo[], importCount: number, usesEnv: boolean): string[] {
  const signals: string[] = [];
  const p = file.path.toLowerCase();
  const text = file.text ?? "";
  const base = path.basename(file.path);
  if (base === "package.json") return ["package manifest"];
  if (importCount >= 2) signals.push(`imported by ${importCount} files`);
  if (/^(src\/)?(main|index|server|app)\.(ts|tsx|js|jsx)$/.test(file.path) || /(^|\/)app\/.*(layout|page)\.(tsx|ts)$/.test(file.path)) signals.push("app entry point");
  if (/auth|session|jwt|oauth|clerk|next-auth|supabase\.auth|passport/i.test(`${file.path}\n${text}`)) signals.push("auth logic");
  if (/db|database|prisma|drizzle|supabase|firebase|sql|schema\.prisma/i.test(`${file.path}\n${text}`)) signals.push("database logic");
  if (routes.some((route) => route.file === file.path)) signals.push("API route");
  if (/stripe|checkout|payment|billing|invoice|subscription/i.test(`${file.path}\n${text}`)) signals.push("payment logic");
  if (/Dockerfile|vercel\.json|netlify\.toml|wrangler\.toml|\.github\/workflows|deploy/i.test(file.path)) signals.push("deployment config");
  if (/\.test\.|\.spec\.|(^|\/)(__tests__|tests)\//i.test(file.path)) signals.push("test file");
  if (/types?\/|\.d\.ts$|interfaces?|type\s+\w+\s*=|interface\s+\w+/i.test(`${file.path}\n${text}`)) signals.push("shared types");
  if ((usesEnv || /process\.env|import\.meta\.env/i.test(text)) && /zod|envalid|envsafe|required|SECRET|DATABASE_URL|PUBLIC_/i.test(text)) signals.push("environment validation");
  if (/migration|policy|rls|row level security|create policy|alter table/i.test(`${file.path}\n${text}`)) signals.push("migration/security policy");
  if (base === "package.json") signals.push("package manifest");
  if (/config|tsconfig|vite\.config|next\.config/i.test(file.path)) signals.push("config layer");
  return signals.length ? signals : ["runtime file"];
}

function scoreSignals(signals: string[], importCount: number): number {
  const weights: Record<string, number> = {
    "app entry point": 25,
    "auth logic": 22,
    "database logic": 20,
    "API route": 18,
    "payment logic": 22,
    "deployment config": 16,
    "shared types": 12,
    "environment validation": 20,
    "migration/security policy": 24,
    "package manifest": 18,
    "config layer": 12,
    "runtime file": 2
  };
  return signals.reduce((sum, signal) => sum + (weights[signal] ?? (signal.startsWith("imported by") ? 8 : 0)), 0) + Math.min(importCount * 4, 24);
}

function reasonForSignals(file: string, signals: string[]): string {
  if (file === "package.json") return "Defines scripts, dependencies, and package metadata.";
  return `Ranked for: ${signals.join(", ")}.`;
}

function riskForSignals(file: string, signals: string[], highRisk: boolean): string {
  if (highRisk) return `Do not edit casually: ${doNotEditReason(signals)}.`;
  if (file === "package.json") return "Dependency or script changes can break builds and CI.";
  if (signals.includes("API route")) return "Can change public or internal API behavior.";
  return "Check imports and call sites before editing.";
}

function doNotEditReason(signals: string[]): string {
  const risky = signals.filter((signal) => [
    "auth logic",
    "payment logic",
    "migration/security policy",
    "environment validation",
    "production deployment config",
    "deployment config"
  ].includes(signal));
  return risky.join(", ") || "high-risk project behavior";
}

function countIncomingImports(files: RepoFile[]): Map<string, number> {
  const counts = new Map<string, number>();
  const aliases = readPathAliases(files);
  const sourceFiles = files.filter((file) => file.text && /\.(ts|tsx|js|jsx)$/.test(file.path));
  for (const file of sourceFiles) {
    for (const imported of importsFrom(file)) {
      const resolved = resolveImport(file.path, imported, files, aliases);
      if (resolved && resolved !== file.path) counts.set(resolved, (counts.get(resolved) ?? 0) + 1);
    }
  }
  return counts;
}

function importsFrom(file: RepoFile): string[] {
  const text = file.text ?? "";
  return [
    ...[...text.matchAll(/\bimport\s+(?:[^"'`]+from\s+)?["'`]([^"'`]+)["'`]/g)].map((match) => match[1]),
    ...[...text.matchAll(/\brequire\(["'`]([^"'`]+)["'`]\)/g)].map((match) => match[1])
  ];
}

function resolveImport(from: string, specifier: string, files: RepoFile[], aliases: Array<{ prefix: string; target: string }>): string | undefined {
  if (!specifier.startsWith(".")) {
    const alias = aliases.find((item) => specifier === item.prefix || specifier.startsWith(`${item.prefix}/`));
    if (!alias) return undefined;
    const rest = specifier === alias.prefix ? "" : specifier.slice(alias.prefix.length + 1);
    return resolveCandidate(path.posix.normalize(path.posix.join(alias.target, rest)), files);
  }
  const dir = path.posix.dirname(from);
  const raw = path.posix.normalize(path.posix.join(dir, specifier));
  return resolveCandidate(raw, files);
}

function resolveCandidate(raw: string, files: RepoFile[]): string | undefined {
  const candidates = [raw, `${raw}.ts`, `${raw}.tsx`, `${raw}.js`, `${raw}.jsx`, `${raw}/index.ts`, `${raw}/index.tsx`, `${raw}/index.js`];
  return candidates.find((candidate) => files.some((file) => file.path === candidate));
}

function readPathAliases(files: RepoFile[]): Array<{ prefix: string; target: string }> {
  const tsconfig = files.find((file) => file.path === "tsconfig.json" && file.text);
  const aliases = [{ prefix: "@", target: "src" }];
  if (!tsconfig?.text) return aliases;
  try {
    const json = JSON.parse(tsconfig.text) as { compilerOptions?: { paths?: Record<string, string[]> } };
    for (const [key, values] of Object.entries(json.compilerOptions?.paths ?? {})) {
      const first = values[0];
      if (!first) continue;
      aliases.push({ prefix: key.replace(/\/\*$/, ""), target: first.replace(/\/\*$/, "") });
    }
  } catch {
    return aliases;
  }
  return aliases;
}

export function detectFolders(files: RepoFile[]): Array<{ folder: string; purpose: string }> {
  const folders = new Set(files.map((file) => file.path.split("/")[0]).filter(Boolean));
  return [...folders].sort().slice(0, 20).map((folder) => ({
    folder,
    purpose: inferFolderPurpose(folder)
  }));
}

function inferFolderPurpose(folder: string): string {
  if (folder === "src") return "Main source code.";
  if (folder === "app") return "Next.js app router or application entry.";
  if (folder === "pages") return "Next.js pages router.";
  if (folder === "tests" || folder === "__tests__") return "Automated tests.";
  if (folder === "server") return "Server-side application code.";
  if (folder === "routes") return "Route handlers.";
  if (folder === "prisma" || folder === "supabase") return "Database tooling/configuration.";
  if (folder === ".github") return "GitHub Actions or repository automation.";
  return "Needs confirmation.";
}

export function detectConventions(files: RepoFile[]): string[] {
  const conventions = [];
  if (files.some((file) => file.path.endsWith(".tsx"))) conventions.push("Uses TSX components.");
  if (files.some((file) => file.path.includes("/app/"))) conventions.push("Uses app-directory routing where present.");
  if (files.some((file) => file.path.includes(".test.") || file.path.includes(".spec."))) conventions.push("Keeps tests near source or in test folders.");
  if (files.some((file) => file.path.endsWith(".module.css"))) conventions.push("Uses CSS modules for scoped styles.");
  return conventions.length ? conventions : ["Unknown; inspect nearby files before editing."];
}

export function buildDependencyMap(importantFiles: ImportantFile[]): DependencyMap {
  const bySignal = (signal: string) => importantFiles.filter((file) => file.signals.includes(signal)).map((file) => file.file).slice(0, 8);
  const byPath = (pattern: RegExp) => importantFiles.filter((file) => pattern.test(file.file)).map((file) => file.file).slice(0, 8);
  return {
    coreEntry: unique([...bySignal("app entry point"), ...byPath(/(^|\/)(main|index|server|app)\.(ts|tsx|js|jsx)$/)]),
    sharedUtilities: unique([...byPath(/(^|\/)(lib|utils|helpers)\//), ...importantFiles.filter((file) => file.signals.some((signal) => signal.startsWith("imported by"))).map((file) => file.file)]).slice(0, 8),
    apiLayer: unique([...bySignal("API route"), ...byPath(/(^|\/)(api|routes)\//)]),
    dataLayer: unique([...bySignal("database logic"), ...byPath(/(^|\/)(db|prisma|supabase|migrations)\//)]),
    uiLayer: unique(byPath(/(^|\/)(app|pages|components|src)\/.*\.(tsx|jsx)$/)),
    configLayer: unique([...bySignal("config layer"), ...bySignal("deployment config"), ...byPath(/config|package\.json|Dockerfile|vercel\.json|netlify\.toml|wrangler\.toml/)])
  };
}

function unique(values: string[]): string[] {
  return [...new Set(values)];
}
