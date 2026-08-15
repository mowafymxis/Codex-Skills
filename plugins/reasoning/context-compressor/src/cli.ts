#!/usr/bin/env node
import { promises as fs } from "node:fs";
import path from "node:path";
import { analyzeProject } from "./analyzers/project.js";
import { renderBrief } from "./reporters/brief.js";
import { checkMemory } from "./reporters/check.js";
import { renderDiff } from "./reporters/diff.js";
import { renderMemory, writeMemory } from "./reporters/memory.js";
import type { MemoryMode } from "./types.js";

interface Args {
  command: string;
  path: string;
  maxLines: number;
  strict: boolean;
  mode: MemoryMode;
  task: string;
  json: boolean;
  packageMemories: boolean;
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  if (!["init", "scan", "update", "diff", "check", "brief", "explain", "help"].includes(args.command)) {
    throw new Error(`Unknown command "${args.command}". Run context-compress help.`);
  }
  if (args.command === "help") {
    console.log(help());
    return;
  }
  const root = path.resolve(args.path);
  if (args.command === "init") {
    const scan = await analyzeProject(root);
    const memoryPath = path.join(root, "PROJECT_MEMORY.md");
    try {
      await fs.access(memoryPath);
      console.log(`PROJECT_MEMORY.md already exists at ${memoryPath}`);
    } catch {
      await fs.writeFile(memoryPath, renderMemory(scan, "", args.mode), "utf8");
      console.log(`Created ${memoryPath}`);
    }
    return;
  }
  const scan = await analyzeProject(root);
  if (args.command === "scan") {
    if (args.json) {
      console.log(JSON.stringify(scan, null, 2));
      return;
    }
    const memoryPath = await writeMemory(root, scan, false, args.mode);
    console.log(`Generated ${memoryPath}`);
    if (args.packageMemories) {
      for (const pkg of scan.workspacePackages) {
        const pkgRoot = path.join(root, pkg.path);
        const pkgScan = await analyzeProject(pkgRoot);
        const pkgMemory = await writeMemory(pkgRoot, pkgScan, false, args.mode);
        console.log(`Generated ${pkgMemory}`);
      }
    }
    console.log(`Context Completeness Score: ${scan.score}/100`);
    return;
  }
  if (args.command === "update") {
    const memoryPath = await writeMemory(root, scan, true, args.mode);
    console.log(`Updated ${memoryPath}`);
    console.log("Manual notes preserved.");
    console.log(`Context Completeness Score: ${scan.score}/100`);
    return;
  }
  if (args.command === "diff") {
    console.log(await renderDiff(root, scan));
    return;
  }
  if (args.command === "brief") {
    console.log(renderBrief(scan, args.task));
    return;
  }
  if (args.command === "explain") {
    console.log(explain());
    return;
  }
  if (args.command === "check") {
    const result = await checkMemory(root, scan, args.maxLines, args.strict);
    console.log(result.report);
    if (!result.ok) process.exitCode = 1;
  }
}

function parseArgs(argv: string[]): Args {
  let command = "";
  let scanPath = ".";
  let maxLines = 300;
  let strict = false;
  let mode: MemoryMode = "standard";
  let task = "";
  let json = false;
  let packageMemories = false;
  let maxLinesProvided = false;
  const readValue = (argvIndex: number, flag: string): string => {
    const value = argv[argvIndex + 1];
    if (!value || value.startsWith("-")) throw new Error(`Missing value for ${flag}.`);
    return value;
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--path") scanPath = readValue(index++, "--path");
    else if (arg === "--max-lines") {
      const value = readValue(index++, "--max-lines");
      maxLines = Number(value);
      maxLinesProvided = true;
      if (!Number.isInteger(maxLines) || maxLines <= 0) throw new Error("--max-lines must be a positive integer.");
    }
    else if (arg === "--mode") mode = parseMode(readValue(index++, "--mode"));
    else if (arg === "--task") task = readValue(index++, "--task");
    else if (arg === "--strict") strict = true;
    else if (arg === "--json") json = true;
    else if (arg === "--package-memories") packageMemories = true;
    else if (arg === "-h" || arg === "--help") command = "help";
    else if (arg.startsWith("-")) throw new Error(`Unknown option "${arg}". Run context-compress help.`);
    else if (!command) command = arg;
    else throw new Error(`Unexpected argument "${arg}". Run context-compress help.`);
  }
  if (!command) command = "help";
  if (!maxLinesProvided) maxLines = mode === "tiny" ? 100 : mode === "detailed" ? 500 : 250;
  return { command, path: scanPath, maxLines, strict, mode, task, json, packageMemories };
}

function parseMode(value: string): MemoryMode {
  if (value === "tiny" || value === "standard" || value === "detailed") return value;
  throw new Error(`Unknown mode "${value}". Use tiny, standard, or detailed.`);
}

function help(): string {
  return [
    "Context Compressor",
    "",
    "Usage:",
    "  context-compress init [--path ./repo]",
    "  context-compress scan [--path ./repo] [--json] [--package-memories]",
    "  context-compress update [--path ./repo]",
    "  context-compress diff [--path ./repo]",
    "  context-compress check [--path ./repo] [--max-lines 250] [--strict]",
    "  context-compress brief --task \"fix login bug\" [--path ./repo]",
    "  context-compress explain",
    "",
    "Modes:",
    "  --mode tiny      target under 100 lines",
    "  --mode standard  target under 250 lines",
    "  --mode detailed  target under 500 lines",
    "",
    "Confidence:",
    "  high    package/config/schema/AST evidence",
    "  medium  known file conventions or literal route/env patterns",
    "  low     keyword/path heuristics that need confirmation"
  ].join("\n");
}

function explain(): string {
  return [
    "# Context Compressor Explanation",
    "",
    "The scanner walks lightweight text files, reads package metadata, detects routes/env vars/imports/exports, ranks important files, and renders PROJECT_MEMORY.md between the auto-generated markers.",
    "",
    "Confidence levels:",
    "- high: package dependency, config file, schema file, workspace manifest, or TypeScript AST evidence.",
    "- medium: known framework file conventions or literal code patterns.",
    "- low: path/keyword heuristics that are useful leads but need human confirmation.",
    "",
    "Manual notes between `<!-- MANUAL NOTES START -->` and `<!-- MANUAL NOTES END -->` are preserved by `update`.",
    "Generated content between `<!-- AUTO-GENERATED START -->` and `<!-- AUTO-GENERATED END -->` is replaceable."
  ].join("\n");
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
