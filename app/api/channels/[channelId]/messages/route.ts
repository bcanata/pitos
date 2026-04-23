import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { db } from "@/db";
import { messages, channels, memberships } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { notifyChannel } from "@/lib/sse";
import { isDemoUser } from "@/lib/demo";

type Params = { params: Promise<{ channelId: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { user } = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { channelId } = await params;

  const msgsRaw = await db.select().from(messages)
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

  notifyChannel(channelId, { type: "message", data: message });

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
