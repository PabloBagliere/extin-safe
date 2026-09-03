# Cloudflare setup

Create the production resources before deploying:

```sh
pnpm exec wrangler d1 create extin-safe-production
pnpm exec wrangler r2 bucket create extin-safe-media-production
```

Copy the returned D1 identifier into `wrangler.jsonc`.

For local development, copy `.dev.vars.example` to `.dev.vars` and provide a
unique `BETTER_AUTH_SECRET`. Set a separate secret in the deployed Worker:

```sh
pnpm exec wrangler secret put BETTER_AUTH_SECRET
```

Generate a migration after a schema change, then apply it to the appropriate
environment:

```sh
pnpm db:generate
pnpm db:migrate:local
pnpm db:migrate:remote
```

The Worker is available at `https://extin-safe.pablobagliere.dev` after the
custom domain finishes provisioning.
