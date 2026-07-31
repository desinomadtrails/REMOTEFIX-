# Performance Enforceable Standards
- Avoid executing database queries in loops. Use bulk fetches or JOIN queries.
- Set appropriate `staleTime` and `gcTime` in React Query definitions.
- Leverage Cloudflare KV cache for static catalog listings (Planned).
- Do not import large client libraries that do not support tree-shaking.
