import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { redact, stableId } from "./util.js";
const DEFAULT_IGNORES = new Set([
    ".git",
    "node_modules",
    "dist",
    "build",
    ".next",
    "coverage",
    ".cache",
    "vendor",
    "target",
    "__pycache__",
]);
const TEXT_EXTENSIONS = new Set([
    ".ts",
    ".tsx",
    ".js",
    ".jsx",
    ".py",
    ".go",
    ".rs",
    ".java",
    ".cs",
    ".rb",
    ".php",
    ".vue",
    ".svelte",
    ".html",
    ".css",
    ".sql",
    ".graphql",
    ".json",
    ".yaml",
    ".yml",
    ".md",
    ".toml",
]);
const RULES = [
    {
        name: "Authentication",
        category: "Identity",
        patterns: [/sign.?in|log.?in|authenticate|auth\//i, /session|jwt|oauth|password/i],
        value: "Users can securely access accounts.",
    },
    {
        name: "Role-based access control",
        category: "Administration",
        patterns: [/rbac|role.?based|permissions?/i, /authorize|can\(|hasRole|policy/i],
        value: "Teams can limit actions by role.",
    },
    {
        name: "Subscription billing",
        category: "Monetization",
        patterns: [/stripe|paddle|subscription|billing/i, /checkout|invoice|webhook|plan/i],
        value: "Customers can purchase and manage paid access.",
    },
    {
        name: "Notifications",
        category: "Engagement",
        patterns: [/notification|mailer|sendEmail/i, /queue|template|recipient|push/i],
        value: "Users receive timely product updates.",
    },
    {
        name: "Search",
        category: "Core workflow",
        patterns: [/search|query/i, /filter|index|results?/i],
        value: "Users can find relevant records.",
    },
    {
        name: "Data export",
        category: "Data portability",
        patterns: [/export|download/i, /csv|json|archive|stream/i],
        value: "Users can retrieve their data.",
    },
    {
        name: "File upload",
        category: "Content",
        patterns: [/upload|multipart|dropzone/i, /storage|file|mime|bucket/i],
        value: "Users can add files to the product.",
    },
    {
        name: "Team workspaces",
        category: "Collaboration",
        patterns: [/workspace|organization|team/i, /member|invite|tenant/i],
        value: "Groups can collaborate in a shared space.",
    },
    {
        name: "Analytics dashboard",
        category: "Analytics",
        patterns: [/dashboard|analytics|metrics/i, /chart|report|event|aggregate/i],
        value: "Users can understand activity and outcomes.",
    },
    {
        name: "Onboarding",
        category: "Activation",
        patterns: [/onboarding|getting.?started|setup.?step/i, /welcome|checklist|first.?run/i],
        value: "New users reach first value faster.",
    },
    {
        name: "API and integrations",
        category: "Integrations",
        patterns: [/api\/|router|controller|endpoint/i, /integration|webhook|openapi|graphql/i],
        value: "The product connects to other systems.",
    },
    {
        name: "Account deletion",
        category: "Trust",
        patterns: [/delete.?account|close.?account/i, /erase|removeUser|destroy.*user/i],
        value: "Users can control account lifecycle.",
    },
    {
        name: "Accessibility support",
        category: "Accessibility",
        patterns: [/aria-|role=|<label|alt=/i, /focus|keyboard|screen.?reader/i],
        value: "The interface supports more users and input modes.",
    },
];
async function gitignorePatterns(root) {
    try {
        return (await readFile(path.join(root, ".gitignore"), "utf8"))
            .split(/\r?\n/)
            .map((x) => x.trim().replace(/^\//, "").replace(/\/$/, ""))
            .filter((x) => x && !x.startsWith("#") && !x.includes("!"));
    }
    catch {
        return [];
    }
}
export async function listSourceFiles(root, ignoredPaths = []) {
    const ignored = [...(await gitignorePatterns(root)), ...ignoredPaths];
    const files = [];
    async function walk(dir) {
        for (const item of await readdir(dir, { withFileTypes: true })) {
            const full = path.join(dir, item.name);
            const rel = path.relative(root, full).replace(/\\/g, "/");
            if (DEFAULT_IGNORES.has(item.name) ||
                ignored.some((x) => rel === x || rel.startsWith(`${x}/`)))
                continue;
            if (item.isSymbolicLink())
                continue;
            if (item.isDirectory())
                await walk(full);
            else if (TEXT_EXTENSIONS.has(path.extname(item.name).toLowerCase()) && files.length < 20_000)
                files.push(full);
        }
    }
    await walk(root);
    return files;
}
export async function scanRepository(root, ignoredPaths = []) {
    const files = await listSourceFiles(root, ignoredPaths);
    const matches = new Map();
    const partial = new Map();
    for (const file of files) {
        let text;
        try {
            text = redact((await readFile(file, "utf8")).slice(0, 500_000));
        }
        catch {
            continue;
        }
        const lines = text.split(/\r?\n/);
        for (const rule of RULES) {
            if (!rule.patterns.every((pattern) => pattern.test(text)))
                continue;
            const index = lines.findIndex((line) => rule.patterns.some((pattern) => pattern.test(line)));
            const evidence = matches.get(rule.name) ?? [];
            if (evidence.length < 5)
                evidence.push({
                    type: "code",
                    path: path.relative(root, file).replace(/\\/g, "/"),
                    lineStart: index + 1,
                    lineEnd: index + 1,
                    summary: `Behavioral signals for ${rule.name} appear in this file.`,
                    reliability: "high",
                });
            matches.set(rule.name, evidence);
            if (/TODO|FIXME|not implemented|throw new Error\(["']TODO|pass\s*(?:#.*)?$/im.test(text))
                partial.set(rule.name, true);
        }
    }
    return RULES.filter((rule) => matches.has(rule.name)).map((rule) => {
        const evidence = matches.get(rule.name);
        const isPartial = partial.get(rule.name) === true || evidence.length === 1;
        return {
            id: stableId(rule.name),
            name: rule.name,
            category: rule.category,
            description: `Repository evidence indicates ${rule.name.toLowerCase()} behavior.`,
            userValue: rule.value,
            status: isPartial ? "partial" : "functional",
            maturityScore: isPartial ? 3 : 4,
            confidence: evidence.length > 1 ? "high" : "medium",
            evidence,
            relatedFiles: [...new Set(evidence.flatMap((x) => (x.path ? [x.path] : [])))],
            dependencies: [],
            qualityNotes: isPartial ? ["Coverage or completion signals are limited."] : [],
            risks: [],
            missingPieces: isPartial
                ? ["Verify the end-to-end workflow, authorization, validation, and failure states."]
                : [],
        };
    });
}
//# sourceMappingURL=scanner.js.map