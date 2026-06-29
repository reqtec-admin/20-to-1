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
- **Checkout** – Simple form (email, name, address) and place order; demo mode by default, or Stripe Checkout when `NEXT_PUBLIC_DEMO=false`

Cart state is in-memory (React context). Product data is mock data in `src/lib/products.ts`.

## Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build

```bash
npm run build
npm start
```

## Deploy to Vercel

### From Vercel dashboard

1. Go to [vercel.com](https://vercel.com) and sign in (GitHub/GitLab/Bitbucket).
2. **Add New** → **Project** and import this repository (root is the app).
3. Leave **Framework Preset** as Next.js and build settings as default.
4. (Optional) Add environment variable `NEXT_PUBLIC_PASSCODE` = your secret passcode (default is `demo`).
5. (Optional) Copy `.env.example` to `.env.local` and configure payment settings (see **Payments** below).
6. Click **Deploy**.

### From CLI

```bash
npx vercel login
npx vercel
```

To set the passcode in production, add `NEXT_PUBLIC_PASSCODE` in the Vercel project **Settings → Environment Variables**.

## Payments (Stripe)

By default the site runs in **demo mode**: checkout shows “Demo only” messaging and no real payments are collected.

To enable live Stripe checkout:

1. Set `NEXT_PUBLIC_DEMO=false` (and `DEMO=false` on the server) in your environment.
2. Add your Stripe keys:
   - `STRIPE_SECRET_KEY` — secret key (server only)
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` — publishable key
   - `STRIPE_WEBHOOK_SECRET` — webhook signing secret (for `/api/webhooks/stripe`)
3. Redeploy. The cart and checkout pages will show Stripe checkout instead of demo messaging.

See `.env.example` for all variables.
