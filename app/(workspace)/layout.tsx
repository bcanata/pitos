import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { lucia } from "@/lib/auth";

export default async function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(lucia.sessionCookieName)?.value ?? null;
  if (!sessionId) redirect("/auth");

  const { session } = await lucia.validateSession(sessionId);
  if (!session) redirect("/auth");

  return <>{children}</>;
}
