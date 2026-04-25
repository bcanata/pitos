import { subscribe } from "@/lib/sse";
import { db } from "@/db";
import { messages, tasks, decisions } from "@/db/schema";
import { eq, gt, and } from "drizzle-orm";

export const runtime = "nodejs"; // SSE needs Node.js runtime

const POLL_INTERVAL_MS = 2_000;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ channelId: string }> },
) {
  const { channelId } = await params;

  const stream = new ReadableStream({
    async start(controller) {
      const enc = new TextEncoder();
      const sent = new Set<string>(); // dedup ids we've already pushed
      const closed = { value: false };

      const send = (event: string) => {
        if (closed.value) return;
        try { controller.enqueue(enc.encode(event)); } catch { closed.value = true; }
      };

      send(": heartbeat\n\n");

      // ─── In-memory pub/sub (same-instance, instant) ────────────────────
      const unsub = subscribe(channelId, (event) => {
        // Best-effort dedup against poll path: poll uses ids, in-memory is opaque.
        // If we wrap poll-emitted events with the same shape, both paths converge
        // on the client setMessages() dedup-by-id.
        send(event);
      });

      // ─── DB poll fallback (cross-instance, ~2s latency) ────────────────
      // Initial floor: now() so we don't replay history on connect.
      let messageFloor = new Date();
      let taskFloor = new Date();
      let decisionFloor = new Date();

      const poll = async () => {
        try {
          const newMsgs = await db
            .select()
            .from(messages)
            .where(and(eq(messages.channelId, channelId), gt(messages.createdAt, messageFloor)))
            .all();
          for (const m of newMsgs) {
            if (sent.has("m:" + m.id)) continue;
            sent.add("m:" + m.id);
            send(`data: ${JSON.stringify({ type: "message", data: m })}\n\n`);
            if (m.createdAt > messageFloor) messageFloor = m.createdAt;
          }

          const newTasks = await db
            .select()
            .from(tasks)
            .where(and(eq(tasks.channelId, channelId), gt(tasks.createdAt, taskFloor)))
            .all();
          for (const t of newTasks) {
            if (sent.has("t:" + t.id)) continue;
            sent.add("t:" + t.id);
            send(`data: ${JSON.stringify({ type: "task_created", data: t })}\n\n`);
            if (t.createdAt > taskFloor) taskFloor = t.createdAt;
          }

          // Decisions are team-scoped — only push if any reference this channel
          // via sourceMessageId belonging here. Cheaper: skip channel-poll for
          // decisions; they go through the team SSE which polls too.
          void decisionFloor;
        } catch (err) {
          console.error("[sse:channel poll]", err);
        }
      };

      const pollTimer = setInterval(poll, POLL_INTERVAL_MS);

      const hb = setInterval(() => {
        send(": heartbeat\n\n");
      }, 25_000);

      _req.signal.addEventListener("abort", () => {
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
