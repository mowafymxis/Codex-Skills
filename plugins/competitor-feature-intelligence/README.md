# Competitor Feature Intelligence

Repo-aware, evidence-backed competitive product intelligence for Codex. The plugin inventories actual application behavior, ingests authorized public or manual competitor evidence, normalizes features without erasing important distinctions, scores product opportunities, and emits a decision-ready roadmap.

## Key features

- Local repository scanner with stable feature IDs, maturity signals, ignore rules, and secret redaction
- Public-source collector with robots checks, domain boundaries, delays, retries, page limits, caching, and explicit failures
- Offline/manual mode with no live network requirement
- Evidence-aware extraction, deterministic normalization, priority scoring, and overrides
- Markdown, JSON, and correctly escaped CSV reports validated against JSON Schema
- GitHub issue drafts and scan-to-scan product change detection
- No remote writes and no transmission of local source code

## Architecture and plugin structure

The Skill directs Codex to the deterministic TypeScript CLI. `scanner` inventories repository behavior; `collector` obtains bounded public evidence; `extractor` and `normalizer` build a canonical catalog; `analysis` and `scoring` classify gaps; `reports` and `diff` write validated artifacts.

```text
.codex-plugin/plugin.json
skills/competitor-feature-intelligence/
  SKILL.md
  agents/openai.yaml
  scripts/competitor-intel.mjs
  references/
  assets/
src/                 TypeScript implementation
schemas/             canonical analysis JSON Schema
tests/               deterministic unit/integration tests
fixtures/sample-app/ fictional repository fixture
examples/            config, manual sources, and sample outputs
```

An MCP server is intentionally not bundled. The CLI provides the same narrow workflows without expanding the process attack surface or requiring a long-running service.

## Install in Codex

From the repository root:

```powershell
codex plugin marketplace add "C:\Users\moham\OneDrive\Desktop\Vibe\Codex\Plugins"
codex plugin add competitor-feature-intelligence@personal
```

The repo marketplace is `.agents/plugins/marketplace.json`; its source path is `./plugins/competitor-feature-intelligence`. Start a new Codex thread after installation so the Skill is discovered.

Invoke the plugin with `@competitor-feature-intelligence` or the Skill with `$competitor-feature-intelligence`:

```text
Use @competitor-feature-intelligence to analyze this repository.

App:
- Name: [APP NAME]
- URL: [APP URL]
- Target users: [TARGET USERS]
- Business model: [BUSINESS MODEL]
- Current stage: [STAGE]

Competitors:
- [NAME]: [URL]
- [NAME]: [URL]

Do not modify application code.
Use strict evidence mode.
Generate Markdown, JSON, and CSV reports.
```

```text
Use the competitor-feature-intelligence Skill to inventory all implemented, partial, hidden, and unfinished product features in this repository. Do not access competitor websites.
```

```text
Use the existing competitive report to draft GitHub issues for Build Now and Build Next items. Write drafts only; do not create issues remotely.
```

```text
Compare the current competitor scan with the previous scan and report only material product, pricing, positioning, integration, and security changes.
```

## CLI

Requires Node.js 20 or newer.

```powershell
npm.cmd install
npm.cmd run build
node dist/src/cli.js analyze --repo . --config competitor-intel.config.json --out ./competitive-report
node dist/src/cli.js scan-repo --repo . --out ./competitive-report/app-inventory.json
node dist/src/cli.js collect --competitors competitors.txt --out ./competitive-report/sources
node dist/src/cli.js compare --app-inventory app-inventory.json --competitor-data competitor-features.json --out ./competitive-report
node dist/src/cli.js validate --report-dir ./competitive-report
node dist/src/cli.js issues --analysis ./competitive-report/feature-gap-analysis.json --priority build-now,build-next --out ./competitive-report/github-issues.md
node dist/src/cli.js diff --previous ./previous-report --current ./competitive-report --out ./competitive-report/changes-since-last-scan.md
```

Exit code `0` means success. Exit code `1` covers invalid configuration, unsafe or failed I/O, collection failure recorded at command level, and output validation failure. Individual inaccessible competitor pages are retained as partial evidence and do not abort a full analysis.

## Configuration

Copy `examples/sample-config.json`. Supported keys are `appName`, `appUrl`, `repoPath`, `targetUsers`, `businessModel`, `currentStage`, `competitors`, `outputDirectory`, `maxPagesPerCompetitor` (1–100), `maxCrawlDepth`, `crawlDelayMs`, `requestTimeoutMs`, `strictEvidenceMode`, `minimumConfidence`, all `include*` analysis switches, `generateGithubIssueDrafts`, `allowedDomains`, `blockedDomains`, `ignoredPaths`, `redactSensitiveData`, `offline`, and `aliasDictionary`.

CLI `--repo`, `--out`, and `--offline` values override the configuration. Secrets are neither required nor supported in config. The collector only follows the configured competitor’s host/subdomains and optional allow list, minus the block list.

## Sources, evidence, and confidence

Supported public inputs include product/feature/use-case pages, pricing, docs/help/API docs, changelogs, public repositories, marketplace listings, demos, security/privacy/terms/status pages, case studies, reviews, comparisons, FAQs, integrations, and template galleries. The built-in crawler discovers same-domain HTML pages; use manual source JSON for other formats or curated third-party evidence.

High reliability covers current official docs/pricing/changelogs/APIs and inspected code; medium covers official marketing/demos/listings; low covers reviews/community material; unknown covers undated or unverifiable sources. Confidence is `high`, `medium`, `low`, or `unknown`. Failed access never proves absence. Marketing-only claims remain claims; announced/beta status must remain visible in manual evidence.

## Scoring

Inputs from 1–5 cover importance, urgency, pain, revenue, retention, activation, trust, uniqueness, strategic fit, evidence, difficulty, operational cost, and MVP suitability. The documented weighted impact score subtracts delivery and operations penalties and is clamped to 0–5. Security blockers, costly weak-evidence work, high-difficulty low-impact work, and simplicity damage apply explicit overrides. Scores are decision support, not objective truth.

## Outputs

Full analysis writes `competitive-feature-report.md`, `app-feature-inventory.json`, `competitor-sources.json`, `competitor-features.json`, `competitor-feature-matrix.csv`, `feature-gap-analysis.json`, `recommended-roadmap.md`, `do-not-build-yet.md`, `positioning-recommendations.md`, `technical-feasibility.md`, and `analysis-metadata.json`. Diff and issue commands add `changes-since-last-scan.md` and `github-issues.md`. The canonical schema is `schemas/feature-gap.schema.json`.

## Offline/manual workflow

```powershell
node dist/src/cli.js analyze --repo ./fixtures/sample-app --config ./examples/sample-config.json --out ./competitive-report --offline --manual-sources ./examples/manual-source.example.json
```

Manual records require `competitorId`, `url`, and `text`; source type, official status, retrieval date, reliability, and notes should be supplied. Reports clearly warn when competitor coverage is absent or partial.

## Issue drafts and monitoring

The `issues` command generates Markdown drafts only. Review evidence, scope, security implications, and acceptance criteria before remote creation. For monitoring, retain two report directories and run `diff`; normalized IDs and content hashes reduce layout noise. The command is scheduler-friendly but does not install a scheduler.

## Security, privacy, and legal limits

The scanner stays within the resolved repository, skips dependency/build/cache directories, respects simple `.gitignore` paths, and never follows symlinks. It redacts common keys, tokens, passwords, authorization values, connection strings, and private keys. The collector uses a named user agent and does not bypass authentication, paywalls, CAPTCHAs, robots rules, or rate limits. Do not use it for private data, surveillance, copyright circumvention, legal advice, compliance claims, or dishonest competitor attacks.

## Known limitations

- Deterministic extraction covers representative feature families; custom product semantics need alias/rule extension and review.
- The crawler is HTML-only and implements conservative same-domain discovery, not browser rendering.
- Robots parsing covers applicable user-agent/disallow rules but is not a full RFC parser.
- UX, accessibility, pricing, and security ratings remain unknown without sufficient direct evidence.
- Public evidence cannot validate authenticated dashboards, regional rollout, plan entitlements, or legal compliance.

## Troubleshooting

- PowerShell blocks `npm.ps1`: use `npm.cmd`.
- `PARTIAL ANALYSIS`: supply manual/cached sources or enable authorized network collection.
- Domain blocked: align the competitor URL and `allowedDomains`; never broaden scope unintentionally.
- Schema error: rerun `npm.cmd run build`, inspect the named JSON, then run `validate`.
- Skill not visible: add the repo marketplace, reinstall the plugin, and start a new thread.

## Development, testing, and release

```powershell
npm.cmd install
npm.cmd run format:write
npm.cmd run lint
npm.cmd run typecheck
npm.cmd test
npm.cmd run validate:package
python "C:\Users\moham\.codex\skills\.system\skill-creator\scripts\quick_validate.py" skills/competitor-feature-intelligence
python "C:\Users\moham\.codex\skills\.system\plugin-creator\scripts\validate_plugin.py" .
```

Use semantic versioning. Update `package.json`, `.codex-plugin/plugin.json`, and `CHANGELOG.md` together; regenerate samples; run all checks; inspect the package for secrets and generated private reports; then tag the release.

Roadmap: add optional browser-rendered adapters, richer repository framework rules, explicit competitor discovery review, source freshness policy, and opt-in MCP tools if they provide value without weakening boundaries.
