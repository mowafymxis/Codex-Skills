---
name: safe-refactoring
description: "Refactor behavior-sensitive code through characterization tests, explicit invariants, small reversible transformations, and incremental verification. Use for legacy cleanup, extraction, renaming, module moves, or complexity reduction when behavior must remain stable."
---

# Safe Refactoring

Separate structural improvement from behavior change. If behavior must change, stop treating the task as a pure refactor and re-plan it.

## Establish the baseline

- Identify public and implicit contracts, callers, persistence formats, permissions, timing, side effects, and failure behavior.
- Find existing tests and add characterization tests for important behavior that is currently unprotected.
- Record invariants and compatibility requirements.
- Treat latency, allocation, ordering, logging, and failure timing as contracts when callers or service objectives rely on them; benchmark only when the contract requires it.
- Check repository state and preserve unrelated changes.

## Refactor incrementally

- Prefer mechanical, one-purpose transformations.
- Keep intermediate states buildable and testable.
- Use adapters or compatibility layers when consumers cannot move atomically.
- Avoid mixing renames, formatting churn, dependency changes, and product behavior in one patch.
- Re-check serialization, reflection, dynamic imports, configuration strings, generated code, and external consumers.

## Verify and stop

- Run focused tests after each risky boundary and broader checks before handoff.
- Compare observable behavior before and after where practical.
- Stop and report if the baseline reveals an undocumented behavior, a test fails, or the change requires migration.
- Do not delete compatibility code or data without evidence that all consumers are migrated.

## Operating discipline

- Read repository instructions and status first. Inspect contracts, callers, tests, and dynamic references before editing.
- Planning and review are read-only. When implementation is authorized, keep each transformation one-purpose, preserve unrelated changes, and stop when behavior evidence changes.
- Run focused checks after risky boundaries and broader checks before handoff. Report exact results, baseline failures, and behavior that remains uncharacterized.


## High-risk escalation

Use additional API, database, release, production, or security review for public contracts, authentication, billing, data formats, schema changes, concurrency, or production configuration.

## Example prompts

- “Use $safe-refactoring to split this service without changing behavior.”
- “Characterize this legacy function before refactoring it.”
