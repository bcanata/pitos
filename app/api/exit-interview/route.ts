import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { isDemoUser } from "@/lib/demo";
import { db } from "@/db";
import { memberships } from "@/db/schema";
import { eq } from "drizzle-orm";
import { startExitInterview } from "@/lib/agents/exit-interview-agent";

export async function POST() {
  const { user } = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (isDemoUser(user.email)) return NextResponse.json({ error: "Not available in demo" }, { status: 403 });

  const membership = await db.select().from(memberships).where(eq(memberships.userId, user.id)).get();
  if (!membership) return NextResponse.json({ error: "Not a team member" }, { status: 403 });

  const result = await startExitInterview(user.id, membership.teamId);
  return NextResponse.json(result, { status: 201 });
}
