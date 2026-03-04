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
