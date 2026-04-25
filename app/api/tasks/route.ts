import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { db } from "@/db";
import { tasks, memberships, users, channels } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { notifyChannel, notifyTeam } from "@/lib/sse";

const SUBTEAMS = ["build", "programming", "outreach", "business"] as const;
type Subteam = (typeof SUBTEAMS)[number];

export async function GET() {
  const { user } = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const membership = await db.select().from(memberships).where(eq(memberships.userId, user.id)).get();
  if (!membership) return NextResponse.json({ error: "Not a team member" }, { status: 403 });

  const teamTasks = await db
    .select({
      id: tasks.id,
      teamId: tasks.teamId,
      channelId: tasks.channelId,
      title: tasks.title,
      description: tasks.description,
      assignedToUserId: tasks.assignedToUserId,
      assignedToSubteam: tasks.assignedToSubteam,
      assignedByUserId: tasks.assignedByUserId,
      status: tasks.status,
      teachMode: tasks.teachMode,
      deadline: tasks.deadline,
      completedAt: tasks.completedAt,
      createdAt: tasks.createdAt,
      channelName: channels.name,
    })
    .from(tasks)
    .leftJoin(channels, eq(tasks.channelId, channels.id))
    .where(eq(tasks.teamId, membership.teamId))
    .orderBy(desc(tasks.createdAt))
    .all();

  // Resolve assignee + assigner names in one round.
  const userIds = [
    ...new Set(
      teamTasks
        .flatMap((t) => [t.assignedToUserId, t.assignedByUserId])
        .filter((id): id is string => !!id),
    ),
  ];
  const userMap = new Map<string, string>();
  if (userIds.length > 0) {
    const rows = await db.select({ id: users.id, name: users.name }).from(users).all();
    for (const r of rows) if (r.name) userMap.set(r.id, r.name);
  }

  const result = teamTasks.map((t) => ({
    ...t,
    assigneeName: t.assignedToUserId ? userMap.get(t.assignedToUserId) ?? null : null,
    assignerName: t.assignedByUserId ? userMap.get(t.assignedByUserId) ?? null : null,
  }));

  return NextResponse.json({ tasks: result });
}

export async function POST(req: Request) {
  const { user } = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const membership = await db.select().from(memberships).where(eq(memberships.userId, user.id)).get();
  if (!membership) return NextResponse.json({ error: "Not a team member" }, { status: 403 });

  const body = (await req.json()) as {
    title?: string;
    description?: string;
    assignedToUserId?: string;
    assignedToSubteam?: Subteam;
    teachMode?: boolean;
    channelId?: string;
    deadline?: string;
  };

  if (!body.title?.trim()) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }

  const subteam =
    body.assignedToSubteam && SUBTEAMS.includes(body.assignedToSubteam)
      ? body.assignedToSubteam
      : null;

  const deadline =
    body.deadline && !Number.isNaN(Date.parse(body.deadline))
      ? new Date(body.deadline)
      : null;

  const task = {
    id: crypto.randomUUID(),
    teamId: membership.teamId,
    channelId: body.channelId ?? null,
    title: body.title.trim(),
    description: body.description?.trim() || null,
    assignedToUserId: body.assignedToUserId ?? null,
    assignedToSubteam: subteam,
    assignedByUserId: user.id,
    teachMode: body.teachMode ?? false,
    deadline,
    status: "open" as const,
    createdAt: new Date(),
  };

  await db.insert(tasks).values(task);

  const event = { type: "task_created" as const, data: task };
  if (task.channelId) notifyChannel(task.channelId, event);
  notifyTeam(membership.teamId, event);

  return NextResponse.json({ task }, { status: 201 });
}
