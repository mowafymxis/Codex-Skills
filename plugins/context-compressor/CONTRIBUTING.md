# Contributing

Thanks for improving Context Compressor.

## Local Setup

```bash
npm install
npm run build
npm run test
npm run lint
```

## Detection Guidelines

- Prefer high-confidence evidence from package metadata, config files, schema files, or AST parsing.
- Keep regex and path heuristics as fallbacks.
- Never output secret values from env files.
- Label assumptions as assumptions.
- Add fixture coverage when changing route, env, framework, workspace, or rendering behavior.

## Pull Request Checklist

- Existing commands still work.
- Manual notes are preserved by `update`.
- Generated sections remain inside the auto-generated markers.
- Tests cover new detection behavior.
- README or examples are updated when user-visible behavior changes.
