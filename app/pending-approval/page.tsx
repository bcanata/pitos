import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { memberships, teams } from "@/db/schema";
import { getSession } from "@/lib/session";

export default async function PendingApprovalPage() {
  const { user } = await getSession();
  if (!user) redirect("/auth");

  const membership = await db
    .select()
    .from(memberships)
    .where(eq(memberships.userId, user.id))
    .get();

  // No membership → not a self-signup, send them through onboarding (or
  // workspace layout if a team now exists).
  if (!membership) redirect("/app");
  // Approved already → workspace.
  if (membership.status === "active") redirect("/app");

  const team = await db
    .select()
    .from(teams)
    .where(eq(teams.id, membership.teamId))
    .get();

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-gray-950 text-gray-100 px-6">
      <div className="max-w-md w-full text-center space-y-4">
        <span className="inline-block rounded-full bg-amber-500/15 text-amber-300 text-xs font-medium tracking-wide uppercase px-2.5 py-1">
          Pending approval
        </span>
        <h1 className="text-2xl font-semibold">Waiting for a lead mentor</h1>
        <p className="text-sm text-gray-400">
          Your request to join{team?.name ? <> <span className="text-gray-200">{team.name}</span></> : " this team"} is queued.
          A lead mentor or team captain needs to approve your account before you can see the workspace.
        </p>
        <p className="text-sm text-gray-500">
          Signed in as <span className="text-gray-300">{user.email}</span>. You can close this tab — refresh once you&apos;ve been approved.
        </p>
        <form action="/api/auth/logout" method="post">
          <button
            type="submit"
            className="mt-6 text-xs text-gray-500 hover:text-gray-300 underline underline-offset-4"
          >
            Sign out
          </button>
        </form>
      </div>
    </main>
  );
}
