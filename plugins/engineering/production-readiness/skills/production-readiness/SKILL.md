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
- Define recovery-time and recovery-point objectives where data matters, and require evidence from a restore or recovery exercise rather than backup existence alone.
- Test or simulate the most consequential failure modes when safe and authorized.

## Output

Return a readiness matrix with evidence, gap severity, owner or next action, verification method, and launch blockers. Distinguish “not observed” from “does not exist.” Do not approve based on a checklist alone when the evidence is missing.

## Operating discipline

- Read repository and operational instructions first. Inspect the service boundary, deployment configuration, runbooks, and decisive runtime evidence before expanding scope.
- Assessment is read-only. Do not deploy, load-test production, rotate secrets, or alter alerts and infrastructure without explicit authorization.
- Report evidence dates, exact checks, representative-load assumptions, missing owners, and untested recovery paths. Distinguish absent controls from controls not observed.


## Example prompts

- “Use $production-readiness before launching this service.”
- “Find the minimum observability needed for this feature.”
