import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { buildAnalysis } from "../src/analysis.js";
import { defaults } from "../src/config.js";
import { generateReports, issueDrafts, validateReportDirectory } from "../src/reports.js";
import type { AppFeature, CompetitorFeature } from "../src/types.js";

const app: AppFeature[] = [
  {
    id: "authentication-1",
    name: "Authentication",
    category: "Identity",
    description: "Login",
    userValue: "Access",
    status: "partial",
    maturityScore: 3,
    confidence: "high",
    evidence: [
      {
        type: "code",
        path: "src/auth.ts",
        lineStart: 1,
        lineEnd: 1,
        summary: "Login route exists",
        reliability: "high",
      },
    ],
    relatedFiles: ["src/auth.ts"],
    dependencies: [],
    qualityNotes: [],
    risks: [],
    missingPieces: ["MFA"],
  },
];
const competitor: CompetitorFeature[] = [
  {
    id: "sso-1",
    competitorId: "nebula",
    name: "Enterprise SSO",
    normalizedName: "enterprise sso",
    category: "Identity",
    description: "SAML SSO",
    userWorkflow: "Admin configures SSO",
    targetUser: "enterprise",
    availability: { plan: "enterprise", platform: "web", region: "global", status: "available" },
    evidenceType: "documentation-confirmed",
    confidence: "high",
    maturityEstimate: "functional",
    uxEstimate: "unknown",
    strategicValue: "high",
    tableStakes: false,
    differentiating: false,
    sources: ["https://nebula.example/docs/sso"],
    notes: [],
  },
];

test("reports generate Markdown/JSON/CSV, validate schema, preserve uncertainty, and draft issues", async () => {
  const out = await mkdtemp(path.join(tmpdir(), "cfi-report-"));
  const analysis = buildAnalysis(
    {
      ...defaults,
      appName: "Orbit",
      repoPath: out,
      outputDirectory: out,
      competitors: [
        { id: "nebula", name: "Nebula", url: "https://nebula.example", type: "direct" },
      ],
    },
    app,
    competitor,
    [],
  );
  await generateReports(analysis, out);
  const schema = path.resolve(
    import.meta.dirname,
    "..",
    "..",
    "schemas",
    "feature-gap.schema.json",
  );
  await validateReportDirectory(out, schema);
  assert.match(
    await readFile(path.join(out, "competitive-feature-report.md"), "utf8"),
    /Partial analysis|PARTIAL ANALYSIS/i,
  );
  assert.match(
    await readFile(path.join(out, "competitor-feature-matrix.csv"), "utf8"),
    /enterprise sso/i,
  );
  assert.doesNotMatch(
    await readFile(path.join(out, "competitive-feature-report.md"), "utf8"),
    /competitor definitively lacks/i,
  );
  assert.match(issueDrafts(analysis.featureGaps, ["Build Now"]), /Acceptance criteria/);
});
