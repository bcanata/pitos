import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { lucia } from "@/lib/auth";
import { db } from "@/db";
import { memberships, users } from "@/db/schema";
import { eq } from "drizzle-orm";
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

  if (!membership) redirect("/onboarding");

  const { bundle } = await getTeamBundle(user.id);

  return <I18nProvider bundle={bundle}>{children}</I18nProvider>;
}
