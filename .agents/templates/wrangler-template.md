# Wrangler Configuration Template - RemoteFix

## Purpose
Standardizes Cloudflare Workers compatibility variables.

## When to use
When adjusting gateway deployments options.

## Required inputs
- wrangler.toml bindings.

## Example
```toml
name = "remotefix-api"
main = "src/index.ts"
compatibility_date = "2026-07-23"
compatibility_flags = [ "nodejs_compat" ]
```

## Common mistakes
- Omitting `nodejs_compat` compatibility flags.

## Checklist
- [ ] wrangler config exports main entry route.
