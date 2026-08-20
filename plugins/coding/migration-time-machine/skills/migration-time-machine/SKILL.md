---
name: migration-time-machine
description: Analyze a migration across past, present, partial, mixed-version, rollback, retry, and future states, then design compatibility gates and recovery checks. Use for database, data-format, API, event-schema, configuration, storage, identity, and dependency migrations where a happy-path upgrade is insufficient.
---

# Migration Time Machine

Model a migration as a period of coexistence, not a single command.

## Define versions and artifacts

Identify:

- old and new readers;
- old and new writers;
- stored representations;
- producers and consumers;
- migration jobs and checkpoints;
- deployment order constraints;
- rollback target;
- retention and backup boundaries.

Name versions by behavior, not only release number.

## Build the time-state matrix

Evaluate:

| Time state | Questions |
|---|---|
| Before | Is current data internally valid? |
| Expanded | Can old code tolerate new optional structures? |
| Mixed versions | Can every reader consume every active writer’s output? |
| Partial migration | How is migrated vs unmigrated data distinguished? |
| Interrupted | Can work resume without duplication or loss? |
| Retried | Are operations idempotent and checkpointed? |
| Rolled back | Can old code read data already written by new code? |
| Contracted | What proves old representations and consumers are gone? |
| Future | Will retained artifacts remain interpretable? |

Add offline clients, delayed queues, replicas, and caches when relevant.

## Verify compatibility pairs

Create a reader/writer matrix. Mark each pair:

- `compatible`;
- `requires adapter`;
- `write restricted`;
- `unsafe`;
- `unknown`.

Do not assume backward-compatible readers imply rollback-safe writers.

## Design gates

Use explicit gates:

1. expand representation;
2. deploy tolerant readers;
3. enable new writes gradually;
4. migrate historical data with checkpoints;
5. reconcile old and new representations;
6. prove no old consumers remain;
7. contract obsolete structures.

Attach a measurable entry and exit condition to each gate.

## Plan fault recovery

Test:

- duplicate execution;
- mid-batch crash;
- poison record;
- stale replica;
- out-of-order event;
- partial external-provider update;
- rollback after new writes;
- restart from the last checkpoint.

Prefer compensating records over destructive correction when history matters.

## Deliver

Return the time-state matrix, compatibility pairs, gated sequence, abort signals, reconciliation queries, and last safe rollback point. State any irreversible boundary before recommending execution.

## Execution boundary

Produce a migration-state plan unless execution is explicitly authorized. Never run destructive, irreversible, or production migration steps as part of analysis. Route database-locking and data-backfill review to `$database-change-safety`, and wire-contract evolution to `$api-contract-safety`.

## Example prompts

- “Use $migration-time-machine for this enum-to-table migration.”
- “Check mixed-version safety for this event schema change.”
- “Design a rollback that still works after new-format writes begin.”
