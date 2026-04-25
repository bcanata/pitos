/**
 * Merge Hakan Köse's empty duplicate "Goat" team into the canonical
 * G.O.A.T. #8092 team, then delete the duplicate.
 *
 * Preview:
 *   npx tsx scripts/merge-duplicate-team.ts
 *
 * Apply to Turso:
 *   npx tsx scripts/merge-duplicate-team.ts --apply
 *
 * Duplicate team: 87476403-24db-442d-8e54-8457e01351db  "Goat"  (en)
 *   • 1 membership (Hakan Köse, lead_mentor)
 *   • 18 auto-created channels + 18 channel_members rows
 *   • 0 messages, 0 tasks, 0 entities, 0 facts, 0 anything-else
 *
 * Canonical team: 89d09a96-b302-478d-ab20-9aaead09ae08  "G.O.A.T." (tr)
 *
 * Plan:
 *   1. Add Hakan as lead_mentor on canonical team (if not already)
 *   2. Delete channel_members for duplicate's channels
 *   3. Delete duplicate's channels
 *   4. Delete duplicate's membership
 *   5. Delete duplicate team row
 */

import { config } from "dotenv";
config({ path: ".env.turso" });
config({ path: ".env.local" });

import { randomUUID } from "crypto";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { eq, inArray, and } from "drizzle-orm";
import * as schema from "../db/schema";

const { teams, memberships, users, channels, channelMembers, messages, tasks } = schema;

const client = createClient({
  url: process.env.TURSO_DATABASE_URL ?? "file:./pitos.db",
  authToken: process.env.TURSO_AUTH_TOKEN,
});
const db = drizzle(client, { schema });

const APPLY = process.argv.includes("--apply");

const DUP_TEAM_ID = "87476403-24db-442d-8e54-8457e01351db";
const CANON_TEAM_ID = "89d09a96-b302-478d-ab20-9aaead09ae08";

async function main() {
  // ─── Guard rails ──────────────────────────────────────────────────────────
  const dup = await db.select().from(teams).where(eq(teams.id, DUP_TEAM_ID)).get();
  const canon = await db.select().from(teams).where(eq(teams.id, CANON_TEAM_ID)).get();
  if (!dup) throw new Error(`Duplicate team ${DUP_TEAM_ID} not found.`);
  if (!canon) throw new Error(`Canonical team ${CANON_TEAM_ID} not found.`);
  console.log(`Duplicate:  ${dup.name} #${dup.number} (${dup.id}) — language=${dup.language}`);
  console.log(`Canonical:  ${canon.name} #${canon.number} (${canon.id}) — language=${canon.language}`);

  // Ensure duplicate is truly empty of user content (re-verify before deleting)
  const dupChs = await db.select().from(channels).where(eq(channels.teamId, DUP_TEAM_ID)).all();
  const dupChIds = dupChs.map((c) => c.id);
  const dupMsgs = dupChIds.length
    ? await db.select().from(messages).where(inArray(messages.channelId, dupChIds)).all()
    : [];
  const dupTasks = await db.select().from(tasks).where(eq(tasks.teamId, DUP_TEAM_ID)).all();
  if (dupMsgs.length > 0 || dupTasks.length > 0) {
    throw new Error(
      `Aborting: duplicate team has ${dupMsgs.length} messages and ${dupTasks.length} tasks — not safe to auto-delete. Investigate manually.`,
    );
  }
  console.log(`✓ Duplicate has ${dupChs.length} channels, ${dupMsgs.length} messages, ${dupTasks.length} tasks.`);

  // ─── Plan: what gets moved vs deleted ────────────────────────────────────
  const dupMems = await db
    .select({ id: memberships.id, userId: memberships.userId, name: users.name, email: users.email, role: memberships.role })
    .from(memberships)
    .leftJoin(users, eq(memberships.userId, users.id))
    .where(eq(memberships.teamId, DUP_TEAM_ID))
    .all();

  console.log(`\n[migrate] ${dupMems.length} membership(s) to reassign to canonical team:`);
  for (const m of dupMems) console.log(`  - ${m.name ?? "?"} <${m.email ?? "?"}> [${m.role}]`);

  const dupChannelMembers = dupChIds.length
    ? await db.select().from(channelMembers).where(inArray(channelMembers.channelId, dupChIds)).all()
    : [];
  console.log(`\n[delete] ${dupChannelMembers.length} channel_members rows`);
  console.log(`[delete] ${dupChs.length} channels`);
  console.log(`[delete] ${dupMems.length} memberships`);
  console.log(`[delete] 1 team row (${dup.name})`);

  if (!APPLY) {
    console.log("\n🔍 Preview only. Re-run with --apply to execute.");
    return;
  }

  // ─── Apply ────────────────────────────────────────────────────────────────

  // 1. Reassign memberships (add to canonical if not already present)
  const canonMems = await db.select().from(memberships).where(eq(memberships.teamId, CANON_TEAM_ID)).all();
  const canonUserIds = new Set(canonMems.map((m) => m.userId));
  const now = new Date();
  let addedCount = 0;
  for (const m of dupMems) {
    if (canonUserIds.has(m.userId)) {
      console.log(`  ⊘ ${m.name ?? m.email} is already on canonical team — skipping`);
      continue;
    }
    await db.insert(memberships).values({
      id: randomUUID(),
      userId: m.userId,
      teamId: CANON_TEAM_ID,
      role: m.role as "lead_mentor" | "mentor" | "captain" | "student",
      subteam: null,
      graduationDate: null,
      joinedAt: now,
    });
    addedCount++;
    console.log(`  + Added ${m.name ?? m.email} to canonical team as ${m.role}`);
  }
  console.log(`✅ Reassigned ${addedCount} member(s).`);

  // 2. Delete duplicate's channel_members
  if (dupChIds.length > 0) {
    await db.delete(channelMembers).where(inArray(channelMembers.channelId, dupChIds));
    console.log(`✅ Deleted ${dupChannelMembers.length} channel_members rows.`);
  }

  // 3. Delete duplicate's channels
  await db.delete(channels).where(eq(channels.teamId, DUP_TEAM_ID));
  console.log(`✅ Deleted ${dupChs.length} channels.`);

  // 4. Delete duplicate's memberships
  await db.delete(memberships).where(eq(memberships.teamId, DUP_TEAM_ID));
  console.log(`✅ Deleted ${dupMems.length} memberships.`);

  // 5. Delete duplicate team row
  await db.delete(teams).where(eq(teams.id, DUP_TEAM_ID));
  console.log(`✅ Deleted duplicate team row.`);

  console.log("\n🎉 Merge complete. Hakan now lands directly in the canonical G.O.A.T. workspace on next login.");
}

main().catch((err) => { console.error(err); process.exit(1); });
