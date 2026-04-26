// Server-side data loader shared between /api/teams/mine GET and the workspace
// layout / channel page. Avoids a self-fetch from server components.

import { db } from "@/db";
import {
  teams,
  memberships,
  channels,
  messages,
  channelMembers,
  users,
} from "@/db/schema";
import { and, asc, eq, isNull, sql } from "drizzle-orm";
import { seedTeamForUser } from "@/lib/seed";

/**
 * Thrown by `loadTeamWorkspace` when the user has a membership but it's still
 * `pending`. The workspace layout catches this and redirects to the
 * "waiting for approval" view.
 */
export class MembershipPendingError extends Error {
  constructor() {
    super("Membership pending approval");
    this.name = "MembershipPendingError";
  }
}

export type Team = typeof teams.$inferSelect;
export type Membership = typeof memberships.$inferSelect;
export type Channel = typeof channels.$inferSelect;

export type ChannelLastMessage = {
  id: string;
  senderName: string | null;
  agentGenerated: boolean;
  contentPreview: string;
  createdAt: Date;
};

export type EnrichedChannel = Channel & {
  unreadCount: number;
  lastReadAt: Date | null;
  lastMessage: ChannelLastMessage | null;
};

export type TeamWorkspaceData = {
  team: Team;
  channels: EnrichedChannel[];
  membership: Membership;
};

/**
 * Load the team workspace payload (team, channels, membership) for a user.
 *
 * Branches:
 *   - Active membership → return team workspace (normal path).
 *   - Pending membership → throw MembershipPendingError so the layout can
 *     redirect to the waiting-for-approval view.
 *   - No membership at all:
 *       - Zero teams in DB → seed founder team (this is the very first user
 *         on a fresh instance, the "fork & deploy" path).
 *       - One or more teams → create a `pending` membership against the
 *         oldest team and throw MembershipPendingError. Self-signed-in users
 *         can't sneak past the approval gate.
 */
export async function loadTeamWorkspace(userId: string): Promise<TeamWorkspaceData> {
  let membership = await db
    .select()
    .from(memberships)
    .where(eq(memberships.userId, userId))
    .get();

  if (!membership) {
    const existingTeam = await db
      .select()
      .from(teams)
      .orderBy(asc(teams.createdAt))
      .get();

    if (!existingTeam) {
      // First user of a fresh instance — they become the founder.
      await seedTeamForUser(userId);
      membership = (await db
        .select()
        .from(memberships)
        .where(eq(memberships.userId, userId))
        .get())!;
    } else {
      // A team already exists. Self-signed-in users land as `pending`
      // against the founding team and wait for a lead_mentor / captain
      // to approve them.
      await db.insert(memberships).values({
        id: crypto.randomUUID(),
        userId,
        teamId: existingTeam.id,
        role: "student",
        joinedAt: new Date(),
        status: "pending",
      });
      throw new MembershipPendingError();
    }
  } else if (membership.status === "pending") {
    throw new MembershipPendingError();
  }

  const team = (await db.select().from(teams).where(eq(teams.id, membership.teamId)).get())!;

  const teamChannels = await db
    .select()
    .from(channels)
    .where(and(eq(channels.teamId, team.id), isNull(channels.archivedAt)))
    .all();

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

  const readRows = channelIds.length
    ? await db
        .select({
          channelId: channelMembers.channelId,
          lastReadAt: channelMembers.lastReadAt,
        })
        .from(channelMembers)
        .where(eq(channelMembers.userId, userId))
        .all()
    : [];
  const readByChannel = new Map(readRows.map((r) => [r.channelId, r.lastReadAt]));

  // Floor for "what counts as unread": user's lastReadAt for the channel,
  // falling back to the timestamp they joined the team. Excludes their own
  // messages (so posting doesn't bump your own unread badge).
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
            sql`(${messages.userId} IS NULL OR ${messages.userId} != ${userId})`,
            sql`${messages.createdAt} > COALESCE(
                  (SELECT last_read_at FROM ${channelMembers} cm
                   WHERE cm.channel_id = ${messages.channelId} AND cm.user_id = ${userId}),
                  ${floorSeconds}
                )`,
          ),
        )
        .groupBy(messages.channelId)
        .all()
    : [];
  const unreadByChannel = new Map(unreadRows.map((r) => [r.channelId, Number(r.count)]));

  const enrichedChannels: EnrichedChannel[] = teamChannels.map((c) => {
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

  return { team, channels: enrichedChannels, membership };
}
