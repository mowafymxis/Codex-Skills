import type { ScanResult } from "../types.js";

export function scoreScan(scan: Omit<ScanResult, "score">, memoryLineCount = 0, manualNotesPreserved = true): number {
  let score = 0;
  if (!scan.purpose.startsWith("Unknown")) score += 12;
  if (scan.frameworks.length) score += 12;
  if (scan.languages.length) score += 8;
  if (scan.importantFiles.length >= 3) score += 12;
  if (scan.envVars.length) score += 8;
  if (scan.routes.length) score += 8;
  if (scan.databases.length) score += 8;
  if (scan.auth.length) score += 8;
  if (scan.deployment.length) score += 8;
  if (scan.testing.length) score += 4;
  if (memoryLineCount === 0 || memoryLineCount <= 300) score += 6;
  if (manualNotesPreserved) score += 6;
  return Math.min(100, score);
}
