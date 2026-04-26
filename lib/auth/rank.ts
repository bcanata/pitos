// Pure rank logic — safe to import on the client (no db, no session).
// scope.ts re-exports the same table for server-side checks; both sides agree.

export type ActiveRole = "lead_mentor" | "mentor" | "captain" | "student";

// Higher number wins. The rule for deleting a message:
//   actor.rank ≥ 1  AND  actor.rank ≥ author.rank
// where agent-authored messages (userId IS NULL) are treated as rank 0, so
// any non-student can clear them.
export const RANK: Record<ActiveRole, number> = {
  lead_mentor: 4,
  mentor: 3,
  captain: 2,
  student: 1,
};

const AGENT_RANK = 0;

/**
 * Pure permission check — works the same on server and client. Pass the
 * author's rank as null/undefined when the message is agent-authored or the
 * author no longer has an active membership in the team.
 */
export function canDeleteMessage(
  actorRole: ActiveRole,
  authorRole: ActiveRole | null | undefined,
): boolean {
  if (actorRole === "student") return false;
  const actor = RANK[actorRole];
  const author = authorRole ? RANK[authorRole] : AGENT_RANK;
  return actor >= author;
}
