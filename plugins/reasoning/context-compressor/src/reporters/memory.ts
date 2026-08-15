import { promises as fs } from "node:fs";
import path from "node:path";
import type { DetectedTool, MemoryMode, ScanResult } from "../types.js";

const AUTO_START = "<!-- AUTO-GENERATED START -->";
const AUTO_END = "<!-- AUTO-GENERATED END -->";
const MANUAL_START = "<!-- MANUAL NOTES START -->";
const MANUAL_END = "<!-- MANUAL NOTES END -->";
const REQUIRED_HEADINGS = [
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

const MODE_LIMITS: Record<MemoryMode, { files: number; routes: number; env: number; todos: number; commits: number; targetLines: number }> = {
  tiny: { files: 8, routes: 5, env: 5, todos: 5, commits: 2, targetLines: 100 },
  standard: { files: 15, routes: 12, env: 12, todos: 12, commits: 5, targetLines: 250 },
  detailed: { files: 30, routes: 30, env: 30, todos: 30, commits: 5, targetLines: 500 }
};

export function renderMemory(scan: ScanResult, manualNotes = "", mode: MemoryMode = "standard"): string {
  const limits = MODE_LIMITS[mode];
  const body = [
    "# Project Memory",
    "",
    MANUAL_START,
    manualNotes.trim() || "Add durable human notes here. These lines are preserved by `context-compress update`.",
    MANUAL_END,
    "",
    AUTO_START,
    "",
    "## Purpose",
    scan.purpose,
    "",
    "## Detected Facts",
    ...renderDetectedFacts(scan),
    "",
    "## Reasonable Assumptions",
    ...renderAssumptions(scan),
    "",
    "## Unknowns / Needs Confirmation",
    ...renderUnknowns(scan),
    "",
    "## Tech Stack",
    `- Package manager: ${scan.packageManager}`,
    ...renderTools("Languages", scan.languages),
    ...renderTools("Frameworks", scan.frameworks),
    ...renderTools("Database", scan.databases),
    ...renderTools("Auth", scan.auth),
    ...renderTools("Deployment", scan.deployment),
    ...renderTools("Testing", scan.testing),
    ...renderTools("Styling", scan.styling),
    "",
    "## Architecture Map",
    ...orUnknown(scan.folders.map((item) => `- \`${item.folder}\`: ${item.purpose}`)),
    "",
    "## Important Files",
    ...orUnknown(scan.importantFiles.slice(0, limits.files).map((item) => `- \`${item.file}\` (${item.score}, confidence: ${confidenceForFile(item)}): ${item.signals.join(", ")}. Risk: ${item.risk}`)),
    "",
    "## Dependency Map",
    ...renderDependencyMap(scan),
    "",
    "## Do Not Edit Casually",
    ...orUnknown(scan.highRiskFiles.slice(0, limits.files).map((item) => `- \`${item.file}\`: ${item.doNotEditReason ?? item.risk}`)),
    "",
    "## App Flows",
    ...renderFlows(scan),
    "",
    "## Data Model",
    ...renderDataModel(scan),
    "",
    "## API Surface",
    ...orUnknown(scan.routes.slice(0, limits.routes).map((route) => `- \`${route.route}\` in \`${route.file}\` (${route.kind}, confidence: ${route.confidence}). Evidence: ${route.evidence.join(", ")}. ${route.explanation}`)),
    "",
    "## Environment Variables",
    ...orUnknown(scan.envVars.slice(0, limits.env).map((env) => `- \`${env.name}\` (confidence: ${env.confidence}): ${env.likelyPurpose}. Files: ${env.files.map((file) => `\`${file}\``).join(", ")}. Values omitted.`)),
    "",
    "## Framework Analysis",
    ...renderFrameworkAnalyses(scan),
    "",
    "## Workspace Packages",
    ...renderWorkspacePackages(scan),
    "",
    "## Deployment",
    ...orUnknown(scan.deployment.map((item) => `- ${item.name} (${item.confidence}): ${item.evidence.join(", ")}`)),
    "",
    "## Coding Conventions",
    ...orUnknown(scan.conventions.map((item) => `- ${item}`)),
    "",
    "## Known Risks",
    ...orUnknown(scan.risks.map((item) => `- ${item}`)),
    "",
    "## Current TODOs",
    ...orUnknown(scan.todos.slice(0, limits.todos).map((todo) => `- \`${todo.file}:${todo.line}\`: ${todo.text}`)),
    "",
    "## Recent Changes",
    ...renderGit(scan, limits.commits),
    "",
    "## Codex Instructions",
    "- Treat facts, assumptions, and unknowns differently.",
    "- Trust code over stale memory; update after architecture, route, env, package, or deployment changes.",
    "",
    "## Context Completeness Score",
    `${scan.score}/100`,
    "",
    "## Last Scan",
    `- Timestamp: ${scan.scannedAt}`,
    `- Root: \`${scan.root}\``,
    `- Mode: ${mode}; target under ${limits.targetLines} lines.`,
    `- Summary: ${scan.importantFiles.length} important files, ${scan.routes.length} routes, ${scan.envVars.length} env vars, ${scan.todos.length} TODOs.`,
    "",
    AUTO_END,
    ""
  ];
  return enforceLineBudget(`${body.join("\n")}`, limits.targetLines);
}

export async function readManualNotes(memoryPath: string): Promise<string> {
  try {
    const text = await fs.readFile(memoryPath, "utf8");
    const match = text.match(new RegExp(`${escapeRegExp(MANUAL_START)}\\s*([\\s\\S]*?)\\s*${escapeRegExp(MANUAL_END)}`));
    return match?.[1]?.trim() ?? "";
  } catch {
    return "";
  }
}

export async function writeMemory(root: string, scan: ScanResult, preserveManual = true, mode: MemoryMode = "standard"): Promise<string> {
  const memoryPath = path.join(root, "PROJECT_MEMORY.md");
  const manual = preserveManual ? await readManualNotes(memoryPath) : "";
  const rendered = renderMemory(scan, manual, mode);
  await fs.writeFile(memoryPath, rendered, "utf8");
  return memoryPath;
}

function renderTools(label: string, tools: DetectedTool[]): string[] {
  if (!tools.length) return [`- ${label}: Unknown.`];
  return [
    `- ${label}:`,
    ...tools.map((item) => `  - ${item.name} (confidence: ${item.confidence}). Evidence: ${item.evidence.join(", ")}.${item.explanation ? ` ${item.explanation}` : ""}`)
  ];
}

function renderFlows(scan: ScanResult): string[] {
  const flows = [];
  if (scan.auth.length) flows.push("- Auth flow: Reasonable assumption based on detected auth tooling; inspect implementation before editing.");
  if (scan.routes.length) flows.push("- API flow: Detected API routes/endpoints listed below.");
  if (scan.frameworks.some((item) => item.name.includes("Next") || item.name.includes("React") || item.name === "Vite")) flows.push("- UI flow: Reasonable assumption that frontend routes/components drive user workflows.");
  return flows.length ? flows : ["- Unknown. Needs confirmation."];
}

function renderDataModel(scan: ScanResult): string[] {
  const schemaFiles = scan.importantFiles.filter((file) => /schema\.prisma|drizzle|supabase|firebase/i.test(file.file));
  if (!scan.databases.length && !schemaFiles.length) return ["- Unknown. No database schema/tooling detected."];
  return [
    ...scan.databases.map((item) => `- Detected ${item.name} (${item.confidence}) from ${item.evidence.join(", ")}.`),
    ...schemaFiles.map((file) => `- Schema/config candidate: \`${file.file}\`.`)
  ];
}

function renderDetectedFacts(scan: ScanResult): string[] {
  const facts = [
    ...scan.languages.map((item) => `- ${item.name} detected (confidence: ${item.confidence}). Evidence: ${item.evidence.join(", ")}.`),
    ...scan.frameworks.filter((item) => item.confidence === "high").map((item) => `- ${item.name} detected (confidence: high). Evidence: ${item.evidence.join(", ")}.`),
    ...scan.databases.filter((item) => item.confidence === "high").map((item) => `- ${item.name} detected (confidence: high). Evidence: ${item.evidence.join(", ")}.`),
    ...scan.routes.filter((item) => item.confidence === "high").slice(0, 6).map((item) => `- Route \`${item.route}\` detected in \`${item.file}\`. Evidence: ${item.evidence.join(", ")}.`)
  ];
  return orUnknown(facts);
}

function renderAssumptions(scan: ScanResult): string[] {
  const assumptions = [
    ...scan.auth.map((item) => `- ${item.name} may be implemented (confidence: ${item.confidence}). Evidence: ${item.evidence.join(", ")}. Verify behavior in code before editing.`),
    ...scan.frameworks.filter((item) => item.confidence !== "high").map((item) => `- ${item.name} may be present (confidence: ${item.confidence}). Evidence: ${item.evidence.join(", ")}.`),
    ...scan.frameworkAnalyses.flatMap((analysis) => analysis.assumptions.slice(0, 2).map((item) => `- ${analysis.name}: ${item.label} (confidence: ${item.confidence}). Evidence: ${item.evidence.join(", ")}.`))
  ];
  return orUnknown(assumptions);
}

function renderUnknowns(scan: ScanResult): string[] {
  const unknowns = [
    ...scan.frameworkAnalyses.flatMap((analysis) => analysis.unknowns.slice(0, 2).map((item) => `- ${analysis.name}: ${item.label} ${item.explanation}`))
  ];
  if (!scan.testing.length) unknowns.push("- Test framework unknown. Inspect package scripts and CI before assuming coverage.");
  if (!scan.deployment.length) unknowns.push("- Deployment target unknown. No common deployment config was detected.");
  return orUnknown(unknowns);
}

function renderFrameworkAnalyses(scan: ScanResult): string[] {
  if (!scan.frameworkAnalyses.length) return ["- Unknown. No framework-specific analyzer had enough evidence."];
  return scan.frameworkAnalyses.flatMap((analysis) => [
    `- ${analysis.name}:`,
    `  - Facts: ${analysis.detectedFacts.slice(0, 4).map((item) => `${item.label} (${item.confidence})`).join("; ") || "Unknown"}`,
    `  - Assumptions: ${analysis.assumptions.slice(0, 3).map((item) => `${item.label} (${item.confidence})`).join("; ") || "None"}`,
    `  - Risks: ${analysis.risks.slice(0, 3).map((item) => `${item.label} (${item.confidence})`).join("; ") || "None obvious"}`
  ]);
}

function renderWorkspacePackages(scan: ScanResult): string[] {
  if (!scan.workspacePackages.length) return ["- Not detected."];
  return scan.workspacePackages.map((pkg) => `- \`${pkg.path}\` (${pkg.name}): ${pkg.frameworks.map((tool) => `${tool.name} ${tool.confidence}`).join(", ") || "framework unknown"}. Important files: ${inlineList(pkg.importantFiles.map((file) => file.file).slice(0, 4))}`);
}

function renderDependencyMap(scan: ScanResult): string[] {
  const map = scan.dependencyMap;
  return [
    `- Core entries: ${inlineList(map.coreEntry)}`,
    `- Shared utilities: ${inlineList(map.sharedUtilities)}`,
    `- API layer: ${inlineList(map.apiLayer)}`,
    `- Data layer: ${inlineList(map.dataLayer)}`,
    `- UI layer: ${inlineList(map.uiLayer)}`,
    `- Config layer: ${inlineList(map.configLayer)}`
  ];
}

function renderGit(scan: ScanResult, commitLimit: number): string[] {
  if (!scan.git.available) return ["- Git unavailable or this path is not inside a git repository."];
  return [
    `- Branch: ${scan.git.branch}`,
    `- Uncommitted changes: ${scan.git.hasUncommittedChanges ? "yes" : "no"}`,
    `- Changed files: ${inlineList(scan.git.changedFiles.slice(0, 10))}`,
    `- Recently changed important files: ${inlineList(scan.git.recentlyChangedImportantFiles.slice(0, 10))}`,
    `- Recent commits: ${scan.git.recentCommits.slice(0, commitLimit).join("; ") || "Unknown"}`
  ];
}

function confidenceForFile(item: { highRisk: boolean; signals: string[] }): string {
  if (item.highRisk || item.signals.some((signal) => ["package manifest", "API route", "deployment config"].includes(signal))) return "high";
  if (item.signals.includes("runtime file")) return "low";
  return "medium";
}

function inlineList(values: string[]): string {
  return values.length ? values.map((value) => `\`${value}\``).join(", ") : "Unknown";
}

function orUnknown(lines: string[]): string[] {
  return lines.length ? lines : ["- Unknown. Needs confirmation."];
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function enforceLineBudget(text: string, maxLines: number): string {
  const lines = text.split(/\r?\n/);
  if (lines.length <= maxLines) return text;
  let tailStart = lines.findIndex((line) => line === "## Known Risks");
  if (tailStart < 0) tailStart = lines.findIndex((line) => line === "## Codex Instructions");
  const tail = tailStart >= 0 ? lines.slice(tailStart) : [AUTO_END, ""];
  const headBudget = Math.max(20, maxLines - tail.length - 3);
  const initialHead = lines.slice(0, headBudget);
  const initialJoined = [...initialHead, ...tail].join("\n");
  const initialMissingCount = REQUIRED_HEADINGS.filter((heading) => !initialJoined.includes(heading)).length;
  const adjustedHeadBudget = Math.max(20, headBudget - initialMissingCount);
  const finalHead = lines.slice(0, adjustedHeadBudget);
  const finalJoined = [...finalHead, ...tail].join("\n");
  const missing = REQUIRED_HEADINGS
    .filter((heading) => !finalJoined.includes(heading))
    .map((heading) => heading);
  return [
    ...finalHead,
    ...missing,
    "",
    "_Truncated by mode; use `--mode detailed` for more._",
    ...tail
  ].join("\n");
}
