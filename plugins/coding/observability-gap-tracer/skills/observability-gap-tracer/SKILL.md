---
name: observability-gap-tracer
description: Trace a user-visible or operational failure backward to the signals needed to detect, localize, explain, and verify recovery, then identify the smallest missing telemetry. Use for silent failures, incident readiness, background jobs, distributed workflows, unreliable alerts, and changes whose correctness must be observable after release.
---

# Observability Gap Tracer

Design observability around decisions operators must make, not around producing more logs.

## Start from the failure

Describe:

- user or business symptom;
- affected entity and request/job identity;
- expected completion window;
- first point where the system can know the outcome is wrong;
- recovery action an operator could take.

Avoid starting with available metrics; they may encode the wrong boundary.

## Trace the causal path

Walk backward through:

1. user-visible outcome;
2. persisted result;
3. side effects and downstream acknowledgements;
4. worker or handler execution;
5. queue, scheduler, or transport;
6. originating request or event.

For each stage, identify input identity, output identity, duration, result class, and retry count.

## Build the signal matrix

| Decision | Required signal | Existing evidence | Gap | Cardinality/privacy risk |
|---|---|---|---|---|

Cover four operator decisions:

- Is something wrong?
- Where is it wrong?
- Which entities are affected?
- Did recovery work?

One signal may support multiple decisions. Prefer that over redundant instrumentation.

## Detect misleading observability

Look for:

- success logged before durable commit;
- counters without denominators;
- averages hiding tail failures;
- retries counted as independent demand;
- queue depth without age;
- errors without stable correlation;
- alerts on causes that do not track user harm;
- high-cardinality labels;
- secret or personal data in payload logs;
- dashboards that cannot distinguish stale data.

Do not recommend logging full request bodies by default.

## Design the minimum patch

Prefer:

- explicit outcome events at durable boundaries;
- bounded result-class counters;
- latency histograms at user-relevant stages;
- queue age and retry exhaustion;
- trace or correlation identifiers with documented propagation;
- reconciliation metrics comparing expected and actual state;
- synthetic checks only when they test the real contract.

Attach each new signal to an alert, query, dashboard decision, or verification step. Remove signals with no consumer.

## Deliver

Return the causal path, signal matrix, smallest telemetry additions, alert condition, and recovery-verification query. State what remains unobservable and why.

## Execution boundary

Auditing telemetry is read-only. Instrumentation changes require implementation authority and must account for sensitive data, cardinality, sampling, retention, cost, and rollback before collection is expanded.

## Example prompts

- “Use $observability-gap-tracer on this silently failing export job.”
- “Find why our dashboard says healthy while users see errors.”
- “Design the minimum signals needed to verify this rollout.”
