import Anthropic from "@anthropic-ai/sdk";
import { getEnBundle, loadCachedBundle, saveCachedBundle } from "./index";

export async function translateBundle(
  langName: string,
  apiKey: string
): Promise<Record<string, string> | null> {
  const normalizedName = langName.toLowerCase().trim();

  const cached = loadCachedBundle(normalizedName);
  if (cached) return cached;

  const client = new Anthropic({ apiKey });
  const enBundle = getEnBundle();

  try {
    const response = await client.messages.create({
      model: "claude-opus-4-7",
      max_tokens: 2048,
      messages: [
        {
          role: "user",
          content: `Translate this JSON string table from English to ${langName}. Rules:
- Keep all JSON keys exactly the same
- Preserve {placeholder} markers like {lang} unchanged
- Return ONLY valid JSON, no markdown, no explanation
- Match the tone: friendly, clear, setup-wizard context for an FRC robotics team app

${JSON.stringify(enBundle, null, 2)}`,
        },
      ],
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;

    const translated = JSON.parse(match[0]) as Record<string, string>;

    // Validate: every EN key must be present in translation
    const enKeys = Object.keys(enBundle);
    for (const k of enKeys) {
      if (!(k in translated)) {
        process.stderr.write(`Translation missing key: ${k}\n`);
        return null;
      }
    }

    saveCachedBundle(normalizedName, translated);
    return translated;
  } catch {
    return null;
  }
}
