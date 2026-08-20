---
name: verification-budget-router
description: Allocate limited testing and review effort according to failure consequence, uncertainty, detectability, propagation, and reversibility instead of treating every changed line equally. Use when time is constrained, a patch spans multiple risk levels, release confidence must be justified, or a team needs a defensible test plan.
---

# Verification Budget Router

Route verification effort to the places where an undetected mistake would matter most.

## Enumerate failure claims

List concrete ways the change could be wrong. Include:

- incorrect local behavior;
- contract or compatibility breakage;
- data corruption or meaning drift;
- authorization or privacy regression;
- temporal failure in retries, queues, or mixed versions;
- operational invisibility;
- rollback failure.

Avoid generic entries such as “there may be bugs.”

## Score routing factors

For each failure claim, rate `1` to `4`:

- consequence: harm if it occurs;
- uncertainty: weakness of current evidence;
- propagation: number and distance of affected consumers;
- invisibility: likelihood ordinary checks miss it;
- irreversibility: difficulty of recovery.

Calculate:

```text
priority = consequence × (uncertainty + propagation + invisibility + irreversibility)
```

Use the result as an ordering heuristic, not a probability estimate.

## Match evidence to failure

Choose the cheapest check that directly discriminates the claim:

| Failure shape | Prefer |
|---|---|
| Pure transformation | focused unit/property tests |
| Consumer contract | integration or contract tests |
| Historical compatibility | fixture corpus or differential test |
| Race/order/retry | deterministic concurrency or fault injection |
| Migration/mixed versions | upgrade matrix and rollback rehearsal |
| User workflow | end-to-end path at the real boundary |
| Operational blindness | alert/log/metric assertion |

Do not spend high-cost end-to-end tests on behavior a narrow deterministic check proves better.

## Allocate the budget

Create three lanes:

- `must prove`: release-blocking evidence;
- `should sample`: meaningful but bounded coverage;
- `accept and observe`: low-consequence residual risk with a detection plan.

State the time or execution budget if supplied. If none is supplied, optimize for the smallest credible suite rather than pretending resources are unlimited.

## Check portfolio balance

Ensure the plan covers:

- at least one success path;
- the highest-priority failure path;
- the most distant contract consumer;
- the least reversible effect;
- a rollback or recovery signal when relevant.

Remove duplicate tests that provide the same evidence.

## Deliver

Return:

| Failure claim | Priority factors | Evidence action | Lane | Pass condition |
|---|---|---|---|---|

End with residual risks and why they are accepted. Never equate passing tests with absence of risk.

## Execution boundary

Budgeting prioritizes optional effort but never waives repository-required checks, safety policy, or acceptance criteria. Execute tests or mutate artifacts only within the authority already granted for the parent task.

## Example prompts

- “Use $verification-budget-router to spend two hours of testing wisely.”
- “Rank the verification work for this mixed frontend/database patch.”
- “Tell me what must block release and what can be observed after rollout.”
