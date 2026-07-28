export declare function stableId(value: string): string;
export declare function hash(value: string): string;
export declare function redact(value: string): string;
export declare function ensureWithin(root: string, target: string): string;
export declare function atomicWrite(file: string, data: string): Promise<void>;
export declare function csvCell(value: unknown): string;
export declare function canonicalizeUrl(input: string): string;
export declare const sleep: (ms: number) => Promise<void>;
