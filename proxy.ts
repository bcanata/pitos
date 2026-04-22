import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const sessionCookieName = "auth_session"; // Lucia v3 default
  const sessionCookie = request.cookies.get(sessionCookieName);
  if (!sessionCookie?.value) {
    return NextResponse.redirect(new URL("/auth", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*", "/onboarding/:path*"],
};
