---
name: dependency-capability-audit
description: Audit a software dependency by the capabilities it receives at install, build, and runtime; the data and network boundaries it crosses; its update path; and the application's ability to contain or replace it. Use before adding or upgrading packages, reviewing plugins and SDKs, reducing supply-chain exposure, or evaluating vendor libraries.
---

# Dependency Capability Audit

Evaluate what a dependency can do in this application, not only whether a vulnerability database names it.

## Establish the dependency path

Record:

- direct or transitive origin;
- requested and resolved version;
- package manager and lockfile;
- install/build/runtime phases;
- importing components;
- production reachability;
- maintainer and release provenance when available.

Do not call a dependency unused solely because no direct import exists; inspect scripts, plugins, loaders, and generated code.

## Map granted capabilities

For each phase, inspect:

| Capability | Examples |
|---|---|
| Filesystem | repository, home config, build output, uploads |
| Process | shell execution, child processes, native code |
| Network | install fetches, telemetry, runtime endpoints |
| Secrets | environment variables, credential files, tokens |
| Data | user content, database records, logs |
| Identity | service account, browser session, OAuth scopes |
| Control | hooks, middleware, code generation, dynamic loading |

Record whether the capability is necessary, inherited, sandboxed, or avoidable.

## Inspect lifecycle risk

Check:

- install and postinstall scripts;
- bundled or generated artifacts;
- native binaries and platform downloads;
- remote code or configuration loading;
- automatic update behavior;
- optional features enabled by default;
- network destinations;
- maintainer or ownership changes;
- release-signing or provenance evidence if present.

Use current authoritative sources when making external claims.

## Evaluate containment

Ask:

- Can the dependency run with fewer permissions?
- Can install scripts be disabled or isolated?
- Can network and secrets be restricted?
- Is input/output validated at the adapter boundary?
- Can it be pinned reproducibly?
- Can it be replaced behind one interface?
- Is removal testable?

Distinguish “trusted” from “contained.” Popularity is not containment.

## Deliver

Return:

| Phase | Capability | Necessity evidence | Exposure | Containment | Verification |
|---|---|---|---|---|---|

Add an adoption decision: `accept`, `accept with containment`, `defer pending evidence`, or `reject for this use`. Explain residual risk and replacement cost without claiming universal safety.

## Example prompts

- “Use $dependency-capability-audit before adding this analytics SDK.”
- “What can this package do during install versus runtime?”
- “Audit whether this plugin can be isolated behind an adapter.”
