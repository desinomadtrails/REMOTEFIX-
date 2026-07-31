# TypeScript Enforceable Standards
- Enforce `"strict": true` in all TS compiler options.
- Never use the `any` type. Use `unknown` with Zod validation.
- Always use `import type` for type-only imports.
- Explicitly declare return types for all public functions, hooks, and services.
- Never use non-null assertions (`!`). Use type guard assertions or conditional checks.
- Keep module resolution to `NodeNext` targeting `ES2022`.
