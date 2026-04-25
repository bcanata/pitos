import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { db } from "@/db";
import { messages, channels, memberships } from "@/db/schema";
import { eq, and } from "drizzle-orm";

// GET /api/messages/{id}/locate
// Resolve a bare message id → { channelId, channelName, teamId } so a
// citation chip in the message bubble can navigate to it. Membership-gated:
// the caller must be on the team that owns the channel.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { user } = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const row = await db
    .select({
      messageId: messages.id,
      channelId: channels.id,
      channelName: channels.name,
      teamId: channels.teamId,
    })
    .from(messages)
    .innerJoin(channels, eq(messages.channelId, channels.id))
    .where(eq(messages.id, id))
    .get();

  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const membership = await db
    .select()
    .from(memberships)
    .where(and(eq(memberships.userId, user.id), eq(memberships.teamId, row.teamId)))
    .get();
  if (!membership) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({
    messageId: row.messageId,
    channelId: row.channelId,
    channelName: row.channelName,
  });
}
