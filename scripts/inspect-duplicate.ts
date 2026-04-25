import { config } from "dotenv";
config({ path: ".env.turso" });
config({ path: ".env.local" });

import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { eq, inArray } from "drizzle-orm";
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

const DUP_ID = "87476403-24db-442d-8e54-8457e01351db";

async function main() {
  const team = await db.select().from(teams).where(eq(teams.id, DUP_ID)).get();
  console.log("TEAM:", JSON.stringify(team, null, 2));

  const mems = await db
    .select({ id: memberships.id, userId: memberships.userId, name: users.name, email: users.email, role: memberships.role, subteam: memberships.subteam, joinedAt: memberships.joinedAt })
    .from(memberships)
    .leftJoin(users, eq(memberships.userId, users.id))
    .where(eq(memberships.teamId, DUP_ID))
    .all();
  console.log(`\nMEMBERSHIPS (${mems.length}):`, JSON.stringify(mems, null, 2));

  const invs = await db.select().from(invites).where(eq(invites.teamId, DUP_ID)).all();
  console.log(`\nINVITES (${invs.length})`);

  const chs = await db.select().from(channels).where(eq(channels.teamId, DUP_ID)).all();
  console.log(`\nCHANNELS (${chs.length}):`);
  const chIds = chs.map(c => c.id);
  for (const c of chs) console.log(`  - ${c.id}  #${c.name}  (${c.type})`);

  if (chIds.length > 0) {
    const msgs = await db.select().from(messages).where(inArray(messages.channelId, chIds)).all();
    console.log(`\nMESSAGES across those channels: ${msgs.length}`);
    for (const m of msgs.slice(0, 10)) console.log(`  - [${m.channelId.slice(0, 8)}] ${m.content.slice(0, 80)}`);

    const chms = await db.select().from(channelMembers).where(inArray(channelMembers.channelId, chIds)).all();
    console.log(`\nCHANNEL_MEMBERS across those channels: ${chms.length}`);
  }

  const tks = await db.select().from(tasks).where(eq(tasks.teamId, DUP_ID)).all();
  console.log(`\nTASKS (${tks.length})`);

  const ents = await db.select().from(entities).where(eq(entities.teamId, DUP_ID)).all();
  console.log(`\nENTITIES (${ents.length})`);

  const facts = await db.select().from(extractedFacts).where(eq(extractedFacts.teamId, DUP_ID)).all();
  console.log(`\nEXTRACTED_FACTS (${facts.length})`);

  const decs = await db.select().from(decisions).where(eq(decisions.teamId, DUP_ID)).all();
  console.log(`\nDECISIONS (${decs.length})`);

  const jsess = await db.select().from(judgeSessions).where(eq(judgeSessions.teamId, DUP_ID)).all();
  console.log(`\nJUDGE_SESSIONS (${jsess.length})`);

  const eps = await db.select().from(exitPacks).where(eq(exitPacks.teamId, DUP_ID)).all();
  console.log(`\nEXIT_PACKS (${eps.length})`);

  const runs = await db.select().from(agentRuns).where(eq(agentRuns.teamId, DUP_ID)).all();
  console.log(`\nAGENT_RUNS (${runs.length})`);

  const docs = await db.select().from(generatedDocuments).where(eq(generatedDocuments.teamId, DUP_ID)).all();
  console.log(`\nGENERATED_DOCUMENTS (${docs.length})`);
}

main().catch((err) => { console.error(err); process.exit(1); });
