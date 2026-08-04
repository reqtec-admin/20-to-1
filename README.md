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
- **Checkout** – Account creation required; demo mode by default, or Stripe Checkout when `NEXT_PUBLIC_DEMO=false`; on order, agents are provisioned to the buyer's organization
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
6. (Optional) Copy `.env.example` to `.env.local` and configure payment settings (see **Payments** below).
7. Click **Deploy**.

### From CLI

```bash
pnpm dlx vercel login
pnpm dlx vercel
```

To set the passcode in production, add `NEXT_PUBLIC_PASSCODE` in the Vercel project **Settings → Environment Variables**.

## Payments (Stripe)

By default the site runs in **demo mode**: checkout shows “Demo only” messaging and no real payments are collected. Demo checkout still provisions agents via `/api/checkout` when Supabase auth is configured.

To enable live Stripe checkout:

1. Set `NEXT_PUBLIC_DEMO=false` (and `DEMO=false` on the server) in your environment.
2. Add your Stripe keys:
   - `STRIPE_SECRET_KEY` — secret key (server only)
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` — publishable key
   - `STRIPE_WEBHOOK_SECRET` — webhook signing secret (for `/api/webhooks/stripe`)
3. Redeploy. The cart and checkout pages will show Stripe checkout instead of demo messaging.

Live flow: checkout redirects to Stripe (`POST /api/stripe/checkout`); on return to `/checkout/success`, agents are provisioned via `POST /api/checkout`.

See `.env.example` for all variables.
