import { promises as fs } from "node:fs";
import path from "node:path";
import type { ScanResult } from "../types.js";

export async function renderDiff(root: string, scan: ScanResult): Promise<string> {
  const memoryPath = path.join(root, "PROJECT_MEMORY.md");
  let existing = "";
  try {
    existing = await fs.readFile(memoryPath, "utf8");
  } catch {
    return "PROJECT_MEMORY.md is missing. Run `context-compress scan` first.";
  }
  const lines = ["# Context Compressor Diff", ""];
  appendMissing(lines, "New important files", scan.importantFiles.map((item) => item.file), existing);
  appendMissing(lines, "New env vars", scan.envVars.map((item) => item.name), existing);
  appendMissing(lines, "New routes", scan.routes.map((item) => item.route), existing);
  appendMissing(lines, "New package dependencies", scan.dependencies, existing);
  appendMissing(lines, "Changed framework/deployment signals", [...scan.frameworks, ...scan.deployment].map((item) => item.name), existing);
  appendMissing(lines, "New TODOs", scan.todos.map((item) => `${item.file}:${item.line}`), existing);
  return lines.join("\n");
}

function appendMissing(lines: string[], title: string, current: string[], existing: string): void {
  const missing = current.filter((item) => !existing.includes(item));
  lines.push(`## ${title}`);
  lines.push(...(missing.length ? missing.map((item) => `- ${item}`) : ["- None detected."]));
  lines.push("");
}
