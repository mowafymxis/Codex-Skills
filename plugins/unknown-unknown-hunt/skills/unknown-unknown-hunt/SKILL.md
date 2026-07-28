---
name: unknown-unknown-hunt
description: Systematically search for failure classes that ordinary requirements and happy-path reviews are unlikely to name by inverting boundaries, combining layers, and probing novelty zones. Use before high-impact launches, architecture reviews, complex migrations, incident prevention, and plans that appear complete too early.
---

# Unknown Unknown Hunt

Generate testable blind-spot hypotheses. Do not produce an unbounded list of generic risks.

## Map the known model

Record:

- intended actors and workflows;
- trusted boundaries;
- expected ordering and timing;
- supported scale and geography;
- data ownership and lifecycle;
- external dependencies;
- recovery assumptions;
- explicitly excluded cases.

Unknown-unknown hunting starts from what the current model assumes.

## Apply blind-spot lenses

Use each lens once:

1. **Boundary inversion:** What if data, identity, or control crosses the boundary in the opposite direction?
2. **Layer mismatch:** What if two individually correct layers interpret the same value differently?
3. **Time distortion:** What if events are early, late, duplicated, replayed, or arrive after deletion?
4. **Identity fracture:** What if one actor has multiple identifiers or an identifier is reused?
5. **Scale shape:** What if many tiny objects, one huge object, or one hot key replaces average load?
6. **Partial truth:** What if a dependency succeeds but returns stale, truncated, or semantically incomplete data?
7. **Recovery paradox:** What if the recovery action repeats the original failure?
8. **Novelty zone:** Which code, provider, workflow, or assumption has the least operational history?

Tie every hypothesis to an actual system boundary.

## Convert surprises into probes

For each hypothesis, define:

```text
If <condition>, then <unexpected effect> because <mechanism>.
Probe with <bounded experiment or inspection>.
Observe <discriminating signal>.
```

Rank by consequence, plausibility evidence, detectability, and probe cost. Do not use imaginative severity alone.

## Avoid duplicate known risks

Remove hypotheses already covered by requirements, tests, alerts, or runbooks unless the coverage is weak. Mark new combinations of known failures separately; interactions are often the blind spot.

## Stop deliberately

Stop when:

- every major boundary has been tested by at least two lenses;
- additional hypotheses repeat existing mechanisms;
- remaining probes cost more than their decision value;
- missing access is the limiting factor.

## Deliver

Return:

| Blind-spot hypothesis | Lens | System evidence | Probe | Signal | Priority |
|---|---|---|---|---|---|

End with the top three probes, residual blind spots, and what new evidence would justify another pass.

## Example prompts

- “Use $unknown-unknown-hunt before this launch review.”
- “Find blind spots our normal migration checklist would miss.”
- “Probe the least experienced boundaries in this architecture.”
