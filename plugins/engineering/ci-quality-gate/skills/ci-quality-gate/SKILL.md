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

## Evidence and efficiency

- Read repository-local instructions before making decisions.
- Start with file names, symbols, and the smallest relevant slices; expand only when evidence requires it.
- Reuse facts already established in the task. Do not rediscover the same files or rerun an unchanged check.
- Prefer deterministic commands, linters, type checkers, and tests over lengthy speculative reasoning.
- Keep intermediate notes compact: preserve paths, commands, results, assumptions, and unresolved risks.
- Never trade away a decisive correctness, safety, or compatibility check merely to save tokens.


## Scope boundary

This skill audits CI design and quality. For a specific failing GitHub Actions run, use the repository’s GitHub CI-debugging workflow when available, then return here for systemic fixes.

## Example prompts

- “Use $ci-quality-gate to audit this GitHub Actions workflow.”
- “Make this CI faster without reducing verification.”
