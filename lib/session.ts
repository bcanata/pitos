import { cookies } from "next/headers";
import { lucia } from "@/lib/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getSession() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(lucia.sessionCookieName)?.value ?? null;
  if (!sessionId) return { user: null, session: null };
  const { session, user: luciaUser } = await lucia.validateSession(sessionId);
  if (!session || !luciaUser) return { user: null, session: null };
  const user = db.select().from(users).where(eq(users.id, luciaUser.id)).get() ?? null;
  return { user, session };
}
