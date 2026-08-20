---
name: professional-engineering-workflow
description: "Execute a scoped software change in an existing codebase through repository inspection, minimal implementation, verification, and handoff. Use when the user asks Codex to make and verify a change; use specialized planning, onboarding, review, migration, release, or incident skills for those standalone tasks."
---

# Professional Engineering Workflow

Run the smallest process that is sufficient for the change risk. Do not turn a one-line change into a heavyweight review, and do not treat a high-risk change as a normal edit.

## 1. Establish the contract

- Read applicable repository instructions, contribution rules, and generated-file policies.
- Restate the requested outcome, constraints, acceptance criteria, and non-goals.
- Identify whether the task is audit-only, plan-only, implementation, debugging, or release preparation.
- Record material unknowns instead of inventing answers.

## 2. Enforce the mode gate

- **Audit, plan, and verification modes are read-only:** inspect and report; do not edit files, run destructive commands, commit, push, deploy, or change external state.
- **Implementation mode may edit only when the user has requested a change:** capture the pre-edit worktree status and keep the write scope explicit.
- **Debugging starts read-only:** diagnose first; make a repair only when the user authorizes the fix or the request clearly includes implementation.
- **Release preparation is not deployment:** validate readiness and handoff unless deployment is explicitly requested and authorized.
- If the request mixes modes, finish the read-only result and state the exact transition that needs authorization.
- Use the most specific active engineering skill for its domain. Do not repeat its analysis; integrate its evidence into the final handoff.

Return a mode-specific result:

- **Audit:** inspected scope, evidence, findings, unknowns, and no-change conclusion.
- **Plan:** requirements, affected surfaces, ordered steps, tests, risks, and no-change conclusion.
- **Verification:** commands/checks, exact results, artifacts or side effects, and unverified areas.
- **Implementation:** files changed, behavior delivered, checks run, risks, and rollback or next action.

## 3. Classify risk

Use the highest applicable level:

- **Low:** isolated copy, styling, documentation, or mechanical change.
- **Medium:** feature logic, shared component, ordinary API, or behavior change with local consumers.
- **High:** authentication, authorization, payments, personal data, schema/migrations, public contracts, concurrency, production configuration, or deployment.

Escalate the workflow when the change crosses a boundary, has irreversible effects, or affects multiple versions of a system.

## 4. Inspect narrowly and plan

- Map the relevant entry points, callers, data, configuration, tests, and deployment path.
- For medium or high risk, produce a short implementation plan with affected surfaces, edge cases, tests, and rollback or recovery considerations.
- Prefer the smallest compatible change boundary. Do not expand scope because an unrelated improvement is visible.

## 5. Implement safely

- Preserve unrelated user changes.
- Record the exact files and directories permitted to change before editing.
- Follow existing conventions unless there is evidence they are unsafe or the task explicitly changes them.
- Keep the diff coherent and reversible.
- Do not expose, copy, or invent secrets. Do not run destructive local commands, change production data, modify external systems, commit, push, or deploy without explicit authorization and a verified target.

## 6. Verify and hand off

- Run the most targeted decisive checks first, then broaden them according to risk. Prefer read-only or isolated checks; if a build, test, cache, snapshot, or generated artifact changes the worktree, report it and clean it only when safe and authorized.
- Inspect the final diff and check callers, types, schemas, tests, build configuration, and compatibility where relevant.
- Recheck repository status after tests and builds so generated files, snapshots, caches, or formatter churn cannot enter the handoff unnoticed.
- Report files changed, checks actually run and their results, assumptions, unresolved risks, and the next action.
- Say explicitly when a check could not be run. Never imply that unexecuted code was tested.

## Evidence and efficiency

- Inspect the smallest relevant surfaces first and expand only when evidence could change implementation or verification.
- Reuse established repository facts and unchanged check results; keep a compact ledger of allowed paths, commands, results, assumptions, and risks.
- Prefer deterministic checks. Never trade away a decisive correctness, authorization, safety, compatibility, or rollback check merely to save tokens.


## Quality anchors

When local policy is absent, use design-first review, requirements/design/implementation/verification/release gates, production-readiness thinking, and controlled merge checks as reference practices. These are adaptable engineering principles, not a claim that every project needs the same bureaucracy.

## Example prompts

- “Use $professional-engineering-workflow to add this feature safely.”
- “Apply $professional-engineering-workflow in lightweight mode for this small UI fix.”
