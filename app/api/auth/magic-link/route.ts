import { NextResponse } from "next/server";
import { z } from "zod";
import { sendMagicLink } from "@/lib/auth/magic-link";

const schema = z.object({ email: z.string().email() });

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  await sendMagicLink(parsed.data.email);
  return NextResponse.json({ ok: true });
}
