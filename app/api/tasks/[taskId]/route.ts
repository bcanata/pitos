import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { db } from "@/db";
import { tasks, memberships } from "@/db/schema";
import { eq, and } from "drizzle-orm";

type Params = { params: Promise<{ taskId: string }> };

export async function PATCH(req: Request, { params }: Params) {
  const { user } = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { taskId } = await params;

  const membership = db.select().from(memberships).where(eq(memberships.userId, user.id)).get();
  if (!membership) return NextResponse.json({ error: "Not a team member" }, { status: 403 });

  const body = await req.json() as { status?: string };
  const validStatuses = ["open", "in_progress", "done", "blocked", "cancelled"] as const;
  type TaskStatus = typeof validStatuses[number];

  if (!body.status || !(validStatuses as readonly string[]).includes(body.status)) {
    return NextResponse.json(
      { error: `status must be one of: ${validStatuses.join(", ")}` },
      { status: 400 }
    );
  }

  const status = body.status as TaskStatus;

  const existing = db.select().from(tasks)
    .where(and(eq(tasks.id, taskId), eq(tasks.teamId, membership.teamId)))
    .get();

  if (!existing) return NextResponse.json({ error: "Task not found" }, { status: 404 });

  db.update(tasks)
    .set({
      status,
      completedAt: status === "done" ? new Date() : null,
    })
    .where(eq(tasks.id, taskId))
    .run();

  const updated = db.select().from(tasks).where(eq(tasks.id, taskId)).get();

  return NextResponse.json({ task: updated });
}
