---
name: change-proof-bundle
description: Package a completed change with a compact, independently checkable chain from request to diff, tests, operational evidence, rollback, and residual risk. Use before handoff, release, pull-request review, regulated or high-consequence changes, and any situation where “it works” needs reproducible proof.
---

# Change Proof Bundle

Assemble evidence that lets a fresh reviewer verify the change without trusting the author's narrative.

## Define proof claims

Start with a small set:

- requested outcome is implemented;
- protected behavior or surfaces remain unchanged;
- relevant failure paths are handled;
- migration or rollout is safe;
- rollback or recovery is credible;
- residual risk is explicit.

Remove claims that are not required for acceptance.

## Link claims to artifacts

For each claim:

| Claim | Evidence artifact | Reproduction step | Pass condition | Limitation |
|---|---|---|---|---|

Prefer raw evidence:

- exact diff or changed-path list;
- test command and result;
- fixture or minimal reproduction;
- schema or contract comparison;
- migration dry run and reconciliation query;
- deployment or runtime signal;
- rollback rehearsal;
- scope or authorization ledger.

Summaries can index evidence but cannot replace it.

## Check evidence independence

Reject circular proof:

- implementation code generating its own expected output;
- a mock that reproduces the same bug as the adapter;
- a status message presented as proof of durable state;
- a reviewer summary citing another summary;
- tests that never cross the changed boundary.

Use at least one independently derived oracle for high-consequence claims.

## Build the bundle

Use:

```md
Outcome
Scope and protected surfaces
Changed artifacts
Proof matrix
Rollback or recovery
Residual risks
Reproduction order
```

Keep logs and large artifacts outside the narrative and reference their stable location. Redact secrets and personal data.

## Run the cold verification

Follow only the bundle:

1. identify the exact version under review;
2. reproduce the highest-value claim;
3. reproduce the highest-risk failure claim;
4. confirm protected paths or behaviors;
5. identify the rollback boundary;
6. verify that limitations are visible.

If a step depends on hidden local state, add the missing prerequisite or downgrade the claim.

## Deliver

Return the bundle and a verdict:

- `proof sufficient for stated scope`;
- `proof sufficient with residual risks`;
- `proof incomplete`;
- `claim refuted`.

Never claim universal correctness. State the exact scope and environment the evidence covers.

## Example prompts

- “Use $change-proof-bundle for this completed migration.”
- “Package this patch so another reviewer can independently verify it.”
- “Find circular evidence in our release proof.”
