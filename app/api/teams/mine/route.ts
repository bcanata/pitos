import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { db } from "@/db";
import { teams, memberships } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { loadTeamWorkspace, MembershipPendingError } from "@/lib/data/team";

export async function GET() {
  const { user } = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const data = await loadTeamWorkspace(user.id);
    return NextResponse.json(data);
  } catch (e) {
    if (e instanceof MembershipPendingError) {
      return NextResponse.json({ error: "Membership pending approval" }, { status: 403 });
    }
    throw e;
  }
}

export async function PATCH(req: Request) {
  const { user } = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Only active members can edit team info — and we use status here to make
  // sure pending self-signups can't quietly mutate team metadata.
  const membership = await db
    .select()
    .from(memberships)
    .where(and(eq(memberships.userId, user.id), eq(memberships.status, "active")))
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
