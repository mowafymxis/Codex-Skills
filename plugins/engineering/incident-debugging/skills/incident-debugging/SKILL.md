---
name: incident-debugging
description: "Investigate production or development failures through evidence preservation, timeline construction, hypothesis testing, safe reproduction, root-cause isolation, minimal repair, regression coverage, and recovery verification. Use for incidents, regressions, outages, or unexplained behavior."
---

# Incident Debugging

Reduce uncertainty systematically. A plausible explanation is not a root cause until evidence connects it to the failure and the fix prevents recurrence.

## Investigate

1. Capture symptom, affected users or data, start time, scope, frequency, recent changes, and current impact.
2. Preserve relevant logs, traces, metrics, requests, versions, configuration, and reproduction input before they rotate or change.
3. Build a concise timeline of observations and actions. Normalize timestamps to one stated timezone and preserve originals when clock skew or ordering could matter.
4. Generate a small set of competing hypotheses with predicted evidence.
5. Test hypotheses using read-only inspection or a safe reproduction first.
6. Isolate the smallest causal change and distinguish trigger, contributing conditions, and root cause.

A mitigation that suppresses the symptom is not root-cause proof. Require the causal explanation to predict both the failure and the observed recovery.

## Repair and learn

- Apply the smallest safe mitigation authorized by the user; do not make unrelated cleanup changes during an incident.
- Add a regression test, invariant, alert, validation, or guard at the layer that can prevent recurrence.
- Verify recovery and check for delayed, queued, duplicated, or partially applied effects.
- Produce a blameless summary: impact, timeline, cause, detection gap, repair, follow-up, and evidence limits.

Never delete evidence, speculate about users or operators, or claim recovery without an observed signal. Escalate immediately when data loss, security exposure, or ongoing production impact is possible.

## Operating discipline

- Read incident and repository instructions first. Preserve volatile evidence, then inspect the smallest surfaces that discriminate competing hypotheses.
- Investigation starts read-only. Apply mitigations, repairs, production commands, or external changes only with explicit authority and a verified target.
- Record commands, timestamps, versions, results, failed hypotheses, and evidence gaps. Do not rerun unchanged checks or expose sensitive event data.


## Example prompts

- “Use $incident-debugging to investigate this failed deployment.”
- “Find the root cause of this intermittent test failure.”
