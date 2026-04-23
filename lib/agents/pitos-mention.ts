import type Anthropic from "@anthropic-ai/sdk";
import { and, eq, isNull } from "drizzle-orm";
import { anthropic } from "@/lib/anthropic";
import { db } from "@/db";
import {
  agentRuns,
  channelMembers,
  channels,
  memberships,
  messages,
} from "@/db/schema";
import { notifyChannel } from "@/lib/sse";

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

async function executeTool(
  name: string,
  input: unknown,
  ctx: MentionInput,
): Promise<ToolOutput> {
  try {
    if (name === "create_channel") return await execCreateChannel(input, ctx);
    if (name === "archive_channel") return await execArchiveChannel(input, ctx);
    return { ok: false, error: `Unknown tool: ${name}` };
  } catch (err) {
    return { ok: false, error: `Tool threw: ${String(err)}` };
  }
}

export async function runMentionAgent(input: MentionInput): Promise<void> {
  const start = Date.now();

  const systemPrompt = `You are PitOS, the on-call agent for FRC team "${input.teamName}", present in channel #${input.channelName}.

You are invoked only when someone tags @pitos. Read the recent conversation, decide what the user actually wants, and respond briefly.

Privileged actions (create_channel, archive_channel) are available as tools. They only succeed when the caller is a lead_mentor or mentor; if a captain or student asks for one, politely explain the restriction and don't call the tool. Channel names must be lowercase kebab-case (a-z, 0-9, hyphens, 1-3 words).

For everything else — answering questions, giving context, summarizing — respond with plain conversational text (1–3 short sentences, no markdown headings, no JSON).

After a tool call succeeds, briefly confirm what happened in your reply.

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
