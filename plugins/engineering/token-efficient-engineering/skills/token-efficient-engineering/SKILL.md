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
- Run focused checks first and escalate to broader checks when risk, failure, or repository policy requires it.

## Preserve the quality floor

- Keep all checks that can change the decision: authorization, data integrity, compatibility, migration safety, failure recovery, and regression tests.
- If a costly check is deferred, state why, what narrower evidence was gathered, and what remains unverified.
- Prefer a smaller, reversible patch over a broad patch that requires more context.
- Stop exploring once the evidence supports the requested decision and the remaining unknowns cannot change it.

## Output

Report the compact evidence ledger, checks run, checks intentionally deferred, token-saving choices, and any quality risk introduced by the deferral. A shorter answer is not a successful optimization if it is less auditable.

## Evidence and efficiency

- Read repository-local instructions before making decisions.
- Start with file names, symbols, and the smallest relevant slices; expand only when evidence requires it.
- Reuse facts already established in the task. Do not rediscover the same files or rerun an unchanged check.
- Prefer deterministic commands, linters, type checkers, and tests over lengthy speculative reasoning.
- Keep intermediate notes compact: preserve paths, commands, results, assumptions, and unresolved risks.
- Never trade away a decisive correctness, safety, or compatibility check merely to save tokens.


## Example prompts

- “Use $token-efficient-engineering while working in this large repository.”
- “Reduce unnecessary context and tool calls, but keep the verification bar unchanged.”
