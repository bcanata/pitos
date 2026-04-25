/**
 * Seed meaningful mock chat data for FRC Team 8092 G.O.A.T.
 *
 * Replaces the previous "WhatsApp fragments" import with multi-week storylines:
 * design iterations, sponsor cultivation, the 2026 Judges' Award arc, exit
 * interviews, etc.
 *
 * Source data lives in scripts/seed-data/<group>.ts files (one per channel
 * cluster) — each exports a typed SeedGroup with messages, tasks, decisions.
 *
 * Run (dry-run, preview counts only):
 *   npx tsx scripts/seed-meaningful.ts
 *
 * Apply:
 *   npx tsx scripts/seed-meaningful.ts --apply
 *
 * Flags:
 *   --apply            Write to DB. Without this, only previews.
 *   --team <teamId>    Override target team (default: G.O.A.T. #8092).
 *   --keep-existing    Don't wipe prior messages/tasks/decisions for the team.
 */

import { config } from "dotenv";
config({ path: ".env.turso" });
config({ path: ".env.local" });

import { randomUUID } from "crypto";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { and, eq, inArray } from "drizzle-orm";
import * as schema from "../db/schema";
import type { SeedGroup, SeedMessage, SeedTask, SeedDecision } from "./seed-data/types";

// ─── CLI ─────────────────────────────────────────────────────────────────────

const APPLY = process.argv.includes("--apply");
const KEEP = process.argv.includes("--keep-existing");
const teamIdx = process.argv.indexOf("--team");
const TEAM_OVERRIDE = teamIdx >= 0 ? process.argv[teamIdx + 1] : undefined;

// ─── DB ──────────────────────────────────────────────────────────────────────

const client = createClient({
  url: process.env.TURSO_DATABASE_URL ?? "file:./pitos.db",
  authToken: process.env.TURSO_AUTH_TOKEN,
});
const db = drizzle(client, { schema });

const { teams, channels, messages, tasks, decisions, channelMembers, memberships } = schema;

// ─── Group loading (only what exists) ────────────────────────────────────────

async function loadGroups(): Promise<SeedGroup[]> {
  const candidates = [
    "./seed-data/team-channels",
    "./seed-data/tech-channels",
    "./seed-data/build-channels-1",
    "./seed-data/build-channels-2",
    "./seed-data/build-channels", // legacy single-file name in case it appears
    "./seed-data/outreach-channels-1",
    "./seed-data/outreach-channels-2",
    "./seed-data/outreach-channels", // legacy single-file name
  ];
  const out: SeedGroup[] = [];
  for (const path of candidates) {
    try {
      const mod = (await import(path)) as { group?: SeedGroup };
      if (mod.group) out.push(mod.group);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      // Silent skip if module not present; otherwise surface.
      if (!/Cannot find module/i.test(msg) && !/ERR_MODULE_NOT_FOUND/i.test(msg)) {
        console.warn(`  ! load failed for ${path}: ${msg}`);
      }
    }
  }
  return out;
}

// ─── Validation ──────────────────────────────────────────────────────────────

function validate(groups: SeedGroup[], validChannelIds: Set<string>, validUserIds: Set<string>) {
  const errors: string[] = [];
  const seenLocalIds = new Set<string>();

  // Pass 1: messages
  const msgIndex = new Map<string, { msg: SeedMessage; group: string }>();
  for (const g of groups) {
    for (const m of g.messages) {
      if (seenLocalIds.has(m.localId)) {
        errors.push(`[${g.groupName}] duplicate localId: ${m.localId}`);
      }
      seenLocalIds.add(m.localId);
      msgIndex.set(m.localId, { msg: m, group: g.groupName });

      if (!validChannelIds.has(m.channelId)) {
        errors.push(`[${g.groupName}] msg ${m.localId} references unknown channelId: ${m.channelId}`);
      }
      if (m.authorUserId !== null && !validUserIds.has(m.authorUserId)) {
        errors.push(`[${g.groupName}] msg ${m.localId} references unknown userId: ${m.authorUserId}`);
      }
      if (Number.isNaN(Date.parse(m.createdAt))) {
        errors.push(`[${g.groupName}] msg ${m.localId} invalid createdAt: ${m.createdAt}`);
      }
    }
  }

  // Pass 2: replies / task refs / decision refs
  for (const g of groups) {
    for (const m of g.messages) {
      if (m.replyToLocalId && !msgIndex.has(m.replyToLocalId)) {
        errors.push(`[${g.groupName}] msg ${m.localId} replies to unknown localId: ${m.replyToLocalId}`);
      }
    }
    for (const t of g.tasks) {
      if (t.createdViaLocalMessageId && !msgIndex.has(t.createdViaLocalMessageId)) {
        errors.push(`[${g.groupName}] task ${t.localId} references unknown msg localId: ${t.createdViaLocalMessageId}`);
      }
      if (t.channelId && !validChannelIds.has(t.channelId)) {
        errors.push(`[${g.groupName}] task ${t.localId} references unknown channelId: ${t.channelId}`);
      }
      if (t.assignedToUserId && !validUserIds.has(t.assignedToUserId)) {
        errors.push(`[${g.groupName}] task ${t.localId} unknown assignee: ${t.assignedToUserId}`);
      }
      if (t.assignedByUserId && !validUserIds.has(t.assignedByUserId)) {
        errors.push(`[${g.groupName}] task ${t.localId} unknown assigner: ${t.assignedByUserId}`);
      }
    }
    for (const d of g.decisions) {
      if (d.sourceLocalMessageId && !msgIndex.has(d.sourceLocalMessageId)) {
        errors.push(`[${g.groupName}] decision ${d.localId} references unknown msg localId: ${d.sourceLocalMessageId}`);
      }
    }
  }

  return { errors, msgIndex };
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log(APPLY ? "▶ APPLY mode" : "▶ DRY-RUN mode (use --apply to write)");

  // Resolve team
  const allTeams = await db.select().from(teams).all();
  const team =
    (TEAM_OVERRIDE && allTeams.find((t) => t.id === TEAM_OVERRIDE)) ||
    allTeams.find((t) => t.number === 8092) ||
    allTeams[0];
  if (!team) {
    console.error("No team found. Run /onboarding or import-team-8092 first.");
    process.exit(1);
  }
  console.log(`◇ Team: ${team.name} #${team.number ?? "?"}  (${team.id})`);

  // Resolve allowed channels (this team only) and members
  const teamChannels = await db.select().from(channels).where(eq(channels.teamId, team.id)).all();
  const channelIds = new Set(teamChannels.map((c) => c.id));
  console.log(`◇ Channels: ${teamChannels.length}`);

  const teamMembers = await db
    .select({ userId: memberships.userId })
    .from(memberships)
    .where(eq(memberships.teamId, team.id))
    .all();
  const userIds = new Set(teamMembers.map((m) => m.userId));
  console.log(`◇ Members: ${teamMembers.length}`);

  // Load all group files that exist
  const groups = await loadGroups();
  if (groups.length === 0) {
    console.error("No seed-data/*.ts groups loaded. Aborting.");
    process.exit(1);
  }
  console.log(`◇ Loaded groups: ${groups.map((g) => g.groupName).join(", ")}`);

  // Validate
  const { errors, msgIndex } = validate(groups, channelIds, userIds);
  if (errors.length) {
    console.error(`\n✗ Validation failed (${errors.length} errors):`);
    for (const e of errors.slice(0, 50)) console.error(`  - ${e}`);
    if (errors.length > 50) console.error(`  … +${errors.length - 50} more`);
    process.exit(1);
  }

  // Counts
  const totalMessages = groups.reduce((n, g) => n + g.messages.length, 0);
  const totalTasks = groups.reduce((n, g) => n + g.tasks.length, 0);
  const totalDecisions = groups.reduce((n, g) => n + g.decisions.length, 0);
  console.log(
    `◇ Will seed: ${totalMessages} messages, ${totalTasks} tasks, ${totalDecisions} decisions`
  );

  // Per-channel preview
  const perChannel = new Map<string, number>();
  for (const g of groups) {
    for (const m of g.messages) {
      perChannel.set(m.channelId, (perChannel.get(m.channelId) ?? 0) + 1);
    }
  }
  console.log("\n◇ Per-channel message counts (after seed):");
  for (const c of teamChannels) {
    const n = perChannel.get(c.id) ?? 0;
    const flag = n === 0 ? " ← empty" : "";
    console.log(`    #${c.name.padEnd(16)} ${String(n).padStart(4)}${flag}`);
  }

  // Build localId → UUID maps
  const messageUuids = new Map<string, string>();
  for (const [localId] of msgIndex) messageUuids.set(localId, randomUUID());
  const taskUuids = new Map<string, string>();
  for (const g of groups) for (const t of g.tasks) taskUuids.set(t.localId, randomUUID());
  const decisionUuids = new Map<string, string>();
  for (const g of groups) for (const d of g.decisions) decisionUuids.set(d.localId, randomUUID());

  if (!APPLY) {
    console.log("\n— dry-run complete. Re-run with --apply to write. —");
    return;
  }

  // ─── Wipe existing team-scoped content ────────────────────────────────────
  if (!KEEP) {
    console.log("\n▸ Wiping existing messages/tasks/decisions for this team…");

    const teamChannelIdList = teamChannels.map((c) => c.id);
    if (teamChannelIdList.length > 0) {
      // Delete decisions referencing these messages first (FK cleanliness)
      const existingMsgs = await db
        .select({ id: messages.id })
        .from(messages)
        .where(inArray(messages.channelId, teamChannelIdList))
        .all();
      const existingMsgIds = existingMsgs.map((m) => m.id);

      // Tasks for this team
      await db.delete(tasks).where(eq(tasks.teamId, team.id));
      console.log("  ✓ tasks cleared");

      // Decisions for this team
      await db.delete(decisions).where(eq(decisions.teamId, team.id));
      console.log("  ✓ decisions cleared");

      // Messages by channel
      if (existingMsgIds.length > 0) {
        // Chunk delete to stay under SQL parameter limits
        for (let i = 0; i < existingMsgIds.length; i += 500) {
          const chunk = existingMsgIds.slice(i, i + 500);
          await db.delete(messages).where(inArray(messages.id, chunk));
        }
        console.log(`  ✓ ${existingMsgIds.length} messages cleared`);
      } else {
        console.log("  ✓ no prior messages");
      }
    }
  }

  // ─── Insert messages (chronological) ──────────────────────────────────────
  console.log("\n▸ Inserting messages…");
  const allMsgRows = groups
    .flatMap((g) =>
      g.messages.map((m) => ({
        id: messageUuids.get(m.localId)!,
        channelId: m.channelId,
        userId: m.authorUserId,
        content: m.content,
        replyToMessageId: m.replyToLocalId ? messageUuids.get(m.replyToLocalId) ?? null : null,
        agentGenerated: m.agentGenerated ?? false,
        agentType: m.agentType ?? null,
        juryReflexKind: m.juryReflexKind ?? null,
        metadata: m.metadata ?? null,
        createdAt: new Date(m.createdAt),
      }))
    )
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

  // Batch insert in chunks (libsql/turso has statement size limits)
  for (let i = 0; i < allMsgRows.length; i += 100) {
    const chunk = allMsgRows.slice(i, i + 100);
    await db.insert(messages).values(chunk);
  }
  console.log(`  ✓ ${allMsgRows.length} messages inserted`);

  // ─── Insert tasks ─────────────────────────────────────────────────────────
  console.log("\n▸ Inserting tasks…");
  const allTaskRows = groups.flatMap((g) =>
    g.tasks.map((t) => ({
      id: taskUuids.get(t.localId)!,
      teamId: team.id,
      channelId: t.channelId ?? null,
      title: t.title,
      description: t.description ?? null,
      assignedToUserId: t.assignedToUserId ?? null,
      assignedByUserId: t.assignedByUserId ?? null,
      createdViaMessageId: t.createdViaLocalMessageId
        ? messageUuids.get(t.createdViaLocalMessageId) ?? null
        : null,
      deadline: t.deadline ? new Date(t.deadline) : null,
      status: t.status,
      teachMode: t.teachMode ?? false,
      completedAt: t.completedAt ? new Date(t.completedAt) : null,
      completionMessageId: null,
      createdAt: new Date(t.createdAt),
    }))
  );
  for (let i = 0; i < allTaskRows.length; i += 100) {
    const chunk = allTaskRows.slice(i, i + 100);
    await db.insert(tasks).values(chunk);
  }
  console.log(`  ✓ ${allTaskRows.length} tasks inserted`);

  // ─── Insert decisions ─────────────────────────────────────────────────────
  console.log("\n▸ Inserting decisions…");
  const allDecisionRows = groups.flatMap((g) =>
    g.decisions.map((d) => ({
      id: decisionUuids.get(d.localId)!,
      teamId: team.id,
      sourceMessageId: d.sourceLocalMessageId
        ? messageUuids.get(d.sourceLocalMessageId) ?? null
        : null,
      decision: d.decision,
      rationale: d.rationale ?? null,
      alternativesConsidered: d.alternativesConsidered ?? null,
      contextAtTime: d.contextAtTime ?? null,
      relatedEntityIds: null,
      decidedAt: new Date(d.decidedAt),
      recordedAt: new Date(d.decidedAt),
    }))
  );
  for (let i = 0; i < allDecisionRows.length; i += 100) {
    const chunk = allDecisionRows.slice(i, i + 100);
    await db.insert(decisions).values(chunk);
  }
  console.log(`  ✓ ${allDecisionRows.length} decisions inserted`);

  console.log("\n✓ Done. Open /app and pick any channel — no more WhatsApp fragments.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
