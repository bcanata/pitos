import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { memberships } from "@/db/schema";
import {
  requireActiveMembership,
  requireRole,
  scopeErrorResponse,
  type Membership,
} from "@/lib/auth/scope";

const APPROVER_ROLES = ["lead_mentor", "captain"] as const;

type Params = { params: Promise<{ membershipId: string }> };

export async function POST(_req: Request, { params }: Params) {
  const { membershipId } = await params;

  let approver: Membership;
  try {
    const scoped = await requireActiveMembership();
    requireRole(scoped.membership, APPROVER_ROLES);
    approver = scoped.membership;
  } catch (e) {
    const r = scopeErrorResponse(e);
    if (r) return r;
    throw e;
  }

  const target = await db
    .select()
    .from(memberships)
    .where(eq(memberships.id, membershipId))
    .get();

  if (!target) return NextResponse.json({ error: "Membership not found" }, { status: 404 });
  if (target.teamId !== approver.teamId) {
    return NextResponse.json({ error: "Membership not found" }, { status: 404 });
  }
  if (target.status !== "pending") {
    return NextResponse.json({ error: "Only pending memberships can be rejected" }, { status: 400 });
  }

  await db.delete(memberships).where(eq(memberships.id, membershipId));
  return NextResponse.json({ ok: true });
}
