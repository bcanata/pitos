import { NextResponse } from "next/server";
import { db } from "@/db";
import { magicLinks, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { lucia } from "@/lib/auth";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  if (!token) return NextResponse.redirect(new URL("/auth?error=missing", request.url));

  const magicLink = db.select().from(magicLinks).where(eq(magicLinks.token, token)).get();

  if (!magicLink || magicLink.usedAt || magicLink.expiresAt < new Date()) {
    return NextResponse.redirect(new URL("/auth?error=invalid", request.url));
  }

  // Find or create user
  let user = db.select().from(users).where(eq(users.email, magicLink.email)).get();
  if (!user) {
    const id = crypto.randomUUID();
    db.insert(users).values({ id, email: magicLink.email, createdAt: new Date() }).run();
    user = db.select().from(users).where(eq(users.email, magicLink.email)).get()!;
  }

  // Mark link as used
  db.update(magicLinks).set({ usedAt: new Date() }).where(eq(magicLinks.token, token)).run();

  // Create session
  const session = await lucia.createSession(user.id, {});
  const sessionCookie = lucia.createSessionCookie(session.id);

  const response = NextResponse.redirect(new URL("/app", request.url));
  response.cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
  return response;
}
