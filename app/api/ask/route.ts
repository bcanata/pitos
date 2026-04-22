import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { db } from "@/db";
import { memberships } from "@/db/schema";
import { eq } from "drizzle-orm";
import { runMemoryAgent } from "@/lib/agents/memory-agent";

export async function POST(req: Request) {
  const { user } = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const query: string = body?.query?.trim() ?? "";
  if (!query) return NextResponse.json({ error: "query is required" }, { status: 400 });

  const membership = db
    .select()
    .from(memberships)
    .where(eq(memberships.userId, user.id))
    .get();

  if (!membership) {
    return NextResponse.json({ error: "Not a team member" }, { status: 403 });
  }

  const result = await runMemoryAgent(query, membership.teamId);
  return NextResponse.json(result);
}
