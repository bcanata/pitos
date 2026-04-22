import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { continueExitInterview } from "@/lib/agents/exit-interview-agent";

export async function POST(req: Request) {
  const { user } = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json()) as { packId?: string; answer?: string };

  if (!body.packId || !body.answer) {
    return NextResponse.json({ error: "packId and answer are required" }, { status: 400 });
  }

  const result = await continueExitInterview(body.packId, body.answer);
  return NextResponse.json(result);
}
