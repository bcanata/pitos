import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { db } from "@/db";
import { memberships } from "@/db/schema";
import { eq } from "drizzle-orm";
import { startExitInterview } from "@/lib/agents/exit-interview-agent";

export async function POST() {
  const { user } = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const membership = db.select().from(memberships).where(eq(memberships.userId, user.id)).get();
  if (!membership) return NextResponse.json({ error: "Not a team member" }, { status: 403 });

  const result = await startExitInterview(user.id, membership.teamId);
  return NextResponse.json(result, { status: 201 });
}
