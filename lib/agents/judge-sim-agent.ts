import { anthropic } from "@/lib/anthropic";
import { db } from "@/db";
import { judgeSessions } from "@/db/schema";
import { eq } from "drizzle-orm";

export type JudgeSimMessage = { role: "judge" | "team"; content: string };

const MAX_TURNS = 6;

function buildJudgeSystemPrompt(award: string): string {
  return `You are an FRC judge evaluating a team for the ${award} award. You are skeptical, thorough, and demand specific evidence. Ask ONE tough question at a time. Be direct and challenging. No pleasantries. Push the team to prove their claims with concrete data and specific examples.`;
}

export async function startJudgeSim(
  teamId: string,
  userId: string,
  award: string
): Promise<{ sessionId: string; firstQuestion: string }> {
  const sessionId = crypto.randomUUID();

  const result = await anthropic.messages.create({
    model: "claude-opus-4-7",
    max_tokens: 512,
    system: buildJudgeSystemPrompt(award),
    messages: [
      {
        role: "user",
        content: `Begin the mock interview for the ${award} award.`,
      },
    ],
  });

  const firstQuestion =
    result.content[0].type === "text" ? result.content[0].text.trim() : "";

  const transcript: JudgeSimMessage[] = [
    { role: "judge", content: firstQuestion },
  ];

  db.insert(judgeSessions)
    .values({
      id: sessionId,
      teamId,
      startedByUserId: userId,
      awardType: awardToEnum(award),
      status: "in_progress",
      transcript: transcript as unknown as null,
      startedAt: new Date(),
    })
    .run();

  return { sessionId, firstQuestion };
}

export async function continueJudgeSim(
  sessionId: string,
  teamResponse: string
): Promise<{ judgeReply: string; isComplete: boolean; gapReport?: string }> {
  const session = db
    .select()
    .from(judgeSessions)
    .where(eq(judgeSessions.id, sessionId))
    .get();

  if (!session) throw new Error("Session not found");

  const transcript = (session.transcript as JudgeSimMessage[] | null) ?? [];

  // Add team's response
  transcript.push({ role: "team", content: teamResponse });

  // Count how many team responses we have so far (after adding this one)
  const teamTurnCount = transcript.filter((m) => m.role === "team").length;
  const isComplete = teamTurnCount >= MAX_TURNS;

  let judgeReply = "";
  let gapReport: string | undefined;

  if (!isComplete) {
    // Build conversation history for Claude
    const claudeMessages: { role: "user" | "assistant"; content: string }[] =
      [];
    for (const msg of transcript) {
      if (msg.role === "judge") {
        claudeMessages.push({ role: "assistant", content: msg.content });
      } else {
        claudeMessages.push({ role: "user", content: msg.content });
      }
    }

    const result = await anthropic.messages.create({
      model: "claude-opus-4-7",
      max_tokens: 512,
      system: buildJudgeSystemPrompt(session.awardType),
      messages: claudeMessages,
    });

    judgeReply =
      result.content[0].type === "text" ? result.content[0].text.trim() : "";
    transcript.push({ role: "judge", content: judgeReply });

    db.update(judgeSessions)
      .set({ transcript: transcript as unknown as null })
      .where(eq(judgeSessions.id, sessionId))
      .run();
  } else {
    // Generate gap report
    const conversationText = transcript
      .map((m) => `${m.role === "judge" ? "Judge" : "Team"}: ${m.content}`)
      .join("\n\n");

    const gapResult = await anthropic.messages.create({
      model: "claude-opus-4-7",
      max_tokens: 1024,
      system:
        "You just completed a mock judging interview. Based on the conversation, identify 3-5 specific evidence gaps — claims the team made without strong proof. Format as a bulleted list. Be specific and actionable.",
      messages: [
        {
          role: "user",
          content: `Here is the full interview transcript:\n\n${conversationText}\n\nIdentify the evidence gaps.`,
        },
      ],
    });

    gapReport =
      gapResult.content[0].type === "text"
        ? gapResult.content[0].text.trim()
        : "";

    judgeReply =
      "Thank you for your time. The interview is now complete. Please review your gap report below.";
    transcript.push({ role: "judge", content: judgeReply });

    db.update(judgeSessions)
      .set({
        transcript: transcript as unknown as null,
        status: "completed",
        evidenceGaps: [gapReport] as unknown as null,
        completedAt: new Date(),
      })
      .where(eq(judgeSessions.id, sessionId))
      .run();
  }

  return { judgeReply, isComplete, gapReport };
}

// Map display award name to DB enum value
function awardToEnum(award: string): typeof judgeSessions.$inferInsert["awardType"] {
  const map: Record<string, typeof judgeSessions.$inferInsert["awardType"]> = {
    "Chairman's Award": "impact",
    "Impact Award": "impact",
    "Engineering Inspiration": "engineering_inspiration",
    "Rookie All Star": "rookie_all_star",
    "Quality Award": "quality",
    "Industrial Design Award": "industrial_design",
    "Safety Award": "safety",
    "Judges Award": "judges",
  };
  return map[award] ?? "judges";
}
