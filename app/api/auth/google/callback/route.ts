import { NextResponse } from "next/server";
import { decodeIdToken } from "arctic";
import { googleOAuth } from "@/lib/auth/google";
import { cookies } from "next/headers";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { lucia } from "@/lib/auth";

interface GoogleClaims {
  sub: string;
  email: string;
  name?: string;
  picture?: string;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  const cookieStore = await cookies();
  const storedState = cookieStore.get("google_oauth_state")?.value ?? null;
  const codeVerifier = cookieStore.get("google_code_verifier")?.value ?? null;

  if (!code || !state || !storedState || !codeVerifier || state !== storedState) {
    return NextResponse.redirect(new URL("/auth?error=invalid", request.url));
  }

  try {
    const tokens = await googleOAuth.validateAuthorizationCode(code, codeVerifier);
    const claims = decodeIdToken(tokens.idToken()) as GoogleClaims;
    const { email, name, picture } = claims;

    let user = await db.select().from(users).where(eq(users.email, email)).get();
    if (!user) {
      const id = crypto.randomUUID();
      await db.insert(users).values({
        id,
        email,
        name: name ?? null,
        avatarUrl: picture ?? null,
        createdAt: new Date(),
      });
      user = (await db.select().from(users).where(eq(users.email, email)).get())!;
    } else {
      const updates: Partial<{ name: string; avatarUrl: string }> = {};
      if (name && !user.name) updates.name = name;
      if (picture && !user.avatarUrl) updates.avatarUrl = picture;
      if (Object.keys(updates).length > 0) {
        await db.update(users).set(updates).where(eq(users.id, user.id));
      }
    }

    const session = await lucia.createSession(user.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);

    const response = NextResponse.redirect(new URL("/app", request.url));
    response.cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
    return response;
  } catch (e) {
    console.error("[google-oauth] callback error:", e);
    return NextResponse.redirect(new URL("/auth?error=session", request.url));
  }
}
