export type Confidence = "high" | "medium" | "low";

export interface DetectedTool {
  name: string;
  confidence: Confidence;
  evidence: string[];
  explanation?: string;
}

export interface EvidenceItem {
  label: string;
  confidence: Confidence;
  evidence: string[];
  explanation: string;
}

export interface ImportantFile {
  file: string;
  reason: string;
  risk: string;
  mtimeMs: number;
  score: number;
  signals: string[];
  highRisk: boolean;
  doNotEditReason?: string;
}

export interface TodoItem {
  file: string;
  line: number;
  text: string;
}

export interface RouteInfo {
  route: string;
  file: string;
  kind: "next-app-api" | "next-pages-api" | "express" | "route-file";
  confidence: Confidence;
  evidence: string[];
  explanation: string;
}

export interface EnvVarInfo {
  name: string;
  files: string[];
  likelyPurpose: string;
  confidence: Confidence;
  evidence: string[];
  explanation: string;
}

export interface RepoFile {
  path: string;
  text?: string;
  mtimeMs: number;
  size: number;
}

export type MemoryMode = "tiny" | "standard" | "detailed";

export interface DependencyMap {
  coreEntry: string[];
  sharedUtilities: string[];
  apiLayer: string[];
  dataLayer: string[];
  uiLayer: string[];
  configLayer: string[];
}

export interface FrameworkAnalysis {
  name: string;
  detectedFacts: EvidenceItem[];
  assumptions: EvidenceItem[];
  unknowns: EvidenceItem[];
  importantFiles: EvidenceItem[];
  risks: EvidenceItem[];
  evidence: string[];
}

export interface GitInfo {
  available: boolean;
  branch: string;
  changedFiles: string[];
  recentCommits: string[];
  hasUncommittedChanges: boolean;
  recentlyChangedImportantFiles: string[];
}

export interface WorkspacePackage {
  name: string;
  path: string;
  packageManager: string;
  frameworks: DetectedTool[];
  importantFiles: ImportantFile[];
}

export interface ScanResult {
  root: string;
  scannedAt: string;
  purpose: string;
  packageManager: string;
  languages: DetectedTool[];
  frameworks: DetectedTool[];
  databases: DetectedTool[];
  auth: DetectedTool[];
  deployment: DetectedTool[];
  testing: DetectedTool[];
  styling: DetectedTool[];
  importantFiles: ImportantFile[];
  dependencyMap: DependencyMap;
  highRiskFiles: ImportantFile[];
  git: GitInfo;
  folders: Array<{ folder: string; purpose: string }>;
  routes: RouteInfo[];
  envVars: EnvVarInfo[];
  imports: EvidenceItem[];
  exports: EvidenceItem[];
  frameworkAnalyses: FrameworkAnalysis[];
  workspacePackages: WorkspacePackage[];
  todos: TodoItem[];
  dependencies: string[];
  conventions: string[];
  risks: string[];
  staleWarnings: string[];
  score: number;
}
