import type { Config, SourceRecord } from "./types.js";
export declare function collectSources(config: Config, cacheDirectory: string): Promise<SourceRecord[]>;
export declare function ingestManualSources(file: string): Promise<SourceRecord[]>;
