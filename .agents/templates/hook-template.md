# React Query Hook Template - RemoteFix

## Purpose
Encapsulates data fetching and client cache management.

## When to use
For all client-server communication.

## Required inputs
- Fetch parameters.

## Example
```typescript
import { useQuery } from "@tanstack/react-query";

export const useFetchJobs = () => {
  return useQuery({
    queryKey: ["assigned-jobs"],
    queryFn: async () => {
      const res = await fetch("/api/bookings");
      if (!res.ok) throw new Error();
      return res.json();
    },
    staleTime: 60000
  });
};
```

## Common mistakes
- Omitting unique query keys mappings.

## Checklist
- [ ] Hook exports type-safe response data.
