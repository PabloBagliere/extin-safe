# Cloudflare setup

Create the development and production resources before deploying:

```sh
pnpm exec wrangler d1 create extin-safe-dev
pnpm exec wrangler d1 create extin-safe-production
pnpm exec wrangler r2 bucket create extin-safe-media-dev
pnpm exec wrangler r2 bucket create extin-safe-media-production
```

Copy the returned D1 identifiers into the matching `database_id` entries in
`wrangler.jsonc`. The zero UUIDs are placeholders and intentionally prevent a
production deployment until the resources are configured.

For local development, copy `.dev.vars.example` to `.dev.vars` and provide a
unique `BETTER_AUTH_SECRET`. Set the same secret in each deployed environment:

```sh
pnpm exec wrangler secret put BETTER_AUTH_SECRET
pnpm exec wrangler secret put BETTER_AUTH_SECRET --env production
```

Generate a migration after a schema change, then apply it to the appropriate
environment:

```sh
pnpm db:generate
pnpm db:migrate:local
pnpm db:migrate:remote
pnpm db:migrate:production
```
