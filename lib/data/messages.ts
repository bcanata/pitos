// Server-side data loader shared between
// /api/channels/[channelId]/messages GET and the channel page.
// Same shape, no HTTP round-trip, no cookie forwarding.

import { db } from "@/db";
import { channels, memberships, messages, users } from "@/db/schema";
import { and, desc, eq, lt } from "drizzle-orm";
import { alias } from "drizzle-orm/sqlite-core";
import type { ActiveRole } from "@/lib/auth/rank";
import { displayName } from "@/lib/demo";

export type ChannelMessage = {
  id: string;
  channelId: string;
  userId: string | null;
  content: string;
  agentGenerated: boolean;
  agentType: string | null;
  juryReflexKind: string | null;
  metadata: unknown;
  createdAt: Date;
  senderName: string | null;
  // Author's role inside the channel's team. Null when agent-authored or
  // the author no longer has an active membership; the rank check treats
  // null as "below student" so any non-student can clear it.
  authorRole: ActiveRole | null;
  // Soft-delete fields. When deletedAt is set the bubble renders a
  // tombstone; deletedByName surfaces who pulled the trigger.
  deletedAt: Date | null;
  deletedByUserId: string | null;
  deletedByName: string | null;
};

const PAGE_SIZE = 50;

export async function loadChannelMessages(
  channelId: string,
  opts: { before?: Date | null } = {},
): Promise<{ messages: ChannelMessage[]; hasMore: boolean }> {
  // Aliases so the second `users` join (the deleter) doesn't collide with
  // the first (the author).
  const deleter = alias(users, "deleter");

  const where = opts.before
    ? and(eq(messages.channelId, channelId), lt(messages.createdAt, opts.before))
    : eq(messages.channelId, channelId);

  // Fetch one extra row to detect whether more history exists past this page.
  const rows = await db
    .select({
      id: messages.id,
      channelId: messages.channelId,
      userId: messages.userId,
      content: messages.content,
      agentGenerated: messages.agentGenerated,
      agentType: messages.agentType,
      juryReflexKind: messages.juryReflexKind,
      metadata: messages.metadata,
      createdAt: messages.createdAt,
      senderName: users.name,
      authorRole: memberships.role,
      deletedAt: messages.deletedAt,
      deletedByUserId: messages.deletedByUserId,
      deletedByName: deleter.name,
    })
    .from(messages)
    .leftJoin(users, eq(messages.userId, users.id))
    .leftJoin(channels, eq(messages.channelId, channels.id))
    .leftJoin(
      memberships,
      and(eq(memberships.userId, messages.userId), eq(memberships.teamId, channels.teamId)),
    )
    .leftJoin(deleter, eq(messages.deletedByUserId, deleter.id))
    .where(where)
    .orderBy(desc(messages.createdAt))
    .limit(PAGE_SIZE + 1)
    .all();

  const hasMore = rows.length > PAGE_SIZE;
  const page = hasMore ? rows.slice(0, PAGE_SIZE) : rows;
  return {
    messages: page.reverse().map((r) => ({
      ...r,
      authorRole: (r.authorRole as ActiveRole | null) ?? null,
      // Mask user-authored sender names + deleter names on the demo instance.
      // Agent messages have userId === null so senderName is also null here;
      // the channel-view fills "PitOS" in for them and stays unmasked.
      senderName: displayName(r.senderName),
      deletedByName: displayName(r.deletedByName),
    })),
    hasMore,
  };
}

export { PAGE_SIZE as CHANNEL_MESSAGES_PAGE_SIZE };
