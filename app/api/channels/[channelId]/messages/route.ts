import { NextResponse } from "next/server";
import { db } from "@/db";
import { messages } from "@/db/schema";
import { notifyChannel, notifyTeam } from "@/lib/sse";
import { displayName, isDemoUser } from "@/lib/demo";
import { loadChannelMessages } from "@/lib/data/messages";
import { requireChannelAccess, scopeErrorResponse } from "@/lib/auth/scope";
import { enqueueChannelAgentJob } from "@/lib/agents/job-queue";
import { checkAgentRateLimit, rateLimitMessage } from "@/lib/agents/rate-limit";

type Params = { params: Promise<{ channelId: string }> };

export async function GET(req: Request, { params }: Params) {
  const { channelId } = await params;
  try {
    await requireChannelAccess(channelId);
  } catch (e) {
    const r = scopeErrorResponse(e);
    if (r) return r;
    throw e;
  }

  const url = new URL(req.url);
  const beforeParam = url.searchParams.get("before");
  const beforeDate = beforeParam ? new Date(beforeParam) : null;
  if (beforeDate && Number.isNaN(beforeDate.getTime())) {
    return NextResponse.json({ error: "Invalid `before` cursor" }, { status: 400 });
  }

  const result = await loadChannelMessages(channelId, { before: beforeDate });
  return NextResponse.json(result);
}

export async function POST(req: Request, { params }: Params) {
  const { channelId } = await params;

  let user, membership;
  try {
    ({ user, membership } = await requireChannelAccess(channelId));
  } catch (e) {
    const r = scopeErrorResponse(e);
    if (r) return r;
    throw e;
  }

  if (isDemoUser(user.email)) {
    return NextResponse.json({ error: "Demo users cannot send messages" }, { status: 403 });
  }

  const { content } = await req.json();
  if (!content?.trim()) return NextResponse.json({ error: "Empty message" }, { status: 400 });

  const limit = await checkAgentRateLimit({ userId: user.id });
  if (!limit.ok) {
    return NextResponse.json(
      {
        error: "rate_limited",
        reason: limit.reason,
        used: limit.used,
        limit: limit.limit,
        message: rateLimitMessage(limit),
      },
      { status: 429 },
    );
  }

  const message = {
    id: crypto.randomUUID(),
    channelId,
    userId: user.id,
    content: content.trim(),
    agentGenerated: false as const,
    createdAt: new Date(),
  };
  await db.insert(messages).values(message);

  // Persist the agent job to agent_runs as status=queued and best-effort
  // start it inline. If this instance is torn down before the agent
  // finishes, the row stays queued/running; the cron at /api/cron/agent-jobs
  // picks it up and runs (or retries) in another instance.
  await enqueueChannelAgentJob({
    teamId: membership.teamId,
    channelId,
    messageId: message.id,
    role: membership.role,
  });

  const eventData = {
    ...message,
    senderName: displayName(user.name),
    authorRole: membership.role,
    deletedAt: null,
    deletedByUserId: null,
    deletedByName: null,
  };
  notifyChannel(channelId, { type: "message", data: eventData });
  notifyTeam(membership.teamId, { type: "message", data: eventData });

  return NextResponse.json({ message: eventData });
}
