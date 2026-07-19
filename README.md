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
- **Checkout** – Simple form (email, name, address) and place order (demo only; no payment)

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
5. Click **Deploy**.

### From CLI

```bash
npx vercel login
npx vercel
```

To set the passcode in production, add `NEXT_PUBLIC_PASSCODE` in the Vercel project **Settings → Environment Variables**.

## Dependency updates (Renovate)

This repo uses [Renovate](https://github.com/renovatebot/renovate) to open pull requests when npm dependencies are outdated or have known vulnerabilities. Configuration lives in `renovate.json`.

### Enable Renovate on GitHub

1. Install the [Mend Renovate GitHub App](https://github.com/apps/renovate) on the `reqtec-admin/20-to-1` organization or repository.
2. Merge this repository's default branch so `renovate.json` is present — Renovate picks up config from the default branch.
3. Renovate will scan `package.json` / `package-lock.json` on its schedule (weekly, Mondays before 06:00 UTC) and open grouped update PRs.

Related packages are grouped (Next.js + `eslint-config-next`, React + types, Tailwind, TypeScript). Security patches are prioritized. CI runs `npm ci` and `npm run build` on every update PR.
