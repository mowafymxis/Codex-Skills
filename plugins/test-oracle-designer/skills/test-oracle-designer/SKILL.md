---
name: test-oracle-designer
description: Design reliable ways to decide whether software is correct when exact expected outputs are unknown, expensive, nondeterministic, or produced by legacy or AI systems. Use for parsers, optimizers, simulations, migrations, search, numerical code, data pipelines, generative systems, and refactors lacking trustworthy golden outputs.
---

# Test Oracle Designer

Choose an oracle that can reveal the target failure without pretending the expected answer is fully known.

## Define the correctness surface

State:

- input domain;
- observable outputs and side effects;
- nondeterministic dimensions;
- tolerances;
- forbidden outcomes;
- historical compatibility requirements;
- consequence of false pass and false fail.

Split correctness into properties when one expected output is unavailable.

## Select oracle families

Use one or more:

- **exact oracle:** trusted expected output for bounded examples;
- **reference oracle:** independent implementation or external standard;
- **differential oracle:** compare old/new or multiple implementations;
- **metamorphic oracle:** transform input and assert a predictable output relation;
- **invariant oracle:** assert properties that must always hold;
- **round-trip oracle:** encode/decode or write/read preserves meaning;
- **conservation oracle:** totals, identities, or resources remain balanced;
- **statistical oracle:** distribution-level expectation with predeclared tolerance;
- **human adjudication:** structured review for irreducibly subjective output.

Do not use the implementation under test to generate and judge the same expectation.

## Design metamorphic relations

Examples:

- permutation should not change a set-valued result;
- duplicating an idempotent input should not change final state;
- scaling units should scale output predictably;
- adding irrelevant data should preserve relevant output;
- round-tripping should preserve semantic projection;
- tightening a filter should not increase the result set.

Verify that each relation is a real domain property, not a convenient guess.

## Handle nondeterminism

Control seeds and clocks where legitimate. Otherwise:

- assert bounded properties;
- compare distributions across enough samples;
- predefine failure thresholds;
- separate flaky environment from product nondeterminism;
- retain failing seeds or inputs for replay.

Avoid “run it several times and eyeball it.”

## Triangulate high-risk behavior

For consequential paths, combine independent oracle families. A differential oracle can preserve an old bug; an invariant can miss a wrong but valid-looking result.

## Deliver

Return:

| Correctness claim | Oracle family | Independent evidence | False-pass risk | Test design |
|---|---|---|---|---|

Include a minimal counterexample strategy and explain which correctness dimensions remain subjective or unproven.

## Example prompts

- “Use $test-oracle-designer for this optimizer with no known best answer.”
- “Test an AI summarizer without brittle golden text.”
- “Create metamorphic tests for this migration transformer.”
