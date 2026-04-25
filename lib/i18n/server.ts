import { db } from "@/db";
import { users, translationCache } from "@/db/schema";
import { eq } from "drizzle-orm";
import { PREDEFINED, type Bundle } from "./index";

import enBundle from "./bundles/en.json";
import trBundle from "./bundles/tr.json";
import esBundle from "./bundles/es.json";
import frBundle from "./bundles/fr.json";
import deBundle from "./bundles/de.json";
import ptBundle from "./bundles/pt.json";
import zhBundle from "./bundles/zh.json";
import jaBundle from "./bundles/ja.json";
import heBundle from "./bundles/he.json";

const BUNDLES: Record<string, Record<string, string>> = {
  en: enBundle,
  tr: trBundle,
  es: esBundle,
  fr: frBundle,
  de: deBundle,
  pt: ptBundle,
  zh: zhBundle,
  ja: jaBundle,
  he: heBundle,
};

function merge(lang: string): Bundle {
  return { ...enBundle, ...(BUNDLES[lang] ?? {}) };
}

export const EN_BUNDLE: Bundle = merge("en");

export function getBundleForLang(lang: string): Bundle {
  return merge(lang);
}

export async function getTeamBundle(
  userId: string
): Promise<{ lang: string; bundle: Bundle }> {
  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .get();

  const lang = user?.language ?? "en";

  if (PREDEFINED.has(lang)) {
    return { lang, bundle: merge(lang) };
  }

  const cached = await db
    .select()
    .from(translationCache)
    .where(eq(translationCache.lang, lang))
    .get();

  if (cached?.bundle) {
    try {
      const parsed = JSON.parse(cached.bundle) as Record<string, string>;
      return { lang, bundle: { ...enBundle, ...parsed } };
    } catch {
      // fall through
    }
  }

  const { translateBundle } = await import("./translate");
  const translated = await translateBundle(lang);
  if (translated) return { lang, bundle: { ...enBundle, ...translated } };

  return { lang: "en", bundle: EN_BUNDLE };
}
