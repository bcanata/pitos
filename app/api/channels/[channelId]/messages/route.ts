import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { db } from "@/db";
import { messages, channels, memberships, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { notifyChannel, notifyTeam } from "@/lib/sse";
import { isDemoUser } from "@/lib/demo";

type Params = { params: Promise<{ channelId: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { user } = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { channelId } = await params;

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
    .where(eq(messages.channelId, channelId))
    .orderBy(desc(messages.createdAt))
    .limit(50)
    .all();
  const msgs = msgsRaw.reverse();

  return NextResponse.json({ messages: msgs });
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
