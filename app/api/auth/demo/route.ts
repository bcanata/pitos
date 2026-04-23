import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, teams, memberships } from "@/db/schema";
import { eq } from "drizzle-orm";
import { lucia } from "@/lib/auth";
import { DEMO_EMAIL } from "@/lib/demo";

export async function GET(request: Request) {
  // Find or create the demo user
  let user = await db.select().from(users).where(eq(users.email, DEMO_EMAIL)).get();
  if (!user) {
    const id = crypto.randomUUID();
    await db.insert(users).values({
      id,
      email: DEMO_EMAIL,
      name: "Demo Guest",
      createdAt: new Date(),
    });
    user = (await db.select().from(users).where(eq(users.email, DEMO_EMAIL)).get())!;
  }

  // Join the demo user to the first available team if not already a member
  const existing = await db
    .select()
    .from(memberships)
    .where(eq(memberships.userId, user.id))
    .get();

  if (!existing) {
    const team = await db.select().from(teams).get();
    if (team) {
      await db.insert(memberships).values({
        id: crypto.randomUUID(),
        userId: user.id,
        teamId: team.id,
        role: "student",
        joinedAt: new Date(),
      });
    }
  }

  const session = await lucia.createSession(user.id, {});
  const sessionCookie = lucia.createSessionCookie(session.id);

  const response = NextResponse.redirect(new URL("/app", request.url));
  response.cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
  return response;
}
