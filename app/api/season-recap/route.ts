import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { isDemoUser } from "@/lib/demo";
import { db } from "@/db";
import { memberships, generatedDocuments } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { runSeasonRecap } from "@/lib/agents/season-recap-agent";
import { checkAgentRateLimit, rateLimitMessage } from "@/lib/agents/rate-limit";

export async function GET() {
  const { user } = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (isDemoUser(user.email)) return NextResponse.json({ error: "Not available in demo" }, { status: 403 });

  const membership = await db.select().from(memberships).where(eq(memberships.userId, user.id)).get();
  if (!membership) return NextResponse.json({ error: "Not a team member" }, { status: 403 });

  const doc = await db
    .select()
    .from(generatedDocuments)
    .where(eq(generatedDocuments.teamId, membership.teamId))
    .orderBy(desc(generatedDocuments.createdAt))
    .get();

  if (!doc || doc.docType !== "season_recap") {
    const allDocs = await db
      .select()
      .from(generatedDocuments)
      .where(eq(generatedDocuments.teamId, membership.teamId))
      .all();
    const recap = allDocs.find((d) => d.docType === "season_recap");
    return NextResponse.json({ document: recap ?? null });
  }

  return NextResponse.json({ document: doc });
}

export async function POST() {
  const { user } = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (isDemoUser(user.email)) return NextResponse.json({ error: "Not available in demo" }, { status: 403 });

  const membership = await db.select().from(memberships).where(eq(memberships.userId, user.id)).get();
  if (!membership) return NextResponse.json({ error: "Not a team member" }, { status: 403 });

  const limit = await checkAgentRateLimit({ userId: user.id });
  if (!limit.ok) {
    return NextResponse.json(
      { error: "rate_limited", reason: limit.reason, message: rateLimitMessage(limit) },
      { status: 429 },
    );
  }

  runSeasonRecap(membership.teamId).catch(console.error);

  return NextResponse.json({
    message: "Season recap is being generated. Check back in a minute.",
  });
}
