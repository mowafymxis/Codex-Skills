import type { ScanResult } from "../types.js";

export function renderBrief(scan: ScanResult, task: string): string {
  const terms = task.toLowerCase().split(/[^a-z0-9_]+/).filter((term) => term.length > 2);
  const relevant = scan.importantFiles
    .map((file) => ({ file, relevance: relevance(file.file, file.signals.join(" "), terms) }))
    .filter((item) => item.relevance > 0)
    .sort((a, b) => b.relevance - a.relevance || b.file.score - a.file.score)
    .map((item) => item.file)
    .slice(0, 8);
  const fallback = scan.importantFiles.slice(0, 5);
  const files = relevant.length ? relevant : fallback;
  const highRisk = files.filter((file) => file.highRisk);
  return [
    "# Task Briefing",
    "",
    `Task: ${task || "Unknown"}`,
    "",
    "## Relevant Files",
    ...files.map((file) => `- \`${file.file}\`: ${file.signals.join(", ")}`),
    "",
    "## Likely Risks",
    ...(highRisk.length ? highRisk.map((file) => `- \`${file.file}\`: ${file.doNotEditReason ?? file.risk}`) : scan.risks.slice(0, 4).map((risk) => `- ${risk}`)),
    "",
    "## Commands To Run",
    ...commandsFor(scan),
    "",
    "## Things Not To Touch Casually",
    ...(scan.highRiskFiles.length ? scan.highRiskFiles.slice(0, 6).map((file) => `- \`${file.file}\``) : ["- Unknown. Inspect nearby files before editing."]),
    "",
    "## Questions / Unknowns",
    ...questionsFor(scan, task)
  ].join("\n");
}

function relevance(file: string, signals: string, terms: string[]): number {
  const haystack = `${file} ${signals}`.toLowerCase();
  return terms.reduce((sum, term) => sum + (haystack.includes(term) ? 3 : 0), 0)
    + (/login|auth|session/.test(terms.join(" ")) && /auth|session|middleware|supabase/i.test(haystack) ? 6 : 0)
    + (/api|route|endpoint/.test(terms.join(" ")) && /api|route/i.test(haystack) ? 5 : 0)
    + (/db|data|schema|model/.test(terms.join(" ")) && /db|database|schema|prisma|supabase/i.test(haystack) ? 5 : 0)
    + (/payment|billing|stripe/.test(terms.join(" ")) && /payment|billing|stripe/i.test(haystack) ? 6 : 0);
}

function commandsFor(scan: ScanResult): string[] {
  const commands = [];
  if (scan.testing.some((tool) => tool.name === "Vitest")) commands.push("- `npm run test`");
  else if (scan.testing.some((tool) => tool.name === "Jest")) commands.push("- `npm test`");
  else commands.push("- Run the repo's existing test command after inspecting `package.json`.");
  commands.push("- `npm run build` if the package has a build script.");
  commands.push("- `context-compress check --max-lines 250` after updating memory.");
  return commands;
}

function questionsFor(scan: ScanResult, task: string): string[] {
  const questions = [];
  if (!task) questions.push("- Task is empty; clarify intended change.");
  if (!scan.auth.length && /login|auth|session/i.test(task)) questions.push("- Auth system was not confidently detected.");
  if (!scan.databases.length && /data|db|schema|model/i.test(task)) questions.push("- Data layer was not confidently detected.");
  if (scan.git.available && scan.git.hasUncommittedChanges) questions.push("- Repo has uncommitted changes; identify owner before editing overlapping files.");
  return questions.length ? questions : ["- None obvious from static scan."];
}
