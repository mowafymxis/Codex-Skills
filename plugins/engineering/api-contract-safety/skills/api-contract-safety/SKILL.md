---
name: api-contract-safety
description: "Review API and service contract changes for schema compatibility, authentication, validation, errors, idempotency, pagination, retries, timeouts, documentation, and consumer impact. Use for REST, GraphQL, RPC, events, webhooks, SDKs, or public/internal service interfaces."
---

# API Contract Safety

Treat an API as a contract across versions, clients, data, and operations—not merely a function signature.

## Map the contract

- Identify producers, consumers, clients, generated SDKs, event handlers, webhooks, tests, and documentation.
- Record request and response fields, types, defaults, nullability, ordering, status or error codes, pagination, limits, authentication, authorization, and rate behavior.
- Check content negotiation, cache validators, date/time and numeric encoding, enum expansion, unknown fields, and locale-sensitive behavior when clients can observe them.
- Check whether clients can observe timing, retries, duplicate delivery, partial failure, or ordering.
- Classify the change as backward-compatible, breaking, migration-required, or unknown, with evidence.

## Review safety

- Preserve unknown fields and tolerant readers where the existing contract requires it.
- Do not silently change meaning behind an unchanged field name.
- Make validation and error behavior explicit and stable.
- Require idempotency or deduplication for retryable writes when appropriate.
- Check authorization at the resource boundary, not only at the route or UI.
- Plan versioning, deprecation, dual-read/write, or coordinated rollout for breaking changes.
- Add contract tests or consumer verification for the farthest affected client.

## Output

Return the contract map, compatibility classification, affected consumers, required migration or rollout, tests, documentation updates, and unresolved unknowns. Do not invent consumers or external guarantees.

## Operating discipline

- Read repository instructions and status first. Inspect the smallest relevant surfaces, then expand only when evidence could change the compatibility decision.
- Default to review or plan mode. Change contracts, generated clients, documentation, or external systems only when the user authorized implementation; preserve unrelated changes and secrets.
- Prefer deterministic schema diffs and contract tests. Report exact checks, results, assumptions, and unverified consumers without repeating unchanged evidence.


## Example prompts

- “Use $api-contract-safety before renaming this response field.”
- “Check whether this endpoint change is safe for existing clients.”
