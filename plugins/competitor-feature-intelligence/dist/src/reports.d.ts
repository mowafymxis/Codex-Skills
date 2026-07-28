import type { Analysis, FeatureGap } from "./types.js";
export declare function generateReports(analysis: Analysis, out: string): Promise<void>;
export declare function validateReportDirectory(directory: string, schemaPath: string): Promise<string[]>;
export declare function issueDrafts(gaps: FeatureGap[], labels: string[]): string;
