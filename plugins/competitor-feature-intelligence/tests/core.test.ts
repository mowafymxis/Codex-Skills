import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { mkdtemp, writeFile, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { canonicalizeUrl, csvCell, ensureWithin, redact, stableId } from "../src/util.js";
import { canonicalName, normalizeFeatures } from "../src/normalizer.js";
import { scorePriority } from "../src/scoring.js";
import { scanRepository } from "../src/scanner.js";
import type { AppFeature, CompetitorFeature, ScoreInputs } from "../src/types.js";

test("stable IDs are deterministic and URL canonicalization removes tracking", () => {
  assert.equal(stableId("Data Export"), stableId("data export"));
  assert.equal(
    canonicalizeUrl("HTTPS://Example.COM/features/?utm_source=x&plan=pro#top"),
    "https://example.com/features?plan=pro",
  );
});

test("redaction covers secrets and path containment rejects traversal", () => {
  const result = redact(
    "password=hunter2 token=abcdefghijklmno Authorization: Bearer abcdefghijklmnop",
  );
  assert.doesNotMatch(result, /hunter2|abcdefghijklmno|abcdefghijklmnop/);
  assert.throws(() => ensureWithin("C:/safe", "C:/escape"), /escapes/);
});

test("CSV escaping handles commas, quotes, line breaks, and Unicode", () => {
  assert.equal(csvCell('مرحبا, "team"\nnext'), '"مرحبا, ""team""\nnext"');
});

test("normalization preserves important distinctions", () => {
  for (const [a, b] of [
    ["Google login", "Enterprise SSO"],
    ["OAuth", "SAML"],
    ["Email notifications", "Push notifications"],
    ["AI chat", "AI recommendations"],
    ["Teams", "RBAC"],
    ["API access", "Webhooks"],
    ["Responsive web", "Native mobile app"],
  ] as Array<[string, string]>) {
    assert.notEqual(canonicalName(a), canonicalName(b));
  }
});

const base: ScoreInputs = {
  importance: 5,
  urgency: 5,
  userPainSeverity: 5,
  revenueImpact: 4,
  retentionImpact: 4,
  activationImpact: 5,
  trustImpact: 4,
  uniqueness: 2,
  strategicFit: 5,
  evidenceStrength: 5,
  difficulty: 2,
  operationalCost: 2,
  mvpSuitability: 5,
};
test("priority formula, thresholds, cost penalty, and overrides", () => {
  assert.equal(scorePriority(base).label, "Build Now");
  assert.ok(
    scorePriority({ ...base, difficulty: 5, operationalCost: 5 }).score < scorePriority(base).score,
  );
  assert.equal(
    scorePriority({ ...base, evidenceStrength: 1, difficulty: 5 }).label,
    "Validate First",
  );
  assert.equal(
    scorePriority({
      ...base,
      importance: 1,
      urgency: 1,
      userPainSeverity: 1,
      revenueImpact: 1,
      retentionImpact: 1,
      activationImpact: 1,
      trustImpact: 1,
      uniqueness: 1,
      strategicFit: 1,
      evidenceStrength: 5,
      difficulty: 5,
      operationalCost: 5,
    }).label,
    "Ignore",
  );
  assert.equal(scorePriority({ ...base, damagesSimplicity: true }).label, "Do Not Build Yet");
  assert.equal(scorePriority({ ...base, importance: 1, securityBlocker: true }).label, "Build Now");
});

test("scanner finds frontend/backend behavior, partial work, ignores dependencies, and redacts", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "cfi-scan-"));
  await mkdir(path.join(root, "src"));
  await mkdir(path.join(root, "node_modules"));
  await writeFile(
    path.join(root, "src", "api.ts"),
    "router.post('/api/login', authenticate); function authenticate(session) { return jwt.sign(session); }",
  );
  await writeFile(
    path.join(root, "src", "export.ts"),
    "// TODO authorization\nexport function downloadCsv(){ return exportToCsv([]); }",
  );
  await writeFile(
    path.join(root, "node_modules", "billing.ts"),
    "stripe subscription checkout invoice webhook",
  );
  await writeFile(path.join(root, "src", "secret.ts"), "const password='not-a-real-secret';");
  const features = await scanRepository(root);
  assert.ok(features.some((x) => x.name === "Authentication"));
  assert.equal(features.find((x) => x.name === "Data export")?.status, "partial");
  assert.ok(!features.some((x) => x.name === "Subscription billing"));
  assert.doesNotMatch(JSON.stringify(features), /not-a-real-secret/);
});

test("normalizer merges safe aliases", () => {
  const app = [
    {
      id: "a",
      name: "CSV export",
      category: "Data",
      description: "",
      userValue: "",
      status: "functional",
      maturityScore: 4,
      confidence: "high",
      evidence: [],
      relatedFiles: [],
      dependencies: [],
      qualityNotes: [],
      risks: [],
      missingPieces: [],
    },
  ] as AppFeature[];
  const competitor = [
    {
      id: "b",
      competitorId: "c",
      name: "Data export",
      normalizedName: "data export",
      category: "Data",
      description: "",
      userWorkflow: "",
      targetUser: "",
      availability: { plan: "", platform: "", region: "", status: "available" },
      evidenceType: "documentation-confirmed",
      confidence: "high",
      maturityEstimate: "functional",
      uxEstimate: "unknown",
      strategicValue: "high",
      tableStakes: false,
      differentiating: false,
      sources: [],
      notes: [],
    },
  ] as CompetitorFeature[];
  assert.equal(normalizeFeatures(app, competitor).length, 1);
});
