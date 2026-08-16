---
name: production-readiness
description: "Assess whether a service, web application, or major feature is ready for production operation through reliability, observability, security boundaries, capacity, recovery, ownership, and runbook checks. Use before first launch, a major architecture change, or accepting operational responsibility."
---

# Production Readiness

Evaluate the system as something people must operate under normal load, dependency failure, partial outage, and recovery—not only as source code.

## Assess the service

- Define important user journeys, service-level indicators, objectives, and acceptable failure or data-loss boundaries.
- Check health and readiness signals, structured logs, useful metrics, traces or request correlation, and actionable alerts.
- Check dependency timeouts, retries, backpressure, rate limits, idempotency, graceful degradation, and overload behavior.
- Review capacity assumptions, resource limits, cold starts, queue growth, storage, database performance, and scaling triggers.
- Verify secrets, authentication, authorization, privacy, backups, retention, and least-privilege boundaries; use a dedicated security skill for an exhaustive security scan.
- Confirm deployment, rollback, migration recovery, incident ownership, on-call or support path, runbook, and user communication.
- Test or simulate the most consequential failure modes when safe and authorized.

## Output

Return a readiness matrix with evidence, gap severity, owner or next action, verification method, and launch blockers. Distinguish “not observed” from “does not exist.” Do not approve based on a checklist alone when the evidence is missing.

## Evidence and efficiency

- Read repository-local instructions before making decisions.
- Start with file names, symbols, and the smallest relevant slices; expand only when evidence requires it.
- Reuse facts already established in the task. Do not rediscover the same files or rerun an unchanged check.
- Prefer deterministic commands, linters, type checkers, and tests over lengthy speculative reasoning.
- Keep intermediate notes compact: preserve paths, commands, results, assumptions, and unresolved risks.
- Never trade away a decisive correctness, safety, or compatibility check merely to save tokens.


## Example prompts

- “Use $production-readiness before launching this service.”
- “Find the minimum observability needed for this feature.”
