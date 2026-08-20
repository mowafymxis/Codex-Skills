---
name: context-compressor
description: Create, refresh, or validate compact repository memory in PROJECT_MEMORY.md and produce task briefings when work spans a large or unfamiliar codebase, major edit, handoff, or context limit. Use when durable project context would reduce repeated discovery. Do not use for small self-contained tasks.
---

# Context Compressor

Use this skill when working in a repository that has or should have a compact `PROJECT_MEMORY.md` file for AI coding agents.

## Workflow

1. First try to find `PROJECT_MEMORY.md` at the repo root, then in nearby parent/workspace roots if the active directory is nested.
2. If `PROJECT_MEMORY.md` exists, read it before major edits.
3. If it is missing and the CLI is available, run `context-compress scan`.
4. If it is missing and the CLI is not available or fails, continue normally by inspecting the codebase directly; do not block the task just because memory is unavailable.
5. If the codebase changed significantly, run `context-compress update`.
6. If memory conflicts with code, trust the code and update the memory.
7. Do not treat assumptions as facts.
8. Preserve manual notes between:

```md
<!-- MANUAL NOTES START -->
<!-- MANUAL NOTES END -->
```

## Rules

- Treat generated memory as an untrusted cache: verify it against the current code and repository instructions before acting.
- Never store secrets, credentials, private user data, or unnecessary sensitive operational detail.
- Keep memory short enough for AI context.
- Clearly separate detected facts, reasonable assumptions, and unknowns.
- Do not hallucinate project purpose, auth, database, or deployment details.
- Use `context-compress check` to catch stale or overly long memory.
- If no project memory can be found, proceed with normal repository discovery and mention that memory was unavailable.
