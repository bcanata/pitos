import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { db } from "@/db";
import { teams, memberships } from "@/db/schema";
import { eq } from "drizzle-orm";
import { loadTeamWorkspace } from "@/lib/data/team";

export async function GET() {
  const { user } = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const data = await loadTeamWorkspace(user.id);
  return NextResponse.json(data);
}

export async function PATCH(req: Request) {
  const { user } = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const membership = await db
    .select()
    .from(memberships)
    .where(eq(memberships.userId, user.id))
    .get();
  if (!membership) return NextResponse.json({ error: "No team" }, { status: 404 });

  const body = await req.json();
  const name = typeof body.name === "string" ? body.name.trim() : undefined;
  const number = typeof body.number === "number" ? body.number : undefined;

  if (!name) return NextResponse.json({ error: "name is required" }, { status: 400 });

  await db
    .update(teams)
    .set({ name, ...(number !== undefined ? { number } : {}) })
    .where(eq(teams.id, membership.teamId));

  return NextResponse.json({ ok: true });
}
