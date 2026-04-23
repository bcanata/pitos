import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { isDemoUser } from "@/lib/demo";
import { db } from "@/db";
import { tasks, memberships, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  const { user } = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (isDemoUser(user.email)) return NextResponse.json({ error: "Not available in demo" }, { status: 403 });

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
      status: tasks.status,
      teachMode: tasks.teachMode,
      deadline: tasks.deadline,
      createdAt: tasks.createdAt,
    })
    .from(tasks)
    .where(eq(tasks.teamId, membership.teamId))
    .orderBy(desc(tasks.createdAt))
    .all();

  const assigneeIds = [
    ...new Set(
      teamTasks.map((t) => t.assignedToUserId).filter((id): id is string => id !== null)
    ),
  ];

  const assigneeMap = new Map<string, string>();
  for (const uid of assigneeIds) {
    const u = await db.select({ name: users.name }).from(users).where(eq(users.id, uid)).get();
    if (u?.name) assigneeMap.set(uid, u.name);
  }

  const result = teamTasks.map((t) => ({
    ...t,
    assigneeName: t.assignedToUserId ? (assigneeMap.get(t.assignedToUserId) ?? null) : null,
  }));

  return NextResponse.json({ tasks: result });
}

export async function POST(req: Request) {
  const { user } = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (isDemoUser(user.email)) return NextResponse.json({ error: "Not available in demo" }, { status: 403 });

  const membership = await db.select().from(memberships).where(eq(memberships.userId, user.id)).get();
  if (!membership) return NextResponse.json({ error: "Not a team member" }, { status: 403 });

  const body = await req.json() as {
    title?: string;
    assigneeName?: string;
    teachMode?: boolean;
    channelId?: string;
  };

  if (!body.title?.trim()) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }

  const task = {
    id: crypto.randomUUID(),
    teamId: membership.teamId,
    channelId: body.channelId ?? null,
    title: body.title.trim(),
    description: body.assigneeName ? `Assignee: ${body.assigneeName}` : null as string | null,
    assignedByUserId: user.id,
    teachMode: body.teachMode ?? false,
    status: "open" as const,
    createdAt: new Date(),
  };

  await db.insert(tasks).values(task);

  return NextResponse.json({ task }, { status: 201 });
}
