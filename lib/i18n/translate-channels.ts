import { anthropic } from "@/lib/anthropic";
import type { ChannelDef } from "@/lib/onboarding/default-channels";

/**
 * Translate channel names + descriptions into the target language.
 * Returns the English base unchanged for "en" / empty / unknown failures.
 *
 * Names are constrained to lowercase kebab-case so they remain valid Slack-style
 * channel slugs in every language.
 */
export async function translateChannels(
  base: ChannelDef[],
  language: string,
): Promise<ChannelDef[]> {
  const normalized = (language || "en").toLowerCase().trim();
  if (normalized === "en" || normalized === "english") return base;

  try {
    const payload = base.map((c, i) => ({
      i,
      name: c.name,
      description: c.description,
    }));

    const response = await anthropic.messages.create({
      model: "claude-opus-4-7",
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: `Translate these Slack-style channel names and descriptions from English to ${language} for an FRC robotics team workspace.

Rules:
- Channel names must be lowercase kebab-case (letters a-z, digits, hyphens only), 1-3 words, no emoji.
- Descriptions should be short and natural in the target language.
- Use idiomatic translations appropriate for an FRC robotics context.
- Keep each "i" index exactly as provided.
- Return ONLY a JSON array of {i, name, description}, no markdown, no explanation.

${JSON.stringify(payload, null, 2)}`,
        },
      ],
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";
    const match = text.match(/\[[\s\S]*\]/);
    if (!match) return base;

    const translated = JSON.parse(match[0]) as Array<{
      i: number;
      name: string;
      description: string;
    }>;

    return base.map((c, i) => {
      const t = translated.find(x => x.i === i);
      if (!t || typeof t.name !== "string" || typeof t.description !== "string") {
        return c;
      }
      const safeName = t.name.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
      return {
        ...c,
        name: safeName || c.name,
        description: t.description,
      };
    });
  } catch (err) {
    console.error("[i18n] translateChannels error:", err);
    return base;
  }
}
