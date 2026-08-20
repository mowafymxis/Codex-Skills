---
name: evidence-debt-ledger
description: Track claims that implementation decisions depend on, score how weak or stale their evidence is, and convert the riskiest uncertainty into targeted verification work. Use for audits, architecture reviews, debugging, planning, research synthesis, inherited systems, and any task where assumptions may silently become facts.
---

# Evidence Debt Ledger

Treat unsupported confidence as debt: it accumulates risk until the claim is verified, bounded, or removed from the decision.

## Create the ledger

Record only decision-relevant claims:

| ID | Claim | Type | Evidence | Freshness | Consequence if wrong | Status |
|---|---|---|---|---|---|---|

Use these claim types:

- `observed`: directly supported by current artifacts or tool output;
- `inferred`: best explanation of observed evidence;
- `reported`: supplied by a person or document;
- `assumed`: temporarily accepted without adequate evidence;
- `unknown`: required information with no defensible claim.

Quote paths, commands, source names, dates, or result identifiers. “The code suggests” is not evidence.

## Score debt

Assign each claim:

- evidence strength: `0` none, `1` indirect, `2` direct but partial, `3` direct and corroborated;
- freshness: `0` unknown/stale, `1` possibly stale, `2` current enough;
- consequence: `1` minor, `2` material, `3` severe;
- decision reach: `1` local, `2` several decisions, `3` foundational.

Calculate:

```text
debt = (3 - evidence strength) + (2 - freshness) + consequence + decision reach
```

Use the score only to order verification. Do not present it as statistical confidence.

## Retire debt efficiently

For the highest-debt claims:

1. State the smallest question that would change the decision.
2. Choose the cheapest authoritative check.
3. Predict what evidence would confirm, weaken, or falsify the claim.
4. Run the check within the user's authorization.
5. Update the claim rather than appending contradictory prose.

Prefer checks that retire multiple high-reach claims. Stop gathering evidence when additional certainty would not change the action.

## Prevent evidence laundering

Do not:

- convert repetition across documents into independent corroboration;
- cite generated summaries as primary evidence;
- treat absence from one search as proof of absence;
- upgrade a reported claim because it sounds plausible;
- hide conflicts by averaging them;
- use a debt score to compensate for missing evidence.

Preserve contradictory evidence and record the boundary of each source.

## Deliver the result

Return:

1. the decision that can be made now;
2. the remaining high-debt claims;
3. the verification already performed;
4. the next check only if it could change the decision.

If no claim needs verification, say why the existing evidence is sufficient.

## Execution boundary

Ledger construction is analysis. Verify claims only within the parent task's access and mutation boundaries, and never probe live production merely to reduce an evidence score.

## Example prompts

- “Use $evidence-debt-ledger to separate facts from assumptions in this audit.”
- “Which architecture assumptions are most dangerous to leave unverified?”
- “Turn these conflicting reports into a prioritized verification ledger.”
