// Server-side data loader shared between
// /api/channels/[channelId]/messages GET and the channel page.
// Same shape, no HTTP round-trip, no cookie forwarding.

import { db } from "@/db";
import { messages, users } from "@/db/schema";
import { and, desc, eq, lt } from "drizzle-orm";

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
};

const PAGE_SIZE = 50;

export async function loadChannelMessages(
  channelId: string,
  opts: { before?: Date | null } = {},
): Promise<{ messages: ChannelMessage[]; hasMore: boolean }> {
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
    })
    .from(messages)
    .leftJoin(users, eq(messages.userId, users.id))
    .where(where)
    .orderBy(desc(messages.createdAt))
    .limit(PAGE_SIZE + 1)
    .all();

  const hasMore = rows.length > PAGE_SIZE;
  const page = hasMore ? rows.slice(0, PAGE_SIZE) : rows;
  return { messages: page.reverse(), hasMore };
}

export { PAGE_SIZE as CHANNEL_MESSAGES_PAGE_SIZE };
