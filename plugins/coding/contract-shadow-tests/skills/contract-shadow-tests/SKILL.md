---
name: contract-shadow-tests
description: Discover implicit behavior contracts from callers, tests, schemas, examples, logs, and production adapters, then create characterization tests that preserve only relied-upon behavior before a risky refactor. Use for legacy code, undocumented APIs, dependency replacement, parser rewrites, compatibility work, and behavior-preserving refactors.
---

# Contract Shadow Tests

Create a temporary executable shadow of the contract consumers actually rely on. Avoid freezing accidental implementation details.

## Discover candidate contracts

Inspect:

- direct call sites and adapters;
- existing tests and fixtures;
- types, schemas, validators, and examples;
- retry, timeout, and error handling;
- persisted or serialized output;
- CLI/API documentation;
- logs or traces supplied by the user.

Record each candidate as:

```text
Given <observable input/state>
the consumer relies on <observable behavior>
because <evidence>.
```

Separate required behavior from merely observed behavior.

## Rank candidates

Use:

- `hard`: enforced by schema, public documentation, or multiple independent consumers;
- `relied-on`: a current consumer branches on or persists it;
- `incidental`: observed but no dependency found;
- `unknown`: evidence conflicts or coverage is incomplete.

Test `hard` and high-impact `relied-on` contracts. Do not lock in `incidental` behavior without a reason.

## Design shadow tests

Prefer tests at the narrowest observable boundary that survives the refactor:

- input/output examples for pure transformations;
- adapter tests for external protocols;
- serialization snapshots with explicit field assertions;
- error class and recovery behavior;
- ordering, idempotency, and retry properties;
- compatibility fixtures from real historical artifacts after redaction.

Normalize nondeterministic values. Avoid snapshots that hide which semantics matter.

Where the old implementation can run safely, use differential tests:

1. feed the same bounded corpus to old and new implementations;
2. compare only contract-relevant projections;
3. triage differences as intended, bug fix, or regression;
4. turn accepted intended differences into explicit new tests.

## Prevent fossilization

Attach a reason to every new characterization test. Mark temporary harnesses. Delete or revise tests that exist only to preserve a confirmed bug, unless compatibility requires that bug.

Do not infer a public contract solely from one current implementation.

## Deliver

Return:

| Contract | Evidence | Strength | Test boundary | Expected assertion |
|---|---|---|---|---|

State which behaviors remain unknown and what evidence would resolve them. After implementation, show that both contract tests and intended-change tests pass.

## Execution boundary

Discovery and test design are read-only. Add or modify a harness only when implementation is authorized, keep observed behavior separate from intended behavior, and label pre-existing failures rather than folding them into the new change.

## Example prompts

- “Use $contract-shadow-tests before replacing this parser.”
- “Characterize the legacy billing adapter without freezing its internals.”
- “Infer the compatibility contract from these call sites and fixtures.”
