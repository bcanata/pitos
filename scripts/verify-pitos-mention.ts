/**
 * End-to-end verify @pitos tool surface by calling runMentionAgent
 * directly with synthetic trigger messages. No HTTP needed.
 *
 * Run: npx tsx scripts/verify-pitos-mention.ts
 */

import { config } from "dotenv";
config({ path: ".env.turso" });
config({ path: ".env.local" });

import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { eq, desc, and, gte } from "drizzle-orm";
import { randomUUID } from "crypto";
import * as schema from "../db/schema";

const client = createClient({
  url: process.env.TURSO_DATABASE_URL ?? "file:./pitos.db",
  authToken: process.env.TURSO_AUTH_TOKEN,
});
const db = drizzle(client, { schema });

const TEAM_ID = "89d09a96-b302-478d-ab20-9aaead09ae08";
const BUGRA_ID = "aad122b8-7776-42c4-b9d7-51b6aa3ecf67";
const SPONSORS_CHANNEL = "f73dce5e-c9eb-4ece-a4bd-57fccea8947a";

async function postUserMessage(content: string): Promise<{ id: string; channelId: string }> {
  const id = randomUUID();
  await db.insert(schema.messages).values({
    id,
    channelId: SPONSORS_CHANNEL,
    userId: BUGRA_ID,
    content,
    agentGenerated: false,
    createdAt: new Date(),
  });
  return { id, channelId: SPONSORS_CHANNEL };
}

async function runOne(label: string, content: string) {
  console.log(`\n━━━ ${label} ━━━`);
  console.log(`> ${content}`);
  const trigger = await postUserMessage(content);

  // Dynamic import so env loads first
  const { runMentionAgent } = await import("../lib/agents/pitos-mention");
  const team = await db.select().from(schema.teams).where(eq(schema.teams.id, TEAM_ID)).get();
  const channel = await db.select().from(schema.channels).where(eq(schema.channels.id, SPONSORS_CHANNEL)).get();
  const recent = await db.select().from(schema.messages)
    .where(eq(schema.messages.channelId, SPONSORS_CHANNEL))
    .orderBy(desc(schema.messages.createdAt)).limit(20).all();
  const transcript = recent.reverse().map(m => `[${m.agentGenerated ? "PitOS" : "user"}] ${m.content}`).join("\n");

  await runMentionAgent({
    channelId: SPONSORS_CHANNEL,
    channelName: channel!.name,
    messageId: trigger.id,
    teamId: TEAM_ID,
    teamName: team!.name,
    triggerContent: content,
    transcript,
    userId: BUGRA_ID,
    role: "lead_mentor",
    language: "en",
  });

  // Show the agent's reply
  const reply = await db.select().from(schema.messages)
    .where(eq(schema.messages.channelId, SPONSORS_CHANNEL))
    .orderBy(desc(schema.messages.createdAt))
    .limit(1).get();
  console.log(`< ${reply?.content?.slice(0, 220) ?? "(no reply)"}`);

  // Show last agent run with toolCalls
  const run = await db.select().from(schema.agentRuns)
    .where(eq(schema.agentRuns.teamId, TEAM_ID))
    .orderBy(desc(schema.agentRuns.createdAt))
    .limit(1).get();
  const tc = run?.toolCalls as Array<{ name: string; output: { ok: boolean; error?: string } }> | null;
  if (tc?.length) {
    for (const c of tc) {
      console.log(`  tool=${c.name} ok=${c.output.ok}${c.output.error ? " err=" + c.output.error : ""}`);
    }
  } else {
    console.log("  (no tool calls)");
  }
}

async function main() {
  const since = new Date(Date.now() - 60_000);

  await runOne(
    "1. create_task (your original prompt)",
    `@pitos create new task, "to find sponsors for season 2026"`
  );

  await runOne(
    "2. update_task_status",
    `@pitos mark the "find sponsors for season 2026" task as in_progress`
  );

  await runOne(
    "3. create_decision",
    `@pitos record decision: switch to MK4i swerve modules. rationale: COTS reliability beats custom plates this year. alternatives: MAXSwerve, SDS Mk4 with custom mounting.`
  );

  await runOne(
    "4. query_memory",
    `@pitos when did we win the Judges' Award and what got cited?`
  );

  await runOne(
    "5. post_message_to_channel",
    `@pitos post in #safety: don't forget the LOTO drill tomorrow at 16:00`
  );

  // Summary of what landed in the DB
  console.log("\n\n━━━ DB DELTA SINCE TEST START ━━━");
  const newTasks = await db.select().from(schema.tasks)
    .where(and(eq(schema.tasks.teamId, TEAM_ID), gte(schema.tasks.createdAt, since))).all();
  console.log(`tasks created: ${newTasks.length}`);
  for (const t of newTasks) console.log(`  [${t.status}] ${t.title}`);

  const newDecisions = await db.select().from(schema.decisions)
    .where(and(eq(schema.decisions.teamId, TEAM_ID), gte(schema.decisions.recordedAt, since))).all();
  console.log(`\ndecisions created: ${newDecisions.length}`);
  for (const d of newDecisions) console.log(`  ${d.decision} | rationale: ${d.rationale?.slice(0, 80) ?? "—"}`);

  const newMsgs = await db.select({ name: schema.channels.name, content: schema.messages.content, agent: schema.messages.agentGenerated, agentType: schema.messages.agentType })
    .from(schema.messages).innerJoin(schema.channels, eq(schema.messages.channelId, schema.channels.id))
    .where(and(eq(schema.channels.teamId, TEAM_ID), gte(schema.messages.createdAt, since)))
    .orderBy(desc(schema.messages.createdAt)).all();
  console.log(`\nmessages created: ${newMsgs.length}`);
  console.log("  (cross-channel posts with agent=true & agentType=pitos-mention indicate post_message_to_channel worked)");
  for (const m of newMsgs) console.log(`  [#${m.name}] ${m.agent ? `(agent:${m.agentType}) ` : ""}${m.content.slice(0, 100).replace(/\n/g, " ")}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
