import { readFile } from "node:fs/promises";
import path from "node:path";
import { stableId } from "./util.js";
export const defaults = {
    appName: "Unnamed App",
    appUrl: "",
    repoPath: ".",
    targetUsers: [],
    businessModel: "unknown",
    currentStage: "unknown",
    competitors: [],
    outputDirectory: "./competitive-report",
    maxPagesPerCompetitor: 30,
    maxCrawlDepth: 3,
    crawlDelayMs: 1000,
    requestTimeoutMs: 15000,
    strictEvidenceMode: true,
    minimumConfidence: "low",
    includeOfficialSources: true,
    includeThirdPartyReviews: true,
    includePublicGithubRepositories: true,
    includeAppStoreListings: true,
    includeExtensionListings: true,
    includePricingAnalysis: true,
    includeUxAnalysis: true,
    includeSeoAnalysis: true,
    includeAccessibilityAnalysis: true,
    includeTrustSecurityAnalysis: true,
    includeGrowthAnalysis: true,
    includeRetentionAnalysis: true,
    includeTechnicalFeasibility: true,
    includePositioningAnalysis: true,
    includeBetterThanCompetitorIdeas: true,
    includeDoNotBuildSection: true,
    includeChangeDetection: true,
    generateGithubIssueDrafts: false,
    allowedDomains: [],
    blockedDomains: [],
    ignoredPaths: [],
    redactSensitiveData: true,
    offline: false,
    aliasDictionary: {},
};
function normalizeCompetitor(value) {
    if (!value || typeof value !== "object")
        throw new Error("Each competitor must be an object");
    const raw = value;
    if (typeof raw.name !== "string" || !raw.name.trim())
        throw new Error("Competitor name is required");
    if (typeof raw.url !== "string")
        throw new Error(`Competitor ${raw.name} requires a URL`);
    try {
        new URL(raw.url);
    }
    catch {
        throw new Error(`Competitor ${raw.name} has an invalid URL`);
    }
    const allowed = ["direct", "indirect", "substitute", "open-source", "benchmark"];
    const type = allowed.includes(raw.type)
        ? raw.type
        : "direct";
    return {
        id: typeof raw.id === "string" ? raw.id : stableId(raw.name),
        name: raw.name,
        url: raw.url,
        type,
    };
}
export async function loadConfig(file, overrides = {}) {
    let raw = {};
    if (file)
        raw = JSON.parse(await readFile(file, "utf8"));
    const merged = { ...defaults, ...raw, ...overrides };
    merged.competitors = (overrides.competitors ?? raw.competitors ?? []).map(normalizeCompetitor);
    if (!Number.isInteger(merged.maxPagesPerCompetitor) ||
        merged.maxPagesPerCompetitor < 1 ||
        merged.maxPagesPerCompetitor > 100) {
        throw new Error("maxPagesPerCompetitor must be an integer from 1 to 100");
    }
    if (merged.crawlDelayMs < 0 || merged.requestTimeoutMs < 100)
        throw new Error("Network timing values are invalid");
    if (!["high", "medium", "low", "unknown"].includes(merged.minimumConfidence))
        throw new Error("minimumConfidence is invalid");
    if (!Array.isArray(merged.allowedDomains) || !Array.isArray(merged.blockedDomains))
        throw new Error("Domain controls must be arrays");
    merged.repoPath = path.resolve(file ? path.dirname(file) : process.cwd(), merged.repoPath);
    merged.outputDirectory = path.resolve(file ? path.dirname(file) : process.cwd(), merged.outputDirectory);
    return merged;
}
//# sourceMappingURL=config.js.map