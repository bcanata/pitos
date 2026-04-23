import { anthropic } from "@/lib/anthropic";
import { db } from "@/db";
import { exitPacks, teams } from "@/db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

function buildSystemPrompt(lang = "en"): string {
  const langNote = lang !== "en" ? ` Respond in ${lang}.` : "";
  return (
    "You are extracting institutional knowledge from a departing FRC team member. " +
    "Ask ONE question to start uncovering knowledge that would be lost when they leave. " +
    `Focus on undocumented processes, hard-learned lessons, or team-specific know-how.${langNote}`
  );
}

const MAX_TURNS = 5;

export async function startExitInterview(
  userId: string,
  teamId: string
): Promise<{ packId: string; firstQuestion: string }> {
  const packId = randomUUID();
  const team = db.select().from(teams).where(eq(teams.id, teamId)).get();
  const lang = team?.language ?? "en";

  // Create the exit pack row
  db.insert(exitPacks)
    .values({
      id: packId,
      memberUserId: userId,
      teamId,
      status: "collecting",
      questionsAsked: [] as string[],
      answersCollected: [] as { q: string; a: string }[],
    })
    .run();

  // Ask Claude for the first extraction question
  const response = await anthropic.messages.create({
    model: "claude-opus-4-7",
    max_tokens: 512,
    system: buildSystemPrompt(lang),
    messages: [{ role: "user", content: "Begin the exit interview." }],
  });

  const firstQuestion =
    response.content[0].type === "text" ? response.content[0].text : "What knowledge do you have that others on the team might not?";

  // Store the first question in the pack
  db.update(exitPacks)
    .set({ questionsAsked: [firstQuestion] as string[] })
    .where(eq(exitPacks.id, packId))
    .run();

  return { packId, firstQuestion };
}

export async function continueExitInterview(
  packId: string,
  answer: string
): Promise<{ nextQuestion: string; isComplete: boolean }> {
  const pack = db.select().from(exitPacks).where(eq(exitPacks.id, packId)).get();
  if (!pack) throw new Error("Exit pack not found");

  const questionsAsked = (pack.questionsAsked as string[]) ?? [];
  const answersCollected = (pack.answersCollected as { q: string; a: string }[]) ?? [];

  // Append the new answer
  const lastQuestion = questionsAsked[questionsAsked.length - 1] ?? "";
  const updatedAnswers = [...answersCollected, { q: lastQuestion, a: answer }];

  if (updatedAnswers.length >= MAX_TURNS) {
    // Mark complete
    db.update(exitPacks)
      .set({
        answersCollected: updatedAnswers,
        status: "finalized",
        generatedAt: new Date(),
      })
      .where(eq(exitPacks.id, packId))
      .run();

    return {
      nextQuestion: "Knowledge captured. Thank you for sharing your expertise with the team.",
      isComplete: true,
    };
  }

  // Build conversation history for Claude
  const conversationMessages: { role: "user" | "assistant"; content: string }[] = [];
  for (const qa of answersCollected) {
    conversationMessages.push({ role: "assistant", content: qa.q });
    conversationMessages.push({ role: "user", content: qa.a });
  }
  // Add latest question and current answer
  conversationMessages.push({ role: "assistant", content: lastQuestion });
  conversationMessages.push({ role: "user", content: answer });

  const packTeam = db.select().from(teams).where(eq(teams.id, pack.teamId)).get();
  const response = await anthropic.messages.create({
    model: "claude-opus-4-7",
    max_tokens: 512,
    system: buildSystemPrompt(packTeam?.language ?? "en"),
    messages: conversationMessages,
  });

  const nextQuestion =
    response.content[0].type === "text"
      ? response.content[0].text
      : "What else should the team know that you haven't documented yet?";

  const updatedQuestions = [...questionsAsked, nextQuestion];

  db.update(exitPacks)
    .set({
      questionsAsked: updatedQuestions,
      answersCollected: updatedAnswers,
    })
    .where(eq(exitPacks.id, packId))
    .run();

  return { nextQuestion, isComplete: false };
}
