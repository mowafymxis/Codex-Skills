# Codex Skills

A personal, installable collection of Codex skills for software engineering, reasoning, verification, and product research.

## Browse by use

| Category | Best for | Plugins |
| --- | --- | --- |
| [Coding & Engineering](./plugins/coding/README.md) | Code behavior, dependencies, migrations, runtime systems, and engineering changes | 9 |
| [Engineering](./plugins/engineering/README.md) | Professional planning, implementation, review, testing, release, and operational workflows | 15 |
| [Reasoning & Context](./plugins/reasoning/README.md) | Context, decisions, handoffs, scope control, blind spots, and balanced evaluation | 7 |
| [Quality & Verification](./plugins/quality/README.md) | Evidence, absence claims, rollback safety, change proof, and test prioritization | 4 |
| [Research & Product](./plugins/research/README.md) | Competitor intelligence and product strategy | 1 |

## Ongoing development

These skills are actively developing. Their prompts, instructions, and supporting assets will be refined to become more accurate, reliable, and useful over time. They are decision-support tools, not guarantees, so important outputs should still be checked against the task’s evidence and constraints.

## Installation

The repository includes a local marketplace manifest at [`.agents/plugins/marketplace.json`](./.agents/plugins/marketplace.json). Use that manifest to discover and install the plugins while keeping their use-based organization visible.

## Repository layout

```
plugins/
├── coding/
├── engineering/
├── quality/
├── reasoning/
└── research/
```

Every plugin keeps its own `.codex-plugin/plugin.json` and skill files. Moving a plugin into a category does not change its plugin name or invocation name.

## License

Apache-2.0. See [LICENSE](./LICENSE).
