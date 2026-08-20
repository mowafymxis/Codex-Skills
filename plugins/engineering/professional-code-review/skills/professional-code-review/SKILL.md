---
name: professional-code-review
description: "Review a code diff, commit, or change set for design, correctness, maintainability, compatibility, performance, testing, and operational risks. Use for pull-request review or pre-merge review; do not modify code unless explicitly asked."
---

# Professional Code Review

Review the change, not the author. Start with the diff and the intended behavior, then inspect surrounding code only when needed to validate a finding.

## Review order

1. Confirm scope, stated behavior, and affected system boundary.
2. Review overall design and integration before line-level details.
3. Check correctness, edge cases, error handling, data integrity, authorization, concurrency, performance, compatibility, and failure recovery.
4. Check whether tests prove the changed behavior and important negative paths.
5. Check configuration, migrations, observability, documentation, and rollback when the change reaches them.

## Findings standard

Report only findings that are actionable and supported by evidence. For each finding include:

- priority: `blocker`, `high`, `medium`, or `low`;
- exact file and line or symbol;
- concrete failure scenario;
- why the current code causes it;
- smallest effective fix or verification needed.

Do not report personal style preferences, hypothetical issues with no plausible path, or issues already ruled out by tests or repository policy. Separate confirmed findings from questions and residual uncertainty. If no material findings are supported, say so and state what was not verified.

Keep pre-existing defects separate from regressions introduced or exposed by the change. Mention an out-of-scope defect only when it materially changes the safety of merging the reviewed change.

## Review modes

- **Diff review:** focus on changed behavior and its immediate blast radius.
- **Pre-merge review:** include CI, migration, release, and documentation readiness.
- **Architecture review:** inspect design alternatives and long-term coupling, not just line edits.

## Operating discipline

- Read repository review instructions and inspect the diff first. Expand to callers, schemas, tests, and operations only to prove or disprove a finding.
- Review is read-only. Do not modify code, post reviews, or change pull-request state unless the user explicitly asks.
- Prefer executable checks and exact symbols or lines. Reuse established evidence, avoid duplicate findings, and state checks not run or contexts not available.


## Example prompts

- “Use $professional-code-review on this diff.”
- “Review this PR for blockers only.”
