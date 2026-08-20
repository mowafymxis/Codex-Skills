---
name: invariant-miner
description: Infer candidate system invariants from code, schemas, tests, historical fixes, UI constraints, and operational behavior, rank their evidence, and turn them into executable checks. Use for unfamiliar systems, refactors, property-based testing, data integrity, debugging recurring corruption, and documenting rules that are enforced only indirectly.
---

# Invariant Miner

Extract rules that must remain true across operations and time. Keep candidate invariants falsifiable.

## Collect evidence sources

Inspect:

- database constraints and migrations;
- validators and type refinements;
- guards and assertions;
- tests and fixtures;
- reducers and transaction boundaries;
- error messages and UI restrictions;
- reconciliation jobs;
- incident fixes and historical comments;
- domain documentation.

Record independent evidence. Many copies of one assumption are still one source.

## Form candidate invariants

Use precise forms:

- state: `balance >= 0`;
- relational: `invoice.total = sum(line.amount)`;
- uniqueness: `one active membership per user/workspace`;
- temporal: `paid cannot return to pending without refund`;
- conservation: `inputs = outputs + retained remainder`;
- authorization: `only owners may transfer ownership`;
- idempotency: `replaying event_id does not duplicate effects`.

Avoid vague rules such as “data should be consistent.”

## Grade evidence

Classify:

- `enforced`: a current authoritative mechanism prevents violation;
- `tested`: executable tests cover representative cases;
- `relied-on`: downstream behavior assumes it;
- `documented`: stated but not enforced;
- `historical`: implied by fixes or migrations;
- `speculative`: plausible domain rule with weak evidence.

Conflicts may indicate versioned rules, missing state dimensions, or a false candidate.

## Seek counterexamples

Search current data samples, fixtures, exception paths, admin tools, imports, and migrations. Try boundary values, partial transactions, retries, and mixed states.

One valid counterexample refutes a universal invariant. Refine the scope rather than explaining it away.

## Encode the invariant

Choose the lowest reliable enforcement layer:

- schema constraint;
- transaction guard;
- type or validator;
- property-based test;
- reconciliation query;
- runtime assertion with safe failure behavior;
- monitoring check for externally controlled state.

Do not duplicate conflicting enforcement across layers without defining precedence.

## Deliver

Return:

| Candidate invariant | Scope | Evidence | Counterexample search | Confidence | Enforcement |
|---|---|---|---|---|---|

Separate validated invariants from open hypotheses. Include the smallest test or query that would falsify each high-value candidate.

## Execution boundary

Mined rules are candidates until corroborated by code paths, tests, data, or owners. Analysis is read-only; adding assertions, constraints, migrations, or enforcement requires explicit implementation authority.

## Example prompts

- “Use $invariant-miner to uncover the hidden rules in this billing code.”
- “Turn these migrations and tests into property checks.”
- “Find which assumed invariants current data can violate.”
