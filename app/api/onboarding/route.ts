import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { db } from "@/db";
import { users, teams, memberships, channels, channelMembers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { runOnboardingStep } from "@/lib/agents/onboarding-agent";

export async function GET() {
  const { user } = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const membership = db
    .select()
    .from(memberships)
    .where(eq(memberships.userId, user.id))
    .get();

  return NextResponse.json({ hasTeam: !!membership });
}

export async function POST(req: Request) {
  const { user } = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const messages: Array<{ role: "user" | "assistant"; content: string }> =
    body?.messages ?? [];

  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "messages is required" }, { status: 400 });
  }

  let result;
  try {
    result = await runOnboardingStep(messages, user.id);
  } catch (err) {
    console.error("[onboarding] agent error:", err);
    return NextResponse.json({ error: "Agent error" }, { status: 500 });
  }

  if (result.done && result.teamData) {
    const { name, number, memberName, role } = result.teamData;
    const now = new Date();
    const teamId = crypto.randomUUID();

    // Create the team
    db.insert(teams)
      .values({
        id: teamId,
        name,
        number,
        createdByUserId: user.id,
        createdAt: now,
      })
      .run();

    // Create the membership
    const validRole = (["lead_mentor", "mentor", "captain", "student"] as const).includes(
      role as "lead_mentor" | "mentor" | "captain" | "student"
    )
      ? (role as "lead_mentor" | "mentor" | "captain" | "student")
      : ("student" as const);

    db.insert(memberships)
      .values({
        id: crypto.randomUUID(),
        userId: user.id,
        teamId,
        role: validRole,
        joinedAt: now,
      })
      .run();

    // Update the user's name
    if (memberName) {
      db.update(users).set({ name: memberName }).where(eq(users.id, user.id)).run();
    }

    // Seed default channels
    const defaultChannels = [
      { name: "general", description: "General team discussion" },
      { name: "outreach", description: "Community outreach & events" },
      { name: "build", description: "Robot build & engineering" },
      { name: "programming", description: "Software & programming" },
    ];

    for (const ch of defaultChannels) {
      const channelId = crypto.randomUUID();
      db.insert(channels)
        .values({
          id: channelId,
          teamId,
          name: ch.name,
          description: ch.description,
          type: "public",
          createdAt: now,
        })
        .run();
      db.insert(channelMembers)
        .values({
          id: crypto.randomUUID(),
          channelId,
          userId: user.id,
          joinedAt: now,
        })
        .run();
    }

    return NextResponse.json({ reply: result.reply, done: true });
  }

  return NextResponse.json({ reply: result.reply, done: false });
}
