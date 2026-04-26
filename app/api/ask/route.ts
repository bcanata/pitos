import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { db } from "@/db";
import { memberships } from "@/db/schema";
import { eq } from "drizzle-orm";
import { runMemoryAgent } from "@/lib/agents/memory-agent";
import { checkAgentRateLimit, rateLimitMessage } from "@/lib/agents/rate-limit";

export async function POST(req: Request) {
  const { user } = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const query: string = body?.query?.trim() ?? "";
  if (!query) return NextResponse.json({ error: "query is required" }, { status: 400 });

  const membership = await db
    .select()
    .from(memberships)
    .where(eq(memberships.userId, user.id))
    .get();

  if (!membership) {
    return NextResponse.json({ error: "Not a team member" }, { status: 403 });
  }

  const limit = await checkAgentRateLimit({ userId: user.id });
  if (!limit.ok) {
    return NextResponse.json(
      { error: "rate_limited", reason: limit.reason, message: rateLimitMessage(limit) },
      { status: 429 },
    );
  }

  const result = await runMemoryAgent(query, membership.teamId);
  return NextResponse.json(result);
}
