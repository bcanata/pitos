import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { lucia } from "@/lib/auth";
import { db } from "@/db";
import { memberships, teams, users } from "@/db/schema";
import { asc, eq } from "drizzle-orm";
import { getTeamBundle } from "@/lib/i18n/server";
import { I18nProvider } from "@/lib/i18n/client";

export default async function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(lucia.sessionCookieName)?.value ?? null;
  if (!sessionId) redirect("/auth");

  const { session, user: luciaUser } = await lucia.validateSession(sessionId);
  if (!session || !luciaUser) redirect("/auth");

  const user = await db.select().from(users).where(eq(users.id, luciaUser.id)).get();
  if (!user) redirect("/auth");

  const membership = await db
    .select()
    .from(memberships)
    .where(eq(memberships.userId, user.id))
    .get();

  if (membership) {
    if (membership.status === "pending") redirect("/pending-approval");
  } else {
    // No membership. If a team already exists in this instance the user has
    // to be approved before getting in — create a pending membership against
    // the founding team and route them to the waiting screen. If no team
    // exists at all (fresh instance), let them through to /onboarding to
    // become the founder.
    const existingTeam = await db
      .select()
      .from(teams)
      .orderBy(asc(teams.createdAt))
      .get();

    if (existingTeam) {
      await db.insert(memberships).values({
        id: crypto.randomUUID(),
        userId: user.id,
        teamId: existingTeam.id,
        role: "student",
        joinedAt: new Date(),
        status: "pending",
      });
      redirect("/pending-approval");
    }

    redirect("/onboarding");
  }

  const { bundle } = await getTeamBundle(user.id);

  return <I18nProvider bundle={bundle}>{children}</I18nProvider>;
}
