---
name: handoff-entropy-check
description: Test whether a work handoff contains enough verified state for a fresh agent or engineer to continue without rediscovery, guesswork, or unsafe repetition. Use before pausing complex work, transferring ownership, summarizing long sessions, handing off incidents, or preparing context for another coding agent.
---

# Handoff Entropy Check

Reduce uncertainty at the receiving side of a handoff. Do not maximize summary length.

## Identify continuation decisions

List the first decisions a receiver must make:

- where to work;
- what outcome remains;
- what is already complete;
- what must not change;
- what evidence has been verified;
- what failed and why;
- what authority or access is missing;
- what the next safe action is.

If a detail cannot affect continuation, omit it.

## Build the state capsule

Use:

```md
Outcome:
Current state:
Completed:
Remaining:
Protected surfaces:
Verified evidence:
Failed attempts:
Open decisions:
Next safe action:
Verification commands:
```

Include exact paths, refs, identifiers, and commands when they are needed. Redact secrets and avoid copying large logs; point to durable artifacts instead.

## Score entropy

For each continuation decision, mark:

- `known and evidenced`;
- `stated but unverified`;
- `ambiguous`;
- `missing`;
- `stale`.

High entropy exists when a receiver must rediscover a fact that was already learned, guess whether an action ran, or repeat a potentially destructive step.

## Run a cold-start test

Simulate a receiver with only:

- the handoff;
- the referenced repository or artifacts;
- normal project instructions.

Check whether they can determine:

1. the exact working boundary;
2. the next command or inspection;
3. how to know it succeeded;
4. which action must not be repeated;
5. when to stop and ask.

Do not include hidden conversational context in the test.

## Preserve evidence lineage

Distinguish:

- observed tool output;
- user-provided facts;
- inferences;
- unresolved assumptions.

Link or name raw artifacts. Never turn “I think” into a completed-state claim.

## Deliver

Return the revised state capsule followed by:

| Continuation decision | Entropy before | Evidence added | Residual uncertainty |
|---|---|---|---|

Keep the final handoff compact enough to be read before action. If the task is fully complete, say so and provide verification rather than inventing a next step.

## Example prompts

- “Use $handoff-entropy-check on this session summary.”
- “Prepare a cold-start-safe handoff for another Codex agent.”
- “Find what a new engineer would still have to rediscover.”
