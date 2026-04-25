import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { db } from "@/db";
import { channelMembers, channels, memberships } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { randomUUID } from "crypto";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ channelId: string }> },
) {
  const { user } = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { channelId } = await params;

  const channel = await db.select().from(channels).where(eq(channels.id, channelId)).get();
  if (!channel) return NextResponse.json({ error: "Channel not found" }, { status: 404 });

  const membership = await db
    .select()
    .from(memberships)
    .where(and(eq(memberships.userId, user.id), eq(memberships.teamId, channel.teamId)))
    .get();
  if (!membership) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const now = new Date();
  const existing = await db
    .select()
    .from(channelMembers)
    .where(and(eq(channelMembers.channelId, channelId), eq(channelMembers.userId, user.id)))
    .get();

  if (existing) {
    await db
      .update(channelMembers)
      .set({ lastReadAt: now })
      .where(eq(channelMembers.id, existing.id));
  } else {
    await db.insert(channelMembers).values({
      id: randomUUID(),
      channelId,
      userId: user.id,
      joinedAt: now,
      lastReadAt: now,
    });
  }

  return new Response(null, { status: 204 });
}
