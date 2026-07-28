import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";
import { atomicWrite, csvCell } from "./util.js";
const require = createRequire(import.meta.url);
const Ajv2020 = require("ajv/dist/2020").default;
const addFormats = require("ajv-formats").default;
const REPORT_FILES = [
    "competitive-feature-report.md",
    "app-feature-inventory.json",
    "competitor-sources.json",
    "competitor-features.json",
    "competitor-feature-matrix.csv",
    "feature-gap-analysis.json",
    "recommended-roadmap.md",
    "do-not-build-yet.md",
    "positioning-recommendations.md",
    "technical-feasibility.md",
    "analysis-metadata.json",
];
export async function generateReports(analysis, out) {
    const jsonFiles = {
        "app-feature-inventory.json": analysis.appFeatures,
        "competitor-sources.json": analysis.sources,
        "competitor-features.json": analysis.competitorFeatures,
        "feature-gap-analysis.json": analysis,
        "analysis-metadata.json": {
            pluginVersion: analysis.pluginVersion,
            runTimestamp: analysis.generatedAt,
            configurationSummary: { app: analysis.app.name, competitors: analysis.competitors.length },
            repositoryCommitInspected: await gitCommit(),
            sourcesRetrieved: analysis.sources.filter((x) => ["success", "cached", "manual"].includes(x.fetchStatus)).length,
            failures: analysis.sources.filter((x) => x.fetchStatus === "failed").map((x) => x.url),
            warnings: analysis.warnings,
            generatedFiles: REPORT_FILES,
            partialAnalysis: analysis.warnings.length > 0,
        },
    };
    for (const [name, value] of Object.entries(jsonFiles))
        await atomicWrite(path.join(out, name), `${JSON.stringify(value, null, 2)}\n`);
    await atomicWrite(path.join(out, "competitor-feature-matrix.csv"), matrixCsv(analysis));
    await atomicWrite(path.join(out, "competitive-feature-report.md"), mainReport(analysis));
    await atomicWrite(path.join(out, "recommended-roadmap.md"), roadmapReport(analysis));
    await atomicWrite(path.join(out, "do-not-build-yet.md"), doNotBuildReport(analysis));
    await atomicWrite(path.join(out, "positioning-recommendations.md"), `# Positioning Recommendations\n\nStrongest verified angle: ${String(analysis.positioning.strongestVerifiedAngle)}\n\nSupported claims: ${analysis.positioning.supportedClaims.join(", ") || "None yet; gather stronger evidence."}\n\nAvoid definitive competitor-absence and compliance claims.\n`);
    await atomicWrite(path.join(out, "technical-feasibility.md"), `# Technical Feasibility\n\n${analysis.technicalFeasibility.map((x) => `## ${String(x.feature)}\n\n- Complexity: ${String(x.complexity)}/5\n- MVP: ${String(x.mvp)}\n- Tests: ${String(x.tests)}\n- Rollback: ${String(x.rollback)}\n`).join("\n") || "No Build Now or Build Next items were supported by current evidence.\n"}`);
}
async function gitCommit() {
    try {
        const { execFile } = await import("node:child_process");
        return await new Promise((resolve) => execFile("git", ["rev-parse", "HEAD"], (error, stdout) => resolve(error ? null : stdout.trim())));
    }
    catch {
        return null;
    }
}
function mainReport(a) {
    const partial = a.warnings.length ? `> **Partial analysis:** ${a.warnings.join(" ")}\n\n` : "";
    const table = a.appFeatures
        .map((x) => `| ${x.name} | ${x.category} | ${x.status} | ${x.maturityScore} | ${x.confidence} | ${x.evidence
        .map((e) => e.path ?? e.url)
        .filter(Boolean)
        .join("; ")} | ${x.missingPieces.join("; ")} |`)
        .join("\n");
    const gaps = a.featureGaps
        .filter((x) => x.competitiveStatus === "competitor advantage")
        .map((x) => `### ${x.feature}\n\n- Evidence-backed status: ${x.appStatus}; ${x.competitors.length} competitor(s) with evidence\n- Priority: ${x.priorityLabel} (${x.priorityScore}/5)\n- Recommendation: ${x.recommendation}\n- MVP: ${x.mvpVersion}\n- Confidence: ${x.confidence}\n`)
        .join("\n");
    return `# Competitive Feature Intelligence Report\n\n${partial}## 1. Executive Summary\n\nThe repository exposes ${a.appFeatures.length} supported feature areas. ${a.featureGaps.filter((x) => x.competitiveStatus === "competitor advantage").length} competitor advantages and ${a.featureGaps.filter((x) => x.competitiveStatus === "app advantage").length} app advantages were identified from available evidence. Scores are decision support, not objective truth.\n\n## 2. Scope and Method\n\nRepository behavior was matched across multiple code signals; public/manual sources retained URL, retrieval time, reliability, and failures. Inaccessible pages are never treated as absence.\n\n## 3. App Summary\n\n${String(a.app.summary)} Stage: ${String(a.app.stage)}. Target users: ${a.app.targetUsers.join(", ") || "not supplied"}.\n\n## 4. App Feature Inventory\n\n| Feature | Category | Status | Maturity | Confidence | Evidence | Missing Pieces |\n|---|---|---:|---:|---:|---|---|\n${table}\n\n## 5. Competitor Overview\n\n${a.competitors.map((x) => `- ${x.name} (${x.type}): ${x.url}`).join("\n") || "No competitors supplied."}\n\n## 6. Competitor Feature Matrix\n\nSee \`competitor-feature-matrix.csv\`.\n\n## 7. Features Competitors Have That the App Lacks\n\n${gaps || "No sufficiently evidenced gaps found."}\n\n## 8. App Features Not Found in Reviewed Competitor Sources\n\n${a.featureGaps
        .filter((x) => x.competitiveStatus === "app advantage")
        .map((x) => `- ${x.feature}: No evidence of this feature was found in the reviewed public sources (${x.confidence} confidence).`)
        .join("\n") || "None supported by current coverage."}\n\n## 9. Shared Features Implemented Differently\n\nDetailed UX comparison requires workflow-level public evidence; unknown ratings remain unknown.\n\n## 10. Table Stakes\n\n${a.featureGaps
        .filter((x) => x.scoreInputs.importance === 5)
        .map((x) => `- ${x.feature}: ${x.priorityLabel}`)
        .join("\n") || "No verified table-stakes gaps."}\n\n## 11. Differentiators\n\n${String(a.positioning.strongestVerifiedAngle)}\n\n## 12. UX and Onboarding\n\nEvidence-limited; no rating is invented from private dashboard claims.\n\n## 13. Pricing and Monetization\n\nNo current price is stated without a dated source.\n\n## 14. Trust, Security, Privacy, and Credibility\n\nRepository signals are not proof of legal compliance. Qualified review is required.\n\n## 15. Growth and Retention\n\nRecommendations require product and user evidence; deceptive loops are excluded.\n\n## 16. SEO, Content, and Distribution\n\nExact search volume is not claimed without an external source.\n\n## 17. Accessibility\n\nCode signals do not establish WCAG conformance; conduct keyboard, screen-reader, contrast, and responsive testing.\n\n## 18. Technical Feasibility\n\nSee \`technical-feasibility.md\`.\n\n## 19. Priority Roadmap\n\nSee \`recommended-roadmap.md\`.\n\n## 20. Do Not Build Yet\n\nSee \`do-not-build-yet.md\`.\n\n## 21. Better-Than-Competitor Opportunities\n\nValidate significant competitor advantages before designing a superior implementation.\n\n## 22. Positioning Recommendations\n\nSee \`positioning-recommendations.md\`.\n\n## 23. Changes Since Previous Scan\n\nRun the \`diff\` command with previous and current reports.\n\n## 24. Final Action Plan\n\nBuild the highest-evidence Build Now items, validate costly weak-evidence items, and protect verified app advantages.\n\n## 25. Evidence and Sources\n\n${a.sources.map((x) => `- ${x.canonicalUrl} (${x.retrievedAt}; ${x.reliability}): ${x.fetchStatus}`).join("\n") || "Repository evidence only."}\n\n## 26. Uncertainty and Missing Data\n\n${a.uncertainty.map((x) => `- ${x}`).join("\n") || "- No material uncertainty recorded beyond normal public-source limits."}\n\nBottom line:\n- Build these first: ${a.roadmap.buildNow
        ?.slice(0, 3)
        .map((x) => x.feature)
        .join(", ") || "none supported"}\n- Validate these before building: ${a.roadmap.validateFirst
        ?.slice(0, 3)
        .map((x) => x.feature)
        .join(", ") || "none"}\n- Do not build these yet: ${a.doNotBuildYet
        .slice(0, 3)
        .map((x) => x.feature)
        .join(", ") || "none"}\n- The strongest current advantage is: ${String(a.positioning.strongestVerifiedAngle)}\n- The biggest competitive risk is: ${a.featureGaps.find((x) => x.competitiveStatus === "competitor advantage")?.feature ?? "insufficient evidence"}\n- The next best move is: verify the top recommendation with users and source evidence.\n`;
}
function roadmapReport(a) {
    return `# Recommended Roadmap\n\nScores are decision support, not objective truth.\n\n${Object.entries(a.roadmap)
        .map(([key, items]) => `## ${key.replace(/([A-Z])/g, " $1").replace(/^./, (x) => x.toUpperCase())}\n\n${items.map((x) => `- **${x.feature}** — ${x.priorityScore}/5. ${x.rationale} MVP: ${x.mvpVersion}`).join("\n") || "No items."}`)
        .join("\n\n")}\n`;
}
function doNotBuildReport(a) {
    return `# Do Not Build Yet\n\n| Feature | Why Tempting | Why Avoid | Alternative | Reconsider When |\n|---|---|---|---|---|\n${a.doNotBuildYet.map((x) => `| ${x.feature} | Competitor presence | ${x.rationale} | Validate the user problem first | Evidence and strategic fit improve |`).join("\n") || "| None | — | No explicit avoid decision supported | — | — |"}\n`;
}
function matrixCsv(a) {
    const headers = [
        "Feature ID",
        "Feature",
        "Category",
        "App Status",
        "App Maturity",
        "Competitors With Feature",
        "Competitor Availability",
        "Evidence",
        "Evidence Reliability",
        "Confidence",
        "Importance",
        "Urgency",
        "User Pain",
        "Activation Impact",
        "Revenue Impact",
        "Retention Impact",
        "Trust Impact",
        "Strategic Fit",
        "Uniqueness",
        "Difficulty",
        "Operational Cost",
        "Priority Score",
        "Priority Label",
        "Recommendation",
        "MVP Version",
        "Full Version",
        "Notes",
    ];
    const rows = a.featureGaps.map((x) => [
        x.id,
        x.feature,
        x.category,
        x.appStatus,
        a.appFeatures.find((f) => f.id === x.id)?.maturityScore ?? "unknown",
        x.competitors,
        x.competitors.length ? "evidence present" : "none found in reviewed sources",
        x.evidence.map((e) => e.path ?? e.url ?? e.summary),
        x.evidence.map((e) => e.reliability ?? "unknown"),
        x.confidence,
        x.scoreInputs.importance,
        x.scoreInputs.urgency,
        x.scoreInputs.userPainSeverity,
        x.scoreInputs.activationImpact,
        x.scoreInputs.revenueImpact,
        x.scoreInputs.retentionImpact,
        x.scoreInputs.trustImpact,
        x.scoreInputs.strategicFit,
        x.scoreInputs.uniqueness,
        x.scoreInputs.difficulty,
        x.scoreInputs.operationalCost,
        x.priorityScore,
        x.priorityLabel,
        x.recommendation,
        x.mvpVersion,
        x.fullVersion,
        x.risks,
    ]);
    return `${[headers, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n")}\r\n`;
}
export async function validateReportDirectory(directory, schemaPath) {
    const missing = [];
    for (const file of REPORT_FILES) {
        try {
            if (!(await stat(path.join(directory, file))).isFile())
                missing.push(file);
        }
        catch {
            missing.push(file);
        }
    }
    if (missing.length)
        throw new Error(`Missing report files: ${missing.join(", ")}`);
    const schema = JSON.parse(await readFile(schemaPath, "utf8"));
    const ajv = new Ajv2020({ allErrors: true, strict: true });
    addFormats(ajv);
    const validate = ajv.compile(schema);
    const analysis = JSON.parse(await readFile(path.join(directory, "feature-gap-analysis.json"), "utf8"));
    if (!validate(analysis))
        throw new Error(`Schema validation failed: ${ajv.errorsText(validate.errors)}`);
    for (const file of (await readdir(directory)).filter((x) => x.endsWith(".json")))
        JSON.parse(await readFile(path.join(directory, file), "utf8"));
    return REPORT_FILES;
}
export function issueDrafts(gaps, labels) {
    return `# GitHub Issue Drafts\n\n${gaps
        .filter((x) => labels.map(normalizeLabel).includes(normalizeLabel(x.priorityLabel)))
        .map((x) => `## ${x.feature}\n\n**Priority:** ${x.priorityLabel} (${x.priorityScore}/5)\n\n### Problem\n${x.rationale}\n\n### MVP scope\n${x.mvpVersion}\n\n### Acceptance criteria\n- [ ] End-to-end workflow is implemented\n- [ ] Authorization and validation are tested\n- [ ] Failure, loading, and empty states are handled where applicable\n- [ ] Observability and rollback approach are documented\n\n### Evidence\n${x.evidence.map((e) => `- ${e.path ?? e.url ?? e.summary}: ${e.summary}`).join("\n")}\n\n### Risks\n${x.risks.map((r) => `- ${r}`).join("\n") || "- Validate scope against the current architecture."}`)
        .join("\n\n---\n\n")}\n`;
}
const normalizeLabel = (x) => x.toLowerCase().replace(/[ _-]/g, "");
//# sourceMappingURL=reports.js.map