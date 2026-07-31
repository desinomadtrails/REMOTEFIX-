# UI Layout Template - RemoteFix

## Purpose
Ensures client page shells align with visual specifications.

## When to use
When declaring headers, footers, sidebar blocks.

## Required inputs
- React child nodes.

## Example
```tsx
import React from "react";

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-[#030712] text-white">
      <header className="border-b border-white/10 bg-slate-900/50 p-4">Header</header>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
};
```

## Common mistakes
- Creating nested headers inside views instead of wrapping with standard shells.

## Checklist
- [ ] Theme uses the Outfit / Inter font family.
