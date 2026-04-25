/**
 * Shared types for meaningful-mock-data seed authoring.
 *
 * Each channel-group file exports SeedGroup with messages + derived tasks/decisions.
 * The master seed script (scripts/seed-meaningful.ts) consumes these.
 */

export type SeedMessage = {
  /** Stable string ID per message (use a short slug like "mek-001"). Used to wire
   * tasks/decisions/replies back to specific messages. */
  localId: string;
  channelId: string;
  /** null = agent-authored. Use a real user UUID otherwise. */
  authorUserId: string | null;
  /** Markdown body. Turkish unless quoting English source material. */
  content: string;
  /** ISO timestamp string. Must fall in [2025-05-15, 2026-04-25]. */
  createdAt: string;
  /** Optional: localId of the message this replies to (must appear earlier in array). */
  replyToLocalId?: string;
  agentGenerated?: boolean;
  agentType?: "channel-agent" | "memory-agent" | "judge-sim" | "exit-interview" | "onboarding";
  juryReflexKind?: "proof_demand" | "why_question" | "teach_redirect";
  metadata?: Record<string, unknown>;
};

export type SeedTask = {
  localId: string;
  /** Optional channel scope; falls back to team-level. */
  channelId?: string;
  title: string;
  description?: string;
  assignedToUserId?: string;
  assignedByUserId?: string;
  /** localId of the message that spawned this task. */
  createdViaLocalMessageId?: string;
  deadline?: string; // ISO
  status: "open" | "in_progress" | "done" | "blocked" | "cancelled";
  teachMode?: boolean;
  completedAt?: string; // ISO, set if status === "done"
  createdAt: string; // ISO
};

export type SeedDecision = {
  localId: string;
  sourceLocalMessageId?: string;
  decision: string;
  rationale?: string;
  alternativesConsidered?: string;
  contextAtTime?: string;
  decidedAt: string; // ISO
};

export type SeedGroup = {
  groupName: string;
  messages: SeedMessage[];
  tasks: SeedTask[];
  decisions: SeedDecision[];
};
