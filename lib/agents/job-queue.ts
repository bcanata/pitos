// Persistent agent-job queue.
//
// Why this exists: the previous design fired triggerChannelAgent(...) as a
// detached promise after returning from the messages POST. On Vercel Fluid
// Compute the function instance can be torn down once the response is sent,
// killing the agent mid-stream. The user sees their message, no reply, no
// trail — and we can't recover because the failure was logged to a stdout
// that's already gone.
//
// New design:
//
//   1. The POST handler enqueues a row in `agent_runs` with status='queued'.
//      That row is durable: it survives function teardown.
//
//   2. We also kick off `processAgentJob(jobId)` synchronously before
//      returning the response — so on the happy path the agent runs in the
//      same instance with no extra latency. The fire-and-forget is now
//      best-effort optimization, not the only path.
//
//   3. A cron worker (`/api/cron/agent-jobs`) runs every minute.
//      `processQueue()` finds:
//        - status='queued' AND nextAttemptAt <= now (never started)
//        - status='running' AND nextAttemptAt <= now (claimed by a worker
//          that died — lockedUntil expired)
//        - status='failed' AND attempts < MAX AND nextAttemptAt <= now
//          (eligible retry)
//      For each, it atomic-claims (UPDATE … RETURNING with WHERE that
//      checks the prior state) and runs.
//
//   4. The agent itself updates the row at completion — `runChannelAgent`
//      now takes an optional `jobId` and UPDATEs the existing row instead
//      of inserting a new trace. Single source of truth in the UI.
//
// Retries are not idempotent — the channel agent posts messages and creates
// tasks. A retry after a partial run can produce duplicates. Acceptable
// trade-off: we'd rather post twice than swallow a job. MAX_ATTEMPTS = 3
// keeps the blast radius small.

import { db } from "@/db";
import { agentRuns } from "@/db/schema";
import { and, eq, lt, lte, or, asc } from "drizzle-orm";
import { randomUUID } from "crypto";
import { notifyTeam } from "@/lib/sse";

export const MAX_ATTEMPTS = 3;
const RUN_LOCK_MS = 5 * 60 * 1000; // 5 min: how long a claim is "locked".
const RETRY_BACKOFF_BASE_MS = 30 * 1000; // 30s base, exponential.

export interface ChannelAgentJobInput {
  teamId: string;
  channelId: string;
  messageId: string;
  role: "lead_mentor" | "mentor" | "captain" | "student";
}

export type AgentRun = typeof agentRuns.$inferSelect;

/**
 * Insert a queued job row and kick off processing. Returns immediately
 * (synchronously) once the row is durable; the run executes in the
 * background. The caller doesn't need to await anything else — even if
 * this process dies, the cron will pick the row up.
 */
export async function enqueueChannelAgentJob(
  input: ChannelAgentJobInput,
): Promise<string> {
  const id = randomUUID();
  const now = new Date();
  await db.insert(agentRuns).values({
    id,
    teamId: input.teamId,
    trigger: `message:${input.messageId}`,
    agentType: "channel",
    status: "queued",
    inputContext: input as unknown as null,
    attempts: 0,
    nextAttemptAt: now, // eligible immediately
    createdAt: now,
  });

  // SSE so the activity panel sees the queued state right away.
  notifyTeam(input.teamId, {
    type: "agent_run",
    data: {
      id,
      channelId: input.channelId,
      agentType: "channel",
      status: "queued",
      action: "queued",
      attempts: 0,
      reasoning: null,
      durationMs: null,
    },
  });

  // Best-effort fast path. Failures here are caught — the cron is the
  // safety net.
  void processAgentJob(id).catch((err) => {
    console.error(`[job-queue] inline processAgentJob(${id}) failed:`, err);
  });

  return id;
}

/**
 * Atomically claim a job and run it. Returns true if we processed the
 * job (success or final failure), false if we couldn't claim (someone
 * else has it, or it's already done).
 */
export async function processAgentJob(jobId: string): Promise<boolean> {
  const now = new Date();
  const lockedUntil = new Date(now.getTime() + RUN_LOCK_MS);

  // Atomic claim: only flip queued→running or stuck-running→running or
  // ready-failed→running. .returning() so we know whether we got it.
  const claimed = await db
    .update(agentRuns)
    .set({
      status: "running",
      nextAttemptAt: lockedUntil,
    })
    .where(
      and(
        eq(agentRuns.id, jobId),
        or(
          and(eq(agentRuns.status, "queued"), lte(agentRuns.nextAttemptAt, now)),
          and(eq(agentRuns.status, "running"), lte(agentRuns.nextAttemptAt, now)),
          and(
            eq(agentRuns.status, "failed"),
            lt(agentRuns.attempts, MAX_ATTEMPTS),
            lte(agentRuns.nextAttemptAt, now),
          ),
        ),
      ),
    )
    .returning();

  if (claimed.length === 0) return false;

  const job = claimed[0];
  const ctx = job.inputContext as unknown as ChannelAgentJobInput;
  const teamId = job.teamId ?? ctx.teamId;
  const newAttempts = job.attempts + 1;

  // Notify state transition: queued → running
  notifyTeam(teamId, {
    type: "agent_run",
    data: {
      id: job.id,
      channelId: ctx.channelId,
      agentType: "channel",
      status: "running",
      action: "running",
      attempts: newAttempts,
      reasoning: null,
      durationMs: null,
    },
  });

  // Bump the attempts counter so retries are visible even before completion.
  await db
    .update(agentRuns)
    .set({ attempts: newAttempts })
    .where(eq(agentRuns.id, job.id));

  try {
    const { runChannelAgent } = await import("./channel-agent");
    await runChannelAgent({
      channelId: ctx.channelId,
      messageId: ctx.messageId,
      teamId: ctx.teamId,
      role: ctx.role,
      jobId: job.id,
    });
    // runChannelAgent has already updated the row to status='completed'
    // with output / tokensUsed / durationMs. Nothing to do here.
    return true;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const finalFail = newAttempts >= MAX_ATTEMPTS;
    const nextAttempt = finalFail
      ? null
      : new Date(Date.now() + RETRY_BACKOFF_BASE_MS * Math.pow(2, newAttempts - 1));
    await db
      .update(agentRuns)
      .set({
        status: "failed",
        lastError: message.slice(0, 500),
        nextAttemptAt: nextAttempt,
      })
      .where(eq(agentRuns.id, job.id));

    notifyTeam(teamId, {
      type: "agent_run",
      data: {
        id: job.id,
        channelId: ctx.channelId,
        agentType: "channel",
        status: "failed",
        action: finalFail ? "failed" : "retrying",
        attempts: newAttempts,
        reasoning: message.slice(0, 200),
        durationMs: null,
        nextAttemptAt: nextAttempt?.toISOString() ?? null,
      },
    });
    return true;
  }
}

/**
 * Cron entry point. Scans for eligible jobs and processes them serially
 * (one per tick is fine — each Anthropic call is the bottleneck, not the
 * worker loop). Returns counts for observability.
 */
export async function processQueue(): Promise<{ scanned: number; processed: number }> {
  const now = new Date();

  const candidates = await db
    .select()
    .from(agentRuns)
    .where(
      or(
        and(eq(agentRuns.status, "queued"), lte(agentRuns.nextAttemptAt, now)),
        and(eq(agentRuns.status, "running"), lte(agentRuns.nextAttemptAt, now)),
        and(
          eq(agentRuns.status, "failed"),
          lt(agentRuns.attempts, MAX_ATTEMPTS),
          lte(agentRuns.nextAttemptAt, now),
        ),
      ),
    )
    .orderBy(asc(agentRuns.nextAttemptAt))
    .limit(20)
    .all();

  let processed = 0;
  for (const c of candidates) {
    const ok = await processAgentJob(c.id);
    if (ok) processed++;
  }

  return { scanned: candidates.length, processed };
}
