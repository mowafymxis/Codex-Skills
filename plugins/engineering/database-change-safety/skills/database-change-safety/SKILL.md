---
name: database-change-safety
description: "Review database schema, migration, index, constraint, and data-backfill changes for locking, mixed-version deployment, integrity, performance, reversibility, and rollback risk. Use before creating or applying database changes, especially in production systems."
---

# Database Change Safety

Assume application versions can overlap and data can be larger or more diverse than local fixtures.

## Inspect first

- Identify the database engine, migration framework, schema, constraints, indexes, triggers, views, jobs, and application queries.
- Determine deployment order, live-version overlap, transaction behavior, estimated data volume, and lock or rewrite risk.
- Include replicas, change-data capture, search indexes, caches, analytics consumers, and read models when they observe the changed schema or data meaning.
- Find null, duplicate, orphaned, legacy, and unexpected values before tightening constraints.
- Separate schema change, backfill, application rollout, cleanup, and destructive removal.

## Prefer safe rollout patterns

- Use expand/contract for changes that span application versions.
- Add compatible columns or tables before reading or writing them.
- Make backfills resumable, bounded, observable, and safe to retry.
- Define batch size, throttling, pause/resume controls, lag thresholds, and reconciliation before running a large backfill.
- Build or validate indexes with the engine’s least disruptive supported method.
- Delay destructive drops until consumers and backups are verified gone.
- Define rollback, forward-fix, reconciliation, and recovery; do not assume a failed migration can simply be reversed.

## Verification and authority

- Validate syntax and behavior in a disposable or staging environment when available.
- Use representative data and explain what production scale could change.
- Do not run production migrations, deletes, or irreversible backfills without explicit authorization.
- Report exact commands/checks, data assumptions, integrity checks, and unresolved operational risks.

## Operating discipline

- Read repository instructions and status first. Inspect the migration, affected queries, engine/version documentation, and representative data before recommending execution.
- Default to review or plan mode. Never apply production migrations, backfills, deletes, or constraint changes without explicit authorization and a verified target.
- Prefer dry runs, explain plans, integrity queries, and disposable-environment tests. Report exact checks, scale assumptions, results, and the last safe rollback point.


## Output

Return a migration sequence, compatibility window, lock/performance risks, data checks, rollout, rollback or forward-fix plan, and proof requirements.

## Example prompts

- “Use $database-change-safety to review this migration.”
- “Plan a zero-downtime column rename.”
