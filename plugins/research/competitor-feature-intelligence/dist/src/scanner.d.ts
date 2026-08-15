import type { AppFeature } from "./types.js";
export declare function listSourceFiles(root: string, ignoredPaths?: string[]): Promise<string[]>;
export declare function scanRepository(root: string, ignoredPaths?: string[]): Promise<AppFeature[]>;
