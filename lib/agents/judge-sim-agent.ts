import { anthropic } from "@/lib/anthropic";
import { db } from "@/db";
import { judgeSessions, teams } from "@/db/schema";
import { eq } from "drizzle-orm";

export type JudgeSimMessage = { role: "judge" | "team"; content: string };

const MAX_TURNS = 6;

function buildJudgeSystemPrompt(award: string, lang = "en"): string {
  const langNote = lang !== "en" ? `\n\nIMPORTANT: Respond in ${lang}.` : "";
  return `You are an FRC judge evaluating a team for the ${award} award. You are skeptical, thorough, and demand specific evidence. Ask ONE tough question at a time. Be direct and challenging. No pleasantries. Push the team to prove their claims with concrete data and specific examples.${langNote}`;
}

export async function startJudgeSim(
  teamId: string,
  userId: string,
  award: string
): Promise<{ sessionId: string; firstQuestion: string }> {
  const sessionId = crypto.randomUUID();
  const team = await db.select().from(teams).where(eq(teams.id, teamId)).get();
  const lang = team?.language ?? "en";

  const result = await anthropic.messages.create({
    model: "claude-opus-4-7",
    max_tokens: 512,
    system: buildJudgeSystemPrompt(award, lang),
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

  await db.insert(judgeSessions).values({
    id: sessionId,
    teamId,
    startedByUserId: userId,
    awardType: awardToEnum(award),
    status: "in_progress",
    transcript: transcript as unknown as null,
    startedAt: new Date(),
  });

  return { sessionId, firstQuestion };
}

export type GapReport = {
  /** 0-100 holistic readiness score for this award. */
  score: number;
  /** One-sentence qualitative summary that contextualises the score. */
  scoreLine: string;
  strengths: string[];
  evidenceGaps: string[];
  suggestions: string[];
  /** Raw markdown fallback if the structured parse failed. */
  raw?: string;
};

export async function continueJudgeSim(
  sessionId: string,
  teamResponse: string
): Promise<{ judgeReply: string; isComplete: boolean; gapReport?: GapReport }> {
  const session = await db
    .select()
    .from(judgeSessions)
    .where(eq(judgeSessions.id, sessionId))
    .get();

  if (!session) throw new Error("Session not found");

  const transcript = (session.transcript as JudgeSimMessage[] | null) ?? [];

  transcript.push({ role: "team", content: teamResponse });

  const teamTurnCount = transcript.filter((m) => m.role === "team").length;
  const isComplete = teamTurnCount >= MAX_TURNS;

  let judgeReply = "";
  let gapReport: GapReport | undefined;

  if (!isComplete) {
    const claudeMessages: { role: "user" | "assistant"; content: string }[] = [];
    for (const msg of transcript) {
      if (msg.role === "judge") {
        claudeMessages.push({ role: "assistant", content: msg.content });
      } else {
        claudeMessages.push({ role: "user", content: msg.content });
      }
    }

    const sessionTeam = await db.select().from(teams).where(eq(teams.id, session.teamId ?? "")).get();
    const result = await anthropic.messages.create({
      model: "claude-opus-4-7",
      max_tokens: 512,
      system: buildJudgeSystemPrompt(session.awardType, sessionTeam?.language ?? "en"),
      messages: claudeMessages,
    });

    judgeReply =
      result.content[0].type === "text" ? result.content[0].text.trim() : "";
    transcript.push({ role: "judge", content: judgeReply });

    await db.update(judgeSessions)
      .set({ transcript: transcript as unknown as null })
      .where(eq(judgeSessions.id, sessionId));
  } else {
    const conversationText = transcript
      .map((m) => `${m.role === "judge" ? "Judge" : "Team"}: ${m.content}`)
      .join("\n\n");

    const gapResult = await anthropic.messages.create({
      model: "claude-opus-4-7",
      max_tokens: 1024,
      system: `You just finished a mock FRC judging interview. Score the team's readiness for this specific award and break down the conversation into three lists.

Reply with ONE JSON object and nothing else, in this exact shape:

{
  "score": <integer 0-100>,
  "scoreLine": "<one sentence summarising where they stand for this award>",
  "strengths": ["<concrete strength backed by something they said>", ...],
  "evidenceGaps": ["<specific claim they made without solid proof>", ...],
  "suggestions": ["<actionable thing to bring next time>", ...]
}

Rules:
- 2-4 items per list; concise (≤ 25 words each).
- Quote or paraphrase the team's actual words when citing strengths or gaps.
- Be specific (numbers, dates, named programs) — not generic encouragement.
- Match the team's language for list items if it wasn't English.`,
      messages: [
        {
          role: "user",
          content: `Full interview transcript:\n\n${conversationText}\n\nReturn the JSON object now.`,
        },
      ],
    });

    const rawText =
      gapResult.content[0].type === "text"
        ? gapResult.content[0].text.trim()
        : "";

    gapReport = parseGapReport(rawText);

    judgeReply =
      "Thank you for your time. The interview is now complete. Please review your gap report below.";
    transcript.push({ role: "judge", content: judgeReply });

    await db.update(judgeSessions)
      .set({
        transcript: transcript as unknown as null,
        status: "completed",
        evaluation: gapReport as unknown as null,
        evidenceGaps: gapReport.evidenceGaps as unknown as null,
        completedAt: new Date(),
      })
      .where(eq(judgeSessions.id, sessionId));
  }

  return { judgeReply, isComplete, gapReport };
}

function parseGapReport(rawText: string): GapReport {
  const fallback: GapReport = {
    score: 0,
    scoreLine: "",
    strengths: [],
    evidenceGaps: [],
    suggestions: [],
    raw: rawText,
  };
  if (!rawText) return fallback;
  try {
    const jsonStart = rawText.indexOf("{");
    const jsonEnd = rawText.lastIndexOf("}");
    if (jsonStart === -1 || jsonEnd === -1) return fallback;
    const parsed = JSON.parse(rawText.slice(jsonStart, jsonEnd + 1)) as Partial<GapReport>;
    return {
      score: typeof parsed.score === "number" ? Math.round(parsed.score) : 0,
      scoreLine: typeof parsed.scoreLine === "string" ? parsed.scoreLine.trim() : "",
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths.map(String) : [],
      evidenceGaps: Array.isArray(parsed.evidenceGaps) ? parsed.evidenceGaps.map(String) : [],
      suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions.map(String) : [],
    };
  } catch {
    return fallback;
  }
}

function awardToEnum(award: string): typeof judgeSessions.$inferInsert["awardType"] {
  const map: Record<string, typeof judgeSessions.$inferInsert["awardType"]> = {
    "FIRST Impact Award": "impact",
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
