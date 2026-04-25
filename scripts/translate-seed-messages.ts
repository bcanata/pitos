/**
 * Translate all seeded (non-agent) messages in a team from Turkish → English.
 *
 * Dry-run (preview only):
 *   npx tsx scripts/translate-seed-messages.ts
 *
 * Apply to Turso:
 *   npx tsx scripts/translate-seed-messages.ts --apply
 *
 * Flags:
 *   --team  <teamId>   Target team (default: first team in DB)
 *   --batch <N>        Messages per Claude call (default 30)
 *   --apply            Write translated content back to DB
 */

import { config } from "dotenv";
config({ path: ".env.turso" });
config({ path: ".env.local" });

import Anthropic from "@anthropic-ai/sdk";
import { eq } from "drizzle-orm";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "../db/schema";
import { teams, messages } from "../db/schema";

// Build client after env is loaded (must come after config() calls above)
const client = createClient({
  url: process.env.TURSO_DATABASE_URL ?? "file:./pitos.db",
  authToken: process.env.TURSO_AUTH_TOKEN,
});
const db = drizzle(client, { schema });

// ─── CLI ─────────────────────────────────────────────────────────────────────

const APPLY = process.argv.includes("--apply");
const _teamIdx = process.argv.indexOf("--team");
const TEAM_ARG = _teamIdx >= 0 ? process.argv[_teamIdx + 1] : undefined;
const _batchIdx = process.argv.indexOf("--batch");
const BATCH_SZ = _batchIdx >= 0 ? Number(process.argv[_batchIdx + 1]) : 20;

// ─── Main ─────────────────────────────────────────────────────────────────────

const anthropic = new Anthropic();

async function translateBatch(items: { id: string; content: string }[]): Promise<{ id: string; content: string }[]> {
  const payload = JSON.stringify(items.map(m => ({ id: m.id, content: m.content })));

  const res = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 8192,
    system: `You translate Turkish FRC (FIRST Robotics Competition) team chat messages to natural English.
Rules:
- Preserve meaning, tone, and technical terms (robot part names, FRC jargon, game piece names, WPILib, etc.)
- Keep placeholders like [link], [telefon], [email], [laf] verbatim
- Keep names (proper nouns) as-is
- Output ONLY a valid JSON array with objects {id, content}. No markdown fences, no commentary.`,
    messages: [{ role: "user", content: `Translate this JSON array of messages. Return the same array with translated "content" fields:\n${payload}` }],
  });

  const text = res.content.find(b => b.type === "text")?.text?.trim() ?? "[]";
  try {
    return JSON.parse(text) as { id: string; content: string }[];
  } catch {
    // Strip any accidental markdown fences and retry
    const cleaned = text.replace(/^```[a-z]*\n?/, "").replace(/\n?```$/, "").trim();
    return JSON.parse(cleaned) as { id: string; content: string }[];
  }
}

async function main() {
  const allTeams = await db.select().from(teams).all();
  const team = TEAM_ARG ? allTeams.find(t => t.id === TEAM_ARG) : allTeams[0];
  if (!team) throw new Error("No team found.");
  console.log(`Team: ${team.name} (${team.id})`);

  // Fetch all non-agent messages for this team's channels
  const { channels: channelsTable } = await import("../db/schema");
  const teamChannels = await db.select().from(channelsTable).where(eq(channelsTable.teamId, team.id)).all();
  const channelIds = new Set(teamChannels.map(c => c.id));

  const allMsgs = await db.select().from(messages).all();
  const target = allMsgs.filter(m => channelIds.has(m.channelId) && !m.agentGenerated && m.userId !== null);

  console.log(`Found ${target.length} seeded messages to translate.`);

  // Batch
  const batches: typeof target[] = [];
  for (let i = 0; i < target.length; i += BATCH_SZ) batches.push(target.slice(i, i + BATCH_SZ));

  let translated = 0;
  for (let bi = 0; bi < batches.length; bi++) {
    const batch = batches[bi];
    process.stdout.write(`  Batch ${bi + 1}/${batches.length} (${batch.length} msgs)…`);
    const results = await translateBatch(batch.map(m => ({ id: m.id, content: m.content })));

    for (const r of results) {
      const orig = batch.find(m => m.id === r.id);
      if (!orig) continue;
      if (APPLY) {
        await db.update(messages).set({ content: r.content }).where(eq(messages.id, r.id));
      } else {
        console.log(`\n  [${r.id.slice(0, 8)}]`);
        console.log(`  TR: ${orig.content.slice(0, 120)}`);
        console.log(`  EN: ${r.content.slice(0, 120)}`);
      }
      translated++;
    }
    console.log(` done.`);
  }

  console.log(`\n${APPLY ? "✅ Updated" : "🔍 Previewed"} ${translated} messages.`);
  if (!APPLY) console.log("Re-run with --apply to write to DB.");
}

main().catch(err => { console.error(err); process.exit(1); });
