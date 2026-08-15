import ts from "typescript";
import type { EnvVarInfo, EvidenceItem, RepoFile } from "../types.js";

const CODE_EXTENSIONS = /\.(ts|tsx|js|jsx|mjs|cjs)$/;

export function analyzeImportsExports(files: RepoFile[]): { imports: EvidenceItem[]; exports: EvidenceItem[] } {
  const imports: EvidenceItem[] = [];
  const exports: EvidenceItem[] = [];
  for (const file of files.filter((item) => item.text && CODE_EXTENSIONS.test(item.path))) {
    const source = ts.createSourceFile(file.path, file.text ?? "", ts.ScriptTarget.Latest, false, scriptKind(file.path));
    source.forEachChild((node) => {
      if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
        imports.push({
          label: node.importClause?.name ? node.importClause.name.text : node.moduleSpecifier.text,
          confidence: "high",
          evidence: [file.path, `module: ${node.moduleSpecifier.text}`],
          explanation: "Parsed from an ES import declaration."
        });
      }
      if (ts.isExportDeclaration(node)) {
        const label = node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier) ? node.moduleSpecifier.text : "local export";
        exports.push({
          label,
          confidence: "high",
          evidence: [file.path],
          explanation: "Parsed from an ES export declaration."
        });
      }
      if (hasExportModifier(node)) {
        exports.push({
          label: declarationName(node) ?? "exported declaration",
          confidence: "high",
          evidence: [file.path],
          explanation: "Parsed from a named exported declaration."
        });
      }
    });
  }
  return {
    imports: imports.slice(0, 80),
    exports: exports.slice(0, 80)
  };
}

export function detectEnvVarsFromAst(files: RepoFile[]): EnvVarInfo[] {
  const map = new Map<string, Set<string>>();
  for (const file of files.filter((item) => item.text && CODE_EXTENSIONS.test(item.path))) {
    const source = ts.createSourceFile(file.path, file.text ?? "", ts.ScriptTarget.Latest, true, scriptKind(file.path));
    const record = (name: string): void => {
      if (name && name !== "NODE_ENV") {
        if (!map.has(name)) map.set(name, new Set());
        map.get(name)?.add(file.path);
      }
    };
    const visit = (node: ts.Node): void => {
      const processEnv = isProcessEnvAccess(node);
      if (processEnv && ts.isPropertyAccessExpression(node) && ts.isIdentifier(node.name)) record(node.name.text);
      if (processEnv && ts.isElementAccessExpression(node) && ts.isStringLiteral(node.argumentExpression)) record(node.argumentExpression.text);
      if (isImportMetaEnvAccess(node) && ts.isPropertyAccessExpression(node) && ts.isIdentifier(node.name)) record(node.name.text);
      if (ts.isVariableDeclaration(node) && ts.isObjectBindingPattern(node.name) && node.initializer && isProcessEnvObject(node.initializer)) {
        for (const element of node.name.elements) {
          if (element.dotDotDotToken) continue;
          const property = element.propertyName;
          const nameNode = property ?? element.name;
          if (ts.isIdentifier(nameNode)) record(nameNode.text);
        }
      }
      ts.forEachChild(node, visit);
    };
    visit(source);
  }
  return [...map.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([name, paths]) => ({
    name,
    files: [...paths].sort(),
    likelyPurpose: inferEnvPurpose(name),
    confidence: "high",
    evidence: [...paths].sort(),
    explanation: "Parsed from TypeScript/JavaScript environment variable access."
  }));
}

function scriptKind(file: string): ts.ScriptKind {
  if (file.endsWith(".tsx")) return ts.ScriptKind.TSX;
  if (file.endsWith(".jsx")) return ts.ScriptKind.JSX;
  if (file.endsWith(".js") || file.endsWith(".mjs") || file.endsWith(".cjs")) return ts.ScriptKind.JS;
  return ts.ScriptKind.TS;
}

function hasExportModifier(node: ts.Node): boolean {
  return Boolean(ts.canHaveModifiers(node) && ts.getModifiers(node)?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword));
}

function declarationName(node: ts.Node): string | undefined {
  if ("name" in node) {
    const name = (node as { name?: ts.Node }).name;
    if (name && ts.isIdentifier(name)) return name.text;
  }
  return undefined;
}

function isProcessEnvAccess(node: ts.Node): boolean {
  if (ts.isPropertyAccessExpression(node)) return isProcessEnvObject(node.expression);
  if (ts.isElementAccessExpression(node)) return isProcessEnvObject(node.expression);
  return false;
}

function isProcessEnvObject(node: ts.Node): boolean {
  return ts.isPropertyAccessExpression(node)
    && node.name.text === "env"
    && ts.isIdentifier(node.expression)
    && node.expression.text === "process";
}

function isImportMetaEnvAccess(node: ts.Node): boolean {
  return ts.isPropertyAccessExpression(node)
    && ts.isPropertyAccessExpression(node.expression)
    && node.expression.name.text === "env"
    && node.expression.expression.kind === ts.SyntaxKind.MetaProperty;
}

function inferEnvPurpose(name: string): string {
  if (/DATABASE|DB|POSTGRES/i.test(name)) return "Database connection/configuration";
  if (/AUTH|JWT|SESSION|SECRET/i.test(name)) return "Authentication or secret material";
  if (/SUPABASE/i.test(name)) return "Supabase configuration";
  if (/API|TOKEN|KEY/i.test(name)) return "External API credential or endpoint";
  if (/URL|HOST/i.test(name)) return "Service URL/host";
  return "Needs confirmation";
}
