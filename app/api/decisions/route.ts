import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { db } from "@/db";
import { decisions, memberships, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { randomUUID } from "crypto";

export async function GET() {
  const { user } = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const membership = db.select().from(memberships).where(eq(memberships.userId, user.id)).get();
  if (!membership) return NextResponse.json({ error: "Not a team member" }, { status: 403 });

  const rows = db
    .select()
    .from(decisions)
    .where(eq(decisions.teamId, membership.teamId))
    .orderBy(desc(decisions.recordedAt))
    .all();

  // For each decision, look up the recording user via sourceMessageId is not available here —
  // decisions table has no recordedByUserId column. We'll attach team-level info.
  // The schema doesn't have a recordedByUserId column, so we return rows as-is.
  return NextResponse.json({ decisions: rows });
}

export async function POST(req: Request) {
  const { user } = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const membership = db.select().from(memberships).where(eq(memberships.userId, user.id)).get();
  if (!membership) return NextResponse.json({ error: "Not a team member" }, { status: 403 });

  const body = (await req.json()) as {
    title?: string;
    rationale?: string;
    alternativesConsidered?: string;
    contextAtTime?: string;
  };

  if (!body.title) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }

  const now = new Date();
  const id = randomUUID();

  db.insert(decisions)
    .values({
      id,
      teamId: membership.teamId,
      decision: body.title,
      rationale: body.rationale ?? null,
      alternativesConsidered: body.alternativesConsidered ?? null,
      contextAtTime: body.contextAtTime ?? null,
      decidedAt: now,
      recordedAt: now,
    })
    .run();

  const inserted = db.select().from(decisions).where(eq(decisions.id, id)).get();
  return NextResponse.json({ decision: inserted }, { status: 201 });
}
