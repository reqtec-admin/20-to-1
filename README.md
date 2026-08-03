# 20 to 1

E-commerce concept: agent catalog, cart, and checkout (passcode-protected demo).

## Stack

- **Next.js 15** (App Router)
- **React 19**
- **Tailwind CSS 4**
- **TypeScript**

## Features

- **Home** – Featured products and link to shop
- **Shop** – Product listing grid
- **Product detail** – Image, description, quantity, add to cart
- **Cart** – List items, update quantity, remove, subtotal, proceed to checkout
- **Checkout** – Account creation required; on order, agents are provisioned to the buyer's organization
- **Accounts & organizations** – Supabase-backed auth; each buyer gets an org and purchased agents as entitlements
- **My Agents** – Account page lists the org's provisioned agents

Cart state is in-memory (React context). Product data is mock data in `src/lib/products.ts`.

## Auth & agent entitlements (Supabase)

Accounts, organizations, and agent ownership are powered by Supabase.

- **Sign up happens at checkout** — buyers create an account before an order is placed.
- **Tenancy is modeled in Postgres** (`organizations`, `memberships`, `org_agents`) and isolated with Row Level Security. See `supabase/`.
- **A custom access-token hook** projects `org_id`, `org_role`, and the owned `agents` into every JWT.
- **Next.js middleware** (`middleware.ts`) refreshes the session and forwards the entitled agents to Server Components, which seed the catalog shown in the UI (owned badges, the **My Agents** page).
- **Checkout provisioning** — `POST /api/checkout` calls the `provision_checkout` RPC to create the org (first purchase) and grant the cart's agents.

Set up: apply the migrations in `supabase/migrations/` (see `supabase/README.md`) and add the env vars below. Without them, the app runs in public demo mode with auth disabled.

## Run

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build

```bash
pnpm build
pnpm start
```

## Deploy to Vercel

### From Vercel dashboard

1. Go to [vercel.com](https://vercel.com) and sign in (GitHub/GitLab/Bitbucket).
2. **Add New** → **Project** and import this repository (root is the app).
3. Leave **Framework Preset** as Next.js. Vercel will detect `pnpm-lock.yaml` and use pnpm automatically.
4. (Optional) Add environment variable `NEXT_PUBLIC_PASSCODE` = your secret passcode (default is `demo`).
5. To enable accounts, add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (see `.env.example` and `supabase/README.md`).
6. Click **Deploy**.

### From CLI

```bash
pnpm dlx vercel login
pnpm dlx vercel
```

To set the passcode in production, add `NEXT_PUBLIC_PASSCODE` in the Vercel project **Settings → Environment Variables**.

## Dependency updates (Renovate)

This repo uses [Renovate](https://github.com/renovatebot/renovate) to open pull requests when npm dependencies are outdated or have known vulnerabilities. Configuration lives in `renovate.json`.

### Enable Renovate on GitHub

1. Install the [Mend Renovate GitHub App](https://github.com/apps/renovate) on the `reqtec-admin/20-to-1` organization or repository.
2. Merge this repository's default branch so `renovate.json` is present — Renovate picks up config from the default branch.
3. Renovate will scan `package.json` / `package-lock.json` on its schedule (weekly, Mondays before 06:00 UTC) and open grouped update PRs.

Related packages are grouped (Next.js + `eslint-config-next`, React + types, Tailwind, TypeScript). Security patches are prioritized. CI runs `npm ci` and `npm run build` on every update PR.
