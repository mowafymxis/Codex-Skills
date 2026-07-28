import { promises as fs } from "node:fs";
import path from "node:path";
import type { ScanResult } from "../types.js";

const REQUIRED_SECTIONS = [
  "## Purpose",
  "## Detected Facts",
  "## Reasonable Assumptions",
  "## Unknowns / Needs Confirmation",
  "## Tech Stack",
  "## Architecture Map",
  "## Important Files",
  "## App Flows",
  "## Data Model",
  "## API Surface",
  "## Environment Variables",
  "## Deployment",
  "## Coding Conventions",
  "## Known Risks",
  "## Current TODOs",
  "## Codex Instructions",
  "## Last Scan"
];

export async function checkMemory(root: string, scan: ScanResult, maxLines: number, strict: boolean): Promise<{ ok: boolean; report: string }> {
  const memoryPath = path.join(root, "PROJECT_MEMORY.md");
  const issues: string[] = [];
  let text = "";
  let stat;
  try {
    text = await fs.readFile(memoryPath, "utf8");
    stat = await fs.stat(memoryPath);
  } catch {
    return { ok: false, report: "PROJECT_MEMORY.md is missing. Run `context-compress scan`." };
  }

  const lineCount = text.split(/\r?\n/).length;
  if (lineCount > maxLines) issues.push(`Memory is too long: ${lineCount} lines exceeds max ${maxLines}.`);
  for (const section of REQUIRED_SECTIONS) {
    if (!text.includes(section)) issues.push(`Missing required section: ${section}.`);
  }
  if (scan.score < 70) issues.push(`Context Completeness Score is below 70: ${scan.score}.`);
  for (const item of extractBacktickFiles(text)) {
    if (!scan.importantFiles.some((file) => file.file === item) && !scan.routes.some((route) => route.file === item)) {
      try {
        await fs.access(path.join(root, item));
      } catch {
        issues.push(`Possible stale reference to missing file: ${item}.`);
      }
    }
  }
  const changedFileTimes = await Promise.all(scan.git.changedFiles.map(async (file) => {
    try {
      return (await fs.stat(path.join(root, file))).mtimeMs;
    } catch {
      return 0;
    }
  }));
  const newestImportant = Math.max(...scan.importantFiles.map((file) => file.mtimeMs), ...changedFileTimes, 0);
  if (strict && newestImportant > stat.mtimeMs) issues.push("PROJECT_MEMORY.md may be older than recent important file changes.");
  if (strict && scan.git.recentlyChangedImportantFiles.length) issues.push(`Recently changed important files should be reviewed: ${scan.git.recentlyChangedImportantFiles.join(", ")}.`);

  return {
    ok: issues.length === 0,
    report: issues.length ? issues.map((issue) => `- ${issue}`).join("\n") : "PROJECT_MEMORY.md passed checks."
  };
}

function extractBacktickFiles(text: string): string[] {
  const files = new Set<string>();
  for (const match of text.matchAll(/`([^`]+\.(?:ts|tsx|js|jsx|json|md|css|toml|yml|yaml|prisma|sql|env|dockerfile))`/gi)) {
    if (!match[1].includes(":") && !match[1].startsWith("/")) files.add(match[1]);
  }
  return [...files];
}
