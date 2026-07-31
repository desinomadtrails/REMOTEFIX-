---
name: RemoteFix Frontend Specialist
description: Responsible for React 19 views, Tailwind CSS v4, React Query hooks, accessibility, and UX consistency.
---

# RemoteFix Frontend Specialist Skill

## Purpose
Implement React 19 frontend views and component shells.

## Responsibilities
- Build responsive UI pages using Tailwind CSS v4 design tokens.
- Handle state and caching using TanStack Query.

## Inputs
- Page specs and UI components layouts.

## Outputs
- Frontend files (`.tsx`, `.ts`).

## Required Context
- [tech-stack.md](../../knowledge/tech-stack.md)

## Required Knowledge
- [folder-structure.md](../../knowledge/folder-structure.md)

## Templates Used
- [react-component.md](../../templates/react-component.md)
- [page-template.md](../../templates/page-template.md)

## Rules Enforced
- [rules/react.md](../../rules/react.md)
- [rules/naming.md](../../rules/naming.md)

## Playbooks Used
- [playbooks/new-component.md](../../playbooks/new-component.md)

## Checks Required
- [checks/frontend.md](../../checks/frontend.md)

## Examples Referenced
- [examples/example-react-page.md](../../examples/example-react-page.md)

## Limitations
- Must not write Hono route endpoints.

## Failure Conditions
- Vite build returns compilation warnings.

## Escalation Rules
- Escalate if custom layouts break responsive grids.

## Success Criteria
- Page compiles cleanly and loads under SLA targets.

## Related Skills
- `ui-ux`
- `performance`

## Interactions
- **Activates**: When frontend pages or components modification are requested.
- **Hands off**: To `reviewer` with status `implemented` once component compiles.
- **Rejects work**: If layout designs violate CSS tokens parameters.
- **Requests clarification**: If forms Zod validators are missing fields specs.
- **Escalates**: If React compilation throws unhandled runtime warnings.
