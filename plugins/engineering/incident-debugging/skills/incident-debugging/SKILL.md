---
name: incident-debugging
description: "Investigate production or development failures through evidence preservation, timeline construction, hypothesis testing, safe reproduction, root-cause isolation, minimal repair, regression coverage, and recovery verification. Use for incidents, regressions, outages, or unexplained behavior."
---

# Incident Debugging

Reduce uncertainty systematically. A plausible explanation is not a root cause until evidence connects it to the failure and the fix prevents recurrence.

## Investigate

1. Capture symptom, affected users or data, start time, scope, frequency, recent changes, and current impact.
2. Preserve relevant logs, traces, metrics, requests, versions, configuration, and reproduction input before they rotate or change.
3. Build a concise timeline of observations and actions.
4. Generate a small set of competing hypotheses with predicted evidence.
5. Test hypotheses using read-only inspection or a safe reproduction first.
6. Isolate the smallest causal change and distinguish trigger, contributing conditions, and root cause.

## Repair and learn

- Apply the smallest safe mitigation authorized by the user; do not make unrelated cleanup changes during an incident.
- Add a regression test, invariant, alert, validation, or guard at the layer that can prevent recurrence.
- Verify recovery and check for delayed, queued, duplicated, or partially applied effects.
- Produce a blameless summary: impact, timeline, cause, detection gap, repair, follow-up, and evidence limits.

Never delete evidence, speculate about users or operators, or claim recovery without an observed signal. Escalate immediately when data loss, security exposure, or ongoing production impact is possible.

## Evidence and efficiency

- Read repository-local instructions before making decisions.
- Start with file names, symbols, and the smallest relevant slices; expand only when evidence requires it.
- Reuse facts already established in the task. Do not rediscover the same files or rerun an unchanged check.
- Prefer deterministic commands, linters, type checkers, and tests over lengthy speculative reasoning.
- Keep intermediate notes compact: preserve paths, commands, results, assumptions, and unresolved risks.
- Never trade away a decisive correctness, safety, or compatibility check merely to save tokens.


## Example prompts

- “Use $incident-debugging to investigate this failed deployment.”
- “Find the root cause of this intermittent test failure.”
