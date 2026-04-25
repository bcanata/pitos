import { config } from "dotenv";
config({ path: ".env.turso" });
config({ path: ".env.local" });

import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { eq } from "drizzle-orm";
import * as schema from "../db/schema";

const { teams, memberships, users, entities, extractedFacts, channels } = schema;

const client = createClient({
  url: process.env.TURSO_DATABASE_URL ?? "file:./pitos.db",
  authToken: process.env.TURSO_AUTH_TOKEN,
});
const db = drizzle(client, { schema });

async function main() {
  const allTeams = await db.select().from(teams).all();
  console.log("TEAMS:", JSON.stringify(allTeams, null, 2));

  for (const t of allTeams) {
    const mems = await db
      .select({
        userId: users.id,
        name: users.name,
        email: users.email,
        role: memberships.role,
        subteam: memberships.subteam,
      })
      .from(memberships)
      .leftJoin(users, eq(memberships.userId, users.id))
      .where(eq(memberships.teamId, t.id))
      .all();
    console.log(`\nMEMBERS of ${t.name} (${mems.length}):`);
    for (const m of mems) console.log(`  - ${m.name ?? "?"} <${m.email ?? "?"}> [${m.role}${m.subteam ? "/" + m.subteam : ""}]`);

    const ents = await db.select().from(entities).where(eq(entities.teamId, t.id)).all();
    console.log(`\nENTITIES (${ents.length}):`);
    for (const e of ents) console.log(`  - [${e.kind}] ${e.name} (canon=${e.canonicalName ?? "-"})`);

    const facts = await db.select().from(extractedFacts).where(eq(extractedFacts.teamId, t.id)).all();
    console.log(`\nFACTS (${facts.length}):`);
    for (const f of facts.slice(0, 10)) console.log(`  - [${f.factType}] ${f.statement.slice(0, 100)}`);
    if (facts.length > 10) console.log(`  … +${facts.length - 10} more`);

    const chs = await db.select().from(channels).where(eq(channels.teamId, t.id)).all();
    console.log(`\nCHANNELS (${chs.length}):`);
    for (const c of chs) console.log(`  - #${c.name} (${c.type})`);
  }
}

main().catch((err) => { console.error(err); process.exit(1); });
