# Coding Standards & Conventions - RemoteFix

## Purpose
Enforces code style and formatting standards to maintain a 96/100 code quality rating.

## Scope
Applies to all source files, configurations, and packages across the repository.

## Overview
Code quality is enforced via strict TypeScript compiler settings, ESLint, and import rules.

## Standards
- **Strict Types**: No implicit `any`. Use explicit type declarations or Zod casting.
- **Imports**: Use `import type` for type-only imports to improve bundler optimization.
- **Naming**: PascalCase for React components, camelCase for hooks, and kebab-case for directories.

## Examples
*Correct imports format:*
```typescript
import React, { useState } from "react";
import type { UserRole } from "@remotefix/types";
```

## Related Documents
- [folder-structure.md](file:///e:/SURAJ/REMOTEFIX-/.agents/knowledge/folder-structure.md)

## Status
Verified (Implemented)

## Last Updated
2026-07-31

## Source of Truth
`tsconfig.json`, `packages/tsconfig.json`
