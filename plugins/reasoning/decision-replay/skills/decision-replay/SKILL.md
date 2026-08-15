---
name: decision-replay
description: Capture a technical or product decision so another person can reproduce why it was chosen from the original evidence, constraints, alternatives, and invalidation triggers. Use for architecture choices, vendor selection, build-vs-buy, incident follow-ups, prioritization, contentious reviews, and decisions likely to be revisited.
---

# Decision Replay

Produce a replayable decision, not a ceremonial record written after the outcome is known.

## Freeze the decision frame

Record:

- decision question;
- decision owner and date;
- deadline or forcing function;
- in-scope and out-of-scope outcomes;
- constraints that cannot be traded;
- preferences that can be traded;
- unknowns at decision time.

Use evidence available at that time. Mark later knowledge separately.

## Define discriminating criteria

Choose criteria that can change the selection. For each criterion, state:

- measurement or evidence source;
- acceptable threshold;
- relative importance;
- uncertainty;
- whether failure is reversible.

Remove criteria all alternatives satisfy equally.

## Evaluate alternatives symmetrically

For each viable alternative, capture:

| Alternative | Supporting evidence | Failure mode | Switching cost | Unknowns |
|---|---|---|---|---|

Include the status quo and a staged or reversible option when real. Do not create fake alternatives to make the chosen option look stronger.

## Write the decision logic

Express the choice as conditional reasoning:

```text
Choose A because constraints X and Y rule out B,
and evidence Z makes A preferable to C.
Accept risks R1 and R2 because mitigations M1 and M2 exist.
```

Separate evidence from preference. Preserve dissent or unresolved disagreement without forcing consensus.

## Add counterfactuals

Record:

- what evidence would have selected another option;
- what future signals should reopen the decision;
- what part can be reversed cheaply;
- the review date or trigger, if relevant.

This prevents an old decision from turning into an unexplained permanent rule.

## Replay check

Ask whether a reader could:

1. reconstruct the candidate set;
2. apply the same constraints;
3. see why the winner changed if one input changed;
4. identify hindsight information;
5. know when to revisit.

If not, gather the missing decision-critical evidence.

## Deliver

Return a concise decision record plus a “replay inputs” table and invalidation triggers. Do not hide weak evidence behind a weighted score.

## Example prompts

- “Use $decision-replay for our database choice.”
- “Turn this chat into a decision another engineer can reproduce.”
- “Show what would need to change for the rejected option to win.”
