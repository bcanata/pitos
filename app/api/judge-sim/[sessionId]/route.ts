import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { isDemoUser } from "@/lib/demo";
import { db } from "@/db";
import { memberships, judgeSessions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { continueJudgeSim } from "@/lib/agents/judge-sim-agent";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { user } = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (isDemoUser(user.email)) return NextResponse.json({ error: "Not available in demo" }, { status: 403 });

  const { sessionId } = await params;

  const body = await req.json();
  const response: string = body?.response?.trim() ?? "";
  if (!response) return NextResponse.json({ error: "response is required" }, { status: 400 });

  const membership = await db
    .select()
    .from(memberships)
    .where(eq(memberships.userId, user.id))
    .get();

  if (!membership) {
    return NextResponse.json({ error: "Not a team member" }, { status: 403 });
  }

  const session = await db
    .select()
    .from(judgeSessions)
    .where(eq(judgeSessions.id, sessionId))
    .get();

  if (!session || session.teamId !== membership.teamId) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  try {
    const result = await continueJudgeSim(sessionId, response);
    return NextResponse.json(result);
  } catch (err) {
    console.error("[judge-sim] continue error:", err);
    return NextResponse.json({ error: "Failed to continue session" }, { status: 500 });
  }
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { user } = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (isDemoUser(user.email)) return NextResponse.json({ error: "Not available in demo" }, { status: 403 });

  const { sessionId } = await params;

  const membership = await db
    .select()
    .from(memberships)
    .where(eq(memberships.userId, user.id))
    .get();

  if (!membership) {
    return NextResponse.json({ error: "Not a team member" }, { status: 403 });
  }

  const session = await db
    .select()
    .from(judgeSessions)
    .where(eq(judgeSessions.id, sessionId))
    .get();

  if (!session || session.teamId !== membership.teamId) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  return NextResponse.json({ session });
}
