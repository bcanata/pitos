/**
 * One-shot pass over scripts/seed-data/*.ts to normalize Turkish honorifics
 * left behind after translation, so English-reading judges don't trip on them.
 *
 *   "X hocam"          → "Coach X"      (used to address mentors)
 *   "Ayşe abla"        → "Ayşe"
 *   "Halil İbrahim ağabey" / "Hakan abi" → drop the honorific
 *   "ağabey/abla"      → "seniors"
 *   "hocalarım"        → "mentors"
 *
 * Run: npx tsx scripts/normalize-honorifics.ts
 */

import { readFileSync, writeFileSync, readdirSync } from "fs";
import { join } from "path";

const SEED_DIR = join(__dirname, "seed-data");

// "<First name(s)> hocam" — supports Turkish characters & multi-word names
const NAME_RE = "[A-ZÇĞİÖŞÜ][a-zçğıöşü]+(?: [A-ZÇĞİÖŞÜ][a-zçğıöşü]+)?";

const REPLACEMENTS: Array<[RegExp, string]> = [
  // Multi-word patterns first
  [/\bağabey\/abla\b/g, "seniors"],
  [/\bhocalarım\b/g, "mentors"],
  // "<Name> hocam" → "Coach <Name>"
  [new RegExp(`\\b(${NAME_RE}) hocam\\b`, "g"), "Coach $1"],
  // "<Name> ağabey" / "<Name> abi" / "<Name> abla" → just "<Name>"
  [new RegExp(`\\b(${NAME_RE}) (?:ağabey|abi|abla)\\b`, "g"), "$1"],
  // "<Name> Hanım" → "Ms. <Name>"   (e.g., İlke Hanım → Ms. İlke)
  [new RegExp(`\\b(${NAME_RE}) Hanım\\b`, "g"), "Ms. $1"],
  // "<Name> Bey" → "Mr. <Name>"
  [new RegExp(`\\b(${NAME_RE}) Bey\\b`, "g"), "Mr. $1"],
  // Bare residuals (rare)
  [/\bhocam\b/g, "coach"],
  [/\bağabey\b/g, ""],
  [/\babla\b/g, ""],
];

let totalReplacements = 0;
const files = readdirSync(SEED_DIR).filter((f) => f.endsWith(".ts") && f !== "types.ts");

for (const f of files) {
  const path = join(SEED_DIR, f);
  let body = readFileSync(path, "utf8");
  let fileChanges = 0;
  for (const [re, sub] of REPLACEMENTS) {
    const matches = body.match(re);
    if (matches) {
      fileChanges += matches.length;
      body = body.replace(re, sub);
    }
  }
  if (fileChanges > 0) {
    // Tidy double-spaces left after dropping honorifics
    body = body.replace(/  +/g, " ");
    writeFileSync(path, body, "utf8");
    console.log(`  ${f}: ${fileChanges} replacement(s)`);
    totalReplacements += fileChanges;
  }
}

console.log(`\n✓ ${totalReplacements} honorific(s) normalized across ${files.length} files`);
