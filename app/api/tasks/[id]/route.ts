import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { isDemoUser } from "@/lib/demo";
import { db } from "@/db";
import { tasks, memberships } from "@/db/schema";
import { eq } from "drizzle-orm";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Params) {
  const { user } = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (isDemoUser(user.email)) return NextResponse.json({ error: "Not available in demo" }, { status: 403 });

  const { id } = await params;
  const body = await req.json();
  const { status } = body;

  const allowedStatuses = ["open", "in_progress", "done", "blocked", "cancelled"] as const;
  if (!allowedStatuses.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

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

  await db.update(tasks)
    .set({
      status,
      completedAt: status === "done" ? new Date() : null,
    })
    .where(eq(tasks.id, id));

  const updated = (await db.select().from(tasks).where(eq(tasks.id, id)).get())!;
  return NextResponse.json({ task: updated });
}
