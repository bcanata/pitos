import { db } from "@/db";
import { teams, memberships, channels, channelMembers } from "@/db/schema";
import { eq } from "drizzle-orm";

export function seedTeamForUser(userId: string) {
  const teamId = crypto.randomUUID();
  const now = new Date();

  db.insert(teams).values({
    id: teamId,
    name: "My FRC Team",
    createdByUserId: userId,
    createdAt: now,
  }).run();

  db.insert(memberships).values({
    id: crypto.randomUUID(),
    userId,
    teamId,
    role: "lead_mentor",
    joinedAt: now,
  }).run();

  const defaultChannels = [
    { name: "general", description: "General team discussion" },
    { name: "outreach", description: "Community outreach & events" },
    { name: "build", description: "Robot build & engineering" },
  ];

  for (const ch of defaultChannels) {
    const channelId = crypto.randomUUID();
    db.insert(channels).values({
      id: channelId,
      teamId,
      name: ch.name,
      description: ch.description,
      type: "public",
      createdAt: now,
    }).run();
    db.insert(channelMembers).values({
      id: crypto.randomUUID(),
      channelId,
      userId,
      joinedAt: now,
    }).run();
  }

  return teamId;
}
