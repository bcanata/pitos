/**
 * One-off migration:
 *   1. Delete legacy channels "general", "outreach", "build" from every team.
 *   2. Rename the 18 Turkish channels (seeded by a prior backfill) to each
 *      team creator's current language, using the English canonical list as
 *      the source of truth.
 *   3. Insert any canonical channels that are still missing afterwards (e.g.
 *      "outreach" gets re-created when the first step deleted the old one).
 *
 * Safe to re-run: deletions are by exact legacy name, renames are matched by
 * the known Turkish slugs, inserts are guarded by a name check.
 *
 * Run with: npx tsx scripts/migrate-channels.ts
 */

import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { teams, channels, channelMembers, memberships, users } from "../db/schema";
import { defaultChannels } from "../lib/onboarding/default-channels";
import { translateChannels } from "../lib/i18n/translate-channels";

const LEGACY_NAMES = ["general", "outreach", "build"] as const;

// Matches the order of lib/onboarding/default-channels.ts.
const TURKISH_BY_INDEX = [
  "genel",        // general
  "sohbet",       // chat
  "mentorlar",    // mentors
  "mekanik",      // mechanical
  "yazilim",      // software
  "elektrik",     // electrical
  "cad",          // cad
  "strateji",     // strategy
  "outreach",     // outreach (backfill skipped adding this because old existed)
  "sponsorlar",   // sponsors
  "medya",        // media
  "oduller",      // awards
  "scouting",     // scouting
  "pit-ekibi",    // pit-crew
  "seyahat",      // travel
  "kit-parcalari", // kit-parts
  "guvenlik",     // safety
  "mezunlar",     // alumni
];

async function main() {
  const target = process.env.TURSO_DATABASE_URL ? "Turso" : "local SQLite";
  console.log(`\n🔧 Migrating channels in ${target}\n`);

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

    // 1. Delete legacy channels.
    const legacyRows = await db
      .select()
      .from(channels)
      .where(eq(channels.teamId, team.id))
      .all();
    const legacyToDelete = legacyRows.filter(c => (LEGACY_NAMES as readonly string[]).includes(c.name));
    for (const row of legacyToDelete) {
      await db.delete(channelMembers).where(eq(channelMembers.channelId, row.id));
      await db.delete(channels).where(eq(channels.id, row.id));
      console.log(`  ✗ deleted legacy #${row.name}`);
    }

    // 2. Rename Turkish channels to the target language (index-matched).
    const afterDelete = await db
      .select()
      .from(channels)
      .where(eq(channels.teamId, team.id))
      .all();
    for (const row of afterDelete) {
      // Match by Turkish slug (from a prior backfill) or by English canonical
      // (from a prior run of this migration) — either way we know the index.
      let idx = TURKISH_BY_INDEX.indexOf(row.name);
      if (idx < 0) idx = defaultChannels.findIndex(c => c.name === row.name);
      if (idx < 0) continue;
      const target = localized[idx];
      if (row.name === target.name && row.description === target.description) {
        console.log(`  · keep #${row.name} (already in target form)`);
        continue;
      }
      await db
        .update(channels)
        .set({ name: target.name, description: target.description })
        .where(eq(channels.id, row.id));
      console.log(`  ↻ renamed #${row.name} → #${target.name}`);
    }

    // 3. Insert any canonical channels still missing (e.g. outreach after deletion).
    const finalRows = await db
      .select()
      .from(channels)
      .where(eq(channels.teamId, team.id))
      .all();
    const finalNames = new Set(finalRows.map(c => c.name));
    const teamMemberships = await db
      .select()
      .from(memberships)
      .where(eq(memberships.teamId, team.id))
      .all();
    const now = new Date();

    for (let i = 0; i < localized.length; i++) {
      const ch = localized[i];
      if (finalNames.has(ch.name)) continue;

      const type = defaultChannels[i].type ?? "public";
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

      console.log(`  ✓ added #${ch.name} (${type}, ${eligible.length} member(s))`);
    }
  }

  console.log("\n✅ Done.\n");
}

main().catch(err => {
  console.error("Migration failed:", err);
  process.exit(1);
});
