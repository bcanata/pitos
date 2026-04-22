import { anthropic } from "@/lib/anthropic";
import { db } from "@/db";
import { messages, teams, channels, agentRuns, tasks } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { notifyChannel } from "@/lib/sse";

interface ChannelAgentInput {
  channelId: string;
  messageId: string;
  teamId: string;
}

interface AgentResponse {
  action: "respond" | "no_action" | "create_task";
  jury_reflex_kind?: "proof_demand" | "why_question" | "teach_redirect" | null;
  response?: string;
  task_title?: string;
  task_assignee?: string;
  task_teach_mode?: boolean;
  reasoning?: string;
}

export async function runChannelAgent({ channelId, messageId, teamId }: ChannelAgentInput) {
  const start = Date.now();

  // Get team name and channel name for context
  const team = db.select().from(teams).where(eq(teams.id, teamId)).get();
  const channel = db.select().from(channels).where(eq(channels.id, channelId)).get();
  const triggerMessage = db.select().from(messages).where(eq(messages.id, messageId)).get();

  if (!team || !channel || !triggerMessage) return;

  // Get last 20 messages for context
  const recentMessages = db.select().from(messages)
    .where(eq(messages.channelId, channelId))
    .orderBy(desc(messages.createdAt))
    .limit(20)
    .all()
    .reverse();

  const contextLines = recentMessages.map(m =>
    `[${m.agentGenerated ? "PitOS" : "user"}] ${m.content}`
  ).join("\n");

  const systemPrompt = `You are a team member of ${team.name}, present in channel #${channel.name}.

You are not a helpful assistant. You are the team's jury rehearsal partner. Your job is to notice when the team makes claims without evidence, makes decisions without recording the rationale, or when a student needs to be taught rather than given an answer.

Most messages don't need a response. You speak only when you can do one of:
- Demand proof for a specific, unsubstantiated claim (jury reflex: proof_demand)
- Ask "why" before a decision gets made without rationale (jury reflex: why_question)
- Redirect a student who wants you to do their work to teaching mode (jury reflex: teach_redirect)
- Create a task when someone explicitly delegates ("Ali, please do X by Friday")
- Answer a direct question about team history with citations
- Stay silent (no_action) — this is the most common response

Respond with a JSON object:
{
  "action": "respond" | "no_action" | "create_task",
  "jury_reflex_kind": "proof_demand" | "why_question" | "teach_redirect" | null,
  "response": "what you would say (if action is respond)",
  "task_title": "short task title (if action is create_task)",
  "task_assignee": "person's name (if action is create_task, optional)",
  "task_teach_mode": false,
  "reasoning": "brief internal note on why you chose this action"
}`;

  const userMessage = `Recent conversation in #${channel.name}:\n${contextLines}\n\nLatest message: "${triggerMessage.content}"\n\nWhat do you do?`;

  let output = "";

  try {
    const result = await anthropic.messages.create({
      model: "claude-opus-4-7",
      max_tokens: 512,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    });

    const text = result.content[0].type === "text" ? result.content[0].text : "";
    output = text;

    let parsed: AgentResponse | null = null;
    try {
      // Extract JSON from response (might have markdown fences)
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) parsed = JSON.parse(jsonMatch[0]) as AgentResponse;
    } catch {}

    console.log(`[agent:channel] #${channel.name} → action=${parsed?.action ?? "parse_error"} reflex=${parsed?.jury_reflex_kind ?? "none"} | ${parsed?.reasoning ?? text.slice(0, 100)}`);

    if (parsed?.action === "respond" && parsed.response) {
      // Insert agent message row
      const agentMsgId = crypto.randomUUID();
      const agentMessage = {
        id: agentMsgId,
        channelId,
        userId: null as string | null,
        content: parsed.response,
        agentGenerated: true as const,
        agentType: "channel" as string,
        juryReflexKind: (parsed.jury_reflex_kind ?? null) as "proof_demand" | "why_question" | "teach_redirect" | null,
        createdAt: new Date(),
      };
      db.insert(messages).values(agentMessage).run();
      notifyChannel(channelId, { type: "message", data: agentMessage });

    } else if (parsed?.action === "create_task" && parsed.task_title) {
      // Insert task
      const taskId = crypto.randomUUID();
      const task = {
        id: taskId,
        teamId,
        channelId,
        title: parsed.task_title,
        description: parsed.task_assignee ? `Assignee: ${parsed.task_assignee}` : null as string | null,
        teachMode: parsed.task_teach_mode ?? false,
        status: "open" as const,
        createdAt: new Date(),
      };
      db.insert(tasks).values(task).run();

      // Post confirmation message to channel
      const confirmMsgId = crypto.randomUUID();
      const confirmMessage = {
        id: confirmMsgId,
        channelId,
        userId: null as string | null,
        content: `Task created: ${parsed.task_title}`,
        agentGenerated: true as const,
        agentType: "channel" as string,
        createdAt: new Date(),
      };
      db.insert(messages).values(confirmMessage).run();
      notifyChannel(channelId, { type: "message", data: confirmMessage });
      notifyChannel(channelId, { type: "task_created", data: task });
    }
    // "no_action": nothing to do, just save the agentRun below

    // Log agent run
    db.insert(agentRuns).values({
      id: crypto.randomUUID(),
      teamId,
      trigger: `message:${messageId}`,
      agentType: "channel",
      status: "completed",
      inputContext: { channelId, messageId, messageCount: recentMessages.length } as unknown as null,
      output,
      tokensUsed: result.usage.input_tokens + result.usage.output_tokens,
      durationMs: Date.now() - start,
      createdAt: new Date(),
    }).run();

  } catch (err) {
    console.error("[agent:channel] error:", err);

    // Log failed run
    db.insert(agentRuns).values({
      id: crypto.randomUUID(),
      teamId,
      trigger: `message:${messageId}`,
      agentType: "channel",
      status: "failed",
      inputContext: { channelId, messageId, messageCount: recentMessages.length } as unknown as null,
      output,
      durationMs: Date.now() - start,
      createdAt: new Date(),
    }).run();
  }
}
