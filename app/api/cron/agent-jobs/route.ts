import { NextResponse } from "next/server";
import { processQueue } from "@/lib/agents/job-queue";

// Vercel-managed cron route. Schedule lives in vercel.json. Vercel sets
// `Authorization: Bearer ${CRON_SECRET}` on every cron invocation; if
// CRON_SECRET is set in env we verify it. Outside of Vercel (local dev,
// manual hits), the route is open by default — set CRON_SECRET to lock it.
export const runtime = "nodejs";

export async function GET(req: Request) {
  const expected = process.env.CRON_SECRET;
  if (expected) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${expected}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const start = Date.now();
  const result = await processQueue();
  const durationMs = Date.now() - start;

  return NextResponse.json({ ok: true, ...result, durationMs });
}
