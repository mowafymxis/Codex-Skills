---
name: test-engineering
description: "Design, implement, and run meaningful tests for software changes using the appropriate unit, integration, contract, end-to-end, property, or manual verification level. Use when adding behavior, fixing a bug, reviewing test coverage, or validating a change."
---

# Test Engineering

Test observable behavior and risk, not implementation details merely for coverage.

## Derive the test strategy

- Read the request, acceptance criteria, diff, and existing tests.
- Identify the behavior oracle: expected result, invariant, contract, state transition, or recovery condition.
- Select the cheapest test level that proves the behavior; use higher-level tests where integration is the risk.
- Cover normal, boundary, invalid, permission, empty, error, retry, timeout, persistence, and concurrency cases when applicable.
- Avoid brittle assertions, excessive mocking, and tests that pass without exercising the changed path.
- Control clocks, randomness, locale, network, shared state, and cleanup where they affect repeatability; retain failing seeds and inputs for replay.

## Execute and diagnose

1. Establish whether the relevant baseline already passes when practical.
2. Run focused tests first.
3. Add or update tests that fail for the old behavior and pass for the intended behavior.
4. Broaden verification according to change risk and repository conventions.
5. Classify failures as implementation defects, test defects, environment failures, flaky behavior, or pre-existing failures.

Never claim a test passed unless it was executed successfully. Report command, scope, result, and any unverified area. Do not chase a numeric coverage target when it does not prove the behavior.

## Operating discipline

- Read repository instructions, acceptance criteria, and existing tests first. Inspect the smallest production boundary needed to prove the test exercises real behavior.
- Test design and audit are read-only. Add tests or alter fixtures only when implementation is authorized; preserve unrelated snapshots and generated files.
- Prefer deterministic focused checks, then broaden by risk. Report exact commands, results, failure classification, environment limits, and untested behavior.


## Output

Return the behavior matrix, tests added or selected, exact checks run, results, failure classification, and remaining coverage risk.

## Example prompts

- “Use $test-engineering to test this auth change.”
- “Find the smallest reliable regression test for this bug.”
