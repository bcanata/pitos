import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { lucia } from "@/lib/auth";
import { db } from "@/db";
import { memberships, users } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(lucia.sessionCookieName)?.value ?? null;
  if (!sessionId) redirect("/auth");

  const { session, user: luciaUser } = await lucia.validateSession(sessionId);
  if (!session || !luciaUser) redirect("/auth");

  const user = db.select().from(users).where(eq(users.id, luciaUser.id)).get();
  if (!user) redirect("/auth");

  const membership = db
    .select()
    .from(memberships)
    .where(eq(memberships.userId, user.id))
    .get();

  if (!membership) redirect("/onboarding");

  return <>{children}</>;
}
