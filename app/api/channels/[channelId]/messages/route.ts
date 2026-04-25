import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { db } from "@/db";
import { messages, channels, memberships, users } from "@/db/schema";
import { and, eq, desc, lt } from "drizzle-orm";
import { notifyChannel, notifyTeam } from "@/lib/sse";
import { isDemoUser } from "@/lib/demo";

type Params = { params: Promise<{ channelId: string }> };

const PAGE_SIZE = 50;

export async function GET(req: Request, { params }: Params) {
  const { user } = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { channelId } = await params;

  const url = new URL(req.url);
  const beforeParam = url.searchParams.get("before");
  const beforeDate = beforeParam ? new Date(beforeParam) : null;
  if (beforeDate && Number.isNaN(beforeDate.getTime())) {
    return NextResponse.json({ error: "Invalid `before` cursor" }, { status: 400 });
  }

  const where = beforeDate
    ? and(eq(messages.channelId, channelId), lt(messages.createdAt, beforeDate))
    : eq(messages.channelId, channelId);

  // Fetch one extra row to detect whether more history exists past this page.
  const msgsRaw = await db
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

  const hasMore = msgsRaw.length > PAGE_SIZE;
  const page = hasMore ? msgsRaw.slice(0, PAGE_SIZE) : msgsRaw;
  const msgs = page.reverse();

  return NextResponse.json({ messages: msgs, hasMore });
}

export async function POST(req: Request, { params }: Params) {
  const { user } = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (isDemoUser(user.email)) return NextResponse.json({ error: "Demo users cannot send messages" }, { status: 403 });
  const { channelId } = await params;

  const { content } = await req.json();
  if (!content?.trim()) return NextResponse.json({ error: "Empty message" }, { status: 400 });

  const ch = await db.select().from(channels).where(eq(channels.id, channelId)).get();
  if (!ch) return NextResponse.json({ error: "Channel not found" }, { status: 404 });

  const membership = await db.select().from(memberships).where(eq(memberships.userId, user.id)).get();
  if (!membership) return NextResponse.json({ error: "Not a team member" }, { status: 403 });

  const message = {
    id: crypto.randomUUID(),
    channelId,
    userId: user.id,
    content: content.trim(),
    agentGenerated: false as const,
    createdAt: new Date(),
  };
  await db.insert(messages).values(message);

  triggerChannelAgent(channelId, message.id, membership.teamId, membership.role).catch(console.error);

  const eventData = { ...message, senderName: user.name };
  notifyChannel(channelId, { type: "message", data: eventData });
  notifyTeam(membership.teamId, { type: "message", data: eventData });

  return NextResponse.json({ message });
}

async function triggerChannelAgent(
  channelId: string,
  messageId: string,
  teamId: string,
  role: "lead_mentor" | "mentor" | "captain" | "student",
) {
  const { runChannelAgent } = await import("@/lib/agents/channel-agent");
  await runChannelAgent({ channelId, messageId, teamId, role });
}
