---
name: intent-drift-guard
description: Keep implementation work aligned with the user's actual authorization by turning a request into goals, non-goals, protected surfaces, and stop conditions, then checking proposed or completed changes for scope drift. Use before or during repository edits, refactors, migrations, automation changes, and any task containing limits such as “only,” “never,” or “do not touch.”
---

# Intent Drift Guard

Build a compact intent contract before making consequential changes. Treat explicit limits as hard constraints, not preferences.

## Establish the intent contract

1. Extract the requested outcome in one sentence.
2. Record explicitly authorized mutations.
3. Record protected surfaces, including named files, repositories, services, data, and behaviors.
4. Record non-goals that are easy to confuse with the goal.
5. Record unresolved choices that would materially change the result.
6. Define stop conditions: missing authority, conflicting instructions, destructive ambiguity, or an unexpected protected-surface dependency.

Use this shape:

```md
Goal:
Authorized:
Protected:
Non-goals:
Open choices:
Stop if:
```

Do not invent a protected surface merely because it seems sensitive. Derive it from the request, repository instructions, or a real dependency discovered during inspection.

## Build the change ledger

For each intended mutation, record:

| Change | Why required | Authorization evidence | Protected surface touched? | Verification |
|---|---|---|---|---|

Split mixed-purpose edits. A change that cannot be tied to the goal is scope drift until proven otherwise.

## Check drift

Run three checks before editing and again before handoff:

- **Object drift:** Did the target file, repo, account, or environment change?
- **Purpose drift:** Did implementation expand from the requested outcome into cleanup, redesign, or “while here” work?
- **Authority drift:** Did a read-only request become a mutation, or a local mutation become an external action?

Classify each discrepancy as:

- `required dependency`: necessary for the stated outcome and within authority;
- `choice needed`: necessary but materially changes the result;
- `scope drift`: useful or convenient but not authorized;
- `protected conflict`: violates an explicit limit.

Pause for `choice needed` or `protected conflict`. Remove `scope drift`.

## Verify the final boundary

Inspect the final diff or action log. Confirm:

- every changed path appears in the change ledger;
- no protected surface changed;
- generated files are attributable to an authorized source change;
- formatting did not rewrite unrelated files;
- external writes match the exact approved target;
- the handoff states any incomplete or unverifiable boundary.

Report the outcome first, followed by changed surfaces and preserved surfaces. Never claim “nothing else changed” without a concrete diff, tree, or action-log check.

## Example prompts

- “Use $intent-drift-guard before changing only the payment callback.”
- “Check this patch against my instruction not to edit generated files.”
- “Build an authorization ledger for this migration before implementation.”
