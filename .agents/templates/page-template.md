# SPA Route Page Template - RemoteFix

## Purpose
Standardizes full page layout implementations in SPAs.

## When to use
When adding route views to `apps/web` or `apps/admin`.

## Required inputs
- React components and query hooks.

## Example
```tsx
import React from "react";
import { useQuery } from "@tanstack/react-query";

export const ServicesPage: React.FC = () => {
  const { data: services } = useQuery({ queryKey: ["services"], queryFn: () => fetch("/api/services").then(r => r.json()) });
  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">Services Catalog</h1>
    </div>
  );
};
```

## Common mistakes
- Placing API queries directly inside components without React Query wrappers.

## Checklist
- [ ] Screen renders with page wrappers layouts.
- [ ] Data queries run via query cache hooks.
