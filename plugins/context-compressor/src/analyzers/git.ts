import { execFile } from "node:child_process";
import { promisify } from "node:util";
import type { GitInfo } from "../types.js";

const execFileAsync = promisify(execFile);

export async function readGitInfo(root: string): Promise<GitInfo> {
  try {
    const branch = (await git(root, ["branch", "--show-current"])).trim() || "detached";
    const status = await git(root, ["status", "--porcelain=v1", "-z", "--", "."]);
    const changedFiles = parsePorcelainStatus(status).slice(0, 20);
    const commits = (await git(root, ["log", "-5", "--pretty=format:%h %s"])).trim();
    return {
      available: true,
      branch,
      changedFiles,
      recentCommits: commits ? commits.split(/\r?\n/).slice(0, 5) : [],
      hasUncommittedChanges: changedFiles.length > 0,
      recentlyChangedImportantFiles: []
    };
  } catch {
    return {
      available: false,
      branch: "Unknown",
      changedFiles: [],
      recentCommits: [],
      hasUncommittedChanges: false,
      recentlyChangedImportantFiles: []
    };
  }
}

function parsePorcelainStatus(status: string): string[] {
  const entries = status.split("\0").filter(Boolean);
  const files: string[] = [];
  for (let index = 0; index < entries.length; index += 1) {
    const entry = entries[index];
    const code = entry.slice(0, 2);
    const path = entry.slice(3).trim();
    if (!path) continue;
    if ((code.startsWith("R") || code.startsWith("C")) && entries[index + 1]) {
      files.push(path, entries[index + 1].trim());
      index += 1;
    } else {
      files.push(path);
    }
  }
  return files;
}

async function git(root: string, args: string[]): Promise<string> {
  const { stdout } = await execFileAsync("git", args, { cwd: root, timeout: 5000 });
  return stdout;
}
