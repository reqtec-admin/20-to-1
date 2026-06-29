# Supabase backend — auth, organizations & agent entitlements

This directory holds the database layer for the 20 to 1 auth model. Tenancy is
modeled in Postgres (Supabase has no native "organizations" primitive) and
enforced with Row Level Security. A custom access-token hook projects org +
agent entitlements into the JWT so the app middleware and the credentials
broker can read them.

## Data model

| Table | Purpose |
|-------|---------|
| `organizations` | One row per customer tenant. First buyer becomes owner. |
| `memberships` | User ↔ org link with a coarse `org_role` (`admin`/`billing`/`member`). |
| `org_agents` | Agents an org purchased. `agent_slug` mirrors `src/lib/products.ts`. Source of truth for entitlements. |

```
auth.users ──< memberships >── organizations ──< org_agents
```

## Token shape

The `custom_access_token_hook` adds these claims to every JWT:

```json
{
  "sub": "<user uuid>",
  "email": "user@example.com",
  "org_id": "<org uuid>",
  "org_role": "admin",
  "agents": ["brand-manager", "marketing-manager"]
}
```

The Next.js middleware decodes `agents` to feed the entitled catalog to the UI.

## Apply the migrations

### Option A — Supabase CLI (recommended)

```bash
supabase db push           # against a linked project
# or, for local dev:
supabase start
supabase db reset          # applies migrations in order
```

### Option B — SQL editor

Run the files in `migrations/` in numeric order (0001 → 0004) in the
Supabase SQL editor.

## Enable the access-token hook

The hook must be turned on after the function exists.

- **Dashboard**: Authentication → Hooks → "Customize Access Token (JWT) Claims"
  → select `public.custom_access_token_hook`.
- **Or** `supabase/config.toml` (included here) already enables it for local dev.

## Provisioning flow

After payment is confirmed, the app server calls the `provision_checkout`
RPC (see `src/app/api/checkout/route.ts`). It idempotently:

1. Creates an organization + admin membership on the user's first purchase.
2. Upserts the purchased agents into `org_agents`.

On the next token refresh the new `agents` claim flows into the JWT and the UI.

## Environment variables

Set these in `.env.local` (see `.env.example`):

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

The app degrades gracefully (auth disabled, public catalog only) when these
are not set, so the demo still builds and runs without Supabase configured.
