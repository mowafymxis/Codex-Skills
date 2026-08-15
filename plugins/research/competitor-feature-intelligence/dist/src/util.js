import { createHash } from "node:crypto";
import { mkdir, rename, writeFile } from "node:fs/promises";
import path from "node:path";
export function stableId(value) {
    const slug = value
        .toLowerCase()
        .normalize("NFKD")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
    return `${slug.slice(0, 48) || "feature"}-${createHash("sha256").update(value.toLowerCase()).digest("hex").slice(0, 8)}`;
}
export function hash(value) {
    return createHash("sha256").update(value).digest("hex");
}
export function redact(value) {
    return value
        .replace(/-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----/g, "[REDACTED PRIVATE KEY]")
        .replace(/\b(?:sk|ghp|github_pat|xox[baprs])-[_A-Za-z0-9-]{12,}\b/g, "[REDACTED TOKEN]")
        .replace(new RegExp("(Bearer|Basic)\\s+[A-Za-z0-9._~+/-]+=*", "gi"), "$1 [REDACTED]")
        .replace(/\b(password|passwd|pwd|token|api[_-]?key|secret|authorization)\s*[:=]\s*[^\s,;]+/gi, "$1=[REDACTED]")
        .replace(/(?:postgres(?:ql)?|mysql|mongodb(?:\+srv)?):\/\/[^\s]+/gi, "[REDACTED CONNECTION STRING]");
}
export function ensureWithin(root, target) {
    const resolvedRoot = path.resolve(root);
    const resolvedTarget = path.resolve(target);
    const relative = path.relative(resolvedRoot, resolvedTarget);
    if (relative.startsWith("..") || path.isAbsolute(relative))
        throw new Error(`Path escapes allowed root: ${target}`);
    return resolvedTarget;
}
export async function atomicWrite(file, data) {
    await mkdir(path.dirname(file), { recursive: true });
    const temp = `${file}.${process.pid}.tmp`;
    await writeFile(temp, data, "utf8");
    await rename(temp, file);
}
export function csvCell(value) {
    const text = Array.isArray(value) ? value.join("; ") : String(value ?? "");
    return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}
export function canonicalizeUrl(input) {
    const url = new URL(input);
    url.hash = "";
    for (const key of [...url.searchParams.keys()]) {
        if (/^(utm_|fbclid|gclid|ref$)/i.test(key))
            url.searchParams.delete(key);
    }
    url.hostname = url.hostname.toLowerCase();
    url.pathname = url.pathname.replace(/\/{2,}/g, "/").replace(/\/$/, "") || "/";
    return url.toString();
}
export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
//# sourceMappingURL=util.js.map