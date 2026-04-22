/**
 * PitOS MCP tools — READ-ONLY, PARSED DATA ONLY.
 *
 * PRIVACY BOUNDARY (do not relax without team review):
 *   - Never expose the `messages` table (raw chat).
 *   - Never expose `judgeSessions.transcript` or `exitPacks.answersCollected`
 *     (both contain chat-like free-form content).
 *   - Never expose `*.sourceMessageId` / `*.firstSeenMessageId` / `*.createdViaMessageId`
 *     (they would let an agent dereference a raw message).
 *   - Never expose `users.email`, `magicLinks`, `sessions`, `invites`.
 *
 * Only structured/parsed outputs of the team's AI pipeline leave this boundary:
 *   extracted facts, decisions, tasks, entities, generated documents,
 *   team/member metadata, and the structured *evaluations* of judge sessions
 *   and exit packs (not the raw back-and-forth).
 */

import { db } from "../db";
import * as schema from "../db/schema";
import { eq, and, desc, gte } from "drizzle-orm";

// ─── helpers ────────────────────────────────────────────────────────────────

function requireTeam(teamId: string) {
  const team = db
    .select({ id: schema.teams.id, name: schema.teams.name, number: schema.teams.number })
    .from(schema.teams)
    .where(eq(schema.teams.id, teamId))
    .get();
  if (!team) throw new Error(`team_not_found: ${teamId}`);
  return team;
}

function parseSince(since: string | undefined): Date | undefined {
  if (!since) return undefined;
  const d = new Date(since);
  if (Number.isNaN(d.getTime())) throw new Error(`invalid_since: ${since}`);
  return d;
}

// ─── tool implementations ──────────────────────────────────────────────────

export async function getTeamContext(params: { team_id: string }) {
  const team = requireTeam(params.team_id);

  const members = db
    .select({
      role: schema.memberships.role,
      subteam: schema.memberships.subteam,
      name: schema.users.name,
    })
    .from(schema.memberships)
    .innerJoin(schema.users, eq(schema.memberships.userId, schema.users.id))
    .where(eq(schema.memberships.teamId, params.team_id))
    .all();

  const facts = db
    .select({ evidenceQuality: schema.extractedFacts.evidenceQuality })
    .from(schema.extractedFacts)
    .where(eq(schema.extractedFacts.teamId, params.team_id))
    .all();

  const decisions = db
    .select({
      id: schema.decisions.id,
      decision: schema.decisions.decision,
      rationale: schema.decisions.rationale,
      decidedAt: schema.decisions.decidedAt,
    })
    .from(schema.decisions)
    .where(eq(schema.decisions.teamId, params.team_id))
    .orderBy(desc(schema.decisions.decidedAt))
    .limit(5)
    .all();

  const openTasks = db
    .select({ status: schema.tasks.status })
    .from(schema.tasks)
    .where(eq(schema.tasks.teamId, params.team_id))
    .all();

  const taskCounts = openTasks.reduce<Record<string, number>>((acc, t) => {
    acc[t.status] = (acc[t.status] ?? 0) + 1;
    return acc;
  }, {});

  return {
    team,
    members,
    factTotals: {
      total: facts.length,
      withStrongEvidence: facts.filter((f) => f.evidenceQuality === "strong").length,
      withWeakEvidence: facts.filter((f) => f.evidenceQuality === "weak").length,
      unbacked: facts.filter((f) => f.evidenceQuality === "none").length,
    },
    taskCounts,
    recentDecisions: decisions,
  };
}

export async function listFacts(params: {
  team_id: string;
  fact_type?: "event" | "metric" | "decision" | "relation" | "milestone";
  evidence_quality?: "none" | "weak" | "strong";
  since?: string;
  limit?: number;
}) {
  requireTeam(params.team_id);
  const since = parseSince(params.since);
  const limit = Math.min(params.limit ?? 50, 200);

  const wheres = [eq(schema.extractedFacts.teamId, params.team_id)];
  if (params.fact_type) wheres.push(eq(schema.extractedFacts.factType, params.fact_type));
  if (params.evidence_quality)
    wheres.push(eq(schema.extractedFacts.evidenceQuality, params.evidence_quality));
  if (since) wheres.push(gte(schema.extractedFacts.extractedAt, since));

  return db
    .select({
      id: schema.extractedFacts.id,
      factType: schema.extractedFacts.factType,
      statement: schema.extractedFacts.statement,
      structuredData: schema.extractedFacts.structuredData,
      tags: schema.extractedFacts.tags,
      hasEvidence: schema.extractedFacts.hasEvidence,
      evidenceQuality: schema.extractedFacts.evidenceQuality,
      confidence: schema.extractedFacts.confidence,
      extractedAt: schema.extractedFacts.extractedAt,
    })
    .from(schema.extractedFacts)
    .where(and(...wheres))
    .orderBy(desc(schema.extractedFacts.extractedAt))
    .limit(limit)
    .all();
}

export async function listDecisions(params: {
  team_id: string;
  since?: string;
  limit?: number;
}) {
  requireTeam(params.team_id);
  const since = parseSince(params.since);
  const limit = Math.min(params.limit ?? 50, 200);

  const wheres = [eq(schema.decisions.teamId, params.team_id)];
  if (since) wheres.push(gte(schema.decisions.decidedAt, since));

  return db
    .select({
      id: schema.decisions.id,
      decision: schema.decisions.decision,
      rationale: schema.decisions.rationale,
      alternativesConsidered: schema.decisions.alternativesConsidered,
      contextAtTime: schema.decisions.contextAtTime,
      decidedAt: schema.decisions.decidedAt,
    })
    .from(schema.decisions)
    .where(and(...wheres))
    .orderBy(desc(schema.decisions.decidedAt))
    .limit(limit)
    .all();
}

export async function listTasks(params: {
  team_id: string;
  status?: "open" | "in_progress" | "done" | "blocked" | "cancelled";
  limit?: number;
}) {
  requireTeam(params.team_id);
  const limit = Math.min(params.limit ?? 50, 200);

  const wheres = [eq(schema.tasks.teamId, params.team_id)];
  if (params.status) wheres.push(eq(schema.tasks.status, params.status));

  return db
    .select({
      id: schema.tasks.id,
      title: schema.tasks.title,
      description: schema.tasks.description,
      status: schema.tasks.status,
      teachMode: schema.tasks.teachMode,
      deadline: schema.tasks.deadline,
      completedAt: schema.tasks.completedAt,
      createdAt: schema.tasks.createdAt,
    })
    .from(schema.tasks)
    .where(and(...wheres))
    .orderBy(desc(schema.tasks.createdAt))
    .limit(limit)
    .all();
}

export async function listEntities(params: {
  team_id: string;
  kind?: "person" | "organization" | "event" | "location";
  limit?: number;
}) {
  requireTeam(params.team_id);
  const limit = Math.min(params.limit ?? 100, 500);

  const wheres = [eq(schema.entities.teamId, params.team_id)];
  if (params.kind) wheres.push(eq(schema.entities.kind, params.kind));

  return db
    .select({
      id: schema.entities.id,
      kind: schema.entities.kind,
      name: schema.entities.name,
      canonicalName: schema.entities.canonicalName,
      aliases: schema.entities.aliases,
    })
    .from(schema.entities)
    .where(and(...wheres))
    .limit(limit)
    .all();
}

export async function listGeneratedDocuments(params: {
  team_id: string;
  doc_type?: "impact_narrative" | "season_recap" | "exit_pack" | "judge_prep";
  limit?: number;
}) {
  requireTeam(params.team_id);
  const limit = Math.min(params.limit ?? 20, 100);

  const wheres = [eq(schema.generatedDocuments.teamId, params.team_id)];
  if (params.doc_type) wheres.push(eq(schema.generatedDocuments.docType, params.doc_type));

  const rows = db
    .select({
      id: schema.generatedDocuments.id,
      title: schema.generatedDocuments.title,
      docType: schema.generatedDocuments.docType,
      generatedByAgentType: schema.generatedDocuments.generatedByAgentType,
      contentMd: schema.generatedDocuments.contentMd,
      createdAt: schema.generatedDocuments.createdAt,
    })
    .from(schema.generatedDocuments)
    .where(and(...wheres))
    .orderBy(desc(schema.generatedDocuments.createdAt))
    .limit(limit)
    .all();

  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    docType: r.docType,
    generatedByAgentType: r.generatedByAgentType,
    createdAt: r.createdAt,
    preview: r.contentMd.slice(0, 400),
    contentLength: r.contentMd.length,
  }));
}

export async function getDocument(params: { team_id: string; doc_id: string }) {
  requireTeam(params.team_id);
  const doc = db
    .select()
    .from(schema.generatedDocuments)
    .where(
      and(
        eq(schema.generatedDocuments.id, params.doc_id),
        eq(schema.generatedDocuments.teamId, params.team_id)
      )
    )
    .get();
  if (!doc) throw new Error(`document_not_found: ${params.doc_id}`);
  return {
    id: doc.id,
    title: doc.title,
    docType: doc.docType,
    generatedByAgentType: doc.generatedByAgentType,
    createdAt: doc.createdAt,
    contentMd: doc.contentMd,
    citations: doc.citations,
  };
}

export async function listJudgeSessions(params: {
  team_id: string;
  award_type?: string;
}) {
  requireTeam(params.team_id);
  const wheres = [
    eq(schema.judgeSessions.teamId, params.team_id),
    eq(schema.judgeSessions.status, "completed"),
  ];
  if (params.award_type) {
    wheres.push(
      eq(
        schema.judgeSessions.awardType,
        params.award_type as
          | "impact"
          | "innovation"
          | "engineering_inspiration"
          | "rookie_all_star"
          | "quality"
          | "industrial_design"
          | "safety"
          | "judges"
      )
    );
  }

  // NOTE: explicitly omits `transcript` — it contains raw back-and-forth chat-like content.
  return db
    .select({
      id: schema.judgeSessions.id,
      awardType: schema.judgeSessions.awardType,
      status: schema.judgeSessions.status,
      evaluation: schema.judgeSessions.evaluation,
      evidenceGaps: schema.judgeSessions.evidenceGaps,
      startedAt: schema.judgeSessions.startedAt,
      completedAt: schema.judgeSessions.completedAt,
    })
    .from(schema.judgeSessions)
    .where(and(...wheres))
    .orderBy(desc(schema.judgeSessions.completedAt))
    .all();
}

export async function listExitPacks(params: {
  team_id: string;
  status?: "collecting" | "review" | "finalized";
}) {
  requireTeam(params.team_id);
  const wheres = [eq(schema.exitPacks.teamId, params.team_id)];
  if (params.status) wheres.push(eq(schema.exitPacks.status, params.status));

  // NOTE: explicitly omits `answersCollected` (chat-like) and `questionsAsked`
  // (would leak the interview flow). Only the distilled `knowledgeSummary` leaves.
  const rows = db
    .select({
      id: schema.exitPacks.id,
      memberUserId: schema.exitPacks.memberUserId,
      status: schema.exitPacks.status,
      knowledgeSummary: schema.exitPacks.knowledgeSummary,
      generatedAt: schema.exitPacks.generatedAt,
    })
    .from(schema.exitPacks)
    .where(and(...wheres))
    .all();

  // Join member name but do NOT leak email.
  return rows.map((r) => {
    const member = db
      .select({ name: schema.users.name })
      .from(schema.users)
      .where(eq(schema.users.id, r.memberUserId))
      .get();
    return {
      id: r.id,
      memberName: member?.name ?? null,
      status: r.status,
      knowledgeSummary: r.knowledgeSummary,
      generatedAt: r.generatedAt,
    };
  });
}

// ─── tool registry (name → {schema, handler}) ──────────────────────────────

export const TOOLS = {
  get_team_context: {
    description:
      "Snapshot of a team: name, members, fact/decision/task totals, recent decisions. Use first to orient.",
    handler: getTeamContext,
  },
  list_facts: {
    description:
      "List extracted facts (metrics, events, milestones, relations) with evidence quality. No raw chat.",
    handler: listFacts,
  },
  list_decisions: {
    description:
      "List recorded decisions with rationale, alternatives, and context — the team's decision log.",
    handler: listDecisions,
  },
  list_tasks: {
    description: "List tasks with status, assignee, deadlines.",
    handler: listTasks,
  },
  list_entities: {
    description: "List canonical entities (people, organizations, events, locations) the team has referenced.",
    handler: listEntities,
  },
  list_generated_documents: {
    description:
      "List prior AI-generated documents (season recaps, impact narratives, judge prep, exit packs) with previews.",
    handler: listGeneratedDocuments,
  },
  get_document: {
    description: "Fetch the full markdown body of a generated document by ID.",
    handler: getDocument,
  },
  list_judge_sessions: {
    description:
      "List COMPLETED mock judge sessions with evaluations and evidence gaps. Transcripts are NOT exposed.",
    handler: listJudgeSessions,
  },
  list_exit_packs: {
    description:
      "List exit packs with distilled knowledge summaries. Raw Q&A answers are NOT exposed.",
    handler: listExitPacks,
  },
} as const;

export type ToolName = keyof typeof TOOLS;
