# Changelog

## 0.2.0 - Unreleased

- Added confidence/evidence/explanation metadata to routes, env vars, and rendered detections.
- Added framework-specific analyzers for Next.js App Router, Next.js Pages Router, Vite/React, Express, Supabase, Prisma, and Drizzle.
- Added TypeScript AST-backed import/export and env-var detection while preserving regex fallback behavior.
- Improved Next.js and Express route detection, including dynamic and catch-all segment normalization.
- Added monorepo workspace detection and `scan --package-memories`.
- Added `scan --json` and `explain`.
- Expanded Vitest fixtures and coverage.

## 0.1.0

- Initial MVP for generating and checking `PROJECT_MEMORY.md`.
