import { db } from "@/db";
import { teams, memberships, channels, channelMembers } from "@/db/schema";

export async function seedTeamForUser(userId: string): Promise<string> {
  const teamId = crypto.randomUUID();
  const now = new Date();

  await db.insert(teams).values({
    id: teamId,
    name: "My FRC Team",
    createdByUserId: userId,
    createdAt: now,
  });

  await db.insert(memberships).values({
    id: crypto.randomUUID(),
    userId,
    teamId,
    role: "lead_mentor",
    joinedAt: now,
  });

  const defaultChannels = [
    { name: "general", description: "General team discussion" },
    { name: "outreach", description: "Community outreach & events" },
    { name: "build", description: "Robot build & engineering" },
  ];

  for (const ch of defaultChannels) {
    const channelId = crypto.randomUUID();
    await db.insert(channels).values({
      id: channelId,
      teamId,
      name: ch.name,
      description: ch.description,
      type: "public",
      createdAt: now,
    });
    await db.insert(channelMembers).values({
      id: crypto.randomUUID(),
      channelId,
      userId,
      joinedAt: now,
    });
  }

  return teamId;
}
