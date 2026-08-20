---
name: semantic-blast-radius
description: Trace how a behavior change propagates through callers, stored data, contracts, user expectations, operations, and downstream systems instead of stopping at import references. Use for refactors, API changes, schema changes, auth or billing changes, shared libraries, feature flags, and deceptively small edits with cross-layer consequences.
---

# Semantic Blast Radius

Map affected meaning, not only affected files.

## Anchor the changed behavior

Describe the before and after behavior as observable rules. Include:

- accepted inputs;
- produced outputs and side effects;
- ordering and timing;
- failure behavior;
- persistence;
- permission or identity assumptions.

If the behavior is unclear, inspect tests, call sites, schemas, logs, and documentation before mapping impact.

## Traverse the radius

Follow these rings:

1. **Direct execution:** callers, callees, imports, routes, jobs, and handlers.
2. **Contract:** request/response shapes, events, database constraints, types, files, CLI output.
3. **Stored meaning:** existing rows, caches, indexes, analytics, audit logs, and serialized artifacts.
4. **Temporal coupling:** retries, queues, scheduled jobs, mixed versions, stale clients, and race windows.
5. **Human contract:** UI copy, support procedures, documentation, billing expectations, and permissions.
6. **Operational recovery:** alerts, dashboards, runbooks, rollback, replay, and reconciliation.

Search for behavior synonyms and values, not only symbol names. A string, database field, or event topic may carry the contract without importing the changed code.

## Classify consumers

For each consumer, label:

- exposure: `direct`, `derived`, or `latent`;
- compatibility: `safe`, `requires coordination`, `requires migration`, or `unknown`;
- detection: how a failure becomes visible;
- owner: component or team when available.

Do not count speculative consumers as confirmed. Preserve why each consumer is included.

## Find radius amplifiers

Escalate scrutiny for:

- fan-out writes;
- reused identifiers;
- shared caches;
- implicit defaults;
- asynchronous consumers;
- public or versionless interfaces;
- historical data replay;
- security and billing semantics;
- behavior encoded in documentation or support tooling.

## Deliver a change map

Return:

| Ring | Consumer | Evidence | Compatibility | Required action | Verification |
|---|---|---|---|---|---|

End with:

- the smallest safe change boundary;
- coordination or migration requirements;
- unknown consumers that could not be ruled out;
- the test path that covers the farthest confirmed ring.

## Execution boundary

This skill maps impact; it does not authorize code or operational changes. Keep confirmed consumers, inferred consumers, and unknown surfaces distinct, and never convert absence of a reference into proof of safety.

## Example prompts

- “Use $semantic-blast-radius on this tiny status enum change.”
- “Trace the real blast radius of renaming this API field.”
- “Map which user and operational contracts this auth refactor changes.”
