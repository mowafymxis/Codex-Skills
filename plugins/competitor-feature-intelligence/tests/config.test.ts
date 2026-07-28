import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { defaults, loadConfig } from "../src/config.js";

test("configuration defaults and CLI overrides", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "cfi-config-"));
  const file = path.join(root, "config.json");
  await writeFile(
    file,
    JSON.stringify({
      appName: "Fixture",
      repoPath: ".",
      competitors: [{ name: "Fictional", url: "https://fictional.example" }],
      maxPagesPerCompetitor: 5,
    }),
  );
  const config = await loadConfig(file, { maxPagesPerCompetitor: 2, offline: true });
  assert.equal(config.maxPagesPerCompetitor, 2);
  assert.equal(config.offline, true);
  assert.equal(config.strictEvidenceMode, defaults.strictEvidenceMode);
});

test("invalid configuration gives a clear error", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "cfi-config-"));
  const file = path.join(root, "config.json");
  await writeFile(file, JSON.stringify({ competitors: [], maxPagesPerCompetitor: 0 }));
  await assert.rejects(loadConfig(file), /maxPagesPerCompetitor/);
});
