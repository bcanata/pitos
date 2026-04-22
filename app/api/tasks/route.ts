import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { db } from "@/db";
import { tasks, memberships, users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const { user } = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const membership = db
    .select()
    .from(memberships)
    .where(eq(memberships.userId, user.id))
    .get();

  if (!membership) {
    return NextResponse.json({ error: "Not a team member" }, { status: 403 });
  }

  const teamTasks = db
    .select({
      id: tasks.id,
      teamId: tasks.teamId,
      channelId: tasks.channelId,
      title: tasks.title,
      description: tasks.description,
      assignedToUserId: tasks.assignedToUserId,
      status: tasks.status,
      teachMode: tasks.teachMode,
      deadline: tasks.deadline,
      createdAt: tasks.createdAt,
    })
    .from(tasks)
    .where(eq(tasks.teamId, membership.teamId))
    .all();

  // Attach assignee names
  const assigneeIds = [
    ...new Set(
      teamTasks.map((t) => t.assignedToUserId).filter((id): id is string => id !== null)
    ),
  ];

  const assigneeMap = new Map<string, string>();
  for (const uid of assigneeIds) {
    const u = db.select({ name: users.name }).from(users).where(eq(users.id, uid)).get();
    if (u?.name) assigneeMap.set(uid, u.name);
  }

  const result = teamTasks.map((t) => ({
    ...t,
    assigneeName: t.assignedToUserId ? (assigneeMap.get(t.assignedToUserId) ?? null) : null,
  }));

  return NextResponse.json({ tasks: result });
}
