import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { db } from "@/db";
import { memberships } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { subscribeTeam } from "@/lib/sse";

export const runtime = "nodejs";

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
    start(controller) {
      const enc = new TextEncoder();
      controller.enqueue(enc.encode(": heartbeat\n\n"));

      const unsub = subscribeTeam(teamId, (event) => {
        try { controller.enqueue(enc.encode(event)); } catch {}
      });

      const hb = setInterval(() => {
        try { controller.enqueue(enc.encode(": heartbeat\n\n")); } catch { clearInterval(hb); }
      }, 25_000);

      req.signal.addEventListener("abort", () => {
        unsub();
        clearInterval(hb);
        try { controller.close(); } catch {}
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}
