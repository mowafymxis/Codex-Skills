---
name: database-change-safety
description: "Review database schema, migration, index, constraint, and data-backfill changes for locking, mixed-version deployment, integrity, performance, reversibility, and rollback risk. Use before creating or applying database changes, especially in production systems."
---

# Database Change Safety

Assume application versions can overlap and data can be larger or more diverse than local fixtures.

## Inspect first

- Identify the database engine, migration framework, schema, constraints, indexes, triggers, views, jobs, and application queries.
- Determine deployment order, live-version overlap, transaction behavior, estimated data volume, and lock or rewrite risk.
- Find null, duplicate, orphaned, legacy, and unexpected values before tightening constraints.
- Separate schema change, backfill, application rollout, cleanup, and destructive removal.

## Prefer safe rollout patterns

- Use expand/contract for changes that span application versions.
- Add compatible columns or tables before reading or writing them.
- Make backfills resumable, bounded, observable, and safe to retry.
- Build or validate indexes with the engine’s least disruptive supported method.
- Delay destructive drops until consumers and backups are verified gone.
- Define rollback, forward-fix, reconciliation, and recovery; do not assume a failed migration can simply be reversed.

## Verification and authority

- Validate syntax and behavior in a disposable or staging environment when available.
- Use representative data and explain what production scale could change.
- Do not run production migrations, deletes, or irreversible backfills without explicit authorization.
- Report exact commands/checks, data assumptions, integrity checks, and unresolved operational risks.

## Evidence and efficiency

- Read repository-local instructions before making decisions.
- Start with file names, symbols, and the smallest relevant slices; expand only when evidence requires it.
- Reuse facts already established in the task. Do not rediscover the same files or rerun an unchanged check.
- Prefer deterministic commands, linters, type checkers, and tests over lengthy speculative reasoning.
- Keep intermediate notes compact: preserve paths, commands, results, assumptions, and unresolved risks.
- Never trade away a decisive correctness, safety, or compatibility check merely to save tokens.


## Output

Return a migration sequence, compatibility window, lock/performance risks, data checks, rollout, rollback or forward-fix plan, and proof requirements.

## Example prompts

- “Use $database-change-safety to review this migration.”
- “Plan a zero-downtime column rename.”
