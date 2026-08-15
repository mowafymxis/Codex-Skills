import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Analysis } from "./types.js";
import { atomicWrite } from "./util.js";

export async function diffReports(
  previousDir: string,
  currentDir: string,
  out: string,
): Promise<void> {
  const previous = JSON.parse(
    await readFile(path.join(previousDir, "feature-gap-analysis.json"), "utf8"),
  ) as Analysis;
  const current = JSON.parse(
    await readFile(path.join(currentDir, "feature-gap-analysis.json"), "utf8"),
  ) as Analysis;
  const changes: string[] = [];
  compareById(
    previous.appFeatures,
    current.appFeatures,
    (oldValue, newValue) => {
      if (!oldValue && newValue) return `New app feature: ${newValue.name}`;
      if (oldValue && !newValue) return `App feature removed from evidence: ${oldValue.name}`;
      if (
        oldValue &&
        newValue &&
        (oldValue.status !== newValue.status || oldValue.maturityScore !== newValue.maturityScore)
      )
        return `App feature maturity changed: ${newValue.name} (${oldValue.status}/${oldValue.maturityScore} → ${newValue.status}/${newValue.maturityScore})`;
      return null;
    },
    changes,
  );
  compareById(
    previous.competitorFeatures,
    current.competitorFeatures,
    (oldValue, newValue) =>
      !oldValue && newValue
        ? `New competitor feature evidence: ${newValue.name}`
        : oldValue && !newValue
          ? `Competitor feature evidence removed: ${oldValue.name}`
          : null,
    changes,
  );
  const oldPricing = previous.sources.filter((x) => x.sourceType === "pricing");
  const newPricing = current.sources.filter((x) => x.sourceType === "pricing");
  for (const source of newPricing) {
    const old = oldPricing.find((x) => x.canonicalUrl === source.canonicalUrl);
    if (old && old.contentHash !== source.contentHash)
      changes.push(`Pricing source content changed: ${source.canonicalUrl}`);
  }
  await atomicWrite(
    out,
    `# Changes Since Last Scan\n\nDetected ${new Date().toISOString()}. Hash and normalized-ID comparison suppresses unchanged content.\n\n${changes.map((x) => `- ${x} (confidence: medium; verify against cited evidence)`).join("\n") || "No material product changes detected."}\n`,
  );
}

function compareById<T extends { id: string }>(
  oldItems: T[],
  newItems: T[],
  describe: (oldValue: T | undefined, newValue: T | undefined) => string | null,
  changes: string[],
): void {
  for (const id of new Set([...oldItems.map((x) => x.id), ...newItems.map((x) => x.id)])) {
    const description = describe(
      oldItems.find((x) => x.id === id),
      newItems.find((x) => x.id === id),
    );
    if (description) changes.push(description);
  }
}
