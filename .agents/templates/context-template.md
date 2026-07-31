# React Context Template - RemoteFix

## Purpose
Manages global shared states (such as active user sessions).

## When to use
When state must propogate through component trees without prop drilling.

## Required inputs
- Context values.

## Example
```tsx
import React, { createContext, useContext, useState } from "react";

const AuthContext = createContext<{ token: string | null } | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token] = useState<string | null>(null);
  return <AuthContext.Provider value={{ token }}>{children}</AuthContext.Provider>;
};
```

## Common mistakes
- Initializing context variables without checking for null exceptions.

## Checklist
- [ ] Hook is exported to fetch context safely.
