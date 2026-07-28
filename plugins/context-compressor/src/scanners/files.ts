import { promises as fs } from "node:fs";
import path from "node:path";
import type { RepoFile } from "../types.js";

const IGNORED_DIRS = new Set([
  ".git",
  "node_modules",
  "dist",
  "build",
  ".next",
  ".turbo",
  "coverage",
  "reports"
]);

const TEXT_EXTENSIONS = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".json",
  ".md",
  ".css",
  ".scss",
  ".env",
  ".yml",
  ".yaml",
  ".toml",
  ".prisma",
  ".sql",
  ".py",
  ".html"
]);

export async function scanFiles(root: string): Promise<RepoFile[]> {
  const files: RepoFile[] = [];
  async function walk(dir: string): Promise<void> {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name.startsWith(".") && !entry.name.startsWith(".env") && entry.name !== ".github" && entry.name !== ".codex") {
        continue;
      }
      if (entry.isDirectory()) {
        if (!IGNORED_DIRS.has(entry.name)) {
          await walk(path.join(dir, entry.name));
        }
        continue;
      }
      const absolute = path.join(dir, entry.name);
      const stat = await fs.stat(absolute);
      const relative = path.relative(root, absolute).replaceAll("\\", "/");
      const ext = path.extname(entry.name);
      const repoFile: RepoFile = { path: relative, mtimeMs: stat.mtimeMs, size: stat.size };
      if (TEXT_EXTENSIONS.has(ext) || entry.name.startsWith(".env") || entry.name.includes("Dockerfile")) {
        try {
          repoFile.text = await fs.readFile(absolute, "utf8");
        } catch {
          repoFile.text = undefined;
        }
      }
      files.push(repoFile);
    }
  }
  await walk(root);
  return files;
}
