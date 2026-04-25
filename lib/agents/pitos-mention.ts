import type Anthropic from "@anthropic-ai/sdk";
import { randomBytes } from "crypto";
import { and, eq, isNull } from "drizzle-orm";
import { anthropic } from "@/lib/anthropic";
import { db } from "@/db";
import {
  agentRuns,
  channelMembers,
  channels,
  decisions,
  invites,
  memberships,
  messages,
  tasks,
  teams,
  users,
} from "@/db/schema";
import { notifyChannel } from "@/lib/sse";
import { runMemoryAgent } from "@/lib/agents/memory-agent";

export type MembershipRole = "lead_mentor" | "mentor" | "captain" | "student";

export interface MentionInput {
  channelId: string;
  channelName: string;
  messageId: string;
  teamId: string;
  teamName: string;
  triggerContent: string;
  transcript: string;
  userId: string;
  role: MembershipRole;
  language: string;
}

export const MENTION_PATTERN = /(?:^|[^a-z0-9])@pitos\b/i;

const tools: Anthropic.Messages.Tool[] = [
  {
    name: "create_channel",
    description:
      "Create a new public or private channel in the current team. Only lead_mentor or mentor callers are permitted; calls from captain/student will fail with a permission error.",
    input_schema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description:
            "Channel name in lowercase kebab-case (letters a-z, digits, hyphens). 1–3 words. No # prefix, no emoji, no special characters.",
        },
        description: {
          type: "string",
          description:
            "Short purpose of the channel, written in the team's current language.",
        },
        type: {
          type: "string",
          enum: ["public", "private"],
          description:
            "Visibility. Defaults to public. Use private only when the user explicitly asks for it.",
        },
      },
      required: ["name", "description"],
    },
  },
  {
    name: "archive_channel",
    description:
      "Archive (close) a channel by its exact name. The channel disappears from the sidebar but its messages remain. Only lead_mentor or mentor callers are permitted.",
    input_schema: {
      type: "object",
      properties: {
        channel_name: {
          type: "string",
          description: "Exact channel name to archive (without # prefix).",
        },
      },
      required: ["channel_name"],
    },
  },
  {
    name: "create_task",
    description:
      "Create a task in the team's task list, scoped to the current channel. Anyone in the team (lead_mentor, mentor, captain, student) may create tasks. Use this whenever the user explicitly asks to create / add / open a task or todo.",
    input_schema: {
      type: "object",
      properties: {
        title: {
          type: "string",
          description:
            "Short imperative task title in the user's language, ideally under 80 chars. Strip surrounding quotes if the user wrapped the request in quotes.",
        },
        description: {
          type: "string",
          description:
            "Optional longer body / context for the task. Leave empty if the user didn't provide one.",
        },
        assignee_name: {
          type: "string",
          description:
            "Optional team member name the user asked to assign this to (e.g. 'Deniz Arslan', 'Ali'). Match against existing members; if no clear match, leave empty.",
        },
        deadline: {
          type: "string",
          description:
            "Optional ISO 8601 date or datetime for the deadline (e.g. '2026-05-15' or '2026-05-15T17:00:00Z'). Leave empty if no deadline mentioned.",
        },
      },
      required: ["title"],
    },
  },
  {
    name: "update_task_status",
    description:
      "Change the status of an existing task in the current team. Anyone may call. Provide either task_id (preferred when known) or task_title (case-insensitive partial match). status must be one of: open, in_progress, done, blocked, cancelled. Sets completedAt automatically when status='done'.",
    input_schema: {
      type: "object",
      properties: {
        task_id: { type: "string", description: "Exact UUID of the task. Preferred when present." },
        task_title: { type: "string", description: "Case-insensitive partial title match within this team. Used when task_id is unknown." },
        status: {
          type: "string",
          enum: ["open", "in_progress", "done", "blocked", "cancelled"],
          description: "New status.",
        },
      },
      required: ["status"],
    },
  },
  {
    name: "create_decision",
    description:
      "Record a team decision with rationale. Use this whenever the user announces, confirms, or asks you to log a decision (e.g. 'we decided X', 'log decision: ...'). Decisions are valuable for judging — capture rationale and alternatives whenever the user provides them. Anyone may call.",
    input_schema: {
      type: "object",
      properties: {
        decision: { type: "string", description: "The decision itself, one sentence preferred." },
        rationale: { type: "string", description: "Why this decision was made. Optional but strongly preferred." },
        alternatives_considered: { type: "string", description: "Other options that were on the table. Optional." },
        context_at_time: { type: "string", description: "Surrounding context — date, status, season phase. Optional." },
      },
      required: ["decision"],
    },
  },
  {
    name: "query_memory",
    description:
      "Search the team's full message history (and extracted facts) for a question, then return an answer with [msg:ID] citations. Use this for any question about team history, prior decisions, sponsor outreach status, build progress, etc. Anyone may call.",
    input_schema: {
      type: "object",
      properties: {
        question: { type: "string", description: "The question in natural language." },
      },
      required: ["question"],
    },
  },
  {
    name: "post_message_to_channel",
    description:
      "Post a message into a different channel on behalf of the team (PitOS-authored). Use this for cross-channel reminders or hand-offs (e.g. 'tell #safety to do the LOTO drill'). Anyone may call. Cannot post to archived channels.",
    input_schema: {
      type: "object",
      properties: {
        channel_name: { type: "string", description: "Target channel name without # prefix." },
        content: { type: "string", description: "Markdown content to post." },
      },
      required: ["channel_name", "content"],
    },
  },
  {
    name: "send_invite",
    description:
      "Send a team invitation to an email address (7-day token). Only lead_mentor or mentor may call. Default role is 'student' if not specified.",
    input_schema: {
      type: "object",
      properties: {
        email: { type: "string", description: "Invitee email address." },
        role: {
          type: "string",
          enum: ["lead_mentor", "mentor", "captain", "student"],
          description: "Membership role to grant on accept. Defaults to student.",
        },
        subteam: {
          type: "string",
          enum: ["build", "programming", "outreach", "business"],
          description: "Optional subteam assignment.",
        },
      },
      required: ["email"],
    },
  },
  {
    name: "update_team_info",
    description:
      "Update the team's display name and/or FRC team number. At least one of name/number must be provided. Only lead_mentor or mentor may call.",
    input_schema: {
      type: "object",
      properties: {
        name: { type: "string", description: "New team name." },
        number: { type: "number", description: "New FRC team number (positive integer)." },
      },
    },
  },
  {
    name: "update_channel_description",
    description:
      "Update an existing channel's description. Only lead_mentor or mentor may call.",
    input_schema: {
      type: "object",
      properties: {
        channel_name: { type: "string", description: "Target channel name without # prefix." },
        description: { type: "string", description: "New description text." },
      },
      required: ["channel_name", "description"],
    },
  },
];

function sanitizeChannelName(raw: string): string {
  return raw
    .toLowerCase()
    .trim()
    .replace(/^#+/, "")
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

type ToolOutput = Record<string, unknown>;

function requireMentor(ctx: MentionInput): ToolOutput | null {
  if (ctx.role !== "lead_mentor" && ctx.role !== "mentor") {
    return {
      ok: false,
      error: `Permission denied: only lead_mentor or mentor can do this (caller role: ${ctx.role}).`,
    };
  }
  return null;
}

async function findChannelByName(teamId: string, raw: string) {
  const name = sanitizeChannelName(raw);
  if (!name) return null;
  return db
    .select()
    .from(channels)
    .where(and(eq(channels.teamId, teamId), eq(channels.name, name)))
    .get();
}

async function resolveAssignee(
  teamId: string,
  rawName: string,
): Promise<string | null> {
  const target = rawName.trim().toLowerCase();
  if (!target) return null;
  const candidates = await db
    .select({ id: users.id, name: users.name })
    .from(memberships)
    .innerJoin(users, eq(memberships.userId, users.id))
    .where(eq(memberships.teamId, teamId))
    .all();
  const exact = candidates.find((c) => c.name?.toLowerCase() === target);
  if (exact) return exact.id;
  const partial = candidates.find((c) => c.name?.toLowerCase().includes(target));
  return partial?.id ?? null;
}

async function execCreateChannel(
  raw: unknown,
  ctx: MentionInput,
): Promise<ToolOutput> {
  if (ctx.role !== "lead_mentor" && ctx.role !== "mentor") {
    return {
      ok: false,
      error: `Permission denied: only lead_mentor or mentor can create channels (caller role: ${ctx.role}).`,
    };
  }
  const input = (raw ?? {}) as {
    name?: string;
    description?: string;
    type?: "public" | "private";
  };
  const name = sanitizeChannelName(input.name ?? "");
  if (!name) return { ok: false, error: "Channel name is required." };
  const description = (input.description ?? "").trim();
  const type: "public" | "private" = input.type === "private" ? "private" : "public";

  const existing = await db
    .select()
    .from(channels)
    .where(
      and(
        eq(channels.teamId, ctx.teamId),
        eq(channels.name, name),
        isNull(channels.archivedAt),
      ),
    )
    .get();
  if (existing) return { ok: false, error: `Channel #${name} already exists.` };

  const channelId = crypto.randomUUID();
  const now = new Date();
  await db.insert(channels).values({
    id: channelId,
    teamId: ctx.teamId,
    name,
    description,
    type,
    createdAt: now,
  });

  const teamMemberships = await db
    .select()
    .from(memberships)
    .where(eq(memberships.teamId, ctx.teamId))
    .all();
  const eligible =
    type === "private"
      ? teamMemberships.filter(m => m.role === "lead_mentor" || m.role === "mentor")
      : teamMemberships;
  for (const m of eligible) {
    await db.insert(channelMembers).values({
      id: crypto.randomUUID(),
      channelId,
      userId: m.userId,
      joinedAt: now,
    });
  }

  notifyChannel(ctx.channelId, { type: "channels_updated", data: { action: "created", name } });

  return {
    ok: true,
    channel_id: channelId,
    name,
    type,
    members_added: eligible.length,
  };
}

async function execArchiveChannel(
  raw: unknown,
  ctx: MentionInput,
): Promise<ToolOutput> {
  if (ctx.role !== "lead_mentor" && ctx.role !== "mentor") {
    return {
      ok: false,
      error: `Permission denied: only lead_mentor or mentor can archive channels (caller role: ${ctx.role}).`,
    };
  }
  const input = (raw ?? {}) as { channel_name?: string };
  const name = sanitizeChannelName(input.channel_name ?? "");
  if (!name) return { ok: false, error: "Channel name is required." };
  const target = await db
    .select()
    .from(channels)
    .where(and(eq(channels.teamId, ctx.teamId), eq(channels.name, name)))
    .get();
  if (!target) return { ok: false, error: `Channel #${name} not found.` };
  if (target.archivedAt) return { ok: false, error: `Channel #${name} is already archived.` };
  await db
    .update(channels)
    .set({ archivedAt: new Date() })
    .where(eq(channels.id, target.id));
  notifyChannel(ctx.channelId, { type: "channels_updated", data: { action: "archived", name } });
  return { ok: true, name, channel_id: target.id };
}

async function execCreateTask(
  raw: unknown,
  ctx: MentionInput,
): Promise<ToolOutput> {
  const input = (raw ?? {}) as {
    title?: string;
    description?: string;
    assignee_name?: string;
    deadline?: string;
  };
  const title = (input.title ?? "")
    .trim()
    .replace(/^["']+|["']+$/g, "")
    .trim();
  if (!title) return { ok: false, error: "Title is required." };

  let assignedToUserId: string | null = null;
  let assigneeNote: string | null = null;
  if (input.assignee_name?.trim()) {
    assignedToUserId = await resolveAssignee(ctx.teamId, input.assignee_name);
    if (!assignedToUserId) {
      assigneeNote = `Requested assignee: ${input.assignee_name.trim()} (not matched)`;
    }
  }

  let deadline: Date | null = null;
  if (input.deadline?.trim()) {
    const ts = Date.parse(input.deadline);
    if (!Number.isNaN(ts)) deadline = new Date(ts);
  }

  const description =
    [input.description?.trim(), assigneeNote].filter(Boolean).join("\n\n") ||
    null;

  const taskId = crypto.randomUUID();
  const now = new Date();
  const task = {
    id: taskId,
    teamId: ctx.teamId,
    channelId: ctx.channelId,
    title,
    description,
    assignedToUserId,
    assignedByUserId: ctx.userId,
    createdViaMessageId: ctx.messageId,
    deadline,
    status: "open" as const,
    teachMode: false,
    createdAt: now,
  };
  await db.insert(tasks).values(task);
  notifyChannel(ctx.channelId, { type: "task_created", data: task });

  return {
    ok: true,
    task_id: taskId,
    title,
    assigned_to_user_id: assignedToUserId,
    deadline: deadline?.toISOString() ?? null,
  };
}

async function execUpdateTaskStatus(
  raw: unknown,
  ctx: MentionInput,
): Promise<ToolOutput> {
  const input = (raw ?? {}) as {
    task_id?: string;
    task_title?: string;
    status?: string;
  };
  const allowed = ["open", "in_progress", "done", "blocked", "cancelled"] as const;
  type Status = (typeof allowed)[number];
  if (!allowed.includes(input.status as Status)) {
    return {
      ok: false,
      error: `Invalid status. Allowed: ${allowed.join(", ")}`,
    };
  }
  const status = input.status as Status;

  let target: typeof tasks.$inferSelect | undefined;
  if (input.task_id) {
    target = await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.id, input.task_id), eq(tasks.teamId, ctx.teamId)))
      .get();
  } else if (input.task_title?.trim()) {
    const candidates = await db
      .select()
      .from(tasks)
      .where(eq(tasks.teamId, ctx.teamId))
      .all();
    const q = input.task_title.trim().toLowerCase();
    target =
      candidates.find((t) => t.title.toLowerCase() === q) ??
      candidates.find((t) => t.title.toLowerCase().includes(q));
  }
  if (!target)
    return {
      ok: false,
      error: "Task not found (provide task_id or a unique task_title).",
    };

  const completedAt = status === "done" ? new Date() : null;
  await db
    .update(tasks)
    .set({ status, completedAt })
    .where(eq(tasks.id, target.id));

  // TODO: wire task_panel.tsx to subscribe to task_updated SSE; currently it polls.
  notifyChannel(ctx.channelId, {
    type: "task_updated",
    data: { id: target.id, status, completedAt },
  });

  return {
    ok: true,
    task_id: target.id,
    title: target.title,
    status,
    completedAt: completedAt?.toISOString() ?? null,
  };
}

async function execCreateDecision(
  raw: unknown,
  ctx: MentionInput,
): Promise<ToolOutput> {
  const input = (raw ?? {}) as {
    decision?: string;
    rationale?: string;
    alternatives_considered?: string;
    context_at_time?: string;
  };
  const decision = (input.decision ?? "").trim();
  if (!decision) return { ok: false, error: "Decision text is required." };

  const id = crypto.randomUUID();
  const now = new Date();
  await db.insert(decisions).values({
    id,
    teamId: ctx.teamId,
    sourceMessageId: ctx.messageId,
    decision,
    rationale: input.rationale?.trim() || null,
    alternativesConsidered: input.alternatives_considered?.trim() || null,
    contextAtTime: input.context_at_time?.trim() || null,
    decidedAt: now,
    recordedAt: now,
  });

  // TODO: wire a decisions-panel SSE subscriber when one exists.
  notifyChannel(ctx.channelId, {
    type: "decision_created",
    data: { id, decision, decidedAt: now },
  });

  return { ok: true, decision_id: id, decision };
}

async function execQueryMemory(
  raw: unknown,
  ctx: MentionInput,
): Promise<ToolOutput> {
  const input = (raw ?? {}) as { question?: string };
  const question = (input.question ?? "").trim();
  if (!question) return { ok: false, error: "Question is required." };

  const result = await runMemoryAgent(question, ctx.teamId);
  return {
    ok: true,
    answer: result.answer,
    citations: result.citations,
  };
}

async function execPostMessageToChannel(
  raw: unknown,
  ctx: MentionInput,
): Promise<ToolOutput> {
  const input = (raw ?? {}) as { channel_name?: string; content?: string };
  const target = await findChannelByName(ctx.teamId, input.channel_name ?? "");
  if (!target)
    return {
      ok: false,
      error: `Channel #${input.channel_name ?? ""} not found.`,
    };
  if (target.archivedAt)
    return { ok: false, error: `Channel #${target.name} is archived.` };
  const content = (input.content ?? "").trim();
  if (!content) return { ok: false, error: "Content is required." };

  const msgId = crypto.randomUUID();
  const message = {
    id: msgId,
    channelId: target.id,
    userId: null as string | null,
    content,
    agentGenerated: true as const,
    agentType: "pitos-mention" as string,
    createdAt: new Date(),
  };
  await db.insert(messages).values(message);
  notifyChannel(target.id, { type: "message", data: message });

  return { ok: true, message_id: msgId, channel: target.name };
}

async function execSendInvite(
  raw: unknown,
  ctx: MentionInput,
): Promise<ToolOutput> {
  const denied = requireMentor(ctx);
  if (denied) return denied;

  const input = (raw ?? {}) as {
    email?: string;
    role?: string;
    subteam?: string;
  };
  const email = (input.email ?? "").trim();
  if (!email.includes("@"))
    return { ok: false, error: "Valid email is required." };

  const allowedRoles = [
    "lead_mentor",
    "mentor",
    "captain",
    "student",
  ] as const;
  type RoleEnum = (typeof allowedRoles)[number];
  const role: RoleEnum = allowedRoles.includes(input.role as RoleEnum)
    ? (input.role as RoleEnum)
    : "student";

  const allowedSubs = ["build", "programming", "outreach", "business"] as const;
  type SubEnum = (typeof allowedSubs)[number];
  const subteam: SubEnum | null = allowedSubs.includes(input.subteam as SubEnum)
    ? (input.subteam as SubEnum)
    : null;

  const id = crypto.randomUUID();
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await db.insert(invites).values({
    id,
    teamId: ctx.teamId,
    email,
    role,
    subteam,
    invitedByUserId: ctx.userId,
    token,
    expiresAt,
  });

  const url = `${process.env.APP_URL ?? "http://localhost:3000"}/api/invites/accept?token=${token}`;
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_EMAIL_API_TOKEN;
  const fromEmail = process.env.FROM_EMAIL ?? "noreply@pitos.app";

  if (accountId && apiToken) {
    try {
      const res = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${accountId}/email/sending/send`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: `PitOS <${fromEmail}>`,
            to: email,
            subject: "You've been invited to PitOS",
            html: `<p>You've been invited to join the team on PitOS. <a href="${url}">Accept invitation</a> (expires in 7 days).</p>`,
            text: `You've been invited to join the team on PitOS. Accept invitation: ${url} (expires in 7 days).`,
          }),
        },
      );
      if (!res.ok) {
        const errBody = await res.text();
        console.error(
          `[pitos-mention:invite] Cloudflare Email send failed: ${res.status} ${errBody}`,
        );
      }
    } catch (err) {
      console.error("[pitos-mention:invite] email send error:", err);
    }
  } else {
    console.log("[pitos-mention:invite] Invite link:", url);
  }

  return { ok: true, invite_id: id, email, role };
}

async function execUpdateTeamInfo(
  raw: unknown,
  ctx: MentionInput,
): Promise<ToolOutput> {
  const denied = requireMentor(ctx);
  if (denied) return denied;

  const input = (raw ?? {}) as { name?: string; number?: number };
  const updates: { name?: string; number?: number } = {};
  if (typeof input.name === "string" && input.name.trim()) {
    updates.name = input.name.trim();
  }
  if (
    typeof input.number === "number" &&
    Number.isInteger(input.number) &&
    input.number > 0
  ) {
    updates.number = input.number;
  }
  if (Object.keys(updates).length === 0) {
    return { ok: false, error: "Provide at least one of: name, number." };
  }

  await db.update(teams).set(updates).where(eq(teams.id, ctx.teamId));
  // TODO: wire sidebar header SSE consumer for team_updated.
  notifyChannel(ctx.channelId, {
    type: "team_updated",
    data: { id: ctx.teamId, ...updates },
  });
  return { ok: true, ...updates };
}

async function execUpdateChannelDescription(
  raw: unknown,
  ctx: MentionInput,
): Promise<ToolOutput> {
  const denied = requireMentor(ctx);
  if (denied) return denied;

  const input = (raw ?? {}) as { channel_name?: string; description?: string };
  const target = await findChannelByName(ctx.teamId, input.channel_name ?? "");
  if (!target)
    return {
      ok: false,
      error: `Channel #${input.channel_name ?? ""} not found.`,
    };
  const description = (input.description ?? "").trim();
  if (!description)
    return { ok: false, error: "Description is required." };

  await db.update(channels).set({ description }).where(eq(channels.id, target.id));
  // TODO: wire sidebar tooltip SSE consumer for channel_updated.
  notifyChannel(ctx.channelId, {
    type: "channel_updated",
    data: { id: target.id, description },
  });
  return { ok: true, channel_id: target.id, name: target.name, description };
}

async function executeTool(
  name: string,
  input: unknown,
  ctx: MentionInput,
): Promise<ToolOutput> {
  try {
    switch (name) {
      case "create_channel":
        return await execCreateChannel(input, ctx);
      case "archive_channel":
        return await execArchiveChannel(input, ctx);
      case "create_task":
        return await execCreateTask(input, ctx);
      case "update_task_status":
        return await execUpdateTaskStatus(input, ctx);
      case "create_decision":
        return await execCreateDecision(input, ctx);
      case "query_memory":
        return await execQueryMemory(input, ctx);
      case "post_message_to_channel":
        return await execPostMessageToChannel(input, ctx);
      case "send_invite":
        return await execSendInvite(input, ctx);
      case "update_team_info":
        return await execUpdateTeamInfo(input, ctx);
      case "update_channel_description":
        return await execUpdateChannelDescription(input, ctx);
      default:
        return { ok: false, error: `Unknown tool: ${name}` };
    }
  } catch (err) {
    return { ok: false, error: `Tool threw: ${String(err)}` };
  }
}

export async function runMentionAgent(input: MentionInput): Promise<void> {
  const start = Date.now();

  const systemPrompt = `You are PitOS, the on-call agent for FRC team "${input.teamName}", present in channel #${input.channelName}.

You are invoked only when someone tags @pitos. Read the recent conversation, decide what the user actually wants, and act.

Capability surface (call as tools when the user's intent matches):
- Tasks — create_task, update_task_status (any role)
- Decisions — create_decision with rationale (any role)
- Memory — query_memory for any question about team history (any role) — always cite [msg:ID]
- Cross-channel — post_message_to_channel to drop a heads-up in another channel (any role)
- Channels (mentor+ only) — create_channel, archive_channel, update_channel_description
- Team admin (mentor+ only) — send_invite, update_team_info

If the caller is captain or student and asks for a mentor-only action, politely decline without calling the tool. Channel names must be lowercase kebab-case (a-z, 0-9, hyphens, 1–3 words).

You cannot start a Judge Simulation, Exit Interview, or Season Recap from chat — point the user to /judge-sim, /exit-interview, or /season-recap.

After a tool call succeeds, briefly confirm what happened (1–3 sentences, no JSON, no headings). For pure information replies (no tool call), keep it equally short.

Reply in ${input.language || "en"}.`;

  const userMessage = `Recent messages in #${input.channelName}:
${input.transcript}

Latest message (tagged @pitos): "${input.triggerContent}"

Caller role: ${input.role}. What do you do?`;

  const conversation: Anthropic.Messages.MessageParam[] = [
    { role: "user", content: userMessage },
  ];
  const toolCallTrace: Array<{
    name: string;
    input: unknown;
    output: ToolOutput;
  }> = [];

  let tokens = 0;
  let finalText = "";
  let status: "completed" | "failed" = "completed";

  try {
    for (let step = 0; step < 4; step++) {
      const result = await anthropic.messages.create({
        model: "claude-opus-4-7",
        max_tokens: 1024,
        system: systemPrompt,
        tools,
        messages: conversation,
      });
      tokens +=
        (result.usage?.input_tokens ?? 0) + (result.usage?.output_tokens ?? 0);

      if (result.stop_reason === "tool_use") {
        const toolUses = result.content.filter(
          (b): b is Anthropic.Messages.ToolUseBlock => b.type === "tool_use",
        );
        const toolResults: Anthropic.Messages.ToolResultBlockParam[] = [];
        for (const tu of toolUses) {
          const output = await executeTool(tu.name, tu.input, input);
          toolCallTrace.push({ name: tu.name, input: tu.input, output });
          toolResults.push({
            type: "tool_result",
            tool_use_id: tu.id,
            content: JSON.stringify(output),
          });
        }
        conversation.push({ role: "assistant", content: result.content });
        conversation.push({ role: "user", content: toolResults });
        continue;
      }

      const textBlock = result.content.find(
        (b): b is Anthropic.Messages.TextBlock => b.type === "text",
      );
      finalText = textBlock?.text?.trim() ?? "";
      break;
    }
  } catch (err) {
    console.error("[agent:pitos-mention] error:", err);
    status = "failed";
    finalText = finalText || "(PitOS hit an error — try again in a moment.)";
  }

  if (!finalText) finalText = "(no response)";

  const agentMessage = {
    id: crypto.randomUUID(),
    channelId: input.channelId,
    userId: null as string | null,
    content: finalText,
    agentGenerated: true as const,
    agentType: "pitos-mention" as string,
    metadata: toolCallTrace.length ? { toolCalls: toolCallTrace } : null,
    createdAt: new Date(),
  };
  await db.insert(messages).values(agentMessage);
  notifyChannel(input.channelId, { type: "message", data: agentMessage });

  await db.insert(agentRuns).values({
    id: crypto.randomUUID(),
    teamId: input.teamId,
    trigger: `mention:${input.messageId}`,
    agentType: "pitos-mention",
    status,
    inputContext: {
      channelId: input.channelId,
      role: input.role,
      language: input.language,
    } as unknown as null,
    output: finalText,
    toolCalls: toolCallTrace as unknown as null,
    tokensUsed: tokens,
    durationMs: Date.now() - start,
    createdAt: new Date(),
  });
}
