---
name: state-machine-reconstructor
description: Reconstruct an undocumented state machine from guards, transitions, events, persistence, retries, UI labels, and tests, while preserving conflicting and unreachable evidence. Use for workflows, subscriptions, orders, authentication, background jobs, approval systems, incident lifecycles, and debugging impossible or stuck states.
---

# State Machine Reconstructor

Derive states from observable predicates and transition evidence. Do not trust a status enum to describe the whole machine.

## Set the entity boundary

Identify:

- the entity whose lifecycle is being modeled;
- its identity and persistence boundary;
- actors that can change it;
- events and commands;
- clocks, retries, and external callbacks.

Split coupled entities if they can transition independently.

## Mine state evidence

Inspect:

- status fields and enums;
- boolean combinations and nullable timestamps;
- authorization and validation guards;
- event handlers, reducers, jobs, and webhooks;
- database constraints and migrations;
- UI labels and available actions;
- tests, fixtures, logs, and runbooks.

Record provenance for every state and transition.

## Build canonical states

A state must differ in allowed behavior, obligations, or future transitions. Merge labels that are semantically identical. Split one label when hidden predicates create different behavior.

Represent state as a predicate when necessary:

```text
ACTIVE = status=active AND suspended_at IS NULL AND expires_at>now
```

Mark:

- terminal states;
- transient states;
- externally controlled states;
- composite or ambiguous states;
- impossible states claimed by constraints.

## Reconstruct transitions

For each transition, capture:

| From | Event/command | Guard | Side effects | To | Idempotent? | Evidence |
|---|---|---|---|---|---|---|

Include duplicate, out-of-order, timeout, cancellation, and retry paths. Distinguish “event received” from “transition committed.”

## Find contradictions

Search for:

- UI actions with no backend transition;
- backend transitions with no reachable trigger;
- guards that conflict with database constraints;
- states with no exit or no entry;
- terminal states that later mutate;
- retries that repeat non-idempotent side effects;
- multiple fields that can encode inconsistent state.

Do not resolve conflicts silently. Present competing models and the evidence needed to choose.

## Deliver

Return a state table, transition table, contradictions, unreachable states, and minimal tests that would pin the model. Use a diagram only when it improves comprehension and keep unknown edges explicit.

## Execution boundary

Reconstruction is read-only unless implementation is requested. Preserve competing state models when evidence conflicts; do not silently choose the neatest model or encode it as a contract before validation.

## Example prompts

- “Use $state-machine-reconstructor on this subscription workflow.”
- “Explain how this job can become stuck between queued and complete.”
- “Find impossible states encoded by these three status fields.”
