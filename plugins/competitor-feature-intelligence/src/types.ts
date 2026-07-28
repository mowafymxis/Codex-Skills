export type Confidence = "high" | "medium" | "low" | "unknown";
export type AppStatus =
  | "not-implemented"
  | "mentioned-only"
  | "prototype"
  | "partial"
  | "functional"
  | "polished"
  | "deprecated"
  | "unknown";

export interface Evidence {
  type: "code" | "documentation" | "source";
  path?: string;
  url?: string;
  lineStart?: number;
  lineEnd?: number;
  symbol?: string;
  summary: string;
  reliability?: "high" | "medium" | "low" | "unknown";
}

export interface AppFeature {
  id: string;
  name: string;
  category: string;
  description: string;
  userValue: string;
  status: AppStatus;
  maturityScore: number;
  confidence: Confidence;
  evidence: Evidence[];
  relatedFiles: string[];
  dependencies: string[];
  qualityNotes: string[];
  risks: string[];
  missingPieces: string[];
}

export interface Competitor {
  id: string;
  name: string;
  url: string;
  type: "direct" | "indirect" | "substitute" | "open-source" | "benchmark";
}

export interface SourceRecord {
  competitorId: string;
  url: string;
  canonicalUrl: string;
  sourceType: string;
  title: string;
  publisher: string;
  isOfficial: boolean;
  publishedAt: string | null;
  retrievedAt: string;
  contentHash: string;
  fetchStatus: "success" | "failed" | "blocked" | "cached" | "manual";
  httpStatus: number | null;
  text: string;
  relevantSnippets: string[];
  reliability: "high" | "medium" | "low" | "unknown";
  notes: string[];
}

export interface CompetitorFeature {
  id: string;
  competitorId: string;
  name: string;
  normalizedName: string;
  category: string;
  description: string;
  userWorkflow: string;
  targetUser: string;
  availability: { plan: string; platform: string; region: string; status: string };
  evidenceType: string;
  confidence: Confidence;
  maturityEstimate: string;
  uxEstimate: string;
  strategicValue: string;
  tableStakes: boolean;
  differentiating: boolean;
  sources: string[];
  notes: string[];
}

export interface ScoreInputs {
  importance: number;
  urgency: number;
  userPainSeverity: number;
  revenueImpact: number;
  retentionImpact: number;
  activationImpact: number;
  trustImpact: number;
  uniqueness: number;
  strategicFit: number;
  evidenceStrength: number;
  difficulty: number;
  operationalCost: number;
  mvpSuitability: number;
  securityBlocker?: boolean;
  damagesSimplicity?: boolean;
}

export interface FeatureGap {
  id: string;
  feature: string;
  category: string;
  appStatus: string;
  competitiveStatus: string;
  competitors: string[];
  recommendation: string;
  priorityLabel: string;
  priorityScore: number;
  scoreInputs: ScoreInputs;
  rationale: string;
  evidence: Evidence[];
  confidence: Confidence;
  mvpVersion: string;
  fullVersion: string;
  risks: string[];
}

export interface Config {
  appName: string;
  appUrl: string;
  repoPath: string;
  targetUsers: string[];
  businessModel: string;
  currentStage: string;
  competitors: Competitor[];
  outputDirectory: string;
  maxPagesPerCompetitor: number;
  maxCrawlDepth: number;
  crawlDelayMs: number;
  requestTimeoutMs: number;
  strictEvidenceMode: boolean;
  minimumConfidence: Confidence;
  includeOfficialSources: boolean;
  includeThirdPartyReviews: boolean;
  includePublicGithubRepositories: boolean;
  includeAppStoreListings: boolean;
  includeExtensionListings: boolean;
  includePricingAnalysis: boolean;
  includeUxAnalysis: boolean;
  includeSeoAnalysis: boolean;
  includeAccessibilityAnalysis: boolean;
  includeTrustSecurityAnalysis: boolean;
  includeGrowthAnalysis: boolean;
  includeRetentionAnalysis: boolean;
  includeTechnicalFeasibility: boolean;
  includePositioningAnalysis: boolean;
  includeBetterThanCompetitorIdeas: boolean;
  includeDoNotBuildSection: boolean;
  includeChangeDetection: boolean;
  generateGithubIssueDrafts: boolean;
  allowedDomains: string[];
  blockedDomains: string[];
  ignoredPaths: string[];
  redactSensitiveData: boolean;
  offline: boolean;
  aliasDictionary: Record<string, string>;
}

export interface Analysis {
  schemaVersion: string;
  generatedAt: string;
  pluginVersion: string;
  app: Record<string, unknown>;
  competitors: Competitor[];
  appFeatures: AppFeature[];
  competitorFeatures: CompetitorFeature[];
  normalizedFeatures: Array<Record<string, unknown>>;
  featureGaps: FeatureGap[];
  uxAnalysis: Record<string, unknown>;
  pricingAnalysis: Record<string, unknown>;
  trustSecurityAnalysis: Record<string, unknown>;
  growthRetentionAnalysis: Record<string, unknown>;
  seoAnalysis: Record<string, unknown>;
  accessibilityAnalysis: Record<string, unknown>;
  technicalFeasibility: Array<Record<string, unknown>>;
  roadmap: Record<string, FeatureGap[]>;
  doNotBuildYet: FeatureGap[];
  positioning: Record<string, unknown>;
  changes: Array<Record<string, unknown>>;
  sources: SourceRecord[];
  uncertainty: string[];
  warnings: string[];
}
