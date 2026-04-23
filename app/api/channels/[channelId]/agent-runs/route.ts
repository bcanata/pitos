import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { db } from "@/db";
import { agentRuns } from "@/db/schema";
import { desc, sql } from "drizzle-orm";

type Params = { params: Promise<{ channelId: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { user } = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { channelId } = await params;

  // agentRuns stores channelId inside inputContext JSON: { channelId, messageId, messageCount }
  const runs = await db
    .select({
      id: agentRuns.id,
      action: sql<string>`json_extract(${agentRuns.output}, '$.action')`,
      juryReflexKind: sql<string | null>`json_extract(${agentRuns.output}, '$.jury_reflex_kind')`,
      reasoning: sql<string | null>`substr(json_extract(${agentRuns.output}, '$.reasoning'), 1, 200)`,
      output: agentRuns.output,
      createdAt: agentRuns.createdAt,
      durationMs: agentRuns.durationMs,
    })
    .from(agentRuns)
    .where(
      sql`json_extract(${agentRuns.inputContext}, '$.channelId') = ${channelId}`
    )
    .orderBy(desc(agentRuns.createdAt))
    .limit(10)
    .all();

  return NextResponse.json({ runs });
}
