import { anthropic } from "@/lib/anthropic";
import { db } from "@/db";
import { messages, channels, extractedFacts } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function runMemoryAgent(
  query: string,
  teamId: string
): Promise<{
  answer: string;
  citations: Array<{ messageId: string; channelName: string; preview: string }>;
}> {
  // 1. Get all channels for this team
  const teamChannels = db
    .select()
    .from(channels)
    .where(eq(channels.teamId, teamId))
    .all();

  const channelMap = new Map(teamChannels.map((ch) => [ch.id, ch.name]));
  const channelIds = teamChannels.map((ch) => ch.id);

  // 2. Get last 200 messages across all team channels
  let recentMessages: Array<{
    id: string;
    channelId: string;
    content: string;
    createdAt: Date | null;
    agentGenerated: boolean;
  }> = [];

  if (channelIds.length > 0) {
    // Query messages for each channel and merge (SQLite doesn't support IN easily with drizzle here)
    for (const channelId of channelIds) {
      const channelMsgs = db
        .select({
          id: messages.id,
          channelId: messages.channelId,
          content: messages.content,
          createdAt: messages.createdAt,
          agentGenerated: messages.agentGenerated,
        })
        .from(messages)
        .where(eq(messages.channelId, channelId))
        .orderBy(desc(messages.createdAt))
        .limit(50)
        .all();
      recentMessages.push(...channelMsgs);
    }

    // Sort all messages by createdAt desc, take top 200
    recentMessages.sort((a, b) => {
      const aTime = a.createdAt ? a.createdAt.getTime() : 0;
      const bTime = b.createdAt ? b.createdAt.getTime() : 0;
      return bTime - aTime;
    });
    recentMessages = recentMessages.slice(0, 200);
  }

  // 3. Filter client-side for messages containing query keywords
  const keywords = query
    .toLowerCase()
    .split(/\s+/)
    .filter((k) => k.length > 2);

  const relevantMessages =
    keywords.length > 0
      ? recentMessages.filter((m) =>
          keywords.some((kw) => m.content.toLowerCase().includes(kw))
        )
      : recentMessages;

  const topMessages = relevantMessages.slice(0, 10);

  // 4. Get extracted facts for this team
  const facts = db
    .select()
    .from(extractedFacts)
    .where(eq(extractedFacts.teamId, teamId))
    .orderBy(desc(extractedFacts.extractedAt))
    .limit(20)
    .all();

  // 5. Build context for the LLM
  const messageContext = topMessages
    .map((m) => {
      const chName = channelMap.get(m.channelId) ?? "unknown";
      const author = m.agentGenerated ? "PitOS" : "user";
      const preview = m.content.slice(0, 300);
      return `[msg:${m.id}] #${chName} (${author}): ${preview}`;
    })
    .join("\n");

  const factsContext = facts
    .map((f) => `[fact] ${f.factType}: ${f.statement}`)
    .join("\n");

  const contextBlock = [
    messageContext ? `## Recent Messages\n${messageContext}` : "",
    factsContext ? `## Extracted Facts\n${factsContext}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  // 6. Call claude-opus-4-7
  const result = await anthropic.messages.create({
    model: "claude-opus-4-7",
    max_tokens: 1024,
    system:
      "You are PitOS Memory. Answer the question using ONLY the provided context. " +
      "Cite specific messages by their ID in [msg:ID] format. " +
      "If the context doesn't contain enough information, say so honestly.",
    messages: [
      {
        role: "user",
        content: `Question: ${query}\n\nContext:\n${contextBlock || "No relevant context found."}`,
      },
    ],
  });

  const answerText =
    result.content[0].type === "text" ? result.content[0].text : "";

  // 7. Parse [msg:ID] citations from the answer
  const citedIds = [...answerText.matchAll(/\[msg:([^\]]+)\]/g)].map(
    (m) => m[1]
  );
  const uniqueCitedIds = [...new Set(citedIds)];

  const citations = uniqueCitedIds
    .map((msgId) => {
      const msg = topMessages.find((m) => m.id === msgId);
      if (!msg) return null;
      return {
        messageId: msgId,
        channelName: channelMap.get(msg.channelId) ?? "unknown",
        preview: msg.content.slice(0, 120),
      };
    })
    .filter((c): c is NonNullable<typeof c> => c !== null);

  return { answer: answerText, citations };
}
