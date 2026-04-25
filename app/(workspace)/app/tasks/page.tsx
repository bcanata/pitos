import { redirect } from "next/navigation";
import { db } from "@/db";
import { memberships, users, channels } from "@/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { getSession } from "@/lib/session";
import KanbanBoard from "@/components/workspace/kanban-board";

export default async function TasksPage() {
  const { user } = await getSession();
  if (!user) redirect("/auth");

  const myMembership = await db
    .select()
    .from(memberships)
    .where(eq(memberships.userId, user.id))
    .get();

  if (!myMembership) redirect("/onboarding");

  const teamId = myMembership.teamId;

  const teamMemberRows = await db
    .select({
      userId: users.id,
      name: users.name,
      subteam: memberships.subteam,
    })
    .from(memberships)
    .leftJoin(users, eq(memberships.userId, users.id))
    .where(eq(memberships.teamId, teamId))
    .all();

  const teamChannels = await db
    .select({ id: channels.id, name: channels.name })
    .from(channels)
    .where(and(eq(channels.teamId, teamId), isNull(channels.archivedAt)))
    .all();

  const members = teamMemberRows
    .filter((m): m is typeof m & { userId: string } => m.userId !== null)
    .map((m) => ({
      userId: m.userId,
      name: m.name,
      subteam: m.subteam,
    }));

  return (
    <KanbanBoard
      teamId={teamId}
      channels={teamChannels}
      members={members}
    />
  );
}
