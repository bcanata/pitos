import { anthropic } from "@/lib/anthropic";

const SYSTEM_PROMPT = `You are setting up a new FRC team on PitOS. Collect: team number (4 digits), team name/nickname, the user's name, and their role (lead_mentor/mentor/captain/student). Be conversational but efficient. When you have all 4 pieces, respond with EXACTLY this JSON on the last line: SETUP_COMPLETE:{"teamNumber":1234,"teamName":"Team Name","memberName":"Name","role":"lead_mentor"}`;

interface SetupData {
  teamNumber: number;
  teamName: string;
  memberName: string;
  role: string;
}

export async function runOnboardingStep(
  messages: Array<{ role: "user" | "assistant"; content: string }>,
  userId: string
): Promise<{
  reply: string;
  done: boolean;
  teamData?: { name: string; number: number; memberName: string; role: string };
}> {
  void userId; // reserved for future per-user context

  const result = await anthropic.messages.create({
    model: "claude-opus-4-7",
    max_tokens: 512,
    system: SYSTEM_PROMPT,
    messages,
  });

  const text = result.content[0].type === "text" ? result.content[0].text : "";

  const setupIndex = text.lastIndexOf("SETUP_COMPLETE:");
  if (setupIndex !== -1) {
    const jsonStr = text.slice(setupIndex + "SETUP_COMPLETE:".length).trim();
    // Take only the first JSON object
    const match = jsonStr.match(/^\{[\s\S]*?\}/);
    if (match) {
      try {
        const data = JSON.parse(match[0]) as SetupData;
        // Strip the SETUP_COMPLETE line from the reply shown to the user
        const reply = text.slice(0, setupIndex).trim();
        return {
          reply: reply || "Great, I have everything I need! Setting up your team now...",
          done: true,
          teamData: {
            name: data.teamName,
            number: data.teamNumber,
            memberName: data.memberName,
            role: data.role,
          },
        };
      } catch {
        // fall through to non-done path
      }
    }
  }

  return { reply: text, done: false };
}
