/**
 * Enforce "one user = one team" by merging every non-canonical team into
 * G.O.A.T. #8092 and deleting the empty duplicates.
 *
 * Safety: refuses to delete any team that has user content (messages, tasks,
 * entities, facts, decisions, judge sessions, exit packs, agent runs, or
 * generated documents). Run the inspect script and reconcile manually in that case.
 *
 * Preview:
 *   npx tsx scripts/consolidate-to-canonical.ts
 *
 * Apply:
 *   npx tsx scripts/consolidate-to-canonical.ts --apply
 */

import { config } from "dotenv";
config({ path: ".env.turso" });
config({ path: ".env.local" });

import { randomUUID } from "crypto";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { eq, inArray, ne } from "drizzle-orm";
import * as schema from "../db/schema";

const {
  teams, memberships, users, channels, channelMembers, messages, tasks,
  entities, extractedFacts, decisions, judgeSessions, exitPacks, agentRuns,
  generatedDocuments, invites,
} = schema;

const client = createClient({
  url: process.env.TURSO_DATABASE_URL ?? "file:./pitos.db",
  authToken: process.env.TURSO_AUTH_TOKEN,
});
const db = drizzle(client, { schema });

const APPLY = process.argv.includes("--apply");
const CANON_TEAM_ID = "89d09a96-b302-478d-ab20-9aaead09ae08";

async function countsFor(teamId: string, chIds: string[]) {
  const [msgs, tks, ents, facts, decs, jsess, eps, runs, docs] = await Promise.all([
    chIds.length ? db.select().from(messages).where(inArray(messages.channelId, chIds)).all() : Promise.resolve([]),
    db.select().from(tasks).where(eq(tasks.teamId, teamId)).all(),
    db.select().from(entities).where(eq(entities.teamId, teamId)).all(),
    db.select().from(extractedFacts).where(eq(extractedFacts.teamId, teamId)).all(),
    db.select().from(decisions).where(eq(decisions.teamId, teamId)).all(),
    db.select().from(judgeSessions).where(eq(judgeSessions.teamId, teamId)).all(),
    db.select().from(exitPacks).where(eq(exitPacks.teamId, teamId)).all(),
    db.select().from(agentRuns).where(eq(agentRuns.teamId, teamId)).all(),
    db.select().from(generatedDocuments).where(eq(generatedDocuments.teamId, teamId)).all(),
  ]);
  return { msgs: msgs.length, tks: tks.length, ents: ents.length, facts: facts.length, decs: decs.length, jsess: jsess.length, eps: eps.length, runs: runs.length, docs: docs.length };
}

async function main() {
  const canon = await db.select().from(teams).where(eq(teams.id, CANON_TEAM_ID)).get();
  if (!canon) throw new Error(`Canonical team ${CANON_TEAM_ID} not found.`);
  console.log(`Canonical:  ${canon.name} #${canon.number} (${canon.id})\n`);

  const otherTeams = await db.select().from(teams).where(ne(teams.id, CANON_TEAM_ID)).all();
  console.log(`Found ${otherTeams.length} non-canonical team(s) to consolidate.\n`);

  const canonMems = await db.select().from(memberships).where(eq(memberships.teamId, CANON_TEAM_ID)).all();
  const canonUserIds = new Set(canonMems.map((m) => m.userId));

  const plan: Array<{
    team: typeof otherTeams[number];
    chIds: string[];
    chCount: number;
    chanMemCount: number;
    mems: Array<{ id: string; userId: string; name: string | null; email: string | null; role: "lead_mentor" | "mentor" | "captain" | "student" }>;
    counts: Awaited<ReturnType<typeof countsFor>>;
    invCount: number;
  }> = [];

  let abortReasons: string[] = [];

  for (const t of otherTeams) {
    const chs = await db.select().from(channels).where(eq(channels.teamId, t.id)).all();
    const chIds = chs.map((c) => c.id);
    const chanMems = chIds.length
      ? await db.select().from(channelMembers).where(inArray(channelMembers.channelId, chIds)).all()
      : [];
    const mems = await db
      .select({ id: memberships.id, userId: memberships.userId, name: users.name, email: users.email, role: memberships.role })
      .from(memberships)
      .leftJoin(users, eq(memberships.userId, users.id))
      .where(eq(memberships.teamId, t.id))
      .all();
    const invCount = (await db.select().from(invites).where(eq(invites.teamId, t.id)).all()).length;
    const counts = await countsFor(t.id, chIds);

    plan.push({
      team: t,
      chIds,
      chCount: chs.length,
      chanMemCount: chanMems.length,
      mems: mems.map(m => ({ id: m.id, userId: m.userId, name: m.name ?? null, email: m.email ?? null, role: m.role })),
      counts,
      invCount,
    });

    const hasContent = counts.msgs || counts.tks || counts.ents || counts.facts || counts.decs || counts.jsess || counts.eps || counts.runs || counts.docs;
    console.log(`─ ${t.name} #${t.number ?? "-"} (${t.id})`);
    console.log(`  members=${mems.length}  invites=${invCount}  channels=${chs.length}  channel_members=${chanMems.length}`);
    console.log(`  messages=${counts.msgs}  tasks=${counts.tks}  entities=${counts.ents}  facts=${counts.facts}  decisions=${counts.decs}`);
    console.log(`  judge_sessions=${counts.jsess}  exit_packs=${counts.eps}  agent_runs=${counts.runs}  generated_docs=${counts.docs}`);
    if (hasContent) {
      abortReasons.push(`${t.name} (${t.id}) has user content — refusing to delete.`);
    }
    console.log("");
  }

  if (abortReasons.length) {
    console.log("❌ Aborting:");
    for (const r of abortReasons) console.log(`  - ${r}`);
    console.log("\nInvestigate the team(s) with content manually. Safe subset must be empty of all user-authored data.");
    process.exit(1);
  }

  // Plan
  console.log("── Plan ─────────────────────────────────────────────────────────");
  for (const p of plan) {
    console.log(`\n[${p.team.name} ${p.team.id.slice(0, 8)}]`);
    console.log(`  migrate memberships → canonical:`);
    for (const m of p.mems) {
      const alreadyOn = canonUserIds.has(m.userId);
      console.log(`    ${alreadyOn ? "⊘ skip" : "+ add "} ${m.name ?? m.email ?? "?"}  [${m.role}]${alreadyOn ? " (already on canonical)" : ""}`);
    }
    console.log(`  delete ${p.chanMemCount} channel_members, ${p.chCount} channels, ${p.mems.length} memberships, ${p.invCount} invites, 1 team row`);
  }

  if (!APPLY) {
    console.log("\n🔍 Preview only. Re-run with --apply to execute.");
    return;
  }

  // ─── Apply ────────────────────────────────────────────────────────────────
  const now = new Date();
  for (const p of plan) {
    console.log(`\n→ Processing ${p.team.name} (${p.team.id.slice(0, 8)}…)`);

    // 1. Reassign memberships
    for (const m of p.mems) {
      if (canonUserIds.has(m.userId)) {
        console.log(`  ⊘ ${m.name ?? m.email} already on canonical — skip`);
        continue;
      }
      await db.insert(memberships).values({
        id: randomUUID(),
        userId: m.userId,
        teamId: CANON_TEAM_ID,
        role: m.role,
        subteam: null,
        graduationDate: null,
        joinedAt: now,
      });
      canonUserIds.add(m.userId);
      console.log(`  + Added ${m.name ?? m.email} to canonical as ${m.role}`);
    }

    // 2. Delete channel_members
    if (p.chIds.length > 0) {
      await db.delete(channelMembers).where(inArray(channelMembers.channelId, p.chIds));
    }
    // 3. Delete channels
    await db.delete(channels).where(eq(channels.teamId, p.team.id));
    // 4. Delete invites (if any)
    if (p.invCount > 0) {
      await db.delete(invites).where(eq(invites.teamId, p.team.id));
    }
    // 5. Delete memberships on duplicate
    await db.delete(memberships).where(eq(memberships.teamId, p.team.id));
    // 6. Delete team
    await db.delete(teams).where(eq(teams.id, p.team.id));
    console.log(`  ✅ Tore down ${p.team.name}`);
  }

  // ─── Verify invariant: every user has ≤ 1 membership ─────────────────────
  console.log("\n── Verifying one-team-per-user invariant ─────────────────────");
  const allMems = await db.select({ userId: memberships.userId }).from(memberships).all();
  const byUser = new Map<string, number>();
  for (const m of allMems) byUser.set(m.userId, (byUser.get(m.userId) ?? 0) + 1);
  const offenders = [...byUser.entries()].filter(([, n]) => n > 1);
  if (offenders.length === 0) {
    console.log("✅ All users have exactly one membership.");
  } else {
    console.log(`⚠️  ${offenders.length} user(s) still have >1 membership:`);
    for (const [uid, n] of offenders) {
      const u = await db.select().from(users).where(eq(users.id, uid)).get();
      console.log(`  - ${u?.name ?? "?"} <${u?.email ?? "?"}> — ${n} memberships`);
    }
  }

  // Final team count
  const allTeams = await db.select().from(teams).all();
  console.log(`\n✅ Total teams in DB: ${allTeams.length}`);
  for (const t of allTeams) console.log(`  - ${t.name} #${t.number ?? "-"} (${t.id})`);
}

main().catch((err) => { console.error(err); process.exit(1); });
