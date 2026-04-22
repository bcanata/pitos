import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { db } from "@/db";
import { messages, channels, memberships } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { notifyChannel } from "@/lib/sse";

type Params = { params: Promise<{ channelId: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { user } = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { channelId } = await params;

  const msgs = db.select().from(messages)
    .where(eq(messages.channelId, channelId))
    .orderBy(desc(messages.createdAt))
    .limit(50)
    .all()
    .reverse(); // oldest first for display

  return NextResponse.json({ messages: msgs });
}

export async function POST(req: Request, { params }: Params) {
  const { user } = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { channelId } = await params;

  const { content } = await req.json();
  if (!content?.trim()) return NextResponse.json({ error: "Empty message" }, { status: 400 });

  const ch = db.select().from(channels).where(eq(channels.id, channelId)).get();
  if (!ch) return NextResponse.json({ error: "Channel not found" }, { status: 404 });

  const membership = db.select().from(memberships).where(eq(memberships.userId, user.id)).get();
  if (!membership) return NextResponse.json({ error: "Not a team member" }, { status: 403 });

  const message = {
    id: crypto.randomUUID(),
    channelId,
    userId: user.id,
    content: content.trim(),
    agentGenerated: false as const,
    createdAt: new Date(),
  };
  db.insert(messages).values(message).run();

  // Fire channel agent async (don't await — don't block the response)
  triggerChannelAgent(channelId, message.id, membership.teamId).catch(console.error);

  // Notify SSE subscribers
  notifyChannel(channelId, { type: "message", data: message });

  return NextResponse.json({ message });
}

async function triggerChannelAgent(channelId: string, messageId: string, teamId: string) {
  // Dynamic import to avoid circular deps
  const { runChannelAgent } = await import("@/lib/agents/channel-agent");
  await runChannelAgent({ channelId, messageId, teamId });
}
