import type { AppFeature, CompetitorFeature } from "./types.js";
export declare function canonicalName(name: string, aliases?: Record<string, string>): string;
export declare function normalizeFeatures(app: AppFeature[], competitors: CompetitorFeature[], aliases?: Record<string, string>): Array<Record<string, unknown>>;
