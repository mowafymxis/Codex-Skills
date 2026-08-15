import type { CompetitorFeature, SourceRecord } from "./types.js";
import { stableId } from "./util.js";

const FEATURE_RULES = [
  ["Authentication", "Identity", /\b(?:sign in|login|authentication|oauth)\b/i],
  ["Enterprise SSO", "Identity", /\b(?:saml|enterprise sso|single sign-on)\b/i],
  [
    "Role-based access control",
    "Administration",
    /\b(?:rbac|role-based|custom roles|permissions)\b/i,
  ],
  [
    "Team workspaces",
    "Collaboration",
    /\b(?:workspace|organization|invite (?:your )?team|team members)\b/i,
  ],
  [
    "Real-time collaboration",
    "Collaboration",
    /\b(?:real-time collaboration|collaborative editing|presence)\b/i,
  ],
  [
    "Subscription billing",
    "Monetization",
    /\b(?:subscription|monthly plan|annual plan|billing)\b/i,
  ],
  ["API access", "Integrations", /\b(?:rest api|graphql api|api access|developer api)\b/i],
  ["Webhooks", "Integrations", /\bwebhooks?\b/i],
  ["Email notifications", "Engagement", /\b(?:email notifications?|email alerts?)\b/i],
  ["Push notifications", "Engagement", /\bpush notifications?\b/i],
  ["AI chat", "AI", /\b(?:ai chat|chat with ai|assistant chat)\b/i],
  [
    "AI recommendations",
    "AI",
    /\b(?:ai recommendations?|recommended by ai|personalized recommendations?)\b/i,
  ],
  ["Data export", "Data portability", /\b(?:data export|export to csv|download your data)\b/i],
  ["Native mobile app", "Mobile", /\b(?:ios app|android app|native mobile app)\b/i],
  ["Responsive web", "Mobile", /\b(?:responsive|works on mobile|mobile web)\b/i],
] as const;

export function extractFeatures(sources: SourceRecord[]): CompetitorFeature[] {
  const features: CompetitorFeature[] = [];
  for (const source of sources.filter((x) =>
    ["success", "cached", "manual"].includes(x.fetchStatus),
  )) {
    for (const [name, category, pattern] of FEATURE_RULES) {
      const match = source.text.match(pattern);
      if (!match) continue;
      const evidenceType =
        source.sourceType === "pricing"
          ? "pricing-confirmed"
          : source.sourceType === "documentation"
            ? "documentation-confirmed"
            : source.isOfficial
              ? "official-marketing-claim"
              : "third-party-review";
      const confidence =
        source.reliability === "high" ? "high" : source.reliability === "medium" ? "medium" : "low";
      features.push({
        id: stableId(`${source.competitorId}:${name}`),
        competitorId: source.competitorId,
        name,
        normalizedName: name.toLowerCase(),
        category,
        description: `Evidence for ${name} appears in ${source.title || source.url}.`,
        userWorkflow: "Not directly observed in the collected source.",
        targetUser: "unknown",
        availability: {
          plan: source.sourceType === "pricing" ? "See cited source" : "unknown",
          platform: "unknown",
          region: "unknown",
          status: evidenceType === "official-marketing-claim" ? "claimed" : "available",
        },
        evidenceType,
        confidence,
        maturityEstimate: evidenceType === "official-marketing-claim" ? "unknown" : "functional",
        uxEstimate: "unknown",
        strategicValue: "unknown",
        tableStakes: ["Authentication", "Data export"].includes(name),
        differentiating: false,
        sources: [source.canonicalUrl],
        notes: match.index === undefined ? [] : [`Matched evidence near character ${match.index}.`],
      });
    }
  }
  const unique = new Map<string, CompetitorFeature>();
  for (const feature of features) {
    const key = `${feature.competitorId}:${feature.normalizedName}`;
    const existing = unique.get(key);
    if (!existing || confidenceRank(feature.confidence) > confidenceRank(existing.confidence))
      unique.set(key, feature);
    else existing.sources = [...new Set([...existing.sources, ...feature.sources])];
  }
  return [...unique.values()].sort((a, b) => a.id.localeCompare(b.id));
}

const confidenceRank = (value: string): number =>
  ({ unknown: 0, low: 1, medium: 2, high: 3 })[value] ?? 0;
