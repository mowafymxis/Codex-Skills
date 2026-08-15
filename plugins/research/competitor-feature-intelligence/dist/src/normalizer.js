import { stableId } from "./util.js";
const SAFE_ALIASES = {
    "user authentication": "authentication",
    "account login": "authentication",
    "team workspace": "team workspaces",
    organizations: "team workspaces",
    "csv export": "data export",
};
const DISTINCT = [
    ["google login", "enterprise sso"],
    ["oauth", "saml"],
    ["email notifications", "push notifications"],
    ["ai chat", "ai recommendations"],
    ["team workspaces", "role-based access control"],
    ["api access", "webhooks"],
    ["responsive web", "native mobile app"],
];
export function canonicalName(name, aliases = {}) {
    const normalized = name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, " ")
        .replace(/\s+/g, " ");
    return ({
        ...SAFE_ALIASES,
        ...Object.fromEntries(Object.entries(aliases).map(([k, v]) => [k.toLowerCase(), v.toLowerCase()])),
    }[normalized] ?? normalized);
}
export function normalizeFeatures(app, competitors, aliases = {}) {
    const catalog = new Map();
    for (const feature of app) {
        const key = canonicalName(feature.name, aliases);
        const group = catalog.get(key) ?? { app: [], competitors: [] };
        group.app.push(feature);
        catalog.set(key, group);
    }
    for (const feature of competitors) {
        const key = canonicalName(feature.name, aliases);
        const group = catalog.get(key) ?? { app: [], competitors: [] };
        group.competitors.push(feature);
        catalog.set(key, group);
    }
    return [...catalog.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([name, group]) => ({
        id: stableId(name),
        canonicalName: name,
        aliases: [
            ...new Set([...group.app.map((x) => x.name), ...group.competitors.map((x) => x.name)]),
        ],
        category: group.app[0]?.category ?? group.competitors[0]?.category ?? "Other",
        description: group.app[0]?.description ?? group.competitors[0]?.description ?? "",
        inclusionRules: [`Evidence explicitly describes ${name}.`],
        exclusionRules: DISTINCT.filter((pair) => pair.includes(name)).flatMap((pair) => pair.filter((x) => x !== name)),
        relatedButDistinct: DISTINCT.filter((pair) => pair.includes(name)).flatMap((pair) => pair.filter((x) => x !== name)),
        appStatus: group.app[0]?.status ?? "missing",
        competitorAvailability: [...new Set(group.competitors.map((x) => x.competitorId))],
        evidence: [
            ...group.app.flatMap((x) => x.evidence),
            ...group.competitors.flatMap((x) => x.sources.map((url) => ({ type: "source", url, summary: `Supports ${x.name}.` }))),
        ],
        confidence: group.app[0]?.confidence ?? group.competitors[0]?.confidence ?? "unknown",
    }));
}
//# sourceMappingURL=normalizer.js.map