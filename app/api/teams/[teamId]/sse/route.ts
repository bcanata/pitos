import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { db } from "@/db";
import { memberships, messages, channels, tasks, decisions, agentRuns, users } from "@/db/schema";
import { and, eq, gt, inArray } from "drizzle-orm";
import { subscribeTeam } from "@/lib/sse";

export const runtime = "nodejs";

const POLL_INTERVAL_MS = 2_000;

export async function GET(
  req: Request,
  { params }: { params: Promise<{ teamId: string }> },
) {
  const { user } = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { teamId } = await params;
  const membership = await db
    .select()
    .from(memberships)
    .where(and(eq(memberships.userId, user.id), eq(memberships.teamId, teamId)))
    .get();
  if (!membership) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const stream = new ReadableStream({
    async start(controller) {
      const enc = new TextEncoder();
      const sent = new Set<string>();
      const closed = { value: false };

      const send = (event: string) => {
        if (closed.value) return;
        try { controller.enqueue(enc.encode(event)); } catch { closed.value = true; }
      };

      send(": heartbeat\n\n");

      // ─── In-memory pub/sub ────────────────────────────────────────────
      const unsub = subscribeTeam(teamId, (event) => send(event));

      // ─── DB poll fallback ─────────────────────────────────────────────
      // Resolve channel ids for this team once at connect.
      const teamChannelRows = await db
        .select({ id: channels.id, name: channels.name })
        .from(channels)
        .where(eq(channels.teamId, teamId))
        .all();
      const teamChannelIds = teamChannelRows.map((c) => c.id);
      const teamChannelMap = new Map(teamChannelRows.map((c) => [c.id, c.name]));

      let messageFloor = new Date();
      let taskFloor = new Date();
      let taskUpdatedFloor = new Date();
      let decisionFloor = new Date();
      let agentRunFloor = new Date();

      const poll = async () => {
        if (teamChannelIds.length === 0) return;
        try {
          // Messages — join users for senderName.
          const newMsgs = await db
            .select({
              id: messages.id,
              channelId: messages.channelId,
              userId: messages.userId,
              content: messages.content,
              agentGenerated: messages.agentGenerated,
              agentType: messages.agentType,
              juryReflexKind: messages.juryReflexKind,
              createdAt: messages.createdAt,
              senderName: users.name,
            })
            .from(messages)
            .leftJoin(users, eq(messages.userId, users.id))
            .where(and(inArray(messages.channelId, teamChannelIds), gt(messages.createdAt, messageFloor)))
            .all();
          for (const m of newMsgs) {
            if (sent.has("m:" + m.id)) continue;
            sent.add("m:" + m.id);
            send(`data: ${JSON.stringify({ type: "message", data: m })}\n\n`);
            if (m.createdAt > messageFloor) messageFloor = m.createdAt;
          }

          // Tasks created (team-wide).
          const newTasks = await db
            .select()
            .from(tasks)
            .where(and(eq(tasks.teamId, teamId), gt(tasks.createdAt, taskFloor)))
            .all();
          for (const t of newTasks) {
            if (sent.has("tc:" + t.id)) continue;
            sent.add("tc:" + t.id);
            send(`data: ${JSON.stringify({ type: "task_created", data: t })}\n\n`);
            if (t.createdAt > taskFloor) taskFloor = t.createdAt;
          }

          // Task updates: detect via completedAt > floor (covers done transitions).
          // Status flips other than done aren't ts-tracked in the schema, so the
          // notify path remains the canonical channel for those — poll catches
          // "marked done" updates which are the most user-visible.
          const updatedTasks = await db
            .select()
            .from(tasks)
            .where(and(eq(tasks.teamId, teamId), gt(tasks.completedAt, taskUpdatedFloor)))
            .all();
          for (const t of updatedTasks) {
            if (!t.completedAt) continue;
            const key = "tu:" + t.id + ":" + t.completedAt.getTime();
            if (sent.has(key)) continue;
            sent.add(key);
            send(`data: ${JSON.stringify({ type: "task_updated", data: { id: t.id, channelId: t.channelId, status: t.status, completedAt: t.completedAt } })}\n\n`);
            if (t.completedAt > taskUpdatedFloor) taskUpdatedFloor = t.completedAt;
          }

          // Decisions.
          const newDecisions = await db
            .select()
            .from(decisions)
            .where(and(eq(decisions.teamId, teamId), gt(decisions.recordedAt, decisionFloor)))
            .all();
          for (const d of newDecisions) {
            if (sent.has("d:" + d.id)) continue;
            sent.add("d:" + d.id);
            send(`data: ${JSON.stringify({ type: "decision_created", data: { id: d.id, decision: d.decision, decidedAt: d.decidedAt } })}\n\n`);
            if (d.recordedAt > decisionFloor) decisionFloor = d.recordedAt;
          }

          // Agent runs.
          const newRuns = await db
            .select()
            .from(agentRuns)
            .where(and(eq(agentRuns.teamId, teamId), gt(agentRuns.createdAt, agentRunFloor)))
            .all();
          for (const r of newRuns) {
            if (sent.has("ar:" + r.id)) continue;
            sent.add("ar:" + r.id);
            // Try to parse action+reasoning out of the channel-agent's output JSON.
            let action: string | null = null;
            let reasoning: string | null = null;
            let juryReflexKind: string | null = null;
            if (r.output) {
              try {
                const parsed = JSON.parse(r.output.match(/\{[\s\S]*\}/)?.[0] ?? "{}") as {
                  action?: string;
                  reasoning?: string;
                  jury_reflex_kind?: string | null;
                };
                action = parsed.action ?? null;
                reasoning = parsed.reasoning ?? null;
                juryReflexKind = parsed.jury_reflex_kind ?? null;
              } catch {}
            }
            // Find a channelId from inputContext when available.
            let channelId: string | null = null;
            const ic = r.inputContext as { channelId?: string } | null;
            if (ic && typeof ic.channelId === "string") channelId = ic.channelId;
            send(`data: ${JSON.stringify({
              type: "agent_run",
              data: {
                id: r.id,
                channelId,
                channelName: channelId ? teamChannelMap.get(channelId) ?? null : null,
                agentType: r.agentType,
                action,
                juryReflexKind,
                reasoning,
                durationMs: r.durationMs,
              },
            })}\n\n`);
            if (r.createdAt > agentRunFloor) agentRunFloor = r.createdAt;
          }
        } catch (err) {
          console.error("[sse:team poll]", err);
        }
      };

      const pollTimer = setInterval(poll, POLL_INTERVAL_MS);

      const hb = setInterval(() => {
        send(": heartbeat\n\n");
      }, 25_000);

      req.signal.addEventListener("abort", () => {
        closed.value = true;
        unsub();
        clearInterval(hb);
        clearInterval(pollTimer);
        try { controller.close(); } catch {}
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
