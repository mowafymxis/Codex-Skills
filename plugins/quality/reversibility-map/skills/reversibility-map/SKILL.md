---
name: reversibility-map
description: Map a proposed change by how completely, quickly, and safely it can be undone, including hidden one-way effects in data, identity, billing, external messages, and caches. Use before deployments, migrations, destructive actions, dependency upgrades, feature rollouts, account changes, and production mutations.
---

# Reversibility Map

Analyze rollback as a property of the whole system, not just whether a code commit can be reverted.

## Define the change unit

State:

- the exact mutation;
- where it executes;
- who or what observes it;
- the time window before effects escape;
- the success and rollback owners.

Split a rollout into independently reversible units when possible.

## Trace effect classes

Inspect each class:

| Effect class | Examples | Reversal question |
|---|---|---|
| Code/config | deploy, flag, secret reference | Can the previous artifact still run? |
| Data shape | schema, encoding, backfill | Can old and new readers coexist? |
| Data meaning | status changes, deduplication | Was information discarded or reinterpreted? |
| External state | provider config, DNS, permissions | Is prior state known and restorable? |
| Human-visible | email, notification, invoice | Can the effect only be corrected, not undone? |
| Identity/access | role, token, ownership | Does reversal restore access safely? |
| Cache/index | CDN, search, derived views | How are stale effects detected and purged? |

Add domain-specific effects rather than forcing them into the table.

## Rate reversibility

Classify every effect:

- `R0 automatic`: rollback is tested and automated;
- `R1 procedural`: documented, bounded manual rollback;
- `R2 compensating`: original effect persists but a corrective action exists;
- `R3 reconstructive`: recovery requires rebuilding from logs, backups, or history;
- `R4 irreversible`: lost information or escaped effect cannot be restored.

Record rollback time, data-loss window, prerequisites, and verification signal. A backup without a tested restore path is `R3`, not `R1`.

## Design the safer path

Prefer, where applicable:

- expand-migrate-contract instead of in-place replacement;
- dual read or dual write with reconciliation;
- shadow traffic or dry-run output;
- idempotency keys and replayable queues;
- tombstones instead of immediate deletion;
- versioned configuration;
- staged rollout with an explicit abort signal;
- snapshots that preserve semantic meaning, not only bytes.

Do not recommend complexity whose failure modes exceed the original risk.

## Produce the map

Return:

| Unit | Escaped effects | Rating | Rollback action | Abort signal | Proof of recovery |
|---|---|---|---|---|---|

Highlight the least reversible dependency and the last safe rollback point. If any `R4` effect is required, make it explicit before mutation and require clear authorization.

## Execution boundary

Mapping is read-only. Any R4 or otherwise irreversible step needs explicit authorization, a named owner, and a recovery or containment decision; a documented rollback command is not proof that rollback works.

## Example prompts

- “Use $reversibility-map before applying this database migration.”
- “Find the hidden irreversible effects in this account cleanup.”
- “Design a rollout whose rollback works across mixed app versions.”
