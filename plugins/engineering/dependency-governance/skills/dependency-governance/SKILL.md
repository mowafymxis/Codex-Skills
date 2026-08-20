---
name: dependency-governance
description: "Evaluate dependency additions, upgrades, removals, and replacements for capability fit, maintenance, licensing, transitive risk, runtime and bundle impact, compatibility, lockfiles, and migration cost. Use before changing package manifests or vendored code."
---

# Dependency Governance

Treat a dependency as a long-term operational and supply-chain commitment, not a one-line manifest edit.

## Evaluate the need

- State the exact capability required and check whether the standard library, existing dependency, or local code already provides it safely.
- Compare viable alternatives on API fit, maintenance, release quality, license, transitive graph, runtime or bundle cost, platform support, and exit cost.
- Verify current package metadata and official documentation when freshness matters; do not infer health from popularity alone.
- Check license compatibility, security-advisory history, provenance or signing evidence, deprecation policy, maintainer transfer, and realistic time-to-fix for critical defects.
- Check lockfiles, peer dependencies, native binaries, build scripts, network behavior, data access, and secret or filesystem capabilities.

## Change safely

- Keep the smallest compatible version range and update the lockfile through the repository’s package manager.
- Read release notes and migration guidance for breaking changes.
- Run focused tests, type/build checks, dependency or license checks, and relevant runtime or bundle measurements.
- Update documentation and removal plans when the dependency changes architecture or operational ownership.
- Do not accept a dependency merely because it makes the immediate code shorter.

## Output

Return need, alternatives, verified evidence, compatibility and supply-chain risks, exact files to change, checks, and a rollback or removal path. Mark current facts that could not be verified.

## Operating discipline

- Read repository instructions and status first. Inspect manifests, lockfiles, imports, build scripts, and official package evidence before comparing options.
- Default to evaluation or plan mode. Change dependencies or lockfiles only when implementation is authorized; preserve package-manager conventions and unrelated resolutions.
- Report current-source dates, exact checks, compatibility results, transitive unknowns, and exit cost. Do not repeat unchanged metadata searches.


## Example prompts

- “Use $dependency-governance before adding this package.”
- “Audit this major dependency upgrade.”
