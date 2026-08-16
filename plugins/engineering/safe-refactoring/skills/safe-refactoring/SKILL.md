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

## Evidence and efficiency

- Read repository-local instructions before making decisions.
- Start with file names, symbols, and the smallest relevant slices; expand only when evidence requires it.
- Reuse facts already established in the task. Do not rediscover the same files or rerun an unchanged check.
- Prefer deterministic commands, linters, type checkers, and tests over lengthy speculative reasoning.
- Keep intermediate notes compact: preserve paths, commands, results, assumptions, and unresolved risks.
- Never trade away a decisive correctness, safety, or compatibility check merely to save tokens.


## High-risk escalation

Use additional API, database, release, production, or security review for public contracts, authentication, billing, data formats, schema changes, concurrency, or production configuration.

## Example prompts

- “Use $safe-refactoring to split this service without changing behavior.”
- “Characterize this legacy function before refactoring it.”
