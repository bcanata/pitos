import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { db } from "@/db";
import {
  teams,
  memberships,
  channels,
  messages,
  channelMembers,
  users,
} from "@/db/schema";
import { eq, and, isNull, sql } from "drizzle-orm";
import { seedTeamForUser } from "@/lib/seed";

export async function GET() {
  const { user } = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let membership = await db
    .select()
    .from(memberships)
    .where(eq(memberships.userId, user.id))
    .get();

  if (!membership) {
    await seedTeamForUser(user.id);
    membership = (await db
      .select()
      .from(memberships)
      .where(eq(memberships.userId, user.id))
      .get())!;
  }

  const team = (await db.select().from(teams).where(eq(teams.id, membership.teamId)).get())!;
  const teamChannels = await db
    .select()
    .from(channels)
    .where(and(eq(channels.teamId, team.id), isNull(channels.archivedAt)))
    .all();

  // Per-channel last message (one row per channel) + read floors keyed by channel.
  const channelIds = teamChannels.map((c) => c.id);

  const lastMessageRows = channelIds.length
    ? await db
        .select({
          id: messages.id,
          channelId: messages.channelId,
          userId: messages.userId,
          content: messages.content,
          agentGenerated: messages.agentGenerated,
          createdAt: messages.createdAt,
          senderName: users.name,
        })
        .from(messages)
        .leftJoin(users, eq(messages.userId, users.id))
        .where(
          sql`${messages.id} IN (
            SELECT id FROM ${messages} m2
            WHERE m2.channel_id = ${messages.channelId}
            ORDER BY m2.created_at DESC
            LIMIT 1
          )`,
        )
        .all()
    : [];

  const lastByChannel = new Map(lastMessageRows.map((m) => [m.channelId, m]));

  // Read state per channel for this user. Floor = lastReadAt or membership.joinedAt.
  const readRows = channelIds.length
    ? await db
        .select({
          channelId: channelMembers.channelId,
          lastReadAt: channelMembers.lastReadAt,
        })
        .from(channelMembers)
        .where(eq(channelMembers.userId, user.id))
        .all()
    : [];
  const readByChannel = new Map(readRows.map((r) => [r.channelId, r.lastReadAt]));

  // Unread counts: messages.created_at > floor, per channel, excluding messages
  // the user themselves authored (so posting doesn't increment your own unread).
  const floorSeconds = Math.floor(membership.joinedAt.getTime() / 1000);
  const unreadRows = channelIds.length
    ? await db
        .select({
          channelId: messages.channelId,
          count: sql<number>`count(*)`,
        })
        .from(messages)
        .where(
          and(
            sql`${messages.channelId} IN (${sql.join(
              channelIds.map((id) => sql`${id}`),
              sql`, `,
            )})`,
            sql`(${messages.userId} IS NULL OR ${messages.userId} != ${user.id})`,
            sql`${messages.createdAt} > COALESCE(
                  (SELECT last_read_at FROM ${channelMembers} cm
                   WHERE cm.channel_id = ${messages.channelId} AND cm.user_id = ${user.id}),
                  ${floorSeconds}
                )`,
          ),
        )
        .groupBy(messages.channelId)
        .all()
    : [];
  const unreadByChannel = new Map(unreadRows.map((r) => [r.channelId, Number(r.count)]));

  const enrichedChannels = teamChannels.map((c) => {
    const last = lastByChannel.get(c.id);
    const unread = unreadByChannel.get(c.id) ?? 0;
    return {
      ...c,
      unreadCount: unread,
      lastReadAt: readByChannel.get(c.id) ?? null,
      lastMessage: last
        ? {
            id: last.id,
            senderName: last.agentGenerated ? "PitOS" : last.senderName,
            agentGenerated: last.agentGenerated,
            contentPreview: last.content.slice(0, 80),
            createdAt: last.createdAt,
          }
        : null,
    };
  });

  return NextResponse.json({ team, channels: enrichedChannels, membership });
}

export async function PATCH(req: Request) {
  const { user } = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const membership = await db
    .select()
    .from(memberships)
    .where(eq(memberships.userId, user.id))
    .get();
  if (!membership) return NextResponse.json({ error: "No team" }, { status: 404 });

  const body = await req.json();
  const name = typeof body.name === "string" ? body.name.trim() : undefined;
  const number = typeof body.number === "number" ? body.number : undefined;

  if (!name) return NextResponse.json({ error: "name is required" }, { status: 400 });

  await db
    .update(teams)
    .set({ name, ...(number !== undefined ? { number } : {}) })
    .where(eq(teams.id, membership.teamId));

  return NextResponse.json({ ok: true });
}
