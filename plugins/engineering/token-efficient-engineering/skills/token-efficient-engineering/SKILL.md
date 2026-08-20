---
name: token-efficient-engineering
description: "Reduce unnecessary model context, tool output, repeated inspection, and verification cost during software work without weakening correctness, safety, or quality. Use explicitly for large repositories, long tasks, repeated Codex iterations, or when token efficiency is a stated requirement."
---

# Token-Efficient Engineering

Optimize information flow, not quality. Never save tokens by skipping a decisive test, hiding uncertainty, or replacing evidence with confidence.

## Use progressive context

1. Read repository instructions and status first.
2. Inventory files and manifests before opening large files.
3. Search for exact symbols, routes, schemas, commands, and tests before reading broad areas.
4. Read only the relevant slices, then expand based on concrete evidence.
5. Keep a compact task ledger of established facts, assumptions, files, checks, and unknowns.

## Minimize repeated work

- Build one repository map and reuse it across the task.
- Inspect the diff before rediscovering unchanged surrounding code.
- Do not invoke overlapping specialist reviews unless each adds a distinct decision or check.
- Prefer scripts, linters, type checkers, and machine-readable outputs for repetitive inspection.
- Capture concise command results instead of copying full logs; retain the path to the complete artifact when needed.
- Do not reopen unchanged files or repeat searches unless a new hypothesis, diff, or failed check makes the old evidence insufficient.
- Run focused checks first and escalate to broader checks when risk, failure, or repository policy requires it.

## Preserve the quality floor

- Keep all checks that can change the decision: authorization, data integrity, compatibility, migration safety, failure recovery, and regression tests.
- If a costly check is deferred, state why, what narrower evidence was gathered, and what remains unverified.
- Prefer a smaller, reversible patch over a broad patch that requires more context.
- Stop exploring once the evidence supports the requested decision and the remaining unknowns cannot change it.

## Output

Report the compact evidence ledger, checks run, checks intentionally deferred, token-saving choices, and any quality risk introduced by the deferral. A shorter answer is not a successful optimization if it is less auditable.

## Execution boundary

- Match the user's mode: audits and plans remain read-only; implementation stays within an explicit write set and preserves unrelated changes.
- Treat output truncation as a reason to narrow or save an artifact, not to guess what hidden output contained.
- Report only token-saving choices that affected coverage or reproducibility. Do not add meta commentary when the optimization had no user-visible tradeoff.


## Example prompts

- “Use $token-efficient-engineering while working in this large repository.”
- “Reduce unnecessary context and tool calls, but keep the verification bar unchanged.”
