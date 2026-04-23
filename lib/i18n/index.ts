export type Bundle = Record<string, string>;

export const PREDEFINED = new Set(["en", "tr", "es", "fr", "de", "pt", "zh", "ja", "he"]);

export function t(bundle: Bundle, key: string, vars?: Record<string, string>): string {
  let str = bundle[key] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      str = str.replace(`{${k}}`, v);
    }
  }
  return str;
}
