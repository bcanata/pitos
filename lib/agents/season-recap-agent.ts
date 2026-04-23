import { anthropic } from "@/lib/anthropic";
import { db } from "@/db";
import { messages, decisions, tasks, extractedFacts, generatedDocuments, teams } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { randomUUID } from "crypto";

export async function runSeasonRecap(teamId: string): Promise<string> {
  const team = db.select().from(teams).where(eq(teams.id, teamId)).get();
  const lang = team?.language ?? "en";
  const langNote = lang !== "en" ? ` Respond entirely in ${lang}.` : "";

  // 1. Gather data
  const recentMessages = db
    .select()
    .from(messages)
    .orderBy(desc(messages.createdAt))
    .limit(200)
    .all();

  // Filter to team channels would require a join — use all messages and filter by teamId indirectly
  // For now gather team-scoped data directly
  const teamDecisions = db
    .select()
    .from(decisions)
    .where(eq(decisions.teamId, teamId))
    .orderBy(desc(decisions.recordedAt))
    .all();

  const completedTasks = db
    .select()
    .from(tasks)
    .where(eq(tasks.teamId, teamId))
    .all()
    .filter((t) => t.status === "done");

  const topFacts = db
    .select()
    .from(extractedFacts)
    .where(eq(extractedFacts.teamId, teamId))
    .orderBy(desc(extractedFacts.extractedAt))
    .limit(50)
    .all();

  // Build context string
  const contextParts: string[] = [];

  if (teamDecisions.length > 0) {
    contextParts.push(
      "=== DECISIONS ===\n" +
        teamDecisions
          .map(
            (d) =>
              `- ${d.decision}${d.rationale ? ` (Rationale: ${d.rationale})` : ""}${d.alternativesConsidered ? ` (Alternatives: ${d.alternativesConsidered})` : ""}`
          )
          .join("\n")
    );
  }

  if (completedTasks.length > 0) {
    contextParts.push(
      "=== COMPLETED TASKS ===\n" +
        completedTasks.map((t) => `- ${t.title}${t.description ? `: ${t.description}` : ""}`).join("\n")
    );
  }

  if (topFacts.length > 0) {
    contextParts.push(
      "=== EXTRACTED FACTS ===\n" +
        topFacts.map((f) => `- [${f.factType}] ${f.statement}`).join("\n")
    );
  }

  if (recentMessages.length > 0) {
    const messageSample = recentMessages.slice(0, 50);
    contextParts.push(
      "=== RECENT MESSAGES (sample) ===\n" +
        messageSample.map((m) => m.content).join("\n---\n")
    );
  }

  const dataContext =
    contextParts.length > 0
      ? contextParts.join("\n\n")
      : "No team data available yet. Write a template-style recap with placeholders.";

  // 2. Call Claude for the recap
  const response = await anthropic.messages.create({
    model: "claude-opus-4-7",
    max_tokens: 8096,
    system:
      "You are writing a comprehensive season recap for an FRC robotics team. " +
      "Use the provided data to write a detailed 5-section report:\n" +
      "1. Season Overview & Key Achievements\n" +
      "2. Major Decisions & Rationale\n" +
      "3. Challenges Overcome\n" +
      "4. Team Growth & Learning\n" +
      "5. Recommendations for Next Season\n" +
      `Be specific, cite actual events from the data, and write at least 300 words per section.${langNote}`,
    messages: [
      {
        role: "user",
        content: `Here is the team data for this season:\n\n${dataContext}\n\nPlease write the comprehensive season recap now.`,
      },
    ],
  });

  const fullText =
    response.content[0].type === "text"
      ? response.content[0].text
      : "Season recap generation failed.";

  // 3. Insert into generatedDocuments
  const docId = randomUUID();
  db.insert(generatedDocuments)
    .values({
      id: docId,
      teamId,
      docType: "season_recap",
      title: `Season Recap — ${new Date().getFullYear()}`,
      contentMd: fullText,
      generatedByAgentType: "season-recap",
      createdAt: new Date(),
    })
    .run();

  return docId;
}
