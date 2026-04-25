<p align="center">
  <img src="public/logo.png" alt="PitOS" width="260">
</p>

# PitOS

An AI-powered workspace for FRC (FIRST Robotics Competition) teams. Slack-style channels, task tracking, decision logs, and judge interview prep — all wired into Claude agents that actually do work, not just chat.

Built for the [Built with Claude Opus 4.7 Hackathon](https://cerebralvalley.ai/e/built-with-4-7-hackathon).

**Live demo → [pitos.8092.tr](https://pitos.8092.tr)**

> **Read in:** [English](README.md) · [Türkçe](README.tr.md) · [한국어](README.ko.md) · [Other language? →](https://github.com/bcanata/pitos/issues/new?labels=translation-request&template=translation-request.md)

---

## Quick start

```bash
npx pitos-app
```

That's it. The wizard scaffolds the project, installs dependencies, provisions your database, optionally sets up a custom domain on Cloudflare, and deploys to Vercel. You get a working sign-in link at the end — about 2 minutes start to finish.

**Requirements:**
- Node.js 20+
- A [Claude API key](https://console.anthropic.com) (`sk-ant-...`)
- *(Optional)* A [Vercel account](https://vercel.com) for production deploys
- *(Optional)* A [Resend account](https://resend.com) for free transactional email (3,000/mo)
- *(Optional)* A [Cloudflare account](https://dash.cloudflare.com) for a custom domain

---

## What the setup wizard does

Running `npx pitos-app` from any empty directory launches an interactive wizard. Each step is optional except the ones marked **required**.

### 1. Project scaffold
If you're not already inside a PitOS checkout, the wizard copies the package into a new directory and runs `npm install`. Pick the directory name when prompted.

### 2. Claude API key *(required)*
Paste your `sk-ant-...` key. The wizard validates it against the Anthropic API before continuing — no typos slip through.

### 3. Language
Pick from ten built-in languages (English, Türkçe, Español, Français, Deutsch, Português, 中文, 日本語, עברית, or any other). "Other" triggers an on-demand Claude translation of the full setup bundle into your language.

### 4. Team details *(required)*
- **Team number** — e.g. `8092` (leave blank for demo / off-season)
- **Team name** — e.g. *Nordic Storm*
- **Your name** and **email** — you'll be the workspace admin

### 5. Email provider *(optional)*
Skip this in development — magic-link sign-in URLs print to the console.

Choose one of three options:

**Resend (recommended — free 3,000 emails/month)**
- Create a free account at [resend.com](https://resend.com) and add your domain
- Paste your `re_*` API key and the verified from-address
- Free tier covers any FRC team indefinitely

**Cloudflare Email Sending (optional — requires Workers Paid $5/mo)**
- **Cloudflare Account ID** — from the Cloudflare dashboard sidebar
- **Cloudflare Email API token** — a `cfut_*` scoped user token with `Email Sending` permission
- **From email address** — e.g. `noreply@yourteam.com`
- Note: requires the Workers Paid plan ($5/mo); not available on the free tier

**Skip** — magic-link URLs print to the server console (dev-only, copy-paste to sign in)

### 6. Custom domain *(optional)*
Hook up a domain like `pitos.yourteam.com` to your Vercel deployment.

You'll be asked for a **Cloudflare API Token**. Create one at [dash.cloudflare.com/profile/api-tokens](https://dash.cloudflare.com/profile/api-tokens) with these scopes:

| Permission | Why |
|---|---|
| `Zone:Zone:Read` | Look up the zone ID for your domain |
| `Zone:DNS:Edit` | Create the CNAME + SPF TXT records |
| `Zone:Email Routing Rules:Read` | *(optional)* Pull Cloudflare's DKIM key for email deliverability |

The token is used **only during setup** — it's never written to `.env.local` or pushed to Vercel. If you prefer not to use a scoped token, configure DNS manually and skip this step.

The wizard:
1. Verifies the token against `/user/tokens/verify`
2. Creates `CNAME → cname.vercel-dns.com` on your domain
3. Adds the SPF TXT record
4. Publishes the DKIM TXT record (if Email Routing provides one)
5. Adds the domain to your Vercel project and updates `APP_URL` to match

If the token is rejected, domain setup is skipped but the rest of the deploy continues.

### 6. Persistent database *(optional, recommended for production)*
After a successful Vercel deploy, the wizard asks if you want to set up [Turso](https://turso.tech) for persistent SQLite. Without it, data lives in `/tmp/pitos.db` and wipes on every cold start.

Turso free tier: 9 GB storage, 500 M row reads/month — more than enough for any FRC team.

1. Create a free database at [turso.tech/app/databases/new](https://turso.tech/app/databases/new)
2. Copy the `libsql://your-db.turso.io` URL and auth token into the wizard

The wizard pushes both to Vercel and triggers a redeploy so migrations run against the new DB.

### 7. Deploy to Vercel *(optional)*
The final step offers a production deploy. If accepted, the wizard:
- Runs `vercel link` (interactive — pick a team and project name)
- Pushes `ANTHROPIC_API_KEY`, `AUTH_SECRET`, and your email provider vars as environment variables
- Runs `vercel --prod --yes`
- Updates `APP_URL` to the deployed URL (or your custom domain if you set one)
- Redeploys so `APP_URL` takes effect

You finish team setup through `/onboarding` on the deployed URL.

---

## Features

**Channels** — Slack-style threaded messaging. Every message can trigger a Claude agent that answers questions, creates tasks, or asks "jury reflex" questions (proof demands, why questions, teach-mode redirects) to build student reasoning.

**Tasks** — Action items surfaced from channel discussion. Teach-mode tasks prompt students to explain their approach before marking done.

**Decisions** — A log of design and strategy decisions with rationale, alternatives considered, and who was in the room. Searchable for end-of-season recap.

**Ask** — Semantic search over everything the team has ever said or decided. Ask *"how did we solve the swerve drift issue last year?"* and get a sourced answer with links back to the original messages.

**Judge simulator** — Realistic mock judge interview. Claude plays the judge, adapts difficulty based on answers, and generates a debrief with strong answers + gaps to work on.

**Exit interview** — End-of-season 1:1 with Claude. Captures what students learned, what frustrated them, and what they want next year — the raw input for the season recap.

**Season recap** — Generates a full retrospective document from channel history, decisions, and exit interviews. Ready for awards submissions and sponsor reports.

**Settings** — Team config, member management, language switch, API key rotation.

---

## Running costs

FRC teams run on tight budgets. PitOS is designed to fit on a student's allowance — you can run a **real production instance with persistent data and real emails for $0/month** (plus Claude API tokens).

### Service-by-service breakdown (April 2026)

| Service | Free tier | Paid from | Notes |
|---|---|---|---|
| **Anthropic Claude API** | $5 trial credits on signup | Pay-per-use | The main variable cost — see below |
| **Vercel (Hobby)** | 1M function invocations, 4 CPU-hrs Active CPU, 100 GB data transfer, 1M edge requests, **60s max function duration** | $20 / user / month (Pro) + $20 usage credit | Hobby tier is "personal, non-commercial use" |
| **Netlify (Free)** | 100 GB bandwidth, 300 build min, 125k function invocations | $19 / user / month (Pro) | Hard caps — site suspends, no surprise bills |
| **Resend** | **3,000 emails/month**, 1 custom domain, 100/day | $20 / month (Pro, 50k emails) | Default email provider — ideal for magic-link logins |
| **Cloudflare DNS + Email Routing** | Unlimited zones, unlimited DNS records, inbound email routing | Free | Covers the domain + DNS automation the CLI does |
| **Cloudflare Workers Paid** (optional for Email Sending) | — | **$5 / month** minimum | Alternative email provider; requires Workers Paid to send any outbound mail |
| **Turso (LibSQL)** | **9 GB storage, 500 M row reads, 500 DBs** | $4.99 / month (Developer) | Persistent SQLite in production — wired into the CLI setup |
| **Custom domain** | — | ~$10–15 / year | Optional — a `*.vercel.app` or `*.netlify.app` URL works fine |

### Claude API pricing (per million tokens)

| Model | Input | Output | Cache read (10%) | Batch (50% off) |
|---|---|---|---|---|
| **Haiku 4.5** | $1 | $5 | $0.10 | $0.50 / $2.50 |
| **Sonnet 4.6** | $3 | $15 | $0.30 | $1.50 / $7.50 |
| **Opus 4.7** | $5 | $25 | $0.50 | $2.50 / $12.50 |

PitOS defaults to **Opus 4.7** in `lib/agents/*.ts` for quality. To cut costs 5x, swap the model ID to `claude-haiku-4-5` for high-frequency, low-stakes agents (channel replies, task extraction) and keep Opus for judge-sim and season-recap where reasoning quality matters most. Prompt caching is already supported by the SDK — cache reads cost 10% of input price.

**Rough monthly estimate** for a team of 20 students chatting actively:
- All Opus 4.7: **$15–40 / month**
- Mixed (Haiku for channels, Opus for heavy agents): **$3–8 / month**
- All Haiku 4.5: **$1–3 / month**

### Cost recipes

**Totally free production (recommended starting point):**
- Vercel Hobby or Netlify Free
- **Resend free tier** (3,000 emails/month) for real magic-link emails
- **Turso free tier** (9 GB) for persistent SQLite — data survives cold starts
- Claude Haiku 4.5 for all agents
- **Cost: $0/month** + Anthropic usage (~$1–3/mo for a team of 20)

**Totally free (dev / hackathon):**
- Skip email — magic-link URLs print to server logs (copy-paste to sign in)
- Ephemeral `/tmp/pitos.db` SQLite (data resets on cold start)
- **Cost: $0/month** + Anthropic usage

**Real team with sponsors (~$25/month + API):**
- Vercel Pro ($20/mo) — legal clarity on commercial use with sponsor logos
- Resend free tier (or Cloudflare Workers Paid $5/mo if you prefer)
- Turso free or Developer ($5/mo if you need more DBs)
- Custom domain ($1/mo amortized)
- **Cost: $20–25/month + ~$10–40/month Claude usage**

### Things to watch out for

- **Vercel Hobby is "non-commercial"** — FRC teams are nonprofit/educational, but if you have named sponsors or sell merchandise through the site, talk to your mentor or switch to Netlify Free (no such clause) or upgrade to Pro.
- **Vercel Hobby function duration caps at 60s** (default 10s, configurable up to 60s). Long Opus 4.7 agent runs — judge-sim mock interviews, season-recap generation — can exceed this. Symptoms are 504 timeouts on complex agent requests. Pro unlocks 300s. Workarounds: use Haiku 4.5 for faster responses, stream via SSE (already supported), or split long agent work into background jobs.
- **Cloudflare Email Sending is not free.** It needs the Workers Paid plan ($5/mo) to send *any* outbound email. The setup wizard defaults to Resend (3,000 emails/mo free). Cloudflare Email is still supported as an option for teams already on Workers Paid.
- **Cloudflare Workers Free is not enough for Email Sending.** The free tier gives you 100k requests/day and 10ms CPU per invocation, but Email Sending specifically requires Workers Paid. The free tier is fine for everything else (DNS, caching, SSL).
- **Ephemeral SQLite resets on cold start.** Without Turso, the DB lives at `/tmp/pitos.db` which Vercel/Netlify wipe between invocations. The setup wizard will offer to configure Turso (free 9 GB) right after deploy.
- **Claude API trial credits expire.** Anthropic gives $5 free credits on signup. After that, you need a payment method. Budget ~$5–10 for a month of testing before going live.

---

## Architecture

- **Framework** — Next.js 16 App Router with Turbopack (the default bundler)
- **UI** — React 19, Tailwind v4, [shadcn/ui](https://ui.shadcn.com)
- **Database** — LibSQL via `@libsql/client` + [Drizzle ORM](https://orm.drizzle.team); local `file:./pitos.db` in dev, Turso in production (`TURSO_DATABASE_URL`)
- **Auth** — [Lucia v3](https://lucia-auth.com) with magic-link tokens (no passwords)
- **Email** — Provider chain: [Resend](https://resend.com) (`RESEND_API_KEY`) → [Cloudflare Email Sending](https://blog.cloudflare.com/email-for-agents/) (`CLOUDFLARE_EMAIL_API_TOKEN`) → console log
- **Real-time** — SSE with a lightweight subscriber registry in `lib/sse.ts`
- **AI** — `@anthropic-ai/sdk` with `claude-opus-4-7` for all agents

Auth and route protection live in `proxy.ts` at the root (renamed from `middleware.ts` in Next.js 16). Agents are one-file-per-agent under `lib/agents/`.

---

## Manual development setup

For forks and contributors who want to skip the wizard:

```bash
git clone https://github.com/bcanata/pitos.git
cd pitos
npm install
cp .env.example .env.local  # fill in ANTHROPIC_API_KEY + AUTH_SECRET
npm run db:push             # creates pitos.db
npx tsx scripts/seed-demo.ts # optional: seed Team 8092 demo data
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000).

---

## Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `ANTHROPIC_API_KEY` | yes | Claude API key |
| `AUTH_SECRET` | yes | 64-char hex string — sign session cookies |
| `APP_URL` | yes | Base URL of the deployment (`http://localhost:3000` in dev) |
| `DATABASE_URL` | no | Local SQLite path (defaults to `./pitos.db`; ignored if `TURSO_DATABASE_URL` is set) |
| `RESEND_API_KEY` | no | Resend API key — enables magic-link emails (free 3k/mo) |
| `RESEND_FROM_EMAIL` | no | Sender address for Resend (e.g. `noreply@yourteam.com`) |
| `CLOUDFLARE_ACCOUNT_ID` | no | Alternative email provider (requires Workers Paid $5/mo) |
| `CLOUDFLARE_EMAIL_API_TOKEN` | no | Scoped `cfut_*` token with Email Sending permission |
| `FROM_EMAIL` | no | Sender address for Cloudflare Email |
| `TURSO_DATABASE_URL` | no | `libsql://your-db.turso.io` — enables persistent SQLite |
| `TURSO_AUTH_TOKEN` | no | Turso auth token |

Email priority: `RESEND_API_KEY` → `CLOUDFLARE_EMAIL_API_TOKEN` → console log (dev fallback).

---

## Commands

```bash
npm run dev         # dev server (Turbopack, localhost:3000)
npm run build       # production build
npm run lint        # ESLint
npm run db:push     # apply schema to SQLite
npm run db:studio   # Drizzle Studio GUI
npm run setup       # re-run the CLI wizard (same as npx pitos-app)
npm run mcp         # start the MCP server (for Claude Desktop / Code)
```

### Re-running setup

```bash
npx pitos-app --force
```

Overwrites `.env.local` and re-prompts for everything. Use this if you mistype a key or want to reconfigure the domain.

---

## Deployment architecture

PitOS is designed for a Vercel + Cloudflare stack:

```
 user
  │
  ▼
 your-domain.com         ← Cloudflare DNS (CNAME → cname.vercel-dns.com)
  │
  ▼
 Vercel (Next.js)
  │
  ├──► LibSQL / Turso               (persistent SQLite — free 9 GB)
  ├──► Anthropic API                (claude-opus-4-7)
  └──► Resend / Cloudflare Email    (magic-link emails)
```

With Turso, `db/index.ts` connects to your remote LibSQL database — data persists across deployments. Without Turso, it falls back to `/tmp/pitos.db` (ephemeral) and auto-migrates on every cold start. The setup wizard provisions Turso right after deploy.

---

## MCP server

PitOS ships with a Model Context Protocol server so Claude Desktop or Claude Code can read from your team's workspace:

```bash
npx pitos-mcp
```

Expose channels, tasks, decisions, and the ask-search as MCP tools. Add it to your Claude Desktop config under `mcpServers`.

---

## License

MIT. See [LICENSE](LICENSE).

Built with [Claude Opus 4.7](https://anthropic.com) · [Next.js](https://nextjs.org) · [Vercel](https://vercel.com) · [Cloudflare](https://cloudflare.com) · [shadcn/ui](https://ui.shadcn.com)
