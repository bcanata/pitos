// Demo-mode rate limiting.
//
// pitos.8092.tr is a public hackathon demo running on shared Anthropic credits.
// Visitors arrive via magic link and all land in the same Team 8092, so a
// per-team cap is meaningless. We enforce two limits to keep credits from
// running out:
//
//   1. Per-user 24h cap on user-authored messages. Each message triggers
//      exactly one channel-agent run, so counting messages == counting
//      Opus calls (modulo the multi-step @pitos mention path, which is
//      already gated by the 1 message that started it).
//   2. Global 24h cap on agent_runs across all users — a kill switch so
//      a stampede can't drain credits faster than we notice.
//
// Both numbers are env-configurable so we can tune live without redeploy.
// Set RATE_LIMIT_DISABLED=1 to bypass entirely (own-testing).

import { db } from "@/db";
import { agentRuns, messages } from "@/db/schema";
import { and, count, eq, gte, isNotNull } from "drizzle-orm";

const PER_USER_DAILY = Number(process.env.RATE_LIMIT_USER_DAILY ?? 20);
const DEMO_IP_HOURLY = Number(process.env.RATE_LIMIT_DEMO_IP_HOURLY ?? 10);
const DEMO_IP_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const GLOBAL_DAILY = Number(process.env.RATE_LIMIT_GLOBAL_DAILY ?? 2000);
const DISABLED = process.env.RATE_LIMIT_DISABLED !== "0";
const WINDOW_MS = 24 * 60 * 60 * 1000;

export type RateLimitDenial = {
  ok: false;
  reason: "user_daily" | "global_daily";
  used: number;
  limit: number;
};

export type RateLimitResult = { ok: true } | RateLimitDenial;

export async function checkAgentRateLimit(opts: {
  userId?: string;
}): Promise<RateLimitResult> {
  if (DISABLED) return { ok: true };

  const since = new Date(Date.now() - WINDOW_MS);

  if (opts.userId) {
    const rows = await db
      .select({ c: count() })
      .from(messages)
      .where(
        and(eq(messages.userId, opts.userId), gte(messages.createdAt, since)),
      )
      .all();
    const used = Number(rows[0]?.c ?? 0);
    if (used >= PER_USER_DAILY) {
      return { ok: false, reason: "user_daily", used, limit: PER_USER_DAILY };
    }
  }

  const rows = await db
    .select({ c: count() })
    .from(agentRuns)
    .where(gte(agentRuns.createdAt, since))
    .all();
  const used = Number(rows[0]?.c ?? 0);
  if (used >= GLOBAL_DAILY) {
    return { ok: false, reason: "global_daily", used, limit: GLOBAL_DAILY };
  }

  return { ok: true };
}

export function rateLimitMessage(denial: RateLimitDenial): string {
  if (denial.reason === "user_daily") {
    return `Demo limiti: günde ${denial.limit} mesaj. Yarın tekrar deneyin veya kendi instance'ınızı kurun (github.com/bcanata/pitos).`;
  }
  return `Demo günlük toplam limiti doldu (${denial.limit} çağrı/gün). Yarın tekrar deneyin veya kendi instance'ınızı kurun.`;
}

/**
 * Extract the real client IP from a request that may be behind Cloudflare
 * and/or Vercel. Priority:
 *   CF-Connecting-IP  — set by Cloudflare; always the original client IP
 *   X-Real-IP         — set by some reverse proxies
 *   X-Forwarded-For   — leftmost entry is the original client
 *   X-Vercel-Forwarded-For — Vercel's own variant
 * Falls back to "unknown" if none are present (e.g. local dev).
 */
export function extractClientIp(req: Request): string {
  const h = req.headers;
  const cf = h.get("cf-connecting-ip");
  if (cf) return cf.trim();
  const xri = h.get("x-real-ip");
  if (xri) return xri.trim();
  const xff = h.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  const vff = h.get("x-vercel-forwarded-for");
  if (vff) return vff.split(",")[0].trim();
  return "unknown";
}

/**
 * Per-IP hourly cap for the shared demo account. Counts messages with a
 * matching senderIp in the rolling window. Returns ok:false when the cap
 * is reached; the caller should 429 with the returned message.
 */
export async function checkDemoIpRateLimit(
  ip: string,
): Promise<{ ok: true; senderIp: string } | { ok: false; message: string }> {
  if (DISABLED) return { ok: true, senderIp: ip };
  const since = new Date(Date.now() - DEMO_IP_WINDOW_MS);
  const rows = await db
    .select({ c: count() })
    .from(messages)
    .where(
      and(
        eq(messages.senderIp, ip),
        isNotNull(messages.senderIp),
        gte(messages.createdAt, since),
      ),
    )
    .all();
  const used = Number(rows[0]?.c ?? 0);
  if (used >= DEMO_IP_HOURLY) {
    return {
      ok: false,
      message: `Demo limiti: saatte ${DEMO_IP_HOURLY} mesaj. Biraz bekleyin veya kendi instance'ınızı kurun (github.com/bcanata/pitos).`,
    };
  }
  return { ok: true, senderIp: ip };
}
