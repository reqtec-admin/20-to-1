# Supabase backend — auth, organizations & agent entitlements

This directory holds the database layer for the 20 to 1 auth model. Tenancy is
modeled in Postgres (Supabase has no native "organizations" primitive) and
enforced with Row Level Security. A custom access-token hook projects org +
agent entitlements into the JWT so the app middleware and the credentials
broker can read them.

## Data model

| Table | Purpose |
|-------|---------|
| `organizations` | One row per customer tenant. First buyer becomes `owner`. |
| `memberships` | User ↔ org link with a coarse `org_role` (`owner`/`admin`/`billing`/`member`) and an `is_default` flag marking the user's **active org**. |
| `org_agents` | Agents an org purchased (the license), with `seats` (null = unlimited). `agent_slug` mirrors `src/lib/products.ts`. Source of truth for entitlements. |
| `teams` | Groups inside an org (e.g. "Brand Team", "Marketing Team"). |
| `team_members` | User ↔ team link. |
| `team_agents` | Agents granted to a whole team. |
| `agent_assignments` | A consumed **seat** — a specific user assigned a specific org agent. Composite FK ensures the org owns the agent. |
| `org_domains` | Verified email domain → org, for SSO/JIT provisioning. |
| `org_sso_connections` | Supabase SAML provider → org, with a default role. |

```
auth.users ──< memberships >── organizations ──< org_agents
     │                              │   │              ^
     │                              │   └──< teams >──< team_members
     │                              │          └──< team_agents
     └──< agent_assignments >───────┘   organizations ──< org_domains / org_sso_connections
```

### How access scales (corporations & teams)

A solo buyer becomes `owner` and implicitly holds every agent the org owns.
For larger orgs, **not every member should reach every agent**, so a user's
*effective* agents in an org are computed by `effective_agent_slugs()`:

```
owner/admin            ⇒ all ACTIVE org agents
+ direct assignments   (agent_assignments: a seat for this user)
+ team assignments     (team_agents for any team the user is in)
─────────────────────────────────────────────────────────────
always ∩ ACTIVE org_agents
```

This keeps each member's token scoped to what they can actually use, and the
claim size is bounded by the product catalog regardless of org size.

A user may belong to many orgs; `is_default` selects the **active org**
reflected in the JWT. Switch it with the `set_active_org(org_id)` RPC.

## Token shape

The `custom_access_token_hook` adds these claims to every JWT, scoped to the
user's **active org** and their **effective** agents:

```json
{
  "sub": "<user uuid>",
  "email": "user@example.com",
  "org_id": "<active org uuid>",
  "org_role": "owner",
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

Run the files in `migrations/` in numeric order (0001 → 0008) in the
Supabase SQL editor.

## Enable the access-token hook

The hook must be turned on after the function exists.

- **Dashboard**: Authentication → Hooks → "Customize Access Token (JWT) Claims"
  → select `public.custom_access_token_hook`.
- **Or** `supabase/config.toml` (included here) already enables it for local dev.

## Permissions verification (important)

RLS applies to **every** role, including the one the hook runs as.

| Path | Role | How it reads | Requirement |
|------|------|--------------|-------------|
| Access-token hook | `supabase_auth_admin` | `memberships` directly | `auth_admin_read_memberships` policy (0005) + GRANT SELECT |
| Access-token hook | `supabase_auth_admin` | agents via `effective_agent_slugs()` | `SECURITY DEFINER` ⇒ bypasses RLS; EXECUTE granted |
| App (anon key) | `authenticated` | own org rows only | `*_select` policies gated by `is_org_member` |
| App mutations | `authenticated` | admin/owner only | `*_admin_write` policies gated by `is_org_admin` |
| Checkout provisioning | `authenticated` → RPC | `provision_checkout` | `SECURITY DEFINER`, scoped to `auth.uid()` |
| SSO JIT | trigger on `auth.users` | `handle_new_user()` | `SECURITY DEFINER`, best-effort (never blocks signup) |

A GRANT is **not** a policy. Without the 0005 policies the hook reads zero
rows and `agents`/`org_id` come back empty. Helper functions used inside
policies (`is_org_member`, `is_org_admin`) are `SECURITY DEFINER` to prevent
RLS recursion on `memberships`.

## Provisioning flow

After payment is confirmed, the app server calls the `provision_checkout`
RPC (see `src/app/api/checkout/route.ts`). It idempotently:

1. Creates an organization + `owner` membership (active) on first purchase.
2. Upserts the purchased agents into `org_agents` (with optional `seats`).
3. Assigns the buyer a seat on each purchased agent.

On the next token refresh the new `agents` claim flows into the JWT and the UI.

## SSO / enterprise onboarding

For corporate customers using SAML SSO:

1. Register the IdP in Supabase (`auth.sso_providers`) and note its id.
2. Insert the org's verified domain(s) into `org_domains` (`verified = true`).
3. Link the provider in `org_sso_connections` with a `default_role`.
4. When an employee signs in via SSO for the first time, the
   `on_auth_user_created` trigger auto-joins them to the matching org. Admins
   then place them on teams (`team_members`) or assign agents directly
   (`agent_assignments`) — or grant the whole team an agent (`team_agents`).

Group/role mapping from IdP attributes is configured in Supabase's SAML
attribute mapping; the `default_role` provides the fallback.

## Environment variables

Set these in `.env.local` (see `.env.example`):

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

The app degrades gracefully (auth disabled, public catalog only) when these
are not set, so the demo still builds and runs without Supabase configured.
