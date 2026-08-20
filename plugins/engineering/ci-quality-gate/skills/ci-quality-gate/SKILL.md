---
name: ci-quality-gate
description: "Audit or improve continuous-integration quality gates for deterministic builds, linting, type checks, tests, artifacts, dependency checks, caching, matrices, secrets, and failure visibility. Use when designing CI, reviewing workflow changes, or diagnosing unreliable quality gates; route GitHub Actions-specific failures to the dedicated GitHub CI workflow when appropriate."
---

# CI Quality Gate

Make CI a trustworthy signal, not a collection of green-looking jobs.

## Audit the gate

- Identify the checks required before merge and the checks that are informational.
- Verify that lint, format, type, unit, integration, contract, build, and relevant security or dependency checks cover the repository’s real risks.
- Check trigger scope, changed-file filtering, matrix coverage, dependency installation, lockfile use, caching, artifact retention, timeouts, concurrency, and permissions.
- Check forked-pull-request secret isolation, third-party action or image pinning, artifact provenance, and whether a compromised job can write to the repository or deployment environment.
- Detect skipped or flaky checks that can appear successful while leaving important paths unverified.
- Compare CI commands with documented local commands and ensure failures expose useful logs.

## Improve without hiding failures

- Prefer deterministic commands and pinned/reproducible inputs where the repository supports them.
- Cache only data that is safe to reuse and invalidate it when inputs change.
- Separate fast feedback from slower required checks without weakening the merge gate.
- Make flaky tests visible and track their cause; do not add blind retries as the only fix.
- Preserve secrets and least privilege; never print credentials or sensitive test data.
- Use artifacts for reports and diagnostics, not as a substitute for a failed required check.

## Output

Return the gate map, trust gaps, cost or latency hotspots, minimal changes, and exact local/CI checks. Do not claim a workflow is fixed without observing the relevant run or executing an equivalent check.

## Operating discipline

- Read repository instructions and status first. Inspect workflow, manifest, and command definitions before opening broad logs.
- Default to audit or plan mode. Modify workflows, secrets, branch rules, or remote CI only when explicitly authorized; never expose secret values.
- Prefer deterministic local equivalents and observed runs. Report exact checks, results, skipped paths, and unverified platform behavior without rerunning unchanged jobs.


## Scope boundary

This skill audits CI design and quality. For a specific failing GitHub Actions run, use the repository’s GitHub CI-debugging workflow when available, then return here for systemic fixes.

## Example prompts

- “Use $ci-quality-gate to audit this GitHub Actions workflow.”
- “Make this CI faster without reducing verification.”
