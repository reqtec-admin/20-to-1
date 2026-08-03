# AGENTS.md

## Cursor Cloud specific instructions

`20 to 1` is a single-service Next.js 15 (App Router) + React 19 + TypeScript + Tailwind CSS 4 app. Package management is **pnpm only** (`packageManager` in `package.json`, lockfile is `pnpm-lock.yaml`). Do not use npm or yarn; do not commit `package-lock.json` or `yarn.lock`.

- **Install / run / build / lint:** `pnpm install`, `pnpm dev`, `pnpm build`, `pnpm start`, `pnpm lint`. The dev server listens on `http://localhost:3000`.
- **Lint is not configured out of the box.** The repo has `eslint-config-next` installed but no ESLint config file, so `pnpm lint` (`next lint`) drops into an interactive setup prompt and cannot run non-interactively. `pnpm build` still performs type checking, and `pnpm exec tsc --noEmit` type-checks the whole project.
- **Passcode gate:** The demo can be passcode-protected via `NEXT_PUBLIC_PASSCODE` (see `src/context/AuthContext.tsx`); it defaults to `demo`. In the current setup the app loaded without prompting for a passcode.
- **Product images** load from `images.unsplash.com` (allowed in `next.config.ts`); external network is only needed for images to render, not for the app to run.
