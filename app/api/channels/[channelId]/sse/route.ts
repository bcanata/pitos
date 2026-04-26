import { subscribe } from "@/lib/sse";
import { db } from "@/db";
import { messages, tasks, users } from "@/db/schema";
import { eq, gt, and, isNotNull } from "drizzle-orm";
import { alias } from "drizzle-orm/sqlite-core";
import { displayName } from "@/lib/demo";

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
      let deleteFloor = new Date();

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

          // Soft deletes: poll for rows whose deletedAt has crossed the
          // floor since last tick. We only need id + deletedAt + deleter
          // name on the wire; the client patches its existing in-memory row.
          const deleter = alias(users, "deleter");
          const newDeletes = await db
            .select({
              id: messages.id,
              channelId: messages.channelId,
              deletedAt: messages.deletedAt,
              deletedByUserId: messages.deletedByUserId,
              deletedByName: deleter.name,
            })
            .from(messages)
            .leftJoin(deleter, eq(messages.deletedByUserId, deleter.id))
            .where(
              and(
                eq(messages.channelId, channelId),
                isNotNull(messages.deletedAt),
                gt(messages.deletedAt, deleteFloor),
              ),
            )
            .all();
          for (const d of newDeletes) {
            const dedupKey = "d:" + d.id;
            if (sent.has(dedupKey)) continue;
            sent.add(dedupKey);
            send(
              `data: ${JSON.stringify({
                type: "message_deleted",
                data: {
                  id: d.id,
                  channelId: d.channelId,
                  deletedAt: d.deletedAt,
                  deletedByUserId: d.deletedByUserId,
                  deletedByName: displayName(d.deletedByName),
                },
              })}\n\n`,
            );
            if (d.deletedAt && d.deletedAt > deleteFloor) deleteFloor = d.deletedAt;
          }

          // Decisions are team-scoped, not channel-scoped — they reach the
          // sidebar via the team SSE poll instead of this one.
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
