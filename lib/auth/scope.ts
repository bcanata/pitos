// Shared route-handler primitives for tenant + role scoping.
//
// Every API route that touches team data should funnel through these so the
// "load membership, compare teamId, check role" sequence happens in exactly
// one place.
//
// Usage:
//
//   export async function GET(req, { params }) {
//     try {
//       const { membership, channel } = await requireChannelAccess(channelId);
//       ...
//     } catch (e) {
//       const r = scopeErrorResponse(e); if (r) return r;
//       throw e;
//     }
//   }

import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import { channels, memberships, users } from "@/db/schema";
import { getSession } from "@/lib/session";
import { canDeleteMessage as canDeleteMessageByRank, RANK, type ActiveRole as RankRole } from "./rank";

export type ActiveRole = RankRole;
export { RANK };

export type SessionUser = typeof users.$inferSelect;
export type Membership = typeof memberships.$inferSelect;
export type Channel = typeof channels.$inferSelect;

export class ScopeError extends Error {
  status: number;
  body: { error: string };
  constructor(status: number, error: string) {
    super(error);
    this.status = status;
    this.body = { error };
  }
}

/**
 * Resolve the caller's session and active membership in one go.
 *
 * Throws ScopeError(401) if no session, ScopeError(403) if the user has no
 * membership at all or the only membership is `pending`. Callers that want
 * to handle pending memberships separately should query directly.
 */
export async function requireActiveMembership(): Promise<{
  user: SessionUser;
  membership: Membership;
}> {
  const { user } = await getSession();
  if (!user) throw new ScopeError(401, "Unauthorized");

  const membership = await db
    .select()
    .from(memberships)
    .where(and(eq(memberships.userId, user.id), eq(memberships.status, "active")))
    .get();
  if (!membership) throw new ScopeError(403, "No active team membership");

  return { user, membership };
}

/**
 * Resolve the caller and verify they have an active membership in the team
 * that owns the given channel. Returns the loaded channel for callers that
 * need it (e.g. POSTing a message).
 */
export async function requireChannelAccess(channelId: string): Promise<{
  user: SessionUser;
  membership: Membership;
  channel: Channel;
}> {
  const { user, membership } = await requireActiveMembership();

  const channel = await db
    .select()
    .from(channels)
    .where(eq(channels.id, channelId))
    .get();
  if (!channel) throw new ScopeError(404, "Channel not found");
  if (channel.teamId !== membership.teamId) {
    // 404 instead of 403 so we don't leak the existence of cross-team channels.
    throw new ScopeError(404, "Channel not found");
  }

  return { user, membership, channel };
}

/**
 * Assert the caller's role is in the allow list. Use after `requireActiveMembership`
 * (or anything else that returns a Membership) to gate privileged actions.
 */
export function requireRole(membership: Membership, allowed: readonly ActiveRole[]): void {
  if (!allowed.includes(membership.role as ActiveRole)) {
    throw new ScopeError(403, "Requires one of: " + allowed.join(", "));
  }
}

/**
 * Server-side wrapper around the pure rank check. Pass the author's
 * Membership when known (look it up by author userId + actor's teamId);
 * pass null for agent-authored messages or orphan authors.
 */
export function canDeleteMessage(actor: Membership, author: Membership | null): boolean {
  return canDeleteMessageByRank(
    actor.role as ActiveRole,
    author ? (author.role as ActiveRole) : null,
  );
}

/**
 * Convert a thrown ScopeError into a NextResponse. Returns null for anything
 * that isn't a ScopeError so the caller can rethrow.
 *
 *   try { ... } catch (e) {
 *     const r = scopeErrorResponse(e);
 *     if (r) return r;
 *     throw e;
 *   }
 */
export function scopeErrorResponse(err: unknown): NextResponse | null {
  if (err instanceof ScopeError) {
    return NextResponse.json(err.body, { status: err.status });
  }
  return null;
}
