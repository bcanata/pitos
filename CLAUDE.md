# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev        # start dev server (Turbopack, localhost:3000)
npm run build      # production build
npm run lint       # ESLint
npm run db:push    # apply schema to SQLite (creates pitos.db if missing)
npm run db:studio  # Drizzle Studio GUI
npx tsx scripts/seed-demo.ts  # populate demo data (Team 8092)
```

## Architecture

Next.js 16 App Router · TypeScript · Tailwind v4 · shadcn/ui · LibSQL (`@libsql/client`) via Drizzle ORM · Lucia v3 magic-link auth · Resend/Cloudflare/console email provider chain · SSE for real-time · `@anthropic-ai/sdk` with `claude-opus-4-7`.

**Key conventions (Next.js 16):**
- Auth/route protection lives in `proxy.ts` (root), not `middleware.ts` — renamed in Next.js 16.
- Turbopack is the default bundler. Webpack plugins (e.g. next-pwa) won't work in `next build` — use `--webpack` flag or manual SW instead.
- Route handlers: `app/api/**/route.ts`.

**Directory layout:**
- `db/schema.ts` — full Drizzle schema (all tables). `db/index.ts` — singleton DB client.
- `lib/auth.ts` — Lucia instance. `lib/auth/magic-link.ts` — token generation + email.
- `lib/anthropic.ts` — shared Anthropic SDK client.
- `lib/sse.ts` — SSE subscriber registry (`subscribe`, `notifyChannel`).
- `lib/agents/` — one file per agent: channel, memory, onboarding, judge-sim, exit-interview, season-recap.
- `app/(workspace)/` — authenticated workspace layout and pages.
- `components/workspace/` — feature components (sidebar, channel-view, message-bubble, right-panel, task-panel, agent-activity).
- `components/ui/` — shadcn primitives only.

**Agent pattern:** Every agent call goes through `lib/agents/<name>.ts`, receives typed context, calls `claude-opus-4-7`, and returns a structured result.

**Real-time:** SSE registry in `lib/sse.ts`. `export const runtime = "nodejs"` required on SSE route handlers.

**PWA:** Manual `public/manifest.json` + `public/sw.js` (no next-pwa webpack plugin).

## Database

Uses `@libsql/client` (async LibSQL driver). Local dev: `file:./pitos.db`. Production: `TURSO_DATABASE_URL` (free 9 GB at turso.tech). Run `npm run db:push` locally after any schema change, then `npx drizzle-kit generate` to update the migration file for production.

JSON columns use `text({ mode: 'json' })` — cast types at the call site with `as`.

**All DB calls are async (LibSQL).** Use `await db.select(...).get()`, `await db.select(...).all()`, `await db.insert(...).values(...)` — no `.run()`. Only `anthropic.messages.create()`, fetch, and DB calls are async.

## Environment variables

See `.env.example`. Required: `ANTHROPIC_API_KEY`, `AUTH_SECRET`, `APP_URL`. Email provider chain (magic links): `RESEND_API_KEY` + `RESEND_FROM_EMAIL` (free) → `CLOUDFLARE_ACCOUNT_ID` + `CLOUDFLARE_EMAIL_API_TOKEN` + `FROM_EMAIL` (Workers Paid) → console log fallback. Persistent DB: `TURSO_DATABASE_URL` + `TURSO_AUTH_TOKEN`.

## Deploying (fork & use)

This repo is designed to be forked. To deploy your own instance:

1. Fork the repo
2. `vercel link` → `vercel --prod`
3. Set env vars: `ANTHROPIC_API_KEY`, `AUTH_SECRET` (random 64-char hex), `APP_URL` (your Vercel URL)
4. For email: add `RESEND_API_KEY` + `RESEND_FROM_EMAIL` (free at resend.com)
5. For persistent DB: add `TURSO_DATABASE_URL` + `TURSO_AUTH_TOKEN` (free at turso.tech)
6. New users go through `/onboarding` to create their team — no manual seeding needed
