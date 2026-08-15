import path from "node:path";
import type { ScanResult } from "../types.js";
import { buildDependencyMap, detectByDependencies, detectConventions, detectEnvVars, detectFolders, detectLanguages, detectPackageManager, detectRoutes, detectTodos, rankImportantFiles, readPackage } from "./detect.js";
import { analyzeFrameworks } from "./frameworks.js";
import { readGitInfo } from "./git.js";
import { scoreScan } from "./score.js";
import { scanFiles } from "../scanners/files.js";
import { analyzeImportsExports } from "./static.js";
import { detectWorkspacePackages, workspaceEvidence } from "./workspace.js";

export async function analyzeProject(root: string): Promise<ScanResult> {
  const absoluteRoot = path.resolve(root);
  const files = await scanFiles(absoluteRoot);
  const { json, dependencies } = readPackage(files);
  const detected = detectByDependencies(files, dependencies);
  const routes = detectRoutes(files);
  const envVars = detectEnvVars(files);
  const importantFiles = rankImportantFiles(files, routes, envVars);
  const todos = detectTodos(files);
  const git = await readGitInfo(absoluteRoot);
  git.recentlyChangedImportantFiles = git.changedFiles.filter((changed) => importantFiles.some((file) => file.file === changed));
  const staticAnalysis = analyzeImportsExports(files);
  const workspacePackages = detectWorkspacePackages(files);
  const workspaceTools = workspaceEvidence(files);
  const frameworks = [...detected.frameworks, ...workspaceTools.filter((item) => !detected.frameworks.some((tool) => tool.name === item.name))];
  const frameworkAnalyses = analyzeFrameworks({ files, dependencies, frameworks, databases: detected.databases, routes });
  const partial = {
    root: absoluteRoot,
    scannedAt: new Date().toISOString(),
    purpose: inferPurpose(json, detected.frameworks.map((item) => item.name)),
    packageManager: detectPackageManager(files),
    languages: detectLanguages(files),
    frameworks,
    databases: detected.databases,
    auth: detected.auth,
    deployment: detected.deployment,
    testing: detected.testing,
    styling: detected.styling,
    importantFiles,
    dependencyMap: buildDependencyMap(importantFiles),
    highRiskFiles: importantFiles.filter((file) => file.highRisk),
    git,
    folders: detectFolders(files),
    routes,
    envVars,
    imports: staticAnalysis.imports,
    exports: staticAnalysis.exports,
    frameworkAnalyses,
    workspacePackages,
    todos,
    dependencies,
    conventions: detectConventions(files),
    risks: inferRisks(routes.length, envVars.length, detected.auth.length, detected.databases.length),
    staleWarnings: []
  };
  return { ...partial, score: scoreScan(partial) };
}

function inferPurpose(pkg: Record<string, unknown>, frameworks: string[]): string {
  const description = typeof pkg.description === "string" ? pkg.description.trim() : "";
  if (description) return `Detected fact: ${description}`;
  const name = typeof pkg.name === "string" ? pkg.name : "";
  if (name && frameworks.length) return `Reasonable assumption: ${name} is an application or package built with ${frameworks.join(", ")}.`;
  if (name) return `Reasonable assumption: ${name} is the main package in this repository.`;
  return "Unknown. Needs confirmation.";
}

function inferRisks(routeCount: number, envCount: number, authCount: number, dbCount: number): string[] {
  const risks = [];
  if (authCount) risks.push("Auth-related dependencies or files were detected; verify access-control behavior before editing.");
  if (dbCount) risks.push("Database tooling was detected; schema edits may require migrations.");
  if (routeCount) risks.push("API routes were detected; route changes may affect clients.");
  if (envCount) risks.push("Environment variables are used; avoid renaming without deployment updates.");
  return risks.length ? risks : ["Unknown fragile areas. Inspect call sites before editing."];
}
