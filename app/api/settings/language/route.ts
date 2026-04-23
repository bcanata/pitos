import { NextResponse } from "next/server";
import { db } from "@/db";
import { teams, memberships } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/session";
import { PREDEFINED } from "@/lib/i18n/index";
import { translateBundle } from "@/lib/i18n/translate";

export async function POST(request: Request) {
  const { user } = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json() as { teamId: string; lang: string };
  const lang = (body.lang ?? "").toLowerCase().trim();
  if (!lang) return NextResponse.json({ error: "lang required" }, { status: 400 });

  const membership = db
    .select()
    .from(memberships)
    .where(eq(memberships.userId, user.id))
    .get();

  if (!membership || membership.teamId !== body.teamId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // For non-predefined languages, pre-translate now so the UI is ready on reload
  if (!PREDEFINED.has(lang)) {
    const translated = await translateBundle(lang);
    if (!translated) {
      return NextResponse.json({ error: "Translation failed" }, { status: 422 });
    }
  }

  db.update(teams)
    .set({ language: lang })
    .where(eq(teams.id, membership.teamId))
    .run();

  return NextResponse.json({ ok: true });
}
