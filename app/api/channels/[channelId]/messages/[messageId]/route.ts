import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { memberships, messages } from "@/db/schema";
import { notifyChannel, notifyTeam } from "@/lib/sse";
import {
  canDeleteMessage,
  requireChannelAccess,
  scopeErrorResponse,
} from "@/lib/auth/scope";
import { displayName } from "@/lib/demo";

type Params = { params: Promise<{ channelId: string; messageId: string }> };

// Soft-delete a message. The row stays so [msg:ID] citation chips still
// resolve via /api/messages/[id]/locate; the bubble renders a tombstone
// instead of the body. Permission rule: actor.rank >= author.rank, with
// students at rank 1 unable to delete anything (see lib/auth/rank.ts).
export async function DELETE(_req: Request, { params }: Params) {
  const { channelId, messageId } = await params;

  let user, membership;
  try {
    ({ user, membership } = await requireChannelAccess(channelId));
  } catch (e) {
    const r = scopeErrorResponse(e);
    if (r) return r;
    throw e;
  }

  const target = await db.select().from(messages).where(eq(messages.id, messageId)).get();
  if (!target || target.channelId !== channelId) {
    // 404 instead of 403 so we don't leak whether the message exists in
    // another channel/team.
    return NextResponse.json({ error: "Message not found" }, { status: 404 });
  }

  // Idempotent: a second DELETE on an already-soft-deleted row is a no-op.
  if (target.deletedAt) {
    return NextResponse.json({ ok: true });
  }

  // Look up the author's active membership in the actor's team. Null when the
  // message is agent-authored (target.userId === null) or the author is no
  // longer on the team — both treated as rank 0 by canDeleteMessage.
  const authorMembership = target.userId
    ? (await db
        .select()
        .from(memberships)
        .where(
          and(
            eq(memberships.userId, target.userId),
            eq(memberships.teamId, membership.teamId),
          ),
        )
        .get()) ?? null
    : null;

  if (!canDeleteMessage(membership, authorMembership)) {
    return NextResponse.json({ error: "Insufficient rank" }, { status: 403 });
  }

  const deletedAt = new Date();
  await db
    .update(messages)
    .set({ deletedAt, deletedByUserId: user.id })
    .where(eq(messages.id, messageId));

  const masked = displayName(user.name);
  const payload = {
    id: messageId,
    channelId,
    deletedAt: deletedAt.toISOString(),
    deletedByUserId: user.id,
    deletedByName: masked,
  };
  notifyChannel(channelId, { type: "message_deleted", data: payload });
  notifyTeam(membership.teamId, { type: "message_deleted", data: payload });

  return NextResponse.json({ ok: true, deletedAt: payload.deletedAt, deletedByName: masked });
}
