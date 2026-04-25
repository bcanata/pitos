import { config } from "dotenv";
config({ path: ".env.turso" });
config({ path: ".env.local" });

import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { eq, desc } from "drizzle-orm";
import { randomUUID } from "crypto";
import * as schema from "../db/schema";

async function main() {
  const client = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
  const db = drizzle(client, { schema });

  const { runMentionAgent } = await import("../lib/agents/pitos-mention");

  const teamId = "89d09a96-b302-478d-ab20-9aaead09ae08";
  const channelId = "1106939d-9d9b-4d2e-9b3f-9c72a6539ef3";
  const userId = "aad122b8-7776-42c4-b9d7-51b6aa3ecf67";

  const triggerContent =
    "@pitos can you search and find our thebluealliance page? Team 8092.";

  const trigger = randomUUID();
  await db.insert(schema.messages).values({
    id: trigger,
    channelId,
    userId,
    content: triggerContent,
    agentGenerated: false,
    createdAt: new Date(),
  });

  const channel = await db.select().from(schema.channels).where(eq(schema.channels.id, channelId)).get();
  const team = await db.select().from(schema.teams).where(eq(schema.teams.id, teamId)).get();
  const recent = await db
    .select()
    .from(schema.messages)
    .where(eq(schema.messages.channelId, channelId))
    .orderBy(desc(schema.messages.createdAt))
    .limit(20)
    .all();
  const transcript = recent
    .reverse()
    .map((m) => `[${m.agentGenerated ? "PitOS" : "user"}] ${m.content}`)
    .join("\n");

  await runMentionAgent({
    channelId,
    channelName: channel!.name,
    messageId: trigger,
    teamId,
    teamName: team!.name,
    triggerContent,
    transcript,
    userId,
    role: "lead_mentor",
    language: "en",
  });

  const reply = await db
    .select()
    .from(schema.messages)
    .where(eq(schema.messages.channelId, channelId))
    .orderBy(desc(schema.messages.createdAt))
    .limit(1)
    .get();
  console.log("\nREPLY:", reply?.content?.slice(0, 800));

  const run = await db
    .select()
    .from(schema.agentRuns)
    .where(eq(schema.agentRuns.teamId, teamId))
    .orderBy(desc(schema.agentRuns.createdAt))
    .limit(1)
    .get();
  const tc = run?.toolCalls as
    | Array<{ name: string; output: { ok: boolean; error?: string } }>
    | null;
  console.log(`\nTOOL CALLS: ${tc?.length ?? 0}`);
  for (const c of tc ?? []) console.log(`  ${c.name} ok=${c.output?.ok}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
