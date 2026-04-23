/**
 * Backfill the full default channel list into every existing team,
 * localized to each team creator's language.
 * Run with: npx tsx scripts/backfill-channels.ts
 *
 * Reads Turso credentials from env (TURSO_DATABASE_URL + TURSO_AUTH_TOKEN)
 * via db/index.ts — same behavior as the app runtime.
 */

import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { teams, channels, channelMembers, memberships, users } from "../db/schema";
import { defaultChannels } from "../lib/onboarding/default-channels";
import { translateChannels } from "../lib/i18n/translate-channels";

async function main() {
  const target = process.env.TURSO_DATABASE_URL ? "Turso" : "local SQLite";
  console.log(`\n🔧 Backfilling channels into ${target}\n`);

  const allTeams = await db.select().from(teams).all();
  console.log(`Found ${allTeams.length} team(s).`);

  for (const team of allTeams) {
    console.log(`\n— Team: ${team.name} (${team.id})`);

    const creator = team.createdByUserId
      ? await db.select().from(users).where(eq(users.id, team.createdByUserId)).get()
      : null;
    const language = creator?.language ?? "en";
    const localized = await translateChannels(defaultChannels, language);
    console.log(`  language: ${language}`);

    const existing = await db
      .select()
      .from(channels)
      .where(eq(channels.teamId, team.id))
      .all();
    const existingNames = new Set(existing.map(c => c.name));

    const teamMemberships = await db
      .select()
      .from(memberships)
      .where(eq(memberships.teamId, team.id))
      .all();

    const now = new Date();

    for (let i = 0; i < localized.length; i++) {
      const ch = localized[i];
      const type = defaultChannels[i].type ?? "public";

      if (existingNames.has(ch.name)) {
        console.log(`  · skip #${ch.name} (exists)`);
        continue;
      }

      const channelId = randomUUID();

      await db.insert(channels).values({
        id: channelId,
        teamId: team.id,
        name: ch.name,
        description: ch.description,
        type,
        createdAt: now,
      });

      const eligible = type === "private"
        ? teamMemberships.filter(m => m.role === "lead_mentor" || m.role === "mentor")
        : teamMemberships;

      for (const m of eligible) {
        await db.insert(channelMembers).values({
          id: randomUUID(),
          channelId,
          userId: m.userId,
          joinedAt: now,
        });
      }

      console.log(`  ✓ add #${ch.name} (${type}, ${eligible.length} member(s))`);
    }
  }

  console.log("\n✅ Done.\n");
}

main().catch(err => {
  console.error("Backfill failed:", err);
  process.exit(1);
});
