// Smoke test: enqueue a real channel-agent job, verify the row goes
// queued → running → completed in agent_runs.

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

  const teamId = "89d09a96-b302-478d-ab20-9aaead09ae08";
  const channelId = "c2710ced-dd88-49d8-88bd-8a05daba5db8";
  const userId = "aad122b8-7776-42c4-b9d7-51b6aa3ecf67";

  const triggerId = randomUUID();
  await db.insert(schema.messages).values({
    id: triggerId,
    channelId,
    userId,
    content: "[smoke-job-queue probe " + new Date().toISOString().slice(11, 19) + "]",
    agentGenerated: false,
    createdAt: new Date(),
  });

  const { enqueueChannelAgentJob } = await import("../lib/agents/job-queue");
  const t0 = Date.now();
  const jobId = await enqueueChannelAgentJob({
    teamId,
    channelId,
    messageId: triggerId,
    role: "lead_mentor",
  });
  console.log("enqueued jobId =", jobId, "after", Date.now() - t0, "ms");

  // Poll the row until status leaves running (~30s budget)
  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 1000));
    const row = await db.select().from(schema.agentRuns).where(eq(schema.agentRuns.id, jobId)).get();
    if (!row) {
      console.log("row missing!");
      return;
    }
    console.log(
      `t+${(i + 1).toString().padStart(2, " ")}s status=${row.status} attempts=${row.attempts}` +
      (row.lastError ? ` lastError=${row.lastError.slice(0, 60)}` : ""),
    );
    if (row.status === "completed" || (row.status === "failed" && (row.attempts ?? 0) >= 3)) break;
  }

  // Show last few agent_runs for the team
  const recent = await db
    .select({ id: schema.agentRuns.id, status: schema.agentRuns.status, attempts: schema.agentRuns.attempts, agentType: schema.agentRuns.agentType, createdAt: schema.agentRuns.createdAt })
    .from(schema.agentRuns)
    .where(eq(schema.agentRuns.teamId, teamId))
    .orderBy(desc(schema.agentRuns.createdAt))
    .limit(5)
    .all();
  console.log("\nlast 5 agent_runs for team:");
  for (const r of recent) console.log(" ", r);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
