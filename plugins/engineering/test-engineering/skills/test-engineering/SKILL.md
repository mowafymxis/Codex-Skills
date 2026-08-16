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

## Execute and diagnose

1. Establish whether the relevant baseline already passes when practical.
2. Run focused tests first.
3. Add or update tests that fail for the old behavior and pass for the intended behavior.
4. Broaden verification according to change risk and repository conventions.
5. Classify failures as implementation defects, test defects, environment failures, flaky behavior, or pre-existing failures.

Never claim a test passed unless it was executed successfully. Report command, scope, result, and any unverified area. Do not chase a numeric coverage target when it does not prove the behavior.

## Evidence and efficiency

- Read repository-local instructions before making decisions.
- Start with file names, symbols, and the smallest relevant slices; expand only when evidence requires it.
- Reuse facts already established in the task. Do not rediscover the same files or rerun an unchanged check.
- Prefer deterministic commands, linters, type checkers, and tests over lengthy speculative reasoning.
- Keep intermediate notes compact: preserve paths, commands, results, assumptions, and unresolved risks.
- Never trade away a decisive correctness, safety, or compatibility check merely to save tokens.


## Output

Return the behavior matrix, tests added or selected, exact checks run, results, failure classification, and remaining coverage risk.

## Example prompts

- “Use $test-engineering to test this auth change.”
- “Find the smallest reliable regression test for this bug.”
