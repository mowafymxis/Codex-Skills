---
name: repository-onboarding
description: "Map an unfamiliar software repository before changes by identifying local instructions, architecture, entry points, dependencies, commands, tests, configuration, deployment, and relevant unknowns. Use when starting work in an unfamiliar or substantially changed codebase, not for implementing the change itself."
---

# Repository Onboarding

Build a compact, evidence-backed map of the repository. This skill is normally read-only; do not edit files unless the user explicitly requests onboarding documentation or a fix.

## Inspect in layers

1. Check Git status and repository-local instructions.
2. List top-level files and likely manifests without dumping the entire tree.
3. Identify language/framework, package manager, build, lint, type-check, test, and format commands from manifests and CI.
4. Locate application entry points, routes, services, data access, shared modules, tests, and deployment configuration.
5. Identify source-of-truth files, generated outputs, dependency direction, package boundaries, and files that repository policy forbids editing.
6. Trace only the paths relevant to the user’s task.

## Record verified facts

Return:

- **Project shape:** applications, packages, services, and generated areas.
- **Execution map:** development, test, build, and deployment commands.
- **Change map:** relevant files, callers, data, configuration, and tests.
- **Conventions:** naming, module boundaries, error handling, validation, and test style.
- **Risk map:** secrets, permissions, migrations, external services, and fragile areas.
- **Unknowns:** facts that could not be established and the cheapest way to verify them.

Do not infer a command from a familiar framework when the repository does not document or expose it. Distinguish observed configuration from a recommendation.

## Operating discipline

- Start with status, local instructions, manifests, and a bounded file inventory. Use symbol search before opening large files.
- Keep onboarding read-only unless the user explicitly asks for documentation changes. Do not install dependencies, run destructive setup, or mutate external services merely to map the repository.
- Reuse verified facts and report exact paths, commands discovered, assumptions, and unavailable systems. Stop when the requested change path is explainable and verifiable.


## Stop condition

Stop mapping when you can explain where the requested behavior enters, how it flows, where it persists or exits, how it is tested, and which command verifies it. Do not read unrelated files for completeness theater.

## Example prompts

- “Use $repository-onboarding before working on this repo.”
- “Map the auth and deployment paths only.”
