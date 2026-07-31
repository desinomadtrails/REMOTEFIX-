# React Component Template - RemoteFix

## Purpose
Standardizes frontend view components using Tailwind CSS v4 design tokens.

## When to use
When creating UI primitives or shared component blocks.

## Required inputs
- Props types.

## Example
```tsx
import React from "react";

interface StatusBadgeProps {
  status: "pending" | "completed";
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  return (
    <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-md ${status === "completed" ? "bg-cyan-500/20 text-cyan-400" : "bg-yellow-500/20 text-yellow-400"}`}>
      {status}
    </span>
  );
};
```

## Common mistakes
- Hardcoding custom theme colors instead of using Tailwind v4 aurora glow configurations.

## Checklist
- [ ] Props are typed.
- [ ] Styles leverage Tailwind CSS tokens.
