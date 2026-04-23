import { anthropic } from "@/lib/anthropic";
import { db } from "@/db";
import { translationCache } from "@/db/schema";
import type { Bundle } from "./index";
import enBundle from "./bundles/en.json";

export async function translateBundle(langName: string): Promise<Bundle | null> {
  const normalized = langName.toLowerCase().trim();

  try {
    const response = await anthropic.messages.create({
      model: "claude-opus-4-7",
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: `Translate this JSON string table from English to ${langName}. Rules:
- Keep all JSON keys exactly the same
- Preserve {placeholder} markers like {count}, {name}, {turn}, {date}, {number} unchanged
- Return ONLY valid JSON, no markdown, no explanation
- Match the tone: friendly, clear, team management app context for FRC robotics teams

${JSON.stringify(enBundle, null, 2)}`,
        },
      ],
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;

    const translated = JSON.parse(match[0]) as Record<string, string>;

    // Validate every EN key is present
    for (const k of Object.keys(enBundle)) {
      if (!(k in translated)) {
        console.error(`[i18n] Translation missing key: ${k}`);
        return null;
      }
    }

    // Cache in DB
    db.insert(translationCache)
      .values({
        lang: normalized,
        bundle: JSON.stringify(translated),
        createdAt: new Date(),
      })
      .onConflictDoUpdate({
        target: translationCache.lang,
        set: { bundle: JSON.stringify(translated), createdAt: new Date() },
      })
      .run();

    return translated as Bundle;
  } catch {
    return null;
  }
}
