import type { DetectedTool, ImportantFile, RepoFile, WorkspacePackage } from "../types.js";
import { detectByDependencies, detectPackageManager, rankImportantFiles, readPackage } from "./detect.js";

export function detectWorkspacePackages(files: RepoFile[]): WorkspacePackage[] {
  const roots = workspaceRoots(files);
  return roots.map((root) => {
    const packageFiles = files
      .filter((file) => root === "." ? !file.path.includes("/") || file.path.startsWith("src/") : file.path === root || file.path.startsWith(`${root}/`))
      .map((file) => ({ ...file, path: root === "." ? file.path : file.path.slice(root.length + 1) }));
    const { dependencies } = readPackage(packageFiles);
    const detected = detectByDependencies(packageFiles, dependencies);
    return {
      name: packageName(files, root),
      path: root,
      packageManager: detectPackageManager(packageFiles),
      frameworks: detected.frameworks,
      importantFiles: rankImportantFiles(packageFiles, [], []).slice(0, 6).map((file) => ({
        ...file,
        file: root === "." ? file.file : `${root}/${file.file}`
      })) as ImportantFile[]
    };
  });
}

export function workspaceEvidence(files: RepoFile[]): DetectedTool[] {
  const tools: DetectedTool[] = [];
  if (files.some((file) => file.path === "pnpm-workspace.yaml")) tools.push({ name: "pnpm workspaces", confidence: "high", evidence: ["pnpm-workspace.yaml"], explanation: "Workspace manifest detected." });
  if (files.some((file) => file.path === "turbo.json")) tools.push({ name: "Turborepo", confidence: "high", evidence: ["turbo.json"], explanation: "Turbo config detected." });
  const rootPackage = files.find((file) => file.path === "package.json" && file.text);
  if (rootPackage?.text) {
    try {
      const json = JSON.parse(rootPackage.text) as { workspaces?: unknown };
      if (json.workspaces) tools.push({ name: "npm/yarn workspaces", confidence: "high", evidence: ["package.json workspaces"], explanation: "Root package declares workspaces." });
    } catch {
      return tools;
    }
  }
  return tools;
}

function workspaceRoots(files: RepoFile[]): string[] {
  const roots = new Set<string>();
  for (const file of files) {
    if (file.path === "package.json") roots.add(".");
    const match = file.path.match(/^(.+)\/package\.json$/);
    if (match && !match[1].includes("node_modules")) roots.add(match[1]);
  }
  if (!hasWorkspaceMarker(files)) return [];
  return [...roots].filter((root) => root !== ".").sort();
}

function hasWorkspaceMarker(files: RepoFile[]): boolean {
  if (files.some((file) => file.path === "pnpm-workspace.yaml" || file.path === "turbo.json")) return true;
  const rootPackage = files.find((file) => file.path === "package.json" && file.text);
  if (!rootPackage?.text) return false;
  try {
    return Boolean((JSON.parse(rootPackage.text) as { workspaces?: unknown }).workspaces);
  } catch {
    return false;
  }
}

function packageName(files: RepoFile[], root: string): string {
  const pkg = files.find((file) => file.path === `${root}/package.json` && file.text);
  if (!pkg?.text) return root;
  try {
    const json = JSON.parse(pkg.text) as { name?: string };
    return json.name ?? root;
  } catch {
    return root;
  }
}
