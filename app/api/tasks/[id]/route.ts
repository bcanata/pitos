import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { db } from "@/db";
import { tasks, memberships } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notifyChannel, notifyTeam } from "@/lib/sse";

const ALLOWED_STATUSES = [
  "open",
  "in_progress",
  "done",
  "blocked",
  "cancelled",
] as const;
type Status = (typeof ALLOWED_STATUSES)[number];

const SUBTEAMS = ["build", "programming", "outreach", "business"] as const;
type Subteam = (typeof SUBTEAMS)[number];

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Params) {
  const { user } = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = (await req.json()) as {
    status?: Status;
    assignedToUserId?: string | null;
    assignedToSubteam?: Subteam | null;
    deadline?: string | null;
    title?: string;
    description?: string | null;
  };

  const membership = await db
    .select()
    .from(memberships)
    .where(eq(memberships.userId, user.id))
    .get();

  if (!membership) {
    return NextResponse.json({ error: "Not a team member" }, { status: 403 });
  }

  const task = await db.select().from(tasks).where(eq(tasks.id, id)).get();
  if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });
  if (task.teamId !== membership.teamId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const updates: Partial<typeof tasks.$inferInsert> = {};

  if (body.status !== undefined) {
    if (!ALLOWED_STATUSES.includes(body.status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    updates.status = body.status;
    updates.completedAt = body.status === "done" ? new Date() : null;
  }

  if ("assignedToUserId" in body) {
    updates.assignedToUserId = body.assignedToUserId ?? null;
  }

  if ("assignedToSubteam" in body) {
    if (
      body.assignedToSubteam !== null &&
      body.assignedToSubteam !== undefined &&
      !SUBTEAMS.includes(body.assignedToSubteam)
    ) {
      return NextResponse.json({ error: "Invalid subteam" }, { status: 400 });
    }
    updates.assignedToSubteam = body.assignedToSubteam ?? null;
  }

  if ("deadline" in body) {
    if (body.deadline === null || body.deadline === undefined || body.deadline === "") {
      updates.deadline = null;
    } else if (!Number.isNaN(Date.parse(body.deadline))) {
      updates.deadline = new Date(body.deadline);
    }
  }

  if (typeof body.title === "string" && body.title.trim()) {
    updates.title = body.title.trim();
  }

  if ("description" in body) {
    updates.description = body.description?.toString().trim() || null;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  await db.update(tasks).set(updates).where(eq(tasks.id, id));

  const updated = (await db.select().from(tasks).where(eq(tasks.id, id)).get())!;

  const event = { type: "task_updated" as const, data: updated };
  if (updated.channelId) notifyChannel(updated.channelId, event);
  notifyTeam(membership.teamId, event);

  return NextResponse.json({ task: updated });
}

export async function DELETE(_req: Request, { params }: Params) {
  const { user } = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const membership = await db
    .select()
    .from(memberships)
    .where(eq(memberships.userId, user.id))
    .get();
  if (!membership) {
    return NextResponse.json({ error: "Not a team member" }, { status: 403 });
  }

  const task = await db.select().from(tasks).where(eq(tasks.id, id)).get();
  if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });
  if (task.teamId !== membership.teamId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await db.delete(tasks).where(eq(tasks.id, id));

  const event = { type: "task_deleted" as const, data: { id, channelId: task.channelId } };
  if (task.channelId) notifyChannel(task.channelId, event);
  notifyTeam(membership.teamId, event);

  return new Response(null, { status: 204 });
}
