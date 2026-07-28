---
name: absence-proof-auditor
description: Evaluate negative claims such as “unused,” “never called,” “no secrets,” “no route,” or “nothing else changed” with bounded, multi-surface evidence and explicit coverage limits. Use for deletion decisions, security audits, dead-code analysis, migration cleanup, repository reviews, and any conclusion that depends on proving something is absent.
---

# Absence Proof Auditor

Replace absolute negative claims with a documented search boundary and evidence coverage.

## Define the negative claim

Rewrite the claim into:

```text
Within <scope>, under <representation and runtime assumptions>,
no evidence of <target> was found using <search surfaces>.
```

Identify what would falsify it. If the target is vague, enumerate names, aliases, encodings, indirections, and generated forms.

## Build the coverage matrix

Inspect relevant surfaces:

| Surface | Examples | Typical blind spot |
|---|---|---|
| Static text | symbols, strings, configs | dynamic construction |
| Dependency graph | imports, manifests, lockfiles | reflection or plugins |
| Runtime entrypoints | routes, jobs, hooks, commands | environment-only paths |
| Data/schema | columns, migrations, seeds | external databases |
| Build/deploy | generated files, bundles, IaC | remote control planes |
| History | deleted references, renames | squashed or unavailable history |
| External integration | webhooks, dashboards, clients | inaccessible systems |

Use only surfaces relevant to the claim, but state omissions.

## Search independently

Use at least two independent strategies for consequential claims:

- exact and case-insensitive names;
- structural search or language-aware references;
- semantic aliases and value patterns;
- entrypoint-to-target reachability;
- generated artifact inspection;
- history or migration inspection;
- runtime evidence supplied by the user.

Do not treat repeated forms of the same index as independent evidence.

## Grade the conclusion

- `not found`: searched surfaces contain no match;
- `unlikely within scope`: independent coverage found no reachable use;
- `safe to remove under stated assumptions`: deletion is reversible and verification covers known entrypoints;
- `unprovable with current access`: important surfaces are missing;
- `refuted`: evidence of the target exists.

Reserve absolute “none” or “never” for mathematically closed or exhaustively enumerated scopes.

## Plan removal safely

When absence supports deletion:

1. identify rollback;
2. add a build, test, or runtime tripwire;
3. remove the smallest unit;
4. verify all known entrypoints;
5. observe for delayed or asynchronous use when applicable.

## Deliver

Return the claim, scope, coverage matrix, search evidence, blind spots, and conclusion grade. Make the boundary visible in the first sentence.

## Example prompts

- “Use $absence-proof-auditor before deleting this supposedly unused endpoint.”
- “Check the claim that no secret values are committed.”
- “Verify the statement that nothing outside this folder changed.”
