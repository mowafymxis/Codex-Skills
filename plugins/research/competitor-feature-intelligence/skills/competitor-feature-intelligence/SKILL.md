---
name: competitor-feature-intelligence
description: Analyze an application repository and authorized public competitor sources to produce evidence-backed feature inventories, competitive gaps, priority roadmaps, UX and pricing comparisons, product positioning, and change monitoring. Use for competitor research, feature-gap analysis, product strategy, launch readiness, and repo-aware competitive intelligence.
---

# Competitor Feature Intelligence

Use the bundled CLI for deterministic inventory, collection, normalization, scoring, report generation, issue drafts, and scan diffs. Apply human judgment only after preserving source evidence and uncertainty.

## Choose the workflow

- Run a full analysis when the user supplies a repository and competitors.
- Run `scan-repo` when competitor access is forbidden or unnecessary.
- Run `collect` for authorized public-source retrieval or manual ingestion.
- Run `compare` for existing app inventory and competitor feature files.
- Run `issues` only to draft Markdown; do not create remote issues without explicit authorization.
- Run `diff` to compare two report directories.
- Do not use this Skill for private-data collection, authenticated scraping, legal conclusions, or definitive claims based on missing evidence.

## Gather inputs

Require the repository path. For competitor analysis, require explicit competitor names/URLs or a manual source file. Accept app URL, users, business model, stage, source controls, and previous scan as optional context. Never silently expand competitor scope.

## Execute

1. Inspect applicable repository instructions and confirm the resolved repository boundary.
2. Create a configuration from `examples/sample-config.json` when one does not exist.
3. Run the built CLI from the plugin root:

   ```bash
   npm run build
   node dist/src/cli.js analyze --repo . --config competitor-intel.config.json --out ./competitive-report
   ```

4. If network use is unavailable or not authorized, add `--offline` and optionally `--manual-sources sources.json`.
5. Run `node dist/src/cli.js validate --report-dir ./competitive-report`.
6. Review warnings, inaccessible sources, conflicts, and low-confidence recommendations before summarizing.

## Evidence rules

- Treat code plus behavior relationships as app evidence; a filename or component name alone is insufficient.
- Prefer current official documentation, pricing, changelog, repository, and API evidence.
- Mark marketing language as a claim. Keep third-party evidence weaker.
- Preserve contradictory evidence and possible plan, platform, region, or rollout differences.
- Say "No evidence was found in the reviewed public sources," never that a competitor definitively lacks a feature without comprehensive proof.
- Use `unknown` rather than invented UX, pricing, security, accessibility, or maturity ratings.

Read [evidence-policy.md](references/evidence-policy.md) and [source-reliability.md](references/source-reliability.md) before making material competitive claims. Read [feature-taxonomy.md](references/feature-taxonomy.md) before changing aliases. Read [scoring-model.md](references/scoring-model.md) before overriding priorities. Read [report-specification.md](references/report-specification.md) when tailoring output.

## Normalize and score

Keep related concepts distinct: Google login/SSO, OAuth/SAML, email/push, AI chat/recommendations, teams/RBAC, API/webhooks, and responsive/native mobile. Use configured aliases only for true semantic equivalence.

Treat the score as decision support. Apply security launch-blocker, costly weak-evidence, high-difficulty low-impact, and simplicity overrides. Every recommendation needs a rationale and evidence confidence.

## Safety

Scan only the intended repository. Respect ignore rules. Redact secrets and avoid quoting source code beyond short summaries. Do not send local code to remote services. Respect robots rules, delays, page limits, domain allow/block controls, authentication boundaries, paywalls, and CAPTCHAs. Read [ethical-research-policy.md](references/ethical-research-policy.md) for collection work and [implementation-guidance.md](references/implementation-guidance.md) for technical feasibility.

## Execution boundary

Treat every report as a dated snapshot and record the collection cutoff. The workflow may read authorized public sources, but it must not create issues, contact vendors, log into products, purchase plans, or change remote systems without explicit authorization.

## Examples

```text
Use $competitor-feature-intelligence to analyze this repository against the supplied competitors in strict evidence mode.
```

```text
Use $competitor-feature-intelligence to inventory implemented, partial, hidden, and unfinished features without accessing competitor websites.
```

```text
Use $competitor-feature-intelligence to compare the current and previous reports and return only material product, pricing, positioning, integration, and security changes.
```

## Limitations

The deterministic extractor recognizes documented feature families; it does not replace authenticated product testing, broad market discovery, legal review, WCAG conformance testing, or user research. Public-source failure reduces coverage and must remain visible in the report.
