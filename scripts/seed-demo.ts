/**
 * Demo seed script for PitOS.
 * Run with: npx tsx scripts/seed-demo.ts
 */

import { randomUUID } from "crypto";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "../db/schema";
import { eq } from "drizzle-orm";

const {
  users,
  teams,
  memberships,
  channels,
  channelMembers,
  messages,
  decisions,
  extractedFacts,
  tasks,
} = schema;

const dbPath = process.env.DATABASE_URL ?? "./pitos.db";
const sqlite = new Database(dbPath);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");
const db = drizzle(sqlite, { schema });

// ─── Helpers ────────────────────────────────────────────────────────────────

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

// ─── Main ────────────────────────────────────────────────────────────────────

console.log(`\n🌱 Seeding demo data into ${dbPath}\n`);

// 1. Find or create demo user
let demoUser = db
  .select()
  .from(users)
  .where(eq(users.email, "demo@pitos.app"))
  .get();

if (!demoUser) {
  const firstUser = db.select().from(users).get();
  if (firstUser) {
    demoUser = firstUser;
    console.log(`Using existing user: ${firstUser.email}`);
  } else {
    const userId = randomUUID();
    db.insert(users)
      .values({
        id: userId,
        email: "demo@pitos.app",
        name: "Coach Mehmet",
        createdAt: daysAgo(60),
      })
      .run();
    demoUser = db.select().from(users).where(eq(users.id, userId)).get()!;
    console.log(`Created demo user: demo@pitos.app`);
  }
} else {
  console.log(`Found existing demo user: demo@pitos.app`);
}

// 2. Check if team 8092 already exists
const existingTeam = db
  .select()
  .from(teams)
  .where(eq(teams.number, 8092))
  .get();

if (existingTeam) {
  console.log(`Team 8092 already exists (id: ${existingTeam.id}). Skipping seed.`);
  process.exit(0);
}

// 3. Create the team
const teamId = randomUUID();
db.insert(teams)
  .values({
    id: teamId,
    name: "Greatest of All Times",
    number: 8092,
    school: "Tekirdağ Science High School",
    country: "Turkey",
    rookieYear: 2022,
    createdByUserId: demoUser.id,
    createdAt: daysAgo(55),
  })
  .run();
console.log(`Created team: "Greatest of All Times" (8092)`);

// 4. Create membership
db.insert(memberships)
  .values({
    id: randomUUID(),
    userId: demoUser.id,
    teamId,
    role: "lead_mentor",
    subteam: "build",
    joinedAt: daysAgo(55),
  })
  .run();
console.log(`Created membership: lead_mentor`);

// 5. Seed 4 channels
const channelDefs = [
  { name: "general", description: "Team-wide announcements and discussion" },
  { name: "outreach", description: "Community outreach & events" },
  { name: "build", description: "Robot build & engineering" },
  { name: "programming", description: "Software & programming" },
];

const channelIds: Record<string, string> = {};

for (const ch of channelDefs) {
  const channelId = randomUUID();
  channelIds[ch.name] = channelId;
  db.insert(channels)
    .values({
      id: channelId,
      teamId,
      name: ch.name,
      description: ch.description,
      type: "public",
      createdAt: daysAgo(55),
    })
    .run();
  db.insert(channelMembers)
    .values({
      id: randomUUID(),
      channelId,
      userId: demoUser.id,
      joinedAt: daysAgo(55),
    })
    .run();
}
console.log(`Created 4 channels: ${Object.keys(channelIds).join(", ")}`);

// ─── 6. Seed ~15 messages ────────────────────────────────────────────────────

const uid = demoUser.id;

interface MsgDef {
  channel: string;
  content: string;
  daysBack: number;
  agent?: boolean;
  agentType?: string;
  juryReflex?: "proof_demand" | "why_question" | "teach_redirect";
}

const msgDefs: MsgDef[] = [
  // build channel
  {
    channel: "build",
    content:
      "Alright team — we're going with a rectangular box frame. 30x26 inches, 1x1 aluminum tube. Light and rigid enough for our weight budget.",
    daysBack: 50,
  },
  {
    channel: "build",
    content:
      "Wait — why rectangular over a more triangulated frame? The extra cross-bracing weight might not be worth it at our power budget.",
    daysBack: 50,
    agent: true,
    agentType: "channel",
    juryReflex: "why_question",
  },
  {
    channel: "build",
    content:
      "Good catch. We ran the numbers: rectangular saves 800g of aluminum at the tube gauge we're using, and triangulation isn't needed at our torque levels. Rectangular wins.",
    daysBack: 49,
  },
  {
    channel: "build",
    content:
      "We're over weight by 1.4 kg. The arm mechanism alone is 2.2 kg. Proposing we drop the secondary arm and go single-pivot only.",
    daysBack: 35,
  },
  {
    channel: "build",
    content:
      "Agreed. Single pivot is more reliable under defense anyway. We had 3 arm jams in practice last week.",
    daysBack: 35,
  },
  {
    channel: "build",
    content:
      "Switched drivetrain from tank to swerve. Yes it's late, but we have the modules from last year. Swerve gives us the field positioning to score from the far side.",
    daysBack: 28,
  },

  // programming channel
  {
    channel: "programming",
    content:
      "Vision tracking with Limelight is only giving us 60% detection rate under the field lights. Not reliable enough for autonomous.",
    daysBack: 30,
  },
  {
    channel: "programming",
    content:
      "Do you have reproducible test data for that 60% claim? Measurement conditions matter a lot here.",
    daysBack: 30,
    agent: true,
    agentType: "channel",
    juryReflex: "proof_demand",
  },
  {
    channel: "programming",
    content:
      "Dropping vision tracking from auto routine. Encoder-only odometry at this stage. We can revisit for regionals if we have bandwidth.",
    daysBack: 25,
  },

  // outreach channel
  {
    channel: "outreach",
    content:
      "Community demo confirmed at Tekirdağ city square on March 14. We'll have the practice robot, 3 banners, and a STEM activity station for kids.",
    daysBack: 45,
  },
  {
    channel: "outreach",
    content:
      "Atatürk Makine Sanayi reached out about sponsoring our field trip costs. Meeting scheduled for next Thursday at their facility.",
    daysBack: 40,
  },
  {
    channel: "outreach",
    content:
      "School visit to Çorlu Fen Lisesi done. Presented to 140 students, recruited 3 potential new members for next season. Great turnout.",
    daysBack: 20,
  },

  // general channel
  {
    channel: "general",
    content:
      "Competition in 3 weeks. Robot needs to be bag-ready by end of next Saturday. Build team please confirm schedule availability.",
    daysBack: 22,
  },
  {
    channel: "general",
    content:
      "Match strategy confirmed: play defense in quals, aim for top-8 alliance. Our robot is best used clearing the opponent intake zone.",
    daysBack: 15,
  },
  {
    channel: "general",
    content:
      "Added a backup intake mechanism — a passive wedge intake that works even if the pneumatics fail. Adds 400g but gives us a fallback.",
    daysBack: 10,
  },
];

const insertedMessageIds: string[] = [];

for (const def of msgDefs) {
  const msgId = randomUUID();
  insertedMessageIds.push(msgId);
  db.insert(messages)
    .values({
      id: msgId,
      channelId: channelIds[def.channel],
      userId: def.agent ? null : uid,
      content: def.content,
      agentGenerated: def.agent ?? false,
      agentType: def.agentType ?? null,
      juryReflexKind: def.juryReflex ?? null,
      createdAt: daysAgo(def.daysBack),
    })
    .run();
}

console.log(`Inserted ${msgDefs.length} messages across channels`);

// ─── 7. Insert 3 decisions ───────────────────────────────────────────────────

const decisionDefs = [
  {
    decision: "Switched from tank to swerve drive",
    rationale:
      "Swerve provides the field positioning flexibility needed to score from the far side of the field. We have the modules from last season, reducing cost. Tank drive limited our autonomous path options given the field layout.",
    alternativesConsidered:
      "Tank drive: simpler, less code, but restricted to fixed heading. Mecanum: considered and rejected due to weight and field defense vulnerability.",
    daysBack: 28,
  },
  {
    decision: "Dropped vision tracking from autonomous routine",
    rationale:
      "Limelight detection rate was inconsistent under competition field lighting. Encoder-based odometry proved more reliable in testing. Dropping vision reduces autonomous failure modes before the first qualifier.",
    alternativesConsidered:
      "Tuning Limelight exposure settings — tried but field lighting variability remained. PhotonVision — no bandwidth to integrate at this stage.",
    daysBack: 25,
  },
  {
    decision: "Added backup passive wedge intake mechanism",
    rationale:
      "Pneumatics failures during practice matches caused complete intake loss 3 times. A passive wedge intake that works without pneumatics gives the robot a fallback. Weight penalty of 400g is acceptable given reliability gain.",
    alternativesConsidered:
      "Repairing pneumatics mid-match (not feasible in 2.5 min); removing pneumatics entirely (gives up primary intake performance).",
    daysBack: 10,
  },
];

for (const def of decisionDefs) {
  db.insert(decisions)
    .values({
      id: randomUUID(),
      teamId,
      decision: def.decision,
      rationale: def.rationale,
      alternativesConsidered: def.alternativesConsidered,
      decidedAt: daysAgo(def.daysBack),
      recordedAt: daysAgo(def.daysBack - 1),
    })
    .run();
}

console.log(`Inserted 3 decisions`);

// ─── 8. Insert 2 extractedFacts ──────────────────────────────────────────────

db.insert(extractedFacts)
  .values({
    id: randomUUID(),
    teamId,
    factType: "metric",
    statement:
      "Robot arm mechanism weighed 2.2 kg before simplification to single-pivot design, resulting in 1.4 kg over the weight budget.",
    hasEvidence: true,
    evidenceQuality: "strong",
    confidence: 0.95,
    extractedAt: daysAgo(35),
    modelUsed: "claude-opus-4-7",
  })
  .run();

db.insert(extractedFacts)
  .values({
    id: randomUUID(),
    teamId,
    factType: "event",
    statement:
      "Team 8092 conducted a community outreach demo at Tekirdağ city square on March 14 with the practice robot and STEM activity station for children.",
    hasEvidence: true,
    evidenceQuality: "strong",
    confidence: 0.98,
    extractedAt: daysAgo(20),
    modelUsed: "claude-opus-4-7",
  })
  .run();

console.log(`Inserted 2 extractedFacts`);

// ─── 9. Insert 2 completed tasks ─────────────────────────────────────────────

db.insert(tasks)
  .values({
    id: randomUUID(),
    teamId,
    channelId: channelIds["build"],
    title: "Finalize robot weight audit and submit to drive coach",
    description: "Weigh all sub-assemblies, document in spreadsheet, identify top 3 reduction candidates.",
    assignedToUserId: uid,
    status: "done",
    teachMode: false,
    completedAt: daysAgo(32),
    createdAt: daysAgo(38),
  })
  .run();

db.insert(tasks)
  .values({
    id: randomUUID(),
    teamId,
    channelId: channelIds["outreach"],
    title: "Prepare sponsor meeting slides for Atatürk Makine Sanayi",
    description: "Include team highlights, impact metrics, and sponsorship tier options.",
    assignedToUserId: uid,
    status: "done",
    teachMode: false,
    completedAt: daysAgo(37),
    createdAt: daysAgo(41),
  })
  .run();

console.log(`Inserted 2 completed tasks`);

// ─── Summary ─────────────────────────────────────────────────────────────────

console.log(`
✅ Demo seed complete!
   Team:        Greatest of All Times (8092)
   School:      Tekirdağ Science High School, Turkey
   User:        ${demoUser.email} → lead_mentor
   Channels:    ${Object.keys(channelIds).join(", ")}
   Messages:    ${msgDefs.length} (incl. 3 agent-generated with jury reflex)
   Decisions:   3
   Facts:       2 (evidenceQuality: strong)
   Tasks:       2 completed
`);
