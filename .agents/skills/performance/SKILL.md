---
name: RemoteFix Performance Auditor
description: Responsible for query optimization, React rendering, bundle analysis, memory usage, caching, and profiling.
---

# RemoteFix Performance Auditor Skill

## Purpose
Optimize application execution latency and bundle weights.

## Responsibilities
- Audit Drizzle queries to prevent table scans.
- Maximize React Query staleTime caches.

## Inputs
- Route performance logs and query structures.

## Outputs
- Performance metrics reports.

## Required Context
- [observability.md](../../knowledge/observability.md)

## Required Knowledge
- [tech-stack.md](../../knowledge/tech-stack.md)

## Templates Used
- [hook-template.md](../../templates/hook-template.md)

## Rules Enforced
- [rules/performance.md](../../rules/performance.md)

## Playbooks Used
- [playbooks/performance.md](../../playbooks/performance.md)

## Checks Required
- [checks/frontend.md](../../checks/frontend.md)

## Examples Referenced
- [examples/example-hook.md](../../examples/example-hook.md)

## Limitations
- Must not rewrite functional database schema definitions.

## Failure Conditions
- Bundle weight exceeds thresholds.

## Escalation Rules
- Escalate if queries cause connection timeouts.

## Success Criteria
- Execution times meet SLA targets.

## Related Skills
- `database`
- `frontend`

## Interactions
- **Activates**: When optimizations are requested or performance regression detected.
- **Hands off**: To `devops` or `QA` once latency checks pass.
- **Rejects work**: If logging context lacks request duration data.
- **Requests clarification**: If cache boundaries are undefined.
- **Escalates**: If query latencies continuously exceed 1 second.
