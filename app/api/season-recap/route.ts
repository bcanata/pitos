import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { db } from "@/db";
import { memberships, generatedDocuments } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { runSeasonRecap } from "@/lib/agents/season-recap-agent";

export async function GET() {
  const { user } = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const membership = db.select().from(memberships).where(eq(memberships.userId, user.id)).get();
  if (!membership) return NextResponse.json({ error: "Not a team member" }, { status: 403 });

  const doc = db
    .select()
    .from(generatedDocuments)
    .where(eq(generatedDocuments.teamId, membership.teamId))
    .orderBy(desc(generatedDocuments.createdAt))
    .get();

  if (!doc || doc.docType !== "season_recap") {
    // Check if any season_recap exists
    const recap = db
      .select()
      .from(generatedDocuments)
      .where(eq(generatedDocuments.teamId, membership.teamId))
      .all()
      .find((d) => d.docType === "season_recap");

    return NextResponse.json({ document: recap ?? null });
  }

  return NextResponse.json({ document: doc });
}

export async function POST() {
  const { user } = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const membership = db.select().from(memberships).where(eq(memberships.userId, user.id)).get();
  if (!membership) return NextResponse.json({ error: "Not a team member" }, { status: 403 });

  // Fire and forget
  runSeasonRecap(membership.teamId).catch(console.error);

  return NextResponse.json({
    message: "Season recap is being generated. Check back in a minute.",
  });
}
