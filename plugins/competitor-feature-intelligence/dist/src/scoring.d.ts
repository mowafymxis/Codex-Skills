import type { ScoreInputs } from "./types.js";
export declare function scorePriority(input: ScoreInputs): {
    score: number;
    label: string;
    rationale: string;
};
export declare function defaultScore(isAppMissing: boolean, competitorCount: number, confidence: string, category: string): ScoreInputs;
