import {
  sqliteTable,
  text,
  integer,
  real,
  index,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

// ─── Auth (Lucia v3) ─────────────────────────────────────────────────────────

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name"),
  avatarUrl: text("avatar_url"),
  language: text("language").notNull().default("en"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const sessions = sqliteTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    expiresAt: integer("expires_at").notNull(),
  },
  (t) => [index("sessions_user_id_idx").on(t.userId)],
);

export const magicLinks = sqliteTable(
  "magic_links",
  {
    id: text("id").primaryKey(),
    email: text("email").notNull(),
    token: text("token").notNull().unique(),
    expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
    usedAt: integer("used_at", { mode: "timestamp" }),
  },
  (t) => [index("magic_links_email_idx").on(t.email)],
);

// ─── Teams & Members ─────────────────────────────────────────────────────────

export const teams = sqliteTable("teams", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  number: integer("number"),
  school: text("school"),
  country: text("country"),
  rookieYear: integer("rookie_year"),
  language: text("language").notNull().default("en"),
  createdByUserId: text("created_by_user_id").references(() => users.id),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const memberships = sqliteTable(
  "memberships",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    teamId: text("team_id")
      .notNull()
      .references(() => teams.id),
    role: text("role", {
      enum: ["lead_mentor", "mentor", "captain", "student"],
    }).notNull(),
    subteam: text("subteam", {
      enum: ["build", "programming", "outreach", "business"],
    }),
    graduationDate: integer("graduation_date", { mode: "timestamp" }),
    joinedAt: integer("joined_at", { mode: "timestamp" }).notNull(),
    // Approval gate. Self-signups land as "pending" and need a lead_mentor /
    // captain to flip them to "active". Invitees and founders are inserted as
    // "active" directly. Existing rows backfill via the column default.
    status: text("status", { enum: ["active", "pending"] })
      .notNull()
      .default("active"),
    approvedAt: integer("approved_at", { mode: "timestamp" }),
    approvedByUserId: text("approved_by_user_id").references(() => users.id),
  },
  (t) => [
    index("memberships_user_id_idx").on(t.userId),
    index("memberships_team_id_idx").on(t.teamId),
    // One membership per (user, team) — protects against duplicate joins.
    uniqueIndex("memberships_user_team_unq").on(t.userId, t.teamId),
  ],
);

export const invites = sqliteTable(
  "invites",
  {
    id: text("id").primaryKey(),
    teamId: text("team_id")
      .notNull()
      .references(() => teams.id),
    email: text("email").notNull(),
    role: text("role", {
      enum: ["lead_mentor", "mentor", "captain", "student"],
    }).notNull(),
    subteam: text("subteam", {
      enum: ["build", "programming", "outreach", "business"],
    }),
    invitedByUserId: text("invited_by_user_id").references(() => users.id),
    token: text("token").notNull().unique(),
    acceptedAt: integer("accepted_at", { mode: "timestamp" }),
    expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  },
  (t) => [
    index("invites_team_id_idx").on(t.teamId),
    index("invites_email_idx").on(t.email),
  ],
);

// ─── Channels & Messages ─────────────────────────────────────────────────────

export const channels = sqliteTable(
  "channels",
  {
    id: text("id").primaryKey(),
    teamId: text("team_id")
      .notNull()
      .references(() => teams.id),
    name: text("name").notNull(),
    description: text("description"),
    type: text("type", { enum: ["public", "private", "dm"] }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
    archivedAt: integer("archived_at", { mode: "timestamp" }),
  },
  (t) => [
    index("channels_team_id_idx").on(t.teamId),
    // Unique channel name per team — partial index so an archived
    // channel doesn't block reusing its name. Lets you `archive_channel`
    // and then `create_channel` with the same name in the same team.
    uniqueIndex("channels_team_name_active_unq")
      .on(t.teamId, t.name)
      .where(sql`archived_at IS NULL`),
  ],
);

export const channelMembers = sqliteTable(
  "channel_members",
  {
    id: text("id").primaryKey(),
    channelId: text("channel_id")
      .notNull()
      .references(() => channels.id),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    joinedAt: integer("joined_at", { mode: "timestamp" }).notNull(),
    lastReadAt: integer("last_read_at", { mode: "timestamp" }),
  },
  (t) => [
    index("channel_members_user_id_idx").on(t.userId),
    index("channel_members_channel_id_idx").on(t.channelId),
    uniqueIndex("channel_members_channel_user_unq").on(t.channelId, t.userId),
  ],
);

export const messages = sqliteTable(
  "messages",
  {
    id: text("id").primaryKey(),
    channelId: text("channel_id")
      .notNull()
      .references(() => channels.id),
    userId: text("user_id").references(() => users.id), // null = agent-authored
    content: text("content").notNull(), // markdown
    replyToMessageId: text("reply_to_message_id"),
    agentGenerated: integer("agent_generated", { mode: "boolean" })
      .notNull()
      .default(false),
    agentType: text("agent_type"),
    juryReflexKind: text("jury_reflex_kind", {
      enum: ["proof_demand", "why_question", "teach_redirect"],
    }),
    metadata: text("metadata", { mode: "json" }), // tool calls, citations, refs
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
    // Soft delete — keeps the row so [msg:ID] citation chips still resolve.
    // Bubble renders a muted "[message deleted by NAME]" tombstone in place of
    // the body. Author/agent stays in place; only deletedAt + deletedByUserId
    // are written. See lib/auth/scope.ts canDeleteMessage for the rank rule.
    deletedAt: integer("deleted_at", { mode: "timestamp" }),
    deletedByUserId: text("deleted_by_user_id").references(() => users.id),
  },
  (t) => [
    // Composite index drives every channel-feed query: filter by channelId,
    // order by createdAt desc, paginate with `before` on createdAt.
    index("messages_channel_created_idx").on(t.channelId, t.createdAt),
  ],
);

// ─── Tasks ───────────────────────────────────────────────────────────────────

export const tasks = sqliteTable(
  "tasks",
  {
    id: text("id").primaryKey(),
    teamId: text("team_id")
      .notNull()
      .references(() => teams.id),
    channelId: text("channel_id").references(() => channels.id),
    title: text("title").notNull(),
    description: text("description"),
    assignedToUserId: text("assigned_to_user_id").references(() => users.id),
    assignedToSubteam: text("assigned_to_subteam", {
      enum: ["build", "programming", "outreach", "business"],
    }),
    assignedByUserId: text("assigned_by_user_id").references(() => users.id),
    createdViaMessageId: text("created_via_message_id").references(
      () => messages.id
    ),
    deadline: integer("deadline", { mode: "timestamp" }),
    status: text("status", {
      enum: ["open", "in_progress", "done", "blocked", "cancelled"],
    })
      .notNull()
      .default("open"),
    teachMode: integer("teach_mode", { mode: "boolean" }).notNull().default(false),
    completedAt: integer("completed_at", { mode: "timestamp" }),
    completionMessageId: text("completion_message_id"),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  },
  (t) => [
    index("tasks_team_id_idx").on(t.teamId),
    index("tasks_channel_id_idx").on(t.channelId),
    index("tasks_assigned_to_user_id_idx").on(t.assignedToUserId),
  ],
);

// ─── Memory: Entities, Facts, Decisions ──────────────────────────────────────

export const entities = sqliteTable(
  "entities",
  {
    id: text("id").primaryKey(),
    teamId: text("team_id")
      .notNull()
      .references(() => teams.id),
    kind: text("kind", {
      enum: ["person", "organization", "event", "location"],
    }).notNull(),
    name: text("name").notNull(),
    canonicalName: text("canonical_name"),
    aliases: text("aliases", { mode: "json" }), // string[]
    metadata: text("metadata", { mode: "json" }),
    firstSeenMessageId: text("first_seen_message_id").references(
      () => messages.id
    ),
  },
  (t) => [index("entities_team_id_idx").on(t.teamId)],
);

export const extractedFacts = sqliteTable(
  "extracted_facts",
  {
    id: text("id").primaryKey(),
    teamId: text("team_id")
      .notNull()
      .references(() => teams.id),
    sourceMessageId: text("source_message_id").references(() => messages.id),
    factType: text("fact_type", {
      enum: ["event", "metric", "decision", "relation", "milestone"],
    }).notNull(),
    statement: text("statement").notNull(),
    structuredData: text("structured_data", { mode: "json" }),
    entityRefs: text("entity_refs", { mode: "json" }), // string[]
    tags: text("tags", { mode: "json" }), // string[]
    hasEvidence: integer("has_evidence", { mode: "boolean" })
      .notNull()
      .default(false),
    evidenceQuality: text("evidence_quality", {
      enum: ["none", "weak", "strong"],
    })
      .notNull()
      .default("none"),
    confidence: real("confidence"),
    extractedAt: integer("extracted_at", { mode: "timestamp" }).notNull(),
    modelUsed: text("model_used"),
  },
  (t) => [index("extracted_facts_team_id_idx").on(t.teamId)],
);

export const decisions = sqliteTable(
  "decisions",
  {
    id: text("id").primaryKey(),
    teamId: text("team_id")
      .notNull()
      .references(() => teams.id),
    sourceMessageId: text("source_message_id").references(() => messages.id),
    decision: text("decision").notNull(),
    rationale: text("rationale"),
    alternativesConsidered: text("alternatives_considered"),
    contextAtTime: text("context_at_time"),
    relatedEntityIds: text("related_entity_ids", { mode: "json" }), // string[]
    decidedAt: integer("decided_at", { mode: "timestamp" }).notNull(),
    recordedAt: integer("recorded_at", { mode: "timestamp" }).notNull(),
  },
  (t) => [index("decisions_team_id_idx").on(t.teamId)],
);

// ─── Judge Sessions ───────────────────────────────────────────────────────────

export const judgeSessions = sqliteTable(
  "judge_sessions",
  {
    id: text("id").primaryKey(),
    teamId: text("team_id")
      .notNull()
      .references(() => teams.id),
    startedByUserId: text("started_by_user_id").references(() => users.id),
    awardType: text("award_type", {
      enum: [
        "impact",
        "innovation",
        "engineering_inspiration",
        "rookie_all_star",
        "quality",
        "industrial_design",
        "safety",
        "judges",
      ],
    }).notNull(),
    status: text("status", {
      enum: ["in_progress", "completed"],
    })
      .notNull()
      .default("in_progress"),
    transcript: text("transcript", { mode: "json" }), // message[]
    evaluation: text("evaluation", { mode: "json" }),
    evidenceGaps: text("evidence_gaps", { mode: "json" }), // string[]
    startedAt: integer("started_at", { mode: "timestamp" }).notNull(),
    completedAt: integer("completed_at", { mode: "timestamp" }),
  },
  (t) => [index("judge_sessions_team_id_idx").on(t.teamId)],
);

// ─── Exit Packs ───────────────────────────────────────────────────────────────

export const exitPacks = sqliteTable(
  "exit_packs",
  {
    id: text("id").primaryKey(),
    teamId: text("team_id")
      .notNull()
      .references(() => teams.id),
    memberUserId: text("member_user_id")
      .notNull()
      .references(() => users.id),
    status: text("status", {
      enum: ["collecting", "review", "finalized"],
    })
      .notNull()
      .default("collecting"),
    questionsAsked: text("questions_asked", { mode: "json" }), // string[]
    answersCollected: text("answers_collected", { mode: "json" }), // {q, a}[]
    knowledgeSummary: text("knowledge_summary"),
    recipientUserIds: text("recipient_user_ids", { mode: "json" }), // string[]
    generatedAt: integer("generated_at", { mode: "timestamp" }),
  },
  (t) => [
    index("exit_packs_team_id_idx").on(t.teamId),
    index("exit_packs_member_user_id_idx").on(t.memberUserId),
  ],
);

// ─── Agent Runs & Generated Docs ─────────────────────────────────────────────

export const agentRuns = sqliteTable(
  "agent_runs",
  {
    id: text("id").primaryKey(),
    teamId: text("team_id").references(() => teams.id),
    trigger: text("trigger"),
    agentType: text("agent_type").notNull(),
    // queued = enqueued, eligible for first run.
    // running = a worker has claimed it (lockedUntil = nextAttemptAt).
    // completed = finished cleanly.
    // failed = last attempt threw; if attempts < MAX, nextAttemptAt is set
    //          to the retry time and the cron picks it up.
    status: text("status", {
      enum: ["queued", "running", "completed", "failed"],
    })
      .notNull()
      .default("queued"),
    inputContext: text("input_context", { mode: "json" }),
    output: text("output"),
    toolCalls: text("tool_calls", { mode: "json" }),
    tokensUsed: integer("tokens_used"),
    durationMs: integer("duration_ms"),
    // Retry bookkeeping. attempts = number of claim transitions
    // (queued|failed → running). lastError captures the most recent
    // exception's message. nextAttemptAt drives both initial run and
    // backoff retry; while running it's the deadline at which the
    // cron will consider the job stuck and re-claim.
    attempts: integer("attempts").notNull().default(0),
    lastError: text("last_error"),
    nextAttemptAt: integer("next_attempt_at", { mode: "timestamp" }),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  },
  (t) => [
    // Activity feed sort: filter teamId, order createdAt desc.
    index("agent_runs_team_created_idx").on(t.teamId, t.createdAt),
    // Cron worker scan: status + nextAttemptAt. Two indexes is cheaper
    // than one composite because the cron uses an OR across statuses.
    index("agent_runs_status_next_idx").on(t.status, t.nextAttemptAt),
  ],
);

export const generatedDocuments = sqliteTable(
  "generated_documents",
  {
    id: text("id").primaryKey(),
    teamId: text("team_id")
      .notNull()
      .references(() => teams.id),
    docType: text("doc_type", {
      enum: ["impact_narrative", "season_recap", "exit_pack", "judge_prep"],
    }).notNull(),
    title: text("title").notNull(),
    contentMd: text("content_md").notNull(),
    citations: text("citations", { mode: "json" }),
    generatedByAgentType: text("generated_by_agent_type"),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  },
  (t) => [index("generated_documents_team_id_idx").on(t.teamId)],
);

// ─── i18n Translation Cache ──────────────────────────────────────────────────

export const translationCache = sqliteTable("translation_cache", {
  lang: text("lang").primaryKey(),
  bundle: text("bundle").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

// ─── Types ───────────────────────────────────────────────────────────────────

export type User = typeof users.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type Team = typeof teams.$inferSelect;
export type Membership = typeof memberships.$inferSelect;
export type Channel = typeof channels.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type Task = typeof tasks.$inferSelect;
export type ExtractedFact = typeof extractedFacts.$inferSelect;
export type Decision = typeof decisions.$inferSelect;
export type JudgeSession = typeof judgeSessions.$inferSelect;
export type ExitPack = typeof exitPacks.$inferSelect;
export type AgentRun = typeof agentRuns.$inferSelect;
export type GeneratedDocument = typeof generatedDocuments.$inferSelect;
