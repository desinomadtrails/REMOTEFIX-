# API Enforceable Standards
- Route routes through Hono routers.
- Prefix all API gateway routes with `/api/`.
- Validate path parameters, query parameters, and body payloads with Zod schemas via `zValidator`.
- Wrap controllers with the standard `handleController` middleware to capture exceptions.
- Return HTTP response formats matching: `{ "success": boolean, "data"?: any, "message": string }`.
- Route security must call `verifyJwt` and `verifyRole` authorization checks.
