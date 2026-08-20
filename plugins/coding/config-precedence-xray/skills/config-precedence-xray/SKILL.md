---
name: config-precedence-xray
description: Reconstruct the effective value and provenance of configuration across defaults, files, includes, environment variables, secrets, flags, remote control planes, build-time substitution, and runtime mutation. Use for environment-only bugs, deployment mismatches, feature-flag confusion, credential routing, and “works locally” incidents.
---

# Config Precedence X-Ray

Explain what configuration is effective, where it came from, and when it was bound.

## Define the observation point

Specify:

- process, service, job, client, or build artifact;
- environment and deployment instance;
- startup or request time;
- configuration key or behavior under investigation;
- whether the goal is diagnosis only or an authorized change.

Do not mix values from different instances or times.

## Inventory configuration layers

Check applicable layers:

1. compiled defaults;
2. package or framework defaults;
3. repository config and includes;
4. user or machine config;
5. environment variables and secret references;
6. command-line flags;
7. container/orchestrator injection;
8. remote flags or control planes;
9. build-time replacement;
10. runtime mutation, cache, or persisted override.

Record whether each layer is readable, writable, and authoritative.

## Trace binding time

Classify each value:

- `build-bound`;
- `startup-bound`;
- `request-bound`;
- `refresh-bound`;
- `persisted until changed`.

A correct source value can coexist with a stale effective value when binding time differs.

## Build the provenance chain

For each key:

| Layer | Candidate value | Applied? | Precedence evidence | Binding time | Redacted source |
|---|---|---|---|---|---|

Never expose secret values. Compare presence, version, hash, identifier, or destination instead.

Inspect parsing and coercion. Strings such as `"false"`, empty values, duplicate keys, case differences, and malformed numbers often change precedence behavior.

## Reproduce minimally

Construct the smallest safe experiment that changes one layer at a time. Capture:

- effective value before;
- single modified input;
- restart/rebuild/refresh performed;
- effective value after;
- cleanup.

Do not mutate production merely to prove precedence without explicit authorization.

## Deliver

Return:

- effective value or behavior;
- winning layer and binding time;
- shadowed candidates;
- stale or duplicated sources;
- minimal fix location;
- verification and rollback.

If the effective value cannot be observed, state the strongest bounded inference and missing access.

## Execution boundary

Treat this as read-only diagnosis unless the user authorizes a change. Do not edit configuration, rotate secrets, restart services, rebuild artifacts, or deploy merely to prove precedence; redact values and prefer identifiers, presence checks, or hashes.

## Example prompts

- “Use $config-precedence-xray to explain why this flag differs in production.”
- “Trace which DATABASE_URL source actually wins.”
- “Find whether this value was baked at build time or read at runtime.”
