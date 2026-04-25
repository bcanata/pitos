import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { db } from "@/db";
import { teams, memberships, channels } from "@/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { seedTeamForUser } from "@/lib/seed";

export async function GET() {
  const { user } = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let membership = await db.select().from(memberships).where(eq(memberships.userId, user.id)).get();

  if (!membership) {
    await seedTeamForUser(user.id);
    membership = (await db.select().from(memberships).where(eq(memberships.userId, user.id)).get())!;
  }

  const team = (await db.select().from(teams).where(eq(teams.id, membership.teamId)).get())!;
  const teamChannels = await db
    .select()
    .from(channels)
    .where(and(eq(channels.teamId, team.id), isNull(channels.archivedAt)))
    .all();

  return NextResponse.json({ team, channels: teamChannels, membership });
}

export async function PATCH(req: Request) {
  const { user } = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const membership = await db.select().from(memberships).where(eq(memberships.userId, user.id)).get();
  if (!membership) return NextResponse.json({ error: "No team" }, { status: 404 });

  const body = await req.json();
  const name = typeof body.name === "string" ? body.name.trim() : undefined;
  const number = typeof body.number === "number" ? body.number : undefined;

  if (!name) return NextResponse.json({ error: "name is required" }, { status: 400 });

  await db.update(teams).set({ name, ...(number !== undefined ? { number } : {}) }).where(eq(teams.id, membership.teamId));

  return NextResponse.json({ ok: true });
}
