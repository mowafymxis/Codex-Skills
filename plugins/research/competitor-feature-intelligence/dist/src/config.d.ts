import type { Config } from "./types.js";
export declare const defaults: Config;
export declare function loadConfig(file: string | undefined, overrides?: Partial<Config>): Promise<Config>;
