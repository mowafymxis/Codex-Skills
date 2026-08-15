import type { DetectedTool, EvidenceItem, FrameworkAnalysis, RepoFile, RouteInfo } from "../types.js";

interface Context {
  files: RepoFile[];
  dependencies: string[];
  frameworks: DetectedTool[];
  databases: DetectedTool[];
  routes: RouteInfo[];
}

export function analyzeFrameworks(context: Context): FrameworkAnalysis[] {
  return [
    analyzeNextAppRouter(context),
    analyzeNextPagesRouter(context),
    analyzeViteReact(context),
    analyzeExpress(context),
    analyzeSupabase(context),
    analyzePrisma(context),
    analyzeDrizzle(context)
  ].filter((analysis) => analysis.detectedFacts.length || analysis.assumptions.length || analysis.importantFiles.length);
}

function analyzeNextAppRouter(context: Context): FrameworkAnalysis {
  const appFiles = context.files.filter((file) => /(^|\/)app\/.*(page|layout|route)\.(ts|tsx|js|jsx)$/.test(file.path));
  return base("Next.js App Router", {
    facts: [
      ...appFiles.map((file) => fact(`App router file: ${file.path}`, "high", [file.path], "Matches Next.js app-directory file conventions.")),
      ...context.routes.filter((route) => route.kind === "next-app-api").map((route) => fact(`API route: ${route.route}`, route.confidence, route.evidence, route.explanation))
    ],
    assumptions: hasDep(context, "next") && appFiles.length ? [fact("Next.js App Router is probably active.", "medium", ["package.json dependency: next", ...appFiles.slice(0, 3).map((file) => file.path)], "Dependency and app-directory files were both detected.")] : [],
    unknowns: appFiles.length ? [] : [fact("No app router files found.", "low", ["No app/**/page or app/api/**/route files"], "The project may use another router or framework.")],
    importantFiles: appFiles.slice(0, 8).map((file) => fact(file.path, "high", [file.path], "App router route/layout/page file.")),
    risks: context.routes.some((route) => route.kind === "next-app-api") ? [fact("API route behavior may affect clients.", "medium", context.routes.filter((route) => route.kind === "next-app-api").map((route) => route.file), "Route handlers were detected under app/api.")] : []
  });
}

function analyzeNextPagesRouter(context: Context): FrameworkAnalysis {
  const pagesFiles = context.files.filter((file) => /(^|\/)pages\/.*\.(ts|tsx|js|jsx)$/.test(file.path));
  return base("Next.js Pages Router", {
    facts: pagesFiles.map((file) => fact(`Pages router file: ${file.path}`, "high", [file.path], "Matches Next.js pages-directory conventions.")),
    assumptions: hasDep(context, "next") && pagesFiles.length ? [fact("Next.js Pages Router is probably active.", "medium", ["package.json dependency: next", ...pagesFiles.slice(0, 3).map((file) => file.path)], "Dependency and pages-directory files were both detected.")] : [],
    unknowns: pagesFiles.length ? [] : [fact("No pages router files found.", "low", ["No pages/**/*.tsx or pages/api files"], "The project may use App Router or another router.")],
    importantFiles: pagesFiles.slice(0, 8).map((file) => fact(file.path, "high", [file.path], "Pages router page/API file.")),
    risks: context.routes.some((route) => route.kind === "next-pages-api") ? [fact("Pages API route behavior may affect clients.", "medium", context.routes.filter((route) => route.kind === "next-pages-api").map((route) => route.file), "API files were detected under pages/api.")] : []
  });
}

function analyzeViteReact(context: Context): FrameworkAnalysis {
  const viteConfig = context.files.find((file) => /^vite\.config\.(ts|js|mjs)$/.test(file.path));
  const entries = context.files.filter((file) => /(^|\/)src\/main\.(tsx|jsx|ts|js)$/.test(file.path));
  return base("Vite/React", {
    facts: [
      ...(viteConfig ? [fact("Vite config detected.", "high", [viteConfig.path], "Config filename matches Vite conventions.")] : []),
      ...entries.map((file) => fact(`Frontend entry: ${file.path}`, "medium", [file.path], "Matches common Vite app entry filename."))
    ],
    assumptions: hasDep(context, "vite") && hasDep(context, "react") ? [fact("React app may be served by Vite.", "high", ["package.json dependency: vite", "package.json dependency: react"], "Both framework dependencies are declared.")] : [],
    unknowns: hasDep(context, "vite") && !viteConfig ? [fact("Vite config location is unknown.", "low", ["vite dependency without vite.config.*"], "Some Vite projects omit config or use nonstandard placement.")] : [],
    importantFiles: [...(viteConfig ? [viteConfig] : []), ...entries].map((file) => fact(file.path, "medium", [file.path], "Vite/React entry or config file.")),
    risks: []
  });
}

function analyzeExpress(context: Context): FrameworkAnalysis {
  const expressRoutes = context.routes.filter((route) => route.kind === "express");
  return base("Express", {
    facts: expressRoutes.map((route) => fact(`Express route: ${route.route}`, route.confidence, route.evidence, route.explanation)),
    assumptions: hasDep(context, "express") ? [fact("Express server may be present.", "high", ["package.json dependency: express"], "Express is declared as a dependency.")] : [],
    unknowns: hasDep(context, "express") && !expressRoutes.length ? [fact("No literal Express route paths detected.", "medium", ["express dependency"], "Routes may be composed dynamically or defined in unsupported patterns.")] : [],
    importantFiles: unique(expressRoutes.map((route) => route.file)).map((file) => fact(file, "high", [file], "Contains Express route registration.")),
    risks: expressRoutes.length ? [fact("Route changes can alter API behavior.", "medium", unique(expressRoutes.map((route) => route.file)), "Express handlers were detected.")] : []
  });
}

function analyzeSupabase(context: Context): FrameworkAnalysis {
  const files = context.files.filter((file) => /(^|\/)supabase\/|supabase/i.test(file.path) || /supabase/i.test(file.text ?? ""));
  return base("Supabase", {
    facts: files.slice(0, 12).map((file) => fact(`Supabase-related file: ${file.path}`, file.path.startsWith("supabase/") ? "high" : "medium", [file.path], "Path or content references Supabase.")),
    assumptions: hasDep(context, "@supabase/supabase-js") ? [fact("Supabase client usage is likely.", "high", ["package.json dependency: @supabase/supabase-js"], "Supabase client dependency is declared.")] : [],
    unknowns: files.length ? [] : [fact("Supabase schema/project details are unknown.", "low", ["No supabase folder or content matches"], "No Supabase-specific files were detected.")],
    importantFiles: files.slice(0, 8).map((file) => fact(file.path, file.path.startsWith("supabase/") ? "high" : "medium", [file.path], "Supabase configuration, migration, or usage candidate.")),
    risks: files.some((file) => /migration|policy|rls/i.test(file.path + (file.text ?? ""))) ? [fact("Database policies or migrations may be security-sensitive.", "high", files.filter((file) => /migration|policy|rls/i.test(file.path + (file.text ?? ""))).map((file) => file.path), "Migration or RLS policy text was detected.")] : []
  });
}

function analyzePrisma(context: Context): FrameworkAnalysis {
  const files = context.files.filter((file) => /schema\.prisma|(^|\/)prisma\//.test(file.path));
  return base("Prisma", {
    facts: files.map((file) => fact(`Prisma file: ${file.path}`, "high", [file.path], "Matches Prisma schema/folder convention.")),
    assumptions: hasDep(context, "prisma") || hasDep(context, "@prisma/client") ? [fact("Prisma is probably used for data access.", "high", context.dependencies.filter((dep) => dep === "prisma" || dep === "@prisma/client").map((dep) => `package.json dependency: ${dep}`), "Prisma packages are declared.")] : [],
    unknowns: files.length ? [] : [fact("Prisma schema not found.", "low", ["No schema.prisma"], "Database models may be defined elsewhere.")],
    importantFiles: files.map((file) => fact(file.path, "high", [file.path], "Prisma schema or migration-related file.")),
    risks: files.length ? [fact("Schema edits may require migrations and generated client updates.", "medium", files.map((file) => file.path), "Prisma schema files were detected.")] : []
  });
}

function analyzeDrizzle(context: Context): FrameworkAnalysis {
  const fixedFiles = context.files.filter((file) => /drizzle\.config|(^|\/)drizzle\/|drizzle-orm/i.test(`${file.path}\n${file.text ?? ""}`));
  return base("Drizzle", {
    facts: fixedFiles.slice(0, 12).map((file) => fact(`Drizzle-related file: ${file.path}`, /drizzle\.config/.test(file.path) ? "high" : "medium", [file.path], "Path or content references Drizzle.")),
    assumptions: hasDep(context, "drizzle-orm") ? [fact("Drizzle ORM is probably used for data access.", "high", ["package.json dependency: drizzle-orm"], "Drizzle dependency is declared.")] : [],
    unknowns: fixedFiles.length ? [] : [fact("Drizzle schema location is unknown.", "low", ["No drizzle config/folder/content matches"], "Schemas may use another ORM or unsupported layout.")],
    importantFiles: fixedFiles.slice(0, 8).map((file) => fact(file.path, /drizzle\.config/.test(file.path) ? "high" : "medium", [file.path], "Drizzle config or schema candidate.")),
    risks: fixedFiles.length ? [fact("Schema edits may require migrations.", "medium", fixedFiles.map((file) => file.path), "Drizzle-related files were detected.")] : []
  });
}

function base(name: string, parts: { facts: EvidenceItem[]; assumptions: EvidenceItem[]; unknowns: EvidenceItem[]; importantFiles: EvidenceItem[]; risks: EvidenceItem[] }): FrameworkAnalysis {
  return {
    name,
    detectedFacts: parts.facts,
    assumptions: parts.assumptions,
    unknowns: parts.unknowns,
    importantFiles: parts.importantFiles,
    risks: parts.risks,
    evidence: unique([...parts.facts, ...parts.assumptions, ...parts.importantFiles].flatMap((item) => item.evidence)).slice(0, 20)
  };
}

function fact(label: string, confidence: EvidenceItem["confidence"], evidence: string[], explanation: string): EvidenceItem {
  return { label, confidence, evidence: unique(evidence).filter(Boolean), explanation };
}

function hasDep(context: Context, dep: string): boolean {
  return context.dependencies.includes(dep);
}

function unique(values: string[]): string[] {
  return [...new Set(values)];
}
