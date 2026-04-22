import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { db } from "@/db";
import { memberships, judgeSessions } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { startJudgeSim } from "@/lib/agents/judge-sim-agent";

export async function POST(req: Request) {
  const { user } = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const award: string = body?.award?.trim() ?? "";
  if (!award) return NextResponse.json({ error: "award is required" }, { status: 400 });

  const membership = db
    .select()
    .from(memberships)
    .where(eq(memberships.userId, user.id))
    .get();

  if (!membership) {
    return NextResponse.json({ error: "Not a team member" }, { status: 403 });
  }

  try {
    const result = await startJudgeSim(membership.teamId, user.id, award);
    return NextResponse.json(result);
  } catch (err) {
    console.error("[judge-sim] start error:", err);
    return NextResponse.json({ error: "Failed to start session" }, { status: 500 });
  }
}

export async function GET() {
  const { user } = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const membership = db
    .select()
    .from(memberships)
    .where(eq(memberships.userId, user.id))
    .get();

  if (!membership) {
    return NextResponse.json({ error: "Not a team member" }, { status: 403 });
  }

  const sessions = db
    .select()
    .from(judgeSessions)
    .where(eq(judgeSessions.teamId, membership.teamId))
    .orderBy(desc(judgeSessions.startedAt))
    .limit(10)
    .all();

  return NextResponse.json({ sessions });
}
