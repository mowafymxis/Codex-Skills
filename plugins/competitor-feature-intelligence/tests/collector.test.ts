import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { ingestManualSources } from "../src/collector.js";
import { collectSources } from "../src/collector.js";
import { defaults } from "../src/config.js";
import { extractFeatures } from "../src/extractor.js";

test("manual/offline ingestion deduplicates extracted features and preserves evidence levels", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "cfi-source-"));
  const file = path.join(root, "sources.json");
  await writeFile(
    file,
    JSON.stringify([
      {
        competitorId: "c1",
        url: "https://example.test/docs?utm_source=x",
        text: "Our REST API access and webhooks are available.",
        sourceType: "documentation",
        isOfficial: true,
        reliability: "high",
      },
      {
        competitorId: "c1",
        url: "https://example.test/marketing",
        text: "API access for every team.",
        sourceType: "product",
        isOfficial: true,
        reliability: "medium",
      },
    ]),
  );
  const sources = await ingestManualSources(file);
  const features = extractFeatures(sources);
  assert.equal(features.filter((x) => x.name === "API access").length, 1);
  assert.equal(
    features.find((x) => x.name === "API access")?.evidenceType,
    "documentation-confirmed",
  );
  assert.ok(features.some((x) => x.name === "Webhooks"));
});

test("manual source requires evidence fields", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "cfi-source-"));
  const file = path.join(root, "bad.json");
  await writeFile(file, "[{}]");
  await assert.rejects(ingestManualSources(file), /requires competitorId/);
});

test("collector enforces page limits, deduplicates URLs, and uses cache", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "cfi-cache-"));
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (input) => {
    const url = String(input);
    const response = url.endsWith("/robots.txt")
      ? new Response("User-agent: *\nDisallow:")
      : new Response(
          '<title>Features</title><a href="/next?utm_source=x">Next</a><p>API access and webhooks.</p>',
        );
    Object.defineProperty(response, "url", { value: url });
    return response;
  };
  try {
    const config = {
      ...defaults,
      competitors: [
        { id: "c1", name: "Fixture", url: "https://fixture.test", type: "direct" as const },
      ],
      maxPagesPerCompetitor: 1,
      crawlDelayMs: 0,
    };
    const first = await collectSources(config, root);
    const second = await collectSources(config, root);
    assert.equal(first.filter((x) => x.fetchStatus === "success").length, 1);
    assert.equal(second[0]?.fetchStatus, "cached");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("collector records blocked domains and retry exhaustion without throwing", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "cfi-cache-"));
  const blocked = await collectSources(
    {
      ...defaults,
      competitors: [{ id: "c1", name: "Blocked", url: "https://blocked.test", type: "direct" }],
      blockedDomains: ["blocked.test"],
      crawlDelayMs: 0,
    },
    root,
  );
  assert.equal(blocked[0]?.fetchStatus, "blocked");

  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (input) => {
    if (String(input).endsWith("/robots.txt")) return new Response("User-agent: *\nDisallow:");
    throw new Error("simulated timeout");
  };
  try {
    const failed = await collectSources(
      {
        ...defaults,
        competitors: [{ id: "c2", name: "Timeout", url: "https://timeout.test", type: "direct" }],
        requestTimeoutMs: 100,
        crawlDelayMs: 0,
        maxPagesPerCompetitor: 1,
      },
      root,
    );
    assert.equal(failed[0]?.fetchStatus, "failed");
    assert.match(failed[0]?.notes[0] ?? "", /simulated timeout/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
