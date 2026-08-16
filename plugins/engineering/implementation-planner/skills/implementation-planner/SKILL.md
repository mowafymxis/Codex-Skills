---
name: implementation-planner
description: "Turn a software request into a repository-grounded implementation plan with acceptance criteria, affected surfaces, invariants, edge cases, tests, migration or rollout needs, and rollback considerations. Use before implementing a non-trivial feature, behavior change, or cross-layer modification."
---

# Implementation Planner

Produce a plan that another engineer could execute without guessing. Default to plan-only; edit files only when the user asks for implementation.

## Build the plan

- Restate the desired observable behavior and non-goals.
- Inspect the relevant repository paths before naming files or APIs.
- Identify entry points, callers, data stores, configuration, permissions, external contracts, and operational effects.
- Define acceptance criteria that can be verified, including failure and permission cases.
- List invariants that must remain true.
- Identify compatibility, migration, rollout, feature-flag, and rollback needs.
- Create a focused test matrix: normal, boundary, invalid, unauthorized, empty, failure, retry, and concurrency cases when relevant.
- Split work into ordered, reversible steps with a verification point after each risky boundary.

## Challenge the plan

- Check whether the request can be satisfied by an existing abstraction or configuration.
- Call out ambiguous requirements that materially affect behavior; make low-risk assumptions explicit instead of blocking unnecessarily.
- Search for hidden consumers, generated files, mixed-version deployments, and documentation or support promises.
- Reject speculative architecture, unnecessary dependencies, and unrelated cleanup.

## Output

Return:

1. Scope and assumptions.
2. Current evidence and affected surfaces.
3. Ordered implementation steps.
4. Acceptance and test matrix.
5. Risks, migration, rollout, and rollback.
6. Unresolved questions and the next smallest action.

## Evidence and efficiency

- Read repository-local instructions before making decisions.
- Start with file names, symbols, and the smallest relevant slices; expand only when evidence requires it.
- Reuse facts already established in the task. Do not rediscover the same files or rerun an unchanged check.
- Prefer deterministic commands, linters, type checkers, and tests over lengthy speculative reasoning.
- Keep intermediate notes compact: preserve paths, commands, results, assumptions, and unresolved risks.
- Never trade away a decisive correctness, safety, or compatibility check merely to save tokens.


## Example prompts

- “Plan this feature with $implementation-planner, but do not edit yet.”
- “Create a migration-safe plan for this schema change.”
