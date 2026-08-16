---
name: release-readiness
description: "Assess a software release for build provenance, compatibility, configuration, migrations, feature flags, observability, rollout, documentation, validation, and rollback. Use before merging, deploying, publishing, or enabling a material change."
---

# Release Readiness

Check whether the exact change can be introduced, observed, and safely recovered—not merely whether it builds.

## Release checklist

- Identify the exact commit or artifact being released and verify it matches the intended source.
- Confirm required tests, CI checks, dependency locks, generated files, and build outputs.
- Check environment variables, secrets references, configuration precedence, permissions, and environment differences.
- Check schema or data migrations, mixed-version compatibility, queues, caches, scheduled jobs, and external contracts.
- Define feature-flag defaults, rollout stages, canary or progressive exposure where useful, and post-release validation.
- Confirm logs, metrics, alerts, health checks, dashboards, ownership, runbooks, and support notes are adequate to detect failure.
- Define rollback, forward-fix, migration recovery, and the conditions that trigger them.

## Decision

Classify each item as `verified`, `not applicable`, `blocked`, or `unknown`. Do not convert unknowns into approval. Give a release verdict with blocking gaps first and state exactly what remains unverified.

Do not deploy or change production state unless the user explicitly asks and the deployment authority is available.

## Evidence and efficiency

- Read repository-local instructions before making decisions.
- Start with file names, symbols, and the smallest relevant slices; expand only when evidence requires it.
- Reuse facts already established in the task. Do not rediscover the same files or rerun an unchanged check.
- Prefer deterministic commands, linters, type checkers, and tests over lengthy speculative reasoning.
- Keep intermediate notes compact: preserve paths, commands, results, assumptions, and unresolved risks.
- Never trade away a decisive correctness, safety, or compatibility check merely to save tokens.


## Example prompts

- “Use $release-readiness before deploying this change.”
- “Review this release for rollback and migration risks.”
