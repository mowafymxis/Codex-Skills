# Coding & Engineering

Use these skills for code behavior, dependencies, configuration, migrations, runtime workflows, observability, and cross-layer engineering changes.

| Plugin | Primary use |
| --- | --- |
| [config-precedence-xray](./config-precedence-xray) | Trace which configuration value wins and where it was bound. |
| [contract-shadow-tests](./contract-shadow-tests) | Preserve behavior that callers actually rely on before refactoring. |
| [dependency-capability-audit](./dependency-capability-audit) | Audit a dependency’s install, build, runtime, data, and network capabilities. |
| [invariant-miner](./invariant-miner) | Extract hidden system rules and turn them into executable checks. |
| [migration-time-machine](./migration-time-machine) | Test migrations across mixed, partial, rollback, retry, and future states. |
| [observability-gap-tracer](./observability-gap-tracer) | Find the minimum telemetry needed to detect, diagnose, and verify recovery. |
| [semantic-blast-radius](./semantic-blast-radius) | Trace behavioral impact beyond direct code references. |
| [state-machine-reconstructor](./state-machine-reconstructor) | Recover undocumented states, guards, events, and transitions. |
| [test-oracle-designer](./test-oracle-designer) | Design reliable correctness checks when golden outputs are unavailable. |

Each directory is an installable Codex plugin. The category is the primary use case; some skills are intentionally useful across more than one category.
