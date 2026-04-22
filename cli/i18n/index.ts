import fs from "fs";
import path from "path";

const BUNDLE_DIR = path.join(__dirname, ".");
const PREDEFINED = new Set(["en", "tr", "es", "fr", "de", "pt", "zh", "ja", "he"]);

function loadBundleFile(code: string): Record<string, string> {
  try {
    const p = path.join(BUNDLE_DIR, `${code}.json`);
    return JSON.parse(fs.readFileSync(p, "utf8")) as Record<string, string>;
  } catch {
    return {};
  }
}

const EN = loadBundleFile("en");
let current: Record<string, string> = EN;

export function loadLanguage(code: string): void {
  current = PREDEFINED.has(code) ? loadBundleFile(code) : EN;
}

export function loadCustomBundle(bundle: Record<string, string>): void {
  current = bundle;
}

export function t(key: string, vars?: Record<string, string>): string {
  let str = current[key] ?? EN[key] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      str = str.replace(`{${k}}`, v);
    }
  }
  return str;
}

export function getEnBundle(): Record<string, string> {
  return EN;
}

export function loadCachedBundle(lang: string): Record<string, string> | null {
  try {
    const p = path.join(BUNDLE_DIR, "cache", `${lang}.json`);
    const content = fs.readFileSync(p, "utf8");
    return JSON.parse(content) as Record<string, string>;
  } catch {
    return null;
  }
}

export function saveCachedBundle(lang: string, bundle: Record<string, string>): void {
  const dir = path.join(BUNDLE_DIR, "cache");
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, `${lang}.json`), JSON.stringify(bundle, null, 2));
}
