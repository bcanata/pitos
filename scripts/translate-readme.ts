/**
 * Translate README.md into any language via Claude Opus 4.7.
 * Run with: npx tsx scripts/translate-readme.ts "<language>"
 *
 * Writes README.<slug>.md and updates the language selector row in README.md.
 * Prints SLUG_OUTPUT= and NATIVE_OUTPUT= lines at the end for the CI workflow to parse.
 */

import Anthropic from "@anthropic-ai/sdk";
import { readFileSync, writeFileSync } from "fs";

const README_PATH = "README.md";

async function main() {
  const lang = process.argv[2]?.trim();
  if (!lang) {
    console.error("Usage: npx tsx scripts/translate-readme.ts \"<language>\"");
    process.exit(1);
  }

  // Allow only safe characters — blocks shell/prompt injection
  if (!/^[A-Za-z][A-Za-z0-9 \-]{0,39}$/.test(lang)) {
    console.error("Invalid language name. Use letters, digits, spaces, and hyphens only (max 40 chars).");
    process.exit(1);
  }

  const readme = readFileSync(README_PATH, "utf8");

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  console.log(`Translating README into ${lang} via Claude Opus 4.7...`);

  const response = await client.messages.create({
    model: "claude-opus-4-7",
    max_tokens: 8192,
    system: `You are a technical translator. Translate GitHub README files accurately.

Your response MUST begin with exactly these three lines (no extra text before them):
SLUG: <ISO 639-1 code, 2–5 chars, lowercase, e.g. "fa" or "zh-CN">
NATIVE: <language name in its own native script, e.g. "فارسی" or "한국어">
---CONTENT---
<full translated README>

Translation rules:
- Translate: headings, prose paragraphs, table cell text, list items, blockquote text, link anchor text
- Preserve VERBATIM (do not translate or alter):
    • Fenced code blocks and their contents
    • Inline code surrounded by backticks
    • All URLs (translate link text but keep the URL unchanged)
    • Environment variable names (e.g. ANTHROPIC_API_KEY, AUTH_SECRET)
    • CLI commands and file paths
    • The product name "PitOS" and feature names: Channels, Tasks, Decisions, Ask, Judge simulator, Exit interview, Season recap
    • "FRC", "FIRST Robotics Competition", "FRC team"
    • HTML comments (<!-- ... -->)
    • The language selector row starting with "> **Read in:**" — leave it exactly as-is
- Maintain table pipe structure and alignment rows
- FRC jargon (swerve drive, COTS, autonomous, etc.) should stay as-is or be transliterated naturally`,
    messages: [
      {
        role: "user",
        content: `Translate this README into ${lang}:\n\n${readme}`,
      },
    ],
  });

  const raw = response.content[0].type === "text" ? response.content[0].text : "";

  const slugMatch = raw.match(/^SLUG:\s*([A-Za-z]{2,5}(?:-[A-Za-z]{2,4})?)/m);
  const nativeMatch = raw.match(/^NATIVE:\s*(.+)/m);
  const contentMatch = raw.match(/---CONTENT---\n([\s\S]+)/);

  if (!slugMatch || !contentMatch) {
    console.error("Unexpected response format from Claude. First 500 chars:");
    console.error(raw.slice(0, 500));
    process.exit(1);
  }

  const slug = slugMatch[1].toLowerCase();
  const nativeName = nativeMatch ? nativeMatch[1].trim() : lang;
  const translatedContent = contentMatch[1].trim();

  // Write translated README
  const outPath = `README.${slug}.md`;
  writeFileSync(outPath, translatedContent + "\n");
  console.log(`Wrote ${outPath} (${translatedContent.length} chars)`);

  // Update selector row in README.md — insert before "Other language?" link
  const selectorPattern = /^(> \*\*Read in:\*\*.*?)(\s*·\s*\[Other language\? →\].+)$/m;
  const newLink = `[${nativeName}](README.${slug}.md)`;

  if (selectorPattern.test(readme)) {
    if (!readme.includes(`README.${slug}.md`)) {
      const updated = readme.replace(selectorPattern, `$1 · ${newLink}$2`);
      writeFileSync(README_PATH, updated);
      console.log(`Added ${nativeName} (${slug}) to selector row in README.md`);
    } else {
      console.log(`${slug} already in selector row — file regenerated, selector unchanged`);
    }
  } else {
    console.log("Selector row not found in README.md — skipping selector update");
  }

  // Emit parseable output for CI workflow
  console.log(`SLUG_OUTPUT=${slug}`);
  console.log(`NATIVE_OUTPUT=${nativeName}`);
}

main().catch((err) => {
  console.error("Translation failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});
