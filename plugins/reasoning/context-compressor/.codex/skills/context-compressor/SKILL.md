---
name: context-compressor
description: Use when Codex should find or generate PROJECT_MEMORY.md before major edits, update compact repo memory, or produce task briefings.
---

# Context Compressor

Use this skill when working in a repository that has or should have a compact `PROJECT_MEMORY.md` file for AI coding agents.

## When To Use

- Before major edits in an unfamiliar codebase.
- When a repo is large enough that architecture context may be lost.
- After major architecture, auth, database, API, deployment, or package changes.
- During handoff between Codex sessions or other AI coding agents.

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

- Keep memory short enough for AI context.
- Clearly separate detected facts, reasonable assumptions, and unknowns.
- Do not hallucinate project purpose, auth, database, or deployment details.
- Use `context-compress check` to catch stale or overly long memory.
- If no project memory can be found, proceed with normal repository discovery and mention that memory was unavailable.
