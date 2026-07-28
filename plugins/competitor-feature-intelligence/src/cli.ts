#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildAnalysis } from "./analysis.js";
import { collectSources, ingestManualSources } from "./collector.js";
import { loadConfig } from "./config.js";
import { diffReports } from "./diff.js";
import { extractFeatures } from "./extractor.js";
import { generateReports, issueDrafts, validateReportDirectory } from "./reports.js";
import { scanRepository } from "./scanner.js";
import type { Analysis, AppFeature, CompetitorFeature, Config, SourceRecord } from "./types.js";
import { atomicWrite, stableId } from "./util.js";

const pluginRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const schemaPath = path.join(pluginRoot, "schemas", "feature-gap.schema.json");

interface Args {
  command: string;
  flags: Record<string, string | boolean>;
}
function parseArgs(argv: string[]): Args {
  const [command = "help", ...tokens] = argv;
  const flags: Record<string, string | boolean> = {};
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]!;
    if (!token.startsWith("--")) throw new Error(`Unexpected argument: ${token}`);
    const key = token.slice(2);
    const next = tokens[i + 1];
    if (!next || next.startsWith("--")) flags[key] = true;
    else {
      flags[key] = next;
      i++;
    }
  }
  return { command, flags };
}
const required = (flags: Args["flags"], key: string): string => {
  const value = flags[key];
  if (typeof value !== "string") throw new Error(`--${key} is required`);
  return value;
};
const optional = (flags: Args["flags"], key: string): string | undefined =>
  typeof flags[key] === "string" ? flags[key] : undefined;

async function main(): Promise<void> {
  const { command, flags } = parseArgs(process.argv.slice(2));
  if (["help", "--help", "-h"].includes(command)) return help();
  if (command === "scan-repo") {
    const repo = path.resolve(required(flags, "repo"));
    const out = path.resolve(required(flags, "out"));
    await atomicWrite(out, `${JSON.stringify(await scanRepository(repo), null, 2)}\n`);
    return;
  }
  if (command === "collect") {
    const out = path.resolve(required(flags, "out"));
    const competitors = await readCompetitors(required(flags, "competitors"));
    const config = await loadConfig(optional(flags, "config"), {
      competitors,
      outputDirectory: out,
      offline: flags.offline === true,
    });
    const sources = optional(flags, "manual-sources")
      ? await ingestManualSources(required(flags, "manual-sources"))
      : await collectSources(config, path.join(out, ".cache"));
    await atomicWrite(
      path.join(out, "competitor-sources.json"),
      `${JSON.stringify(sources, null, 2)}\n`,
    );
    return;
  }
  if (command === "compare") {
    const app = JSON.parse(
      await readFile(required(flags, "app-inventory"), "utf8"),
    ) as AppFeature[];
    const competitorData = JSON.parse(
      await readFile(required(flags, "competitor-data"), "utf8"),
    ) as CompetitorFeature[];
    const out = path.resolve(required(flags, "out"));
    const config = await loadConfig(optional(flags, "config"), {
      outputDirectory: out,
      offline: true,
    });
    await generateReports(buildAnalysis(config, app, competitorData, []), out);
    return;
  }
  if (command === "analyze") {
    const configFile = optional(flags, "config");
    const overrides: Partial<Config> = {};
    if (optional(flags, "repo")) overrides.repoPath = path.resolve(required(flags, "repo"));
    if (optional(flags, "out")) overrides.outputDirectory = path.resolve(required(flags, "out"));
    if (flags.offline === true) overrides.offline = true;
    const config = await loadConfig(configFile, overrides);
    const app = await scanRepository(config.repoPath, config.ignoredPaths);
    let sources: SourceRecord[] = [];
    if (optional(flags, "manual-sources"))
      sources = await ingestManualSources(required(flags, "manual-sources"));
    else if (!config.offline)
      sources = await collectSources(config, path.join(config.outputDirectory, ".cache"));
    const analysis = buildAnalysis(config, app, extractFeatures(sources), sources);
    await generateReports(analysis, config.outputDirectory);
    if (config.generateGithubIssueDrafts)
      await atomicWrite(
        path.join(config.outputDirectory, "github-issues.md"),
        issueDrafts(analysis.featureGaps, ["Build Now", "Build Next"]),
      );
    await validateReportDirectory(config.outputDirectory, schemaPath);
    return;
  }
  if (command === "validate") {
    await validateReportDirectory(path.resolve(required(flags, "report-dir")), schemaPath);
    return;
  }
  if (command === "issues") {
    const analysis = JSON.parse(await readFile(required(flags, "analysis"), "utf8")) as Analysis;
    const labels = (optional(flags, "priority") ?? "build-now,build-next").split(",");
    await atomicWrite(
      path.resolve(required(flags, "out")),
      issueDrafts(analysis.featureGaps, labels),
    );
    return;
  }
  if (command === "diff") {
    await diffReports(
      path.resolve(required(flags, "previous")),
      path.resolve(required(flags, "current")),
      path.resolve(required(flags, "out")),
    );
    return;
  }
  throw new Error(`Unknown command: ${command}`);
}

async function readCompetitors(file: string): Promise<Config["competitors"]> {
  const text = await readFile(file, "utf8");
  try {
    const parsed = JSON.parse(text) as Array<{
      name: string;
      url: string;
      type?: Config["competitors"][number]["type"];
    }>;
    return parsed.map((x) => ({
      id: stableId(x.name),
      name: x.name,
      url: x.url,
      type: x.type ?? "direct",
    }));
  } catch {
    return text
      .split(/\r?\n/)
      .map((x) => x.trim())
      .filter((x) => x && !x.startsWith("#"))
      .map((url) => {
        const parsed = new URL(url);
        const name = parsed.hostname.replace(/^www\./, "");
        return { id: stableId(name), name, url, type: "direct" as const };
      });
  }
}

function help(): void {
  console.log(
    `competitor-intel <command>\n\nCommands:\n  analyze --repo . --config FILE --out DIR [--offline] [--manual-sources FILE]\n  scan-repo --repo DIR --out FILE\n  collect --competitors FILE --out DIR [--config FILE] [--offline] [--manual-sources FILE]\n  compare --app-inventory FILE --competitor-data FILE --out DIR [--config FILE]\n  validate --report-dir DIR\n  issues --analysis FILE --priority build-now,build-next --out FILE\n  diff --previous DIR --current DIR --out FILE\n\nExit codes: 0 success; 1 validation, configuration, I/O, or partial command failure.`,
  );
}

main().catch((error: unknown) => {
  console.error(
    JSON.stringify({
      level: "error",
      message: error instanceof Error ? error.message : String(error),
    }),
  );
  process.exitCode = 1;
});
