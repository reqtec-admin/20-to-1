# AGENTS.md

## Cursor Cloud specific instructions

`20 to 1` is a single-service Next.js 15 (App Router) + React 19 + TypeScript + Tailwind CSS 4 app. There is no backend, database, or API routes — product data is mock data in `src/lib/products.ts` and cart state is in-memory React context.

- **Run / build / lint commands** are the standard scripts in `package.json` (`npm run dev`, `npm run build`, `npm start`). The dev server listens on `http://localhost:3000`.
- **Lint is not configured out of the box.** The repo has `eslint-config-next` installed but no ESLint config file, so `npm run lint` (`next lint`) drops into an interactive setup prompt and cannot run non-interactively. `npm run build` still performs type checking, and `npx tsc --noEmit` type-checks the whole project.
- **Passcode gate:** The demo can be passcode-protected via `NEXT_PUBLIC_PASSCODE` (see `src/context/AuthContext.tsx`); it defaults to `demo`. In the current setup the app loaded without prompting for a passcode.
- **Product images** load from `images.unsplash.com` (allowed in `next.config.ts`); external network is only needed for images to render, not for the app to run.
