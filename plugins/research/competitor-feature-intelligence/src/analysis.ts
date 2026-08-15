import type {
  Analysis,
  AppFeature,
  CompetitorFeature,
  Config,
  Evidence,
  FeatureGap,
  SourceRecord,
} from "./types.js";
import { normalizeFeatures } from "./normalizer.js";
import { defaultScore, scorePriority } from "./scoring.js";

export function buildAnalysis(
  config: Config,
  appFeatures: AppFeature[],
  competitorFeatures: CompetitorFeature[],
  sources: SourceRecord[],
): Analysis {
  const normalized = normalizeFeatures(appFeatures, competitorFeatures, config.aliasDictionary);
  const featureGaps: FeatureGap[] = normalized.map((feature) => {
    const competitors = feature.competitorAvailability as string[];
    const appStatus = String(feature.appStatus);
    const missing = appStatus === "missing";
    const inputs = defaultScore(
      missing,
      competitors.length,
      String(feature.confidence),
      String(feature.category),
    );
    if (
      missing &&
      feature.category === "Mobile" &&
      /mvp|prototype|early/i.test(config.currentStage)
    ) {
      inputs.damagesSimplicity = true;
    }
    const scored = scorePriority(inputs);
    const appEvidence = (feature.evidence as Evidence[]).filter((x) => x.type === "code");
    const competitiveStatus =
      missing && competitors.length
        ? "competitor advantage"
        : !missing && !competitors.length
          ? "app advantage"
          : !missing && competitors.length
            ? "parity"
            : "unclear";
    let recommendation = scored.label;
    if (!missing && !competitors.length) recommendation = "Differentiator to Protect";
    else if (!missing && ["partial", "prototype", "mentioned-only"].includes(appStatus))
      recommendation = "Improve Existing";
    else if (!missing) recommendation = "Already Strong";
    return {
      id: String(feature.id),
      feature: String(feature.canonicalName),
      category: String(feature.category),
      appStatus,
      competitiveStatus,
      competitors,
      recommendation,
      priorityLabel: scored.label,
      priorityScore: scored.score,
      scoreInputs: inputs,
      rationale: scored.rationale,
      evidence: appEvidence.length ? appEvidence : (feature.evidence as Evidence[]),
      confidence: feature.confidence as FeatureGap["confidence"],
      mvpVersion: missing
        ? `Implement the smallest end-to-end ${String(feature.canonicalName)} workflow with authorization, validation, and tests.`
        : "Strengthen the verified workflow and close its documented missing pieces.",
      fullVersion: `Deliver a polished ${String(feature.canonicalName)} experience with observability, accessibility, documentation, and lifecycle handling.`,
      risks:
        inputs.evidenceStrength <= 2
          ? ["Evidence is weak; validate demand before implementation."]
          : [],
    };
  });
  const roadmap: Record<string, FeatureGap[]> = {
    buildNow: [],
    buildNext: [],
    validateFirst: [],
    consider: [],
    later: [],
    monitor: [],
    ignore: [],
  };
  const keyByLabel: Record<string, string> = {
    "Build Now": "buildNow",
    "Build Next": "buildNext",
    "Validate First": "validateFirst",
    Consider: "consider",
    Later: "later",
    Monitor: "monitor",
    Ignore: "ignore",
  };
  for (const gap of featureGaps) {
    const key = keyByLabel[gap.priorityLabel];
    if (key) roadmap[key]!.push(gap);
  }
  const failed = sources.filter((x) => ["failed", "blocked"].includes(x.fetchStatus));
  return {
    schemaVersion: "1.0.0",
    generatedAt: new Date().toISOString(),
    pluginVersion: "1.0.0",
    app: {
      name: config.appName,
      url: config.appUrl,
      category: "unknown",
      targetUsers: config.targetUsers,
      businessModel: config.businessModel,
      stage: config.currentStage,
      summary: `${appFeatures.length} repository-supported feature areas detected.`,
      maturity: appFeatures.some((x) => x.status === "functional") ? "functional" : "early",
      techStack: [],
      strengths: featureGaps
        .filter((x) => x.competitiveStatus === "app advantage")
        .map((x) => x.feature),
      weaknesses: featureGaps
        .filter((x) => x.competitiveStatus === "competitor advantage")
        .map((x) => x.feature),
      evidence: appFeatures.flatMap((x) => x.evidence),
    },
    competitors: config.competitors,
    appFeatures,
    competitorFeatures,
    normalizedFeatures: normalized,
    featureGaps,
    uxAnalysis: {
      status: config.includeUxAnalysis ? "evidence-limited" : "not-requested",
      observations: [],
    },
    pricingAnalysis: {
      status: config.includePricingAnalysis ? "source-dependent" : "not-requested",
      prices: [],
      warning: "No price is reported without cited current evidence.",
    },
    trustSecurityAnalysis: {
      status: config.includeTrustSecurityAnalysis ? "repository-signals-only" : "not-requested",
      legalReviewRequired: true,
    },
    growthRetentionAnalysis: {
      status:
        config.includeGrowthAnalysis || config.includeRetentionAnalysis
          ? "evidence-limited"
          : "not-requested",
      recommendations: [],
    },
    seoAnalysis: { status: config.includeSeoAnalysis ? "evidence-limited" : "not-requested" },
    accessibilityAnalysis: {
      status: config.includeAccessibilityAnalysis ? "code-signals-only" : "not-requested",
      wcagConformance: "not-assessed",
    },
    technicalFeasibility: featureGaps
      .filter((x) => ["Build Now", "Build Next"].includes(x.priorityLabel))
      .map((x) => ({
        feature: x.feature,
        frontend: "Inspect affected UI routes and states.",
        backend: "Add validated service/API behavior where required.",
        database: "Determine migration needs from the repository schema.",
        authorization: "Define and test access rules.",
        tests: "Unit, integration, authorization, and failure-state coverage.",
        complexity: x.scoreInputs.difficulty,
        risks: x.risks,
        likelyAreas: appFeatures.flatMap((f) => f.relatedFiles).slice(0, 5),
        mvp: x.mvpVersion,
        polished: x.fullVersion,
        rollback: "Ship behind a reversible feature flag when risk warrants it.",
      })),
    roadmap,
    doNotBuildYet: featureGaps.filter((x) => x.priorityLabel === "Do Not Build Yet"),
    positioning: {
      strongestVerifiedAngle:
        featureGaps.find((x) => x.competitiveStatus === "app advantage")?.feature ??
        "Insufficient evidence",
      supportedClaims: featureGaps
        .filter((x) => x.competitiveStatus === "app advantage" && x.confidence !== "low")
        .map((x) => x.feature),
      claimsToAvoid: ["Definitive competitor absence without comprehensive source coverage"],
    },
    changes: [],
    sources,
    uncertainty: [
      ...(failed.length
        ? [
            `${failed.length} source(s) were unavailable or blocked; absence claims are not supported by those failures.`,
          ]
        : []),
      ...(sources.length === 0 && config.competitors.length
        ? ["No competitor source evidence was available; competitor analysis is partial."]
        : []),
    ],
    warnings:
      sources.length === 0 && config.competitors.length
        ? ["PARTIAL ANALYSIS: competitor evidence was not collected."]
        : [],
  };
}
