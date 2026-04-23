import { NextResponse } from "next/server";
import { db } from "@/db";
import { invites, memberships, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { lucia } from "@/lib/auth";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  const appUrl = process.env.APP_URL ?? "http://localhost:3000";

  if (!token) {
    return NextResponse.redirect(new URL("/auth?error=invalid-invite", appUrl));
  }

  const invite = await db.select().from(invites).where(eq(invites.token, token)).get();

  if (!invite || invite.acceptedAt !== null || invite.expiresAt < new Date()) {
    return NextResponse.redirect(new URL("/auth?error=invalid-invite", appUrl));
  }

  const existingUser = await db.select().from(users).where(eq(users.email, invite.email)).get();

  if (existingUser) {
    const existingMembership = await db
      .select()
      .from(memberships)
      .where(
        and(
          eq(memberships.userId, existingUser.id),
          eq(memberships.teamId, invite.teamId)
        )
      )
      .get();

    if (!existingMembership) {
      await db.insert(memberships).values({
        id: crypto.randomUUID(),
        userId: existingUser.id,
        teamId: invite.teamId,
        role: invite.role,
        subteam: invite.subteam ?? undefined,
        joinedAt: new Date(),
      });
    }

    await db.update(invites).set({ acceptedAt: new Date() }).where(eq(invites.token, token));

    return NextResponse.redirect(new URL("/app", appUrl));
  }

  const redirectUrl = new URL("/auth", appUrl);
  redirectUrl.searchParams.set("email", invite.email);
  redirectUrl.searchParams.set("invite", token);
  return NextResponse.redirect(redirectUrl);
}
