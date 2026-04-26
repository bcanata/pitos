// Demo-instance helpers.
//
// Single-user demo account: `demo@pitos.8092.tr` — used by isDemoUser to
// gate features (e.g. demo accounts can't post messages).
//
// Demo *instance*: any deployment whose APP_URL points at the public demo
// (https://pitos.8092.tr). On the demo instance every user name is
// anonymized at the wire boundary so visitors who poke around the public
// demo don't see real names. The DB still stores the real names; only the
// rendering boundary masks them.

export const DEMO_EMAIL = "demo@pitos.8092.tr";
export const DEMO_INSTANCE_HOST = "pitos.8092.tr";

export function isDemoUser(email: string | null | undefined): boolean {
  return email === DEMO_EMAIL;
}

export function isDemoInstance(): boolean {
  const url = process.env.APP_URL ?? "";
  try {
    const u = new URL(url);
    return u.hostname === DEMO_INSTANCE_HOST || u.hostname.endsWith("." + DEMO_INSTANCE_HOST);
  } catch {
    return false;
  }
}

/**
 * Mask a personal name for anonymity on the public demo. Keeps the first
 * letter of each whitespace-separated word and replaces the rest with
 * exactly four asterisks ("Buğra Canata" → "B**** C****"). Single-letter
 * tokens stay as-is so initials don't disappear.
 */
export function anonymizeName(name: string | null | undefined): string {
  if (!name) return "—";
  const tokens = name.trim().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return "—";
  return tokens.map((w) => (w.length <= 1 ? w : w[0] + "****")).join(" ");
}

/**
 * Render-side display name. On the demo instance every personal name is
 * anonymized; everywhere else it's passed through. Null in / null out so
 * existing fallback logic (`?? "—"`) still works.
 */
export function displayName(name: string | null | undefined): string | null {
  if (name == null) return null;
  if (!isDemoInstance()) return name;
  return anonymizeName(name);
}

/**
 * Mask an email address. Keeps the first letter of the local part, the
 * first letter of the registrable domain, and the public TLD so it still
 * reads as an email but doesn't leak the provider:
 *   "bugra@radio.org.tr" → "b****@r****.tr"
 *   "alice@gmail.com"    → "a****@g****.com"
 */
export function anonymizeEmail(email: string | null | undefined): string {
  if (!email) return "—";
  const at = email.indexOf("@");
  if (at <= 0) return "—";
  const local = email.slice(0, at);
  const domain = email.slice(at + 1);
  const localMasked = (local[0] ?? "?") + "****";
  const tld = domain.split(".").slice(-1)[0] ?? "";
  const domainMasked = (domain[0] ?? "?") + "****" + (tld ? "." + tld : "");
  return `${localMasked}@${domainMasked}`;
}

/**
 * Render-side email address — same demo-instance toggle as displayName.
 */
export function displayEmail(email: string | null | undefined): string | null {
  if (email == null) return null;
  if (!isDemoInstance()) return email;
  return anonymizeEmail(email);
}
