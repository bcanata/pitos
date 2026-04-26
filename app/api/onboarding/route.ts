import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { db } from "@/db";
import { users, teams, memberships, channels, channelMembers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { runOnboardingStep } from "@/lib/agents/onboarding-agent";
import { defaultChannels } from "@/lib/onboarding/default-channels";
import { translateChannels } from "@/lib/i18n/translate-channels";

export async function GET() {
  const { user } = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const membership = await db
    .select()
    .from(memberships)
    .where(eq(memberships.userId, user.id))
    .get();

  return NextResponse.json({ hasTeam: !!membership });
}

export async function POST(req: Request) {
  const { user } = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const existing = await db
    .select()
    .from(memberships)
    .where(eq(memberships.userId, user.id))
    .get();
  if (existing) {
    return NextResponse.json({ error: "Already on a team" }, { status: 409 });
  }

  // Founder gate: only allow team creation when this is a fresh instance with
  // no teams yet. Otherwise the user must come in through an invite or wait
  // for approval as a pending member.
  const anyTeam = await db.select().from(teams).get();
  if (anyTeam) {
    return NextResponse.json(
      { error: "A team already exists on this instance — ask a lead mentor to invite you" },
      { status: 403 },
    );
  }

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

    await db.insert(teams).values({
      id: teamId,
      name,
      number,
      createdByUserId: user.id,
      createdAt: now,
    });

    const validRole = (["lead_mentor", "mentor", "captain", "student"] as const).includes(
      role as "lead_mentor" | "mentor" | "captain" | "student"
    )
      ? (role as "lead_mentor" | "mentor" | "captain" | "student")
      : ("student" as const);

    await db.insert(memberships).values({
      id: crypto.randomUUID(),
      userId: user.id,
      teamId,
      role: validRole,
      joinedAt: now,
    });

    if (memberName) {
      await db.update(users).set({ name: memberName }).where(eq(users.id, user.id));
    }

    const currentUser = await db
      .select()
      .from(users)
      .where(eq(users.id, user.id))
      .get();
    const language = currentUser?.language ?? "en";
    const channelsToCreate = await translateChannels(defaultChannels, language);

    for (const ch of channelsToCreate) {
      const channelId = crypto.randomUUID();
      await db.insert(channels).values({
        id: channelId,
        teamId,
        name: ch.name,
        description: ch.description,
        type: ch.type ?? "public",
        createdAt: now,
      });
      await db.insert(channelMembers).values({
        id: crypto.randomUUID(),
        channelId,
        userId: user.id,
        joinedAt: now,
      });
    }

    return NextResponse.json({ reply: result.reply, done: true });
  }

  return NextResponse.json({ reply: result.reply, done: false });
}
