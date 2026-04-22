import { NextResponse } from "next/server";
import { anthropic } from "@/lib/anthropic";

export async function POST() {
  const message = await anthropic.messages.create({
    model: "claude-opus-4-7",
    max_tokens: 32,
    messages: [{ role: "user", content: "Say hi in five words." }],
  });
  const text =
    message.content[0].type === "text" ? message.content[0].text : "";
  return NextResponse.json({ ok: true, text });
}
