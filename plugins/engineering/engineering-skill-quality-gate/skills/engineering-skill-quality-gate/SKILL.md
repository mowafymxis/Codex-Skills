---
name: engineering-skill-quality-gate
description: "Audit or validate a Codex skill for accurate triggering, concise progressive disclosure, safe workflows, useful outputs, deterministic resources, installation correctness, and realistic task performance. Use when creating, updating, publishing, or reviewing a skill."
---

# Skill Quality Gate

Treat a skill as production software: its interface must trigger for the right work, its instructions must produce repeatable behavior, and its cost must be justified.

## Validate the package

- Confirm the folder name, `SKILL.md`, YAML frontmatter, lowercase name, and precise description.
- Ensure the description states what the skill does and when it should trigger; remove broad overlap with existing skills.
- Check that instructions use imperative language, define scope, preserve user changes, and distinguish audit, plan, change, and verification modes.
- Check tool, filesystem, secret, external-write, destructive-action, and authorization boundaries.
- Check that outputs include evidence, actual checks, unresolved risks, and honest limitations.
- Keep the core body concise and under the platform’s recommended size; move conditional detail into directly linked references.
- Remove redundant explanations that the model already knows and avoid loading unrelated references.
- Test every bundled script or deterministic resource with representative inputs.
- Run the available skill validator and parse the UI metadata.

## Forward-test behavior

Use fresh, realistic prompts that resemble normal user requests. Evaluate trigger precision, repository inspection, edge cases, safe no-op behavior, token discipline, and final reporting. Test both a task the skill should handle and a nearby task it should not hijack.

Do not pass the validator your intended answer or suspected flaw. Review raw outputs and emitted diffs. Fix the skill when it relies on leaked context, invents evidence, over-scopes edits, or skips decisive verification.

## Gate decision

Return `ready`, `ready with changes`, or `not ready`, with blocking findings, evidence, checks run, residual risk, and the smallest next fix. Never call a skill accurate merely because its YAML parses.

## Evidence and efficiency

- Read repository-local instructions before making decisions.
- Start with file names, symbols, and the smallest relevant slices; expand only when evidence requires it.
- Reuse facts already established in the task. Do not rediscover the same files or rerun an unchanged check.
- Prefer deterministic commands, linters, type checkers, and tests over lengthy speculative reasoning.
- Keep intermediate notes compact: preserve paths, commands, results, assumptions, and unresolved risks.
- Never trade away a decisive correctness, safety, or compatibility check merely to save tokens.


## Example prompts

- “Use $engineering-skill-quality-gate before publishing this skill.”
- “Forward-test this skill on a realistic repository change.”
