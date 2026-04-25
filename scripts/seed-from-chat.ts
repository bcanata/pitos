/**
 * Parse a WhatsApp chat export, anonymize senders + inline PII, categorize
 * messages to channels, and seed them into a team.
 *
 * Run (dry-run, preview only):
 *   npx tsx scripts/seed-from-chat.ts --input /path/to/_chat.txt
 *
 * Run (apply to Turso):
 *   npx tsx scripts/seed-from-chat.ts --input /path/to/_chat.txt --apply
 *
 * Flags:
 *   --input <path>     WhatsApp _chat.txt path (required)
 *   --team  <teamId>   Target team (default: first team in DB)
 *   --apply            Actually write to DB. Without this, only previews.
 *   --limit <N>        Cap total messages seeded (default 400).
 */

import { readFileSync, writeFileSync } from "fs";
import { randomUUID } from "crypto";
import { eq, and } from "drizzle-orm";
import { db } from "../db";
import {
  teams,
  users,
  memberships,
  channels,
  channelMembers,
  messages as messagesTable,
} from "../db/schema";

// ─── CLI parsing ────────────────────────────────────────────────────────────

function arg(name: string, defaultValue?: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  if (i >= 0 && i + 1 < process.argv.length) return process.argv[i + 1];
  return defaultValue;
}
const INPUT = arg("input");
const APPLY = process.argv.includes("--apply");
const TEAM_ARG = arg("team");
const LIMIT = Number(arg("limit", "400"));

if (!INPUT) {
  console.error("Usage: npx tsx scripts/seed-from-chat.ts --input <path> [--apply] [--team <id>] [--limit N]");
  process.exit(1);
}

// ─── Parsing ────────────────────────────────────────────────────────────────

type RawMessage = { ts: Date; sender: string; content: string };

const LINE_RE = /^‎?\[(\d{1,2})\.(\d{1,2})\.(\d{4}), (\d{1,2}):(\d{2}):(\d{2})\] ([^:]+?): ([\s\S]*)$/;

function parseChat(raw: string): RawMessage[] {
  const lines = raw.split(/\r?\n/);
  const out: RawMessage[] = [];
  let current: RawMessage | null = null;
  for (const line of lines) {
    const m = line.match(LINE_RE);
    if (m) {
      if (current) out.push(current);
      const [, d, mo, y, h, mi, s, sender, content] = m;
      current = {
        ts: new Date(Number(y), Number(mo) - 1, Number(d), Number(h), Number(mi), Number(s)),
        sender: sender.trim(),
        content: content.trim(),
      };
    } else if (current) {
      current.content += "\n" + line;
    }
  }
  if (current) out.push(current);
  return out;
}

// ─── Filters ────────────────────────────────────────────────────────────────

const SKIP_PATTERNS = [
  /image omitted/i,
  /video omitted/i,
  /document omitted/i,
  /audio omitted/i,
  /sticker omitted/i,
  /GIF omitted/i,
  /POLL:/i,
  /Messages and calls are end-to-end encrypted/i,
  /This message was edited/,
  /created this group/i,
  /added (?:you|[^\n]+)$/i,
  /removed [^\n]+$/i,
  /left$/i,
  /changed the group/i,
  /changed this group's icon/i,
  /changed the subject/i,
  /You were added/i,
  /joined using this group's invite link/i,
];

function isMeaningful(content: string): boolean {
  const c = content.trim();
  if (!c) return false;
  if (SKIP_PATTERNS.some(r => r.test(c))) return false;
  // Keep emoji-only messages out.
  const stripped = c.replace(/[\p{Emoji_Presentation}\p{Emoji}‍️\s❤️]/gu, "");
  if (stripped.length < 8) return false;
  return true;
}

// ─── Sender anonymization map ───────────────────────────────────────────────

type Role = "lead_mentor" | "mentor" | "captain" | "student";

interface Persona {
  name: string;
  handle: string;  // used for replacing @mentions
  role: Role;
  language: string;
}

// Real volunteers — consented to appear with their real name and title.
const KAGAN_PERSONA:  Persona = { name: "Kağan Bahadır Durgut", handle: "kagan", role: "mentor", language: "tr" };
const YAGIZ_PERSONA:  Persona = { name: "Yağız Engin",          handle: "yagiz", role: "mentor", language: "tr" };
const BUGRA_PERSONA:  Persona = { name: "Buğra Canata",          handle: "bugra",  role: "mentor", language: "tr" };

const personas: Persona[] = [
  { name: "Ayşe Demir",       handle: "ayse",     role: "lead_mentor", language: "tr" },
  { name: "Mehmet Yılmaz",    handle: "mehmet",   role: "mentor",      language: "tr" },
  { name: "Fatma Kaya",       handle: "fatma",    role: "mentor",      language: "tr" },
  { name: "Deniz Arslan",     handle: "deniz",    role: "captain",     language: "tr" },
  { name: "Ali Öztürk",       handle: "ali",      role: "student",     language: "tr" },
  { name: "Zeynep Çelik",     handle: "zeynep",   role: "student",     language: "tr" },
  { name: "Can Aydın",        handle: "can",      role: "student",     language: "tr" },
  { name: "Elif Doğan",       handle: "elif",     role: "student",     language: "tr" },
  { name: "Eren Şahin",       handle: "eren",     role: "student",     language: "tr" },
  { name: "Merve Taş",        handle: "merve",    role: "student",     language: "tr" },
  KAGAN_PERSONA,
  YAGIZ_PERSONA,
  BUGRA_PERSONA,
];

// Sender names (as they appear in the WhatsApp export) → real persona pin.
const PINNED_SENDER_MAP = new Map<string, Persona>([
  ["Kağan Bahadır DURGUT", KAGAN_PERSONA],
  ["Kağan Bahadır Durgut", KAGAN_PERSONA],
  ["Yağız",                YAGIZ_PERSONA],
  ["Yağız Engin",          YAGIZ_PERSONA],
  ["Buğra C.",             BUGRA_PERSONA],
  ["Buğra Canata",         BUGRA_PERSONA],
]);

// Heuristic: who gets which persona? Sort real senders by volume; top N → 1:1
// mapping; tail senders collapse onto the student pool round-robin.
function buildSenderMap(allMessages: RawMessage[]): Map<string, Persona> {
  const counts = new Map<string, number>();
  for (const m of allMessages) counts.set(m.sender, (counts.get(m.sender) ?? 0) + 1);
  const ranked = [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([s]) => s);

  // Senders to treat as mentors in the role-assignment heuristic.
  // Populate locally with real display names — do NOT commit (may contain minors' names).
  const MENTOR_SENDERS = new Set<string>([]);

  const result = new Map<string, Persona>();
  // Fake pool excludes the real-name personas so they aren't re-used for others.
  const pinnedPersonas = new Set(PINNED_SENDER_MAP.values());
  const mentorPool = personas.filter(p =>
    (p.role === "lead_mentor" || p.role === "mentor") && !pinnedPersonas.has(p),
  );
  const studentPool = personas.filter(p => p.role === "student" || p.role === "captain");

  let mentorI = 0;
  let studentI = 0;
  for (const sender of ranked) {
    if (PINNED_SENDER_MAP.has(sender)) {
      result.set(sender, PINNED_SENDER_MAP.get(sender)!);
    } else if (MENTOR_SENDERS.has(sender)) {
      result.set(sender, mentorPool[mentorI % mentorPool.length]);
      mentorI++;
    } else {
      result.set(sender, studentPool[studentI % studentPool.length]);
      studentI++;
    }
  }
  return result;
}

// ─── Inline scrubbing ───────────────────────────────────────────────────────

// Real names that appear inline in message content but were never senders.
// Populate this list locally (do NOT commit names — many are underage minors).
const INLINE_REAL_NAMES: string[] = [];

// Replacement pool (round-robin) for unmapped real names we hit inline.
const FALLBACK_NAMES = ["Ada", "Kaan", "Lara", "Onur", "Nil", "Efe", "Mira", "Berk", "Ece", "Kerem"];

function buildNameReplacer(senderMap: Map<string, Persona>): (content: string) => string {
  // First: every known sender's real name → their persona's full name.
  const directReplacements: Array<[string, string]> = [];
  for (const [sender, persona] of senderMap) {
    directReplacements.push([sender, persona.name]);
    // First-name fallback
    const firstName = sender.split(/\s+/)[0];
    if (firstName && firstName.length >= 3) {
      directReplacements.push([firstName, persona.name.split(" ")[0]]);
    }
  }
  // Then: inline names not in the sender map get fallback replacements
  // (deterministic round-robin by position in list).
  const extraReplacements: Array<[string, string]> = [];
  let fbI = 0;
  for (const raw of INLINE_REAL_NAMES) {
    if (directReplacements.some(([from]) => from === raw)) continue;
    extraReplacements.push([raw, FALLBACK_NAMES[fbI % FALLBACK_NAMES.length]]);
    fbI++;
  }
  // Longest match first to avoid partial replacements clobbering longer forms.
  const all = [...directReplacements, ...extraReplacements].sort(
    (a, b) => b[0].length - a[0].length,
  );
  return (content: string) => {
    let out = content;
    for (const [from, to] of all) {
      // Word-boundary-ish: Turkish letters not handled by \b, so use
      // lookarounds with non-letter anchors.
      const escaped = from.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const re = new RegExp(`(^|[^\\p{L}])(${escaped})(?=[^\\p{L}]|$)`, "gu");
      out = out.replace(re, (_, pre) => `${pre}${to}`);
    }
    return out;
  };
}

function scrubContent(raw: string, replaceNames: (s: string) => string): string {
  let c = raw;
  // Strip @mention wrappers like "@⁨Name⁩" (WhatsApp uses U+2068/U+2069)
  c = c.replace(/@[⁨‪]?([^⁨⁩‪-‬]+)[⁩‬]?/g, (_, name) => `@${name.trim()}`);
  // URLs → [link]
  c = c.replace(/https?:\/\/\S+/g, "[link]");
  // Phone numbers (+90 variants, loose)
  c = c.replace(/\+?\d{1,3}[\s-]?\(?\d{2,4}\)?[\s-]?\d{3}[\s-]?\d{2,4}[\s-]?\d{0,4}/g, "[telefon]");
  // Emails
  c = c.replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, "[email]");
  // Team number
  c = c.replace(/\b8092\b/g, "8888");
  // Hashtags that reference real sponsors/universities (keep generic ones)
  c = c.replace(/#(AllStarKickoff|fikretyukselfoundation|yildiztekniküniversitesi|FIRST)/gi, "#etiket");
  // School/city specifics
  c = c.replace(/Veliköy\s+Organize\s+Sanayi\s+Bölgesi[^.\n]*/gi, "Demo Meslek Lisesi");
  c = c.replace(/Çerkezköy/gi, "Demoşehir");
  c = c.replace(/Tekirdağ/gi, "Demoşehir");
  c = c.replace(/Velimeşe/gi, "Demoilçe");
  c = c.replace(/Siemens|Boeing|FYF|Fikret Yüksel/gi, "SponsorX");
  c = c.replace(/TAÜ|Türk-Alman/gi, "DemoÜniversite");
  // Replace names (sender-map + inline pool)
  c = replaceNames(c);
  // Final tidy
  c = c.replace(/\s+\n/g, "\n").trim();
  return c;
}

// ─── Channel routing ────────────────────────────────────────────────────────

// Target channel names in Turkish (matches current Turso state for this team).
const CHANNEL_NAMES = {
  genel:         "genel",
  sohbet:        "sohbet",
  mentorlar:     "mentorlar",
  mekanik:       "mekanik",
  yazilim:       "yazilim",
  elektrik:      "elektrik",
  cad:           "cad",
  strateji:      "strateji",
  tanitim:       "tanitim",       // outreach
  sponsorlar:    "sponsorlar",
  medya:         "medya",
  oduller:       "oduller",
  scouting:      "scouting",
  "pit-ekibi":   "pit-ekibi",
  seyahat:       "seyahat",
  "kit-parcalari":"kit-parcalari",
  guvenlik:      "guvenlik",
  mezunlar:      "mezunlar",
} as const;

type ChannelKey = keyof typeof CHANNEL_NAMES;

const ROUTING: Array<{ key: ChannelKey; kw: RegExp }> = [
  { key: "yazilim",        kw: /\b(kod|code|python|java|github|pr|commit|compile|wpilib|swerve|ros|vision|kamera|limelight|photonvision|robotcode|bug|deploy|log)\b/i },
  { key: "elektrik",       kw: /\b(elektrik|kablo|motor|falcon|neo|kraken|spark|talon|pdp|pdh|akü|batarya|sensör|encoder|gyro|roborio)\b/i },
  { key: "cad",            kw: /\b(cad|onshape|solidworks|fusion|render|montaj dosyası|iam|ipt|sldprt|çizim|tasarım)\b/i },
  { key: "mekanik",        kw: /\b(mekanik|cnc|lazer|kesim|matkap|vida|parça|chassis|intake|shooter|klemp|profil|tork)\b/i },
  { key: "medya",          kw: /\b(post|story|reel|instagram|sosyal medya|fotoğraf|video|youtube|röportaj|basın|tasarım afiş|afiş|tiktok)\b/i },
  { key: "sponsorlar",     kw: /\b(sponsor|bütçe|fatura|ödeme|destek parası|sponsorx|toplantı notu)\b/i },
  { key: "tanitim",        kw: /\b(etkinlik|şenlik|okul ziyareti|tanıtım|gösteri|rozet|stand|topluluk|demo günü)\b/i },
  { key: "scouting",       kw: /\b(scout|scouting|rakip|ittifak|match|qualification|alliance|maç videosu)\b/i },
  { key: "pit-ekibi",      kw: /\b(pit|turnuva|hazırlık kutusu|servis|tamir kiti)\b/i },
  { key: "seyahat",        kw: /\b(otobüs|konaklama|otel|harcırah|ulaşım|yol|servis aracı|kalkış saati)\b/i },
  { key: "oduller",        kw: /\b(impact|award|engineering inspiration|dean'?s list|chairman|woodie|rookie all star)\b/i },
  { key: "strateji",       kw: /\b(strateji|maç analizi|oyun planı|game piece|autonomous|auto mode|defense|offense)\b/i },
  { key: "guvenlik",       kw: /\b(güvenlik|safety|kaza|yaralanma|gözlük|eldiven|yangın)\b/i },
  { key: "kit-parcalari",  kw: /\b(kop|kit.? parça|kayıp parça|envanter|stok)\b/i },
  { key: "mezunlar",       kw: /\b(mezun|alumni|exit interview)\b/i },
  { key: "mentorlar",      kw: /\b(mentor toplantısı|mentor koordinasyon|mentorlar arası)\b/i },
];

function routeMessage(content: string): ChannelKey {
  for (const { key, kw } of ROUTING) if (kw.test(content)) return key;
  // Short/greeting → sohbet
  if (content.length < 60 || /\b(selam|naber|günaydın|iyi geceler|merhaba|hocam)\b/i.test(content)) return "sohbet";
  return "genel";
}

// ─── Main ───────────────────────────────────────────────────────────────────

interface ScrubbedMsg {
  ts: Date;
  persona: Persona;
  channelKey: ChannelKey;
  content: string;
}

async function main() {
  const raw = readFileSync(INPUT!, "utf8");
  const parsed = parseChat(raw);
  console.log(`Parsed ${parsed.length} raw messages.`);

  const meaningful = parsed.filter(m => isMeaningful(m.content));
  console.log(`${meaningful.length} meaningful after filters.`);

  const senderMap = buildSenderMap(meaningful);
  console.log("\nSender → persona map:");
  for (const [sender, persona] of senderMap) {
    console.log(`  ${sender.padEnd(32)} → ${persona.name} (${persona.role})`);
  }

  const replaceNames = buildNameReplacer(senderMap);

  // Scrub + route
  const scrubbed: ScrubbedMsg[] = meaningful.map(m => {
    const persona = senderMap.get(m.sender)!;
    const content = scrubContent(m.content, replaceNames);
    const channelKey = routeMessage(content);
    return { ts: m.ts, persona, channelKey, content };
  }).filter(m => m.content.length >= 5);

  // Cap: balance by channel so we don't overrun #genel.
  const byChannel = new Map<ChannelKey, ScrubbedMsg[]>();
  for (const m of scrubbed) {
    const list = byChannel.get(m.channelKey) ?? [];
    list.push(m);
    byChannel.set(m.channelKey, list);
  }
  const perChannelCap = Math.max(8, Math.floor(LIMIT / byChannel.size));
  const final: ScrubbedMsg[] = [];
  for (const [key, list] of byChannel) {
    const take = Math.min(list.length, perChannelCap);
    // Evenly sample across the chronological range.
    const step = list.length / take;
    for (let i = 0; i < take; i++) final.push(list[Math.floor(i * step)]);
    void key;
  }
  final.sort((a, b) => a.ts.getTime() - b.ts.getTime());
  const capped = final.slice(0, LIMIT);

  // Channel breakdown
  const breakdown = new Map<ChannelKey, number>();
  for (const m of capped) breakdown.set(m.channelKey, (breakdown.get(m.channelKey) ?? 0) + 1);

  console.log("\nChannel breakdown (capped):");
  for (const [k, n] of [...breakdown.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`  #${CHANNEL_NAMES[k].padEnd(14)} ${n}`);
  }
  console.log(`\nTotal: ${capped.length} messages.`);

  // Preview file
  const previewPath = "/tmp/pitos-seed-preview.txt";
  const preview = capped
    .map(m => `[${m.ts.toISOString()}] #${CHANNEL_NAMES[m.channelKey]} ${m.persona.name}: ${m.content}`)
    .join("\n");
  writeFileSync(previewPath, preview, "utf8");
  console.log(`\nPreview written to ${previewPath}`);

  if (!APPLY) {
    console.log("\nDry-run mode — no DB writes. Re-run with --apply to seed.");
    return;
  }

  // ─── DB writes ────────────────────────────────────────────────────────────
  const team = TEAM_ARG
    ? await db.select().from(teams).where(eq(teams.id, TEAM_ARG)).get()
    : await db.select().from(teams).get();
  if (!team) throw new Error("No target team found.");
  console.log(`\nTarget team: ${team.name} (${team.id})`);

  // 1. Upsert fake users.
  const personaToUserId = new Map<Persona, string>();
  for (const p of personas) {
    const email = `${p.handle}@seed.pitos.local`;
    const existing = await db.select().from(users).where(eq(users.email, email)).get();
    const userId = existing?.id ?? randomUUID();
    if (!existing) {
      await db.insert(users).values({
        id: userId,
        email,
        name: p.name,
        avatarUrl: null,
        language: p.language,
        createdAt: new Date(),
      });
      console.log(`  + user ${p.name} (${p.role})`);
    }
    personaToUserId.set(p, userId);

    // Membership
    const mem = await db.select().from(memberships)
      .where(and(eq(memberships.userId, userId), eq(memberships.teamId, team.id)))
      .get();
    if (!mem) {
      await db.insert(memberships).values({
        id: randomUUID(),
        userId,
        teamId: team.id,
        role: p.role,
        joinedAt: new Date(),
      });
    }
  }

  // 2. Load channels for this team.
  const teamChannels = await db.select().from(channels).where(eq(channels.teamId, team.id)).all();
  const channelByName = new Map(teamChannels.map(c => [c.name, c]));

  // 3. Ensure memberships in each public channel + mentors in private.
  for (const [, ch] of channelByName) {
    const eligible = personas.filter(p => {
      if (ch.type === "private") return p.role === "lead_mentor" || p.role === "mentor";
      return true;
    });
    for (const p of eligible) {
      const uid = personaToUserId.get(p)!;
      const cm = await db.select().from(channelMembers)
        .where(and(eq(channelMembers.channelId, ch.id), eq(channelMembers.userId, uid)))
        .get();
      if (!cm) {
        await db.insert(channelMembers).values({
          id: randomUUID(),
          channelId: ch.id,
          userId: uid,
          joinedAt: new Date(),
        });
      }
    }
  }

  // 4. Insert messages.
  let inserted = 0;
  for (const m of capped) {
    const targetName = CHANNEL_NAMES[m.channelKey];
    const ch = channelByName.get(targetName);
    if (!ch) continue;
    const uid = personaToUserId.get(m.persona)!;
    await db.insert(messagesTable).values({
      id: randomUUID(),
      channelId: ch.id,
      userId: uid,
      content: m.content,
      agentGenerated: false,
      createdAt: m.ts,
    });
    inserted++;
  }
  console.log(`\n✅ Inserted ${inserted} messages across ${byChannel.size} channels.`);
}

main().catch(err => {
  console.error("seed-from-chat failed:", err);
  process.exit(1);
});
