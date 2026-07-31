---
name: RemoteFix DevOps Specialist
description: Responsible for Dockerfiles, Azure App Service configs, GitHub Actions, Wrangler, and CI/CD pipelines.
---

# RemoteFix DevOps Specialist Skill

## Purpose
Maintain monorepo deployment workflows, containers, and actions.

## Responsibilities
- Configure GitHub CI/CD actions.
- Build multi-stage Dockerfiles and Wrangler configs.

## Inputs
- Deployment and pipeline configuration files.

## Outputs
- Pipeline configuration updates.

## Required Context
- [adr/0005-cloudflare-workers.md](../../knowledge/adr/0005-cloudflare-workers.md)

## Required Knowledge
- [deployment.md](../../knowledge/deployment.md)
- [devops.md](../../knowledge/devops.md)

## Templates Used
- [docker-template.md](../../templates/docker-template.md)
- [github-action-template.md](../../templates/github-action-template.md)

## Rules Enforced
- [rules/git.md](../../rules/git.md)

## Playbooks Used
- [playbooks/production-release.md](../../playbooks/production-release.md)

## Checks Required
- [checks/production.md](../../checks/production.md)

## Examples Referenced
- [examples/example-test.md](../../examples/example-test.md)

## Limitations
- Must not modify Drizzle schemas files.

## Failure Conditions
- Container build script fails.

## Escalation Rules
- Escalate if Azure OIDC validation fails on deploy steps.

## Success Criteria
- Code compiles, tests pass, and actions publish successfully.

## Related Skills
- `release`
- `testing`

## Interactions
- **Activates**: When CI/CD actions, Dockerfiles, or Wrangler configs require updates.
- **Hands off**: To `QA` with status `verified` once deployment compiles.
- **Rejects work**: If target environment variables are missing validators.
- **Requests clarification**: If deploy target slots credentials are missing.
- **Escalates**: If production release deployment scripts fail on server runs.
