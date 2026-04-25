/**
 * Switch the seeded G.O.A.T. team to English: rename channels (Turkish slugs
 * → English), translate channel descriptions, and flip teams.language to "en"
 * so the live channel-agent responds in English too.
 *
 * Channel UUIDs are preserved — only `name` and `description` change.
 *
 * Run: npx tsx scripts/localize-team-en.ts            (dry-run preview)
 *      npx tsx scripts/localize-team-en.ts --apply
 */

import { config } from "dotenv";
config({ path: ".env.turso" });
config({ path: ".env.local" });

import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { eq } from "drizzle-orm";
import * as schema from "../db/schema";

const APPLY = process.argv.includes("--apply");

const client = createClient({
  url: process.env.TURSO_DATABASE_URL ?? "file:./pitos.db",
  authToken: process.env.TURSO_AUTH_TOKEN,
});
const db = drizzle(client, { schema });

const TEAM_ID = "89d09a96-b302-478d-ab20-9aaead09ae08";

const CHANNELS: Record<string, { name: string; description: string }> = {
  "1106939d-9d9b-4d2e-9b3f-9c72a6539ef3": {
    name: "general",
    description: "Team chat, culture, off-topic",
  },
  "246af821-24f7-4c8e-8cd0-c955cb2cac00": {
    name: "mentors",
    description: "Mentor coordination (private)",
  },
  "c2710ced-dd88-49d8-88bd-8a05daba5db8": {
    name: "mechanical",
    description: "Design, fabrication, assembly, testing",
  },
  "cfb326d5-39f6-4b04-b7c7-1fffb04172d1": {
    name: "software",
    description: "Code, vision pipelines, autonomous, robot integration",
  },
  "ca8b1e84-c553-4613-b827-2bc05e68d99c": {
    name: "electrical",
    description: "Wiring, motor controllers, sensors, power",
  },
  "8419a670-3a15-413e-a96e-4159de75260b": {
    name: "cad",
    description: "Onshape / SolidWorks design, BOM, file discipline",
  },
  "4768c6cc-826e-481d-ac41-ec334070a933": {
    name: "strategy",
    description: "Game analysis, alliance criteria, match planning",
  },
  "f73dce5e-c9eb-4ece-a4bd-57fccea8947a": {
    name: "sponsors",
    description: "Sponsor relationships, meetings, follow-ups",
  },
  "144277b6-7765-4e3d-824b-72bfb094ab7c": {
    name: "media",
    description: "Social, photo, video, press",
  },
  "0805d52b-ab18-4ed3-a0b7-564d0bb3330a": {
    name: "awards",
    description: "Impact, Engineering Inspiration, Dean's List submissions",
  },
  "c635757e-6a53-4d1f-8607-d2a0b85e96e1": {
    name: "scouting",
    description: "Opponent analysis, match data, alliance picks",
  },
  "92de2aa2-3a61-4928-b16f-9cde02d59ff6": {
    name: "pit-crew",
    description: "Tournament pit operations",
  },
  "cc76a840-e834-4f18-833a-759bfd1357da": {
    name: "travel",
    description: "Transport, lodging, logistics",
  },
  "70209dd4-e94d-481e-b46c-1644b6659d34": {
    name: "kit-of-parts",
    description: "KOP inventory, missing parts, replacement requests",
  },
  "8fd2d7d3-bc40-446b-94b3-38b9ed4b9ec2": {
    name: "safety",
    description: "Safety incidents, equipment maintenance, drills",
  },
  "47a5940c-2cdf-4e07-aaff-8f99510a011f": {
    name: "alumni",
    description: "Alumni connection — Exit Interview transcripts",
  },
  "bff9357d-5991-46e6-ac9a-67085e54f95e": {
    name: "announcements",
    description: "Team-wide announcements and decisions",
  },
  "c16e7e42-aa1f-4c68-972b-bc9691c0cb51": {
    name: "outreach",
    description: "Community events, school visits, demos",
  },
};

async function main() {
  console.log(APPLY ? "▶ APPLY mode" : "▶ DRY-RUN mode (use --apply to write)");

  const team = await db.select().from(schema.teams).where(eq(schema.teams.id, TEAM_ID)).get();
  if (!team) {
    console.error(`Team ${TEAM_ID} not found.`);
    process.exit(1);
  }
  console.log(`◇ Team: ${team.name} #${team.number}  (current language=${team.language})`);

  // Show planned channel renames
  const dbChannels = await db
    .select()
    .from(schema.channels)
    .where(eq(schema.channels.teamId, TEAM_ID))
    .all();

  console.log("\n◇ Channel renames:");
  for (const c of dbChannels) {
    const target = CHANNELS[c.id];
    if (!target) {
      console.log(`    #${c.name}  (no mapping — leaving alone)`);
      continue;
    }
    if (c.name === target.name && c.description === target.description) {
      console.log(`    #${c.name}  (already English)`);
      continue;
    }
    console.log(`    #${c.name.padEnd(16)} → #${target.name}`);
    console.log(`        "${c.description ?? ""}"`);
    console.log(`     →  "${target.description}"`);
  }

  if (!APPLY) {
    console.log("\n— dry-run complete. Re-run with --apply to write. —");
    return;
  }

  // Flip team language
  await db.update(schema.teams).set({ language: "en" }).where(eq(schema.teams.id, TEAM_ID));
  console.log("\n✓ teams.language → 'en'");

  // Rename channels
  for (const c of dbChannels) {
    const target = CHANNELS[c.id];
    if (!target) continue;
    await db
      .update(schema.channels)
      .set({ name: target.name, description: target.description })
      .where(eq(schema.channels.id, c.id));
  }
  console.log(`✓ ${Object.keys(CHANNELS).length} channels renamed + descriptions translated`);

  console.log("\n✓ Done. Open /app — sidebar now reads in English, agent will respond in English.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
