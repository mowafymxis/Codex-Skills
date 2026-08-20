---
name: release-readiness
description: "Assess a software release for build provenance, compatibility, configuration, migrations, feature flags, observability, rollout, documentation, validation, and rollback. Use before merging, deploying, publishing, or enabling a material change."
---

# Release Readiness

Check whether the exact change can be introduced, observed, and safely recovered—not merely whether it builds.

## Release checklist

- Identify the exact commit or artifact being released and verify it matches the intended source.
- Confirm required tests, CI checks, dependency locks, generated files, and build outputs.
- Verify artifact digest, provenance or signing, SBOM or dependency inventory when required, and that the exact validated artifact is the one selected for release.
- Check environment variables, secrets references, configuration precedence, permissions, and environment differences.
- Check schema or data migrations, mixed-version compatibility, queues, caches, scheduled jobs, and external contracts.
- Define feature-flag defaults, rollout stages, canary or progressive exposure where useful, and post-release validation.
- Confirm logs, metrics, alerts, health checks, dashboards, ownership, runbooks, and support notes are adequate to detect failure.
- Define rollback, forward-fix, migration recovery, and the conditions that trigger them.

## Decision

Classify each item as `verified`, `not applicable`, `blocked`, or `unknown`. Do not convert unknowns into approval. Give a release verdict with blocking gaps first and state exactly what remains unverified.

Do not deploy or change production state unless the user explicitly asks and the deployment authority is available.

## Operating discipline

- Read release and repository instructions first. Anchor every claim to the exact commit, artifact, environment, and evidence timestamp.
- Assessment is read-only. Do not merge, publish, deploy, enable flags, or alter production state without explicit authorization.
- Prefer observed checks, artifact comparisons, migration rehearsals, and rollback signals. Report unknowns and stale evidence without rerunning unchanged validation.


## Example prompts

- “Use $release-readiness before deploying this change.”
- “Review this release for rollback and migration risks.”
