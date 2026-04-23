import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { lucia } from "@/lib/auth";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(lucia.sessionCookieName)?.value ?? null;

  if (sessionId) {
    await lucia.invalidateSession(sessionId);
  }

  const blankCookie = lucia.createBlankSessionCookie();
  const response = NextResponse.redirect(new URL("/auth", request.url));
  response.cookies.set(blankCookie.name, blankCookie.value, blankCookie.attributes);
  return response;
}
