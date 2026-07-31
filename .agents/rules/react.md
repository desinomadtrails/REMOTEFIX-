# React Enforceable Standards
- Build functional components only. Class components are forbidden.
- Manage side-effects and backend data caching exclusively via TanStack Query hooks.
- Validate all form inputs using React Hook Form paired with Zod schemas.
- Place shared layout blocks inside `@remotefix/ui` library packages.
- Always use the React 19 compiler targets.
- Implement keys on mapped list elements using unique entity IDs, not indexes.
