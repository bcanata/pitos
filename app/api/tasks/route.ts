import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { db } from "@/db";
import { tasks, memberships } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(_req: Request) {
  const { user } = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const membership = db.select().from(memberships).where(eq(memberships.userId, user.id)).get();
  if (!membership) return NextResponse.json({ error: "Not a team member" }, { status: 403 });

  const teamTasks = db.select().from(tasks)
    .where(eq(tasks.teamId, membership.teamId))
    .orderBy(desc(tasks.createdAt))
    .all();

  return NextResponse.json({ tasks: teamTasks });
}

export async function POST(req: Request) {
  const { user } = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const membership = db.select().from(memberships).where(eq(memberships.userId, user.id)).get();
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

  db.insert(tasks).values(task).run();

  return NextResponse.json({ task }, { status: 201 });
}
