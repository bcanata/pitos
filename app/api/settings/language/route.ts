import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/session";
import { PREDEFINED } from "@/lib/i18n/index";
import { translateBundle } from "@/lib/i18n/translate";

export async function POST(request: Request) {
  const { user } = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json() as { lang: string };
  const lang = (body.lang ?? "").toLowerCase().trim();
  if (!lang) return NextResponse.json({ error: "lang required" }, { status: 400 });

  if (!PREDEFINED.has(lang)) {
    const translated = await translateBundle(lang);
    if (!translated) {
      return NextResponse.json({ error: "Translation failed" }, { status: 422 });
    }
  }

  await db.update(users)
    .set({ language: lang })
    .where(eq(users.id, user.id));

  return NextResponse.json({ ok: true });
}
