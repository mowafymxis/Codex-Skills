# Context Compressor

Context Compressor is a lightweight TypeScript CLI that scans a repository and generates a compact `PROJECT_MEMORY.md` for Codex and other AI coding agents.

The problem it solves: agents often spend context budget rediscovering project structure, and they can overstate architecture from weak clues. Context Compressor writes a short memory file that separates detected facts, reasonable assumptions, and unknowns.

It is not a perfect repository understanding system. It uses static analysis, package metadata, known file conventions, and conservative heuristics. Treat its output as a starting map, not as proof of runtime behavior.

## What It Does

- Detects languages, frameworks, database tooling, auth-related clues, deployment files, tests, routes, env vars, important files, and recent git context.
- Adds confidence, evidence, and a short explanation to detected routes/env vars/tools.
- Preserves human notes between manual-note markers.
- Replaces generated content between auto-generated markers.
- Supports Next.js App Router, Next.js Pages Router, Vite/React, Express, Supabase, Prisma, and Drizzle-specific summaries.
- Detects simple npm/pnpm/yarn/turbo monorepo structure and can write package-level memories with `--package-memories`.

## What It Does Not Do

- It does not execute application code.
- It does not verify auth, billing, database, or deployment behavior at runtime.
- It does not output secret values from env files.
- It does not replace tests, code review, or human architecture notes.
- It may miss dynamic routes, generated files, framework plugins, or nonstandard layouts.

## Installation

```bash
npm install
npm run build
```

During local development:

```bash
node dist/cli.js scan --path examples/nextjs-supabase-app
```

When installed as a package, the binary is:

```bash
context-compress scan
```

## Commands

```bash
context-compress init [--path ./repo]
context-compress scan [--path ./repo] [--mode tiny|standard|detailed] [--json] [--package-memories]
context-compress update [--path ./repo] [--mode tiny|standard|detailed]
context-compress diff [--path ./repo]
context-compress check [--path ./repo] [--max-lines 250] [--strict]
context-compress brief --task "fix login bug" [--path ./repo]
context-compress explain
```

- `init`: create `PROJECT_MEMORY.md` if missing.
- `scan`: scan and write `PROJECT_MEMORY.md`.
- `scan --json`: print the raw scan result without writing memory.
- `scan --package-memories`: also write package-level memories for detected workspace packages.
- `update`: refresh generated content while preserving manual notes.
- `diff`: compare current scan output with existing memory.
- `check`: validate size, required sections, stale file references, and heuristic completeness score.
- `check --strict`: also warn when important files changed after memory was written.
- `brief --task "..."`: emit a task-specific briefing for an agent.
- `explain`: describe how generation and confidence levels work.

The displayed completeness score measures how much useful context the scanner found for the memory file. It is not a correctness score for architecture, auth, database, deployment, or runtime behavior.

Modes:

- `--mode tiny`: target under 100 lines.
- `--mode standard`: target under 250 lines.
- `--mode detailed`: target under 500 lines.

## Example Output

```md
## Detected Facts
- TypeScript detected (confidence: high). Evidence: *.ts/*.tsx files.
- Route `/api/users/:id` detected in `app/api/users/[id]/route.ts`.

## Reasonable Assumptions
- Supabase Auth may be implemented (confidence: medium). Evidence: @supabase/supabase-js. Verify behavior in code before editing.

## Unknowns / Needs Confirmation
- Deployment target unknown. No common deployment config was detected.
```

## Confidence Model

- `high`: package dependency, config file, schema file, workspace manifest, or TypeScript AST evidence.
- `medium`: known file conventions or literal code patterns.
- `low`: keyword/path heuristics that need confirmation.

The memory intentionally says "may be" for auth, payments, or other behavior when the evidence only shows dependencies or file names.

## Memory Markers

Manual notes are preserved between:

```md
<!-- MANUAL NOTES START -->
<!-- MANUAL NOTES END -->
```

Generated content is replaced between:

```md
<!-- AUTO-GENERATED START -->
<!-- AUTO-GENERATED END -->
```

## Codex Usage

1. Run `context-compress scan` at the repo root before major work.
2. Read `PROJECT_MEMORY.md` before editing unfamiliar areas.
3. Use `context-compress brief --task "..."` to create a focused handoff for a specific change.
4. Run `context-compress update` after architecture, route, env, auth, database, deployment, or package changes.
5. Run `context-compress check --strict` before handing off work.

## Limitations

- Static analysis is intentionally shallow and lightweight.
- Express route detection only handles literal paths in common `app.METHOD` and `router.METHOD` calls.
- Framework analyzers are evidence summaries, not runtime validators.
- Package-level monorepo memories are simple independent scans.
- Git information is best-effort and degrades cleanly outside git repos.

## Roadmap

- Broader AST-based route detection for composed Express routers.
- More package manager and workspace edge cases.
- More framework analyzers for Remix, Astro, SvelteKit, NestJS, and Cloudflare Workers.
- Configurable ignore/include rules.
- Optional richer JSON schema for downstream agent tooling.

## Development

```bash
npm install
npm run build
npm run test
npm run lint
```
