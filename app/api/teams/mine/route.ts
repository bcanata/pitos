import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { db } from "@/db";
import { teams, memberships, channels } from "@/db/schema";
import { eq } from "drizzle-orm";
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
  const teamChannels = await db.select().from(channels).where(eq(channels.teamId, team.id)).all();

  return NextResponse.json({ team, channels: teamChannels, membership });
}
