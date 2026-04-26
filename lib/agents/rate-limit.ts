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
import { and, count, eq, gte } from "drizzle-orm";

const PER_USER_DAILY = Number(process.env.RATE_LIMIT_USER_DAILY ?? 20);
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
