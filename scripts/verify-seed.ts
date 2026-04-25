import { config } from "dotenv";
config({ path: ".env.turso" });
config({ path: ".env.local" });

import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { eq, sql } from "drizzle-orm";
import * as schema from "../db/schema";

const client = createClient({
  url: process.env.TURSO_DATABASE_URL ?? "file:./pitos.db",
  authToken: process.env.TURSO_AUTH_TOKEN,
});
const db = drizzle(client, { schema });

async function main() {
  const teamId = "89d09a96-b302-478d-ab20-9aaead09ae08";

  const taskStatus = await db
    .select({ status: schema.tasks.status, c: sql<number>`count(*)` })
    .from(schema.tasks)
    .where(eq(schema.tasks.teamId, teamId))
    .groupBy(schema.tasks.status)
    .all();
  console.log("TASK STATUS MIX:");
  for (const r of taskStatus) console.log(`  ${r.status}: ${r.c}`);

  const agentCnt = await db
    .select({ c: sql<number>`count(*)` })
    .from(schema.messages)
    .innerJoin(schema.channels, eq(schema.messages.channelId, schema.channels.id))
    .where(
      sql`${schema.channels.teamId} = ${teamId} AND ${schema.messages.agentGenerated} = 1`
    )
    .all();
  console.log(`\nAGENT MESSAGES: ${agentCnt[0].c}`);

  const reflexes = await db
    .select({ kind: schema.messages.juryReflexKind, c: sql<number>`count(*)` })
    .from(schema.messages)
    .innerJoin(schema.channels, eq(schema.messages.channelId, schema.channels.id))
    .where(
      sql`${schema.channels.teamId} = ${teamId} AND ${schema.messages.juryReflexKind} IS NOT NULL`
    )
    .groupBy(schema.messages.juryReflexKind)
    .all();
  console.log("JURY REFLEX KINDS:");
  for (const r of reflexes) console.log(`  ${r.kind}: ${r.c}`);

  const replies = await db
    .select({ c: sql<number>`count(*)` })
    .from(schema.messages)
    .innerJoin(schema.channels, eq(schema.messages.channelId, schema.channels.id))
    .where(
      sql`${schema.channels.teamId} = ${teamId} AND ${schema.messages.replyToMessageId} IS NOT NULL`
    )
    .all();
  console.log(`\nREPLY-LINKED MESSAGES: ${replies[0].c}`);

  const decCount = await db
    .select({ c: sql<number>`count(*)` })
    .from(schema.decisions)
    .where(eq(schema.decisions.teamId, teamId))
    .all();
  const decs = await db
    .select()
    .from(schema.decisions)
    .where(eq(schema.decisions.teamId, teamId))
    .limit(5)
    .all();
  console.log(`\nSAMPLE DECISIONS (5/${decCount[0].c}):`);
  for (const d of decs) console.log(`  - ${d.decision.slice(0, 110)}`);

  const sampleAgent = await db
    .select()
    .from(schema.messages)
    .innerJoin(schema.channels, eq(schema.messages.channelId, schema.channels.id))
    .where(
      sql`${schema.channels.teamId} = ${teamId} AND ${schema.messages.agentGenerated} = 1`
    )
    .limit(3)
    .all();
  console.log(`\nSAMPLE AGENT MESSAGES:`);
  for (const r of sampleAgent) {
    console.log(
      `  [#${r.channels.name}] [${r.messages.juryReflexKind}] ${r.messages.content.slice(0, 140)}`
    );
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
