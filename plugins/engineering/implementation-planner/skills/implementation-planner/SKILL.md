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
- Define observability, ownership, documentation, and support changes needed to know the rollout succeeded and to respond when it does not.
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

## Operating discipline

- Read repository instructions and status first. Inspect only the paths needed to ground names, dependencies, and verification commands.
- Planning is read-only. Do not edit files, create issues, or change external state unless the user separately requests implementation.
- Cite repository evidence for affected surfaces, reuse established facts, and label unverified commands or assumptions instead of presenting them as tested.


## Example prompts

- “Plan this feature with $implementation-planner, but do not edit yet.”
- “Create a migration-safe plan for this schema change.”
