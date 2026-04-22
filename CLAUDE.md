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
```

## Architecture

Next.js 16 App Router · TypeScript · Tailwind v4 · shadcn/ui · SQLite via Drizzle ORM · Lucia v3 magic-link auth · Resend email · SSE for real-time · `@anthropic-ai/sdk` with `claude-opus-4-7`.

**Key conventions (Next.js 16):**
- Auth/route protection lives in `proxy.ts` (root), not `middleware.ts` — renamed in Next.js 16.
- Turbopack is the default bundler. Webpack plugins (e.g. next-pwa) won't work in `next build` — use `--webpack` flag or manual SW instead.
- Route handlers: `app/api/**/route.ts`.

**Directory layout:**
- `db/schema.ts` — full Drizzle schema (all tables). `db/index.ts` — singleton DB client.
- `lib/auth.ts` — Lucia instance. `lib/auth/magic-link.ts` — token generation + email.
- `lib/anthropic.ts` — shared Anthropic SDK client.
- `app/(workspace)/` — authenticated workspace layout and pages.
- `app/api/agent/` — agent route handlers (channel, memory, task, judge-sim, exit-interview).
- `components/ui/` — shadcn primitives only. Feature components live alongside their routes.

**Agent pattern:** Every agent call goes through `lib/agents/<name>.ts`, receives typed context, calls `claude-opus-4-7`, and returns a structured result. Tool definitions live in the same file as the agent that uses them.

**Real-time:** SSE via `app/api/sse/route.ts`. Polling fallback available if SSE proves unreliable on Vercel.

**PWA:** Manual `public/manifest.json` + `public/sw.js` (no next-pwa webpack plugin). Manifest linked via `metadata` export in `app/layout.tsx`.

## Database

SQLite in development (`pitos.db`, gitignored). Drizzle schema in `db/schema.ts` — all tables defined there. Run `npm run db:push` after any schema change.

JSON columns use `text({ mode: 'json' })` — cast types at the call site with `as`.

## Environment variables

See `.env.example`. Required: `ANTHROPIC_API_KEY`, `AUTH_SECRET`. Optional: `RESEND_API_KEY` (magic links log to console in dev when absent), `DATABASE_URL` (defaults to `./pitos.db`), `APP_URL`.
