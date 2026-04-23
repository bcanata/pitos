import { NextResponse } from "next/server";
import { db } from "@/db";
import { magicLinks, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { lucia } from "@/lib/auth";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  if (!token) return NextResponse.redirect(new URL("/auth?error=missing", request.url));

  const magicLink = await db.select().from(magicLinks).where(eq(magicLinks.token, token)).get();

  if (!magicLink || magicLink.usedAt || magicLink.expiresAt < new Date()) {
    return NextResponse.redirect(new URL("/auth?error=invalid", request.url));
  }

  let user = await db.select().from(users).where(eq(users.email, magicLink.email)).get();
  if (!user) {
    const id = crypto.randomUUID();
    await db.insert(users).values({ id, email: magicLink.email, createdAt: new Date() });
    user = (await db.select().from(users).where(eq(users.email, magicLink.email)).get())!;
  }

  const session = await lucia.createSession(user.id, {});

  await db.update(magicLinks).set({ usedAt: new Date() }).where(eq(magicLinks.token, token));
  const sessionCookie = lucia.createSessionCookie(session.id);

  const inviteToken = url.searchParams.get("invite");
  const redirectTarget = inviteToken
    ? new URL(`/api/invites/accept?token=${encodeURIComponent(inviteToken)}`, request.url)
    : new URL("/app", request.url);

  const response = NextResponse.redirect(redirectTarget);
  response.cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
  return response;
}
