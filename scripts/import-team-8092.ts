/**
 * Import canonical G.O.A.T. #8092 facts into Turso.
 *
 * Sources:
 *   • Public website codebase: /Users/bugracanata/Developer/GOAT/Web/8092.tr
 *   • Internal docs (iCloud): ~/…/Okul/FRC - GOAT8092/
 *
 * Idempotent: deletes prior import-tagged entities/facts, then reinserts.
 *
 * Preview:
 *   npx tsx scripts/import-team-8092.ts
 *
 * Apply to Turso:
 *   npx tsx scripts/import-team-8092.ts --apply
 *
 * Flags:
 *   --team <teamId>   Override target team (default: G.O.A.T. #8092)
 */

import { config } from "dotenv";
config({ path: ".env.turso" });
config({ path: ".env.local" });

import { randomUUID } from "crypto";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { and, eq, like, sql } from "drizzle-orm";
import * as schema from "../db/schema";

const { teams, entities, extractedFacts } = schema;

const client = createClient({
  url: process.env.TURSO_DATABASE_URL ?? "file:./pitos.db",
  authToken: process.env.TURSO_AUTH_TOKEN,
});
const db = drizzle(client, { schema });

const APPLY = process.argv.includes("--apply");
const _teamIdx = process.argv.indexOf("--team");
const TEAM_ARG = _teamIdx >= 0 ? process.argv[_teamIdx + 1] : undefined;

// ─── Source: public 8092.tr site + internal docs ─────────────────────────────

const TEAM_UPDATES = {
  name: "G.O.A.T.",
  number: 8092,
  school: "Halit Narin MTAL + Veliköy OSB MTAL",
  country: "Türkiye",
  rookieYear: 2019,
  language: "tr",
};

type EntSeed = {
  kind: "person" | "organization" | "event" | "location";
  name: string;
  canonicalName: string;
  aliases?: string[];
  metadata?: Record<string, unknown>;
};

const ENTITIES: EntSeed[] = [
  // ─── Team & host ──────────────────────────────────────────────────────────
  {
    kind: "organization",
    name: "G.O.A.T. #8092",
    canonicalName: "team-8092",
    aliases: ["GOAT 8092", "Team G.O.A.T.", "Greatest of All Times", "Greatest Of All Times"],
    metadata: {
      role: "self",
      rookieYear: 2019,
      slogan: "Greatest Of All Times",
      website: "https://8092.tr",
      contactEmail: "iletisim@8092.tr",
      social: {
        instagram: "https://www.instagram.com/goat8092/",
        x: "https://x.com/goat8092",
        linkedin: "https://www.linkedin.com/company/greatest-of-all-times-8092/",
        youtube: "https://www.youtube.com/@greatestofalltimes8092",
        github: "https://github.com/goat-8092",
      },
      brand: {
        primary: "#512f75",
        secondary: "#673a8e",
        accent: "#7e46a8",
        fonts: ["Atkinson Hyperlegible", "Inter"],
      },
    },
  },
  {
    kind: "organization",
    name: "G.O.A.T. Jr.",
    canonicalName: "goat-jr",
    aliases: ["GOAT Junior"],
    metadata: { role: "outreach", since: 2021, description: "Middle-school outreach/mentorship squad" },
  },
  {
    kind: "organization",
    name: "Halit Narin Mesleki ve Teknik Anadolu Lisesi",
    canonicalName: "school-halit-narin",
    aliases: ["Halit Narin MTAL"],
    metadata: { role: "host-school", since: 2019 },
  },
  {
    kind: "organization",
    name: "Veliköy OSB Mesleki ve Teknik Anadolu Lisesi",
    canonicalName: "school-velikoy-osb",
    aliases: ["Veliköy OSB MTAL"],
    metadata: { role: "host-school", since: 2021 },
  },
  {
    kind: "location",
    name: "Çerkezköy, Tekirdağ",
    canonicalName: "loc-cerkezkoy",
    aliases: ["Tekirdağ", "Çerkezköy"],
    metadata: { country: "Türkiye", address: "Veliköy OSB Mah. 12. Cad. No: 6, 59930 Çerkezköy/Tekirdağ/Türkiye" },
  },

  // ─── Sponsors (corporate) ─────────────────────────────────────────────────
  { kind: "organization", name: "Siemens",          canonicalName: "sponsor-siemens",        metadata: { role: "sponsor", tier: "main", logo: "/sponsors/logo/Siemens.svg" } },
  { kind: "organization", name: "Boeing",           canonicalName: "sponsor-boeing",         metadata: { role: "sponsor", tier: "corporate", logo: "/sponsors/logo/Boeing.svg" } },
  { kind: "organization", name: "Çetin Group",      canonicalName: "sponsor-cetin-group",    metadata: { role: "sponsor", tier: "corporate", logo: "/sponsors/logo/CetinGroup.png" } },
  { kind: "organization", name: "Saray Alüminyum",  canonicalName: "sponsor-saray-aluminyum", metadata: { role: "sponsor", tier: "corporate", logo: "/sponsors/logo/SarayAluminyum.svg" } },
  { kind: "organization", name: "ÇEMOBSAN",         canonicalName: "sponsor-cemobsan",       metadata: { role: "sponsor", tier: "corporate", logo: "/sponsors/logo/Cemobsan.jpg" } },
  { kind: "organization", name: "Politem",          canonicalName: "sponsor-politem",        metadata: { role: "sponsor", tier: "corporate", logo: "/sponsors/logo/Politem.png" } },
  { kind: "organization", name: "Asos Proses",      canonicalName: "sponsor-asos-proses",    aliases: ["Asos Process Engineering"], metadata: { role: "sponsor", tier: "corporate", logo: "/sponsors/logo/AsosProcess.jpg" } },
  { kind: "organization", name: "Butan Makina",     canonicalName: "sponsor-butan-makina",   metadata: { role: "sponsor", tier: "corporate", logo: "/sponsors/logo/ButanMakina.png" } },
  { kind: "organization", name: "IndCoMach",        canonicalName: "sponsor-indcomach",      metadata: { role: "sponsor", tier: "corporate", note: "Founded by mentor Kağan Bahadır Durgut" } },

  // ─── Sponsors (institutional / foundations) ───────────────────────────────
  { kind: "organization", name: "Savunma Sanayii Başkanlığı", canonicalName: "sponsor-ssb",         aliases: ["SSB"], metadata: { role: "sponsor", tier: "institutional", logo: "/sponsors/logo/SSB.png" } },
  { kind: "organization", name: "Millî Eğitim Bakanlığı",     canonicalName: "sponsor-meb",         aliases: ["MEB", "Ministry of National Education"], metadata: { role: "sponsor", tier: "institutional" } },
  { kind: "organization", name: "Fikret Yüksel Eğitim Vakfı", canonicalName: "sponsor-fikret-yuksel", aliases: ["Fikret Yüksel Foundation", "FYF"], metadata: { role: "sponsor", tier: "institutional", logo: "/sponsors/logo/FYF-tr.svg" } },
  { kind: "organization", name: "ELMAS Programı",             canonicalName: "sponsor-elmas",       metadata: { role: "sponsor", tier: "institutional", logo: "/sponsors/logo/Elmas.png", note: "FIRST Diamond Program — 13 pilot schools across Türkiye" } },
  { kind: "organization", name: "Çerkezköy Kaymakamlığı",     canonicalName: "sponsor-kaymakamlik", metadata: { role: "sponsor", tier: "institutional" } },
  { kind: "organization", name: "Çerkezköy İlçe Millî Eğitim Müdürlüğü", canonicalName: "sponsor-ilce-mem", metadata: { role: "sponsor", tier: "institutional" } },

  // ─── Founding sponsors (historic) ─────────────────────────────────────────
  { kind: "organization", name: "BSH Türkiye",       canonicalName: "sponsor-bsh",         metadata: { role: "sponsor", tier: "founding", logo: "/sponsors/logo/BSH.png", note: "Co-founding sponsor, 2019" } },
  { kind: "organization", name: "Kodluyoruz Derneği", canonicalName: "sponsor-kodluyoruz", metadata: { role: "sponsor", tier: "founding", logo: "/sponsors/logo/Kodluyoruz.png", note: "Co-founding sponsor, 2019" } },

  // ─── Publicly-listed mentors (already consented via 8092.tr) ──────────────
  { kind: "person", name: "Hakan Köse",              canonicalName: "mentor-hakan-kose",      metadata: { role: "lead_mentor", since: 2019 } },
  { kind: "person", name: "Ecem Çolak",              canonicalName: "mentor-ecem-colak",      metadata: { role: "lead_mentor", since: 2019 } },
  { kind: "person", name: "Selin Ertan",             canonicalName: "mentor-selin-ertan",     metadata: { role: "lead_mentor", since: 2022 } },
  { kind: "person", name: "Yağız Engin",             canonicalName: "mentor-yagiz-engin",     metadata: { role: "mentor", since: 2019, subteam: "software" } },
  { kind: "person", name: "Ömer Faruk Günal",        canonicalName: "mentor-omer-faruk-gunal", metadata: { role: "mentor", since: 2019 } },
  { kind: "person", name: "Ali Erkan Saruhan",       canonicalName: "mentor-ali-erkan-saruhan", metadata: { role: "mentor", since: 2019 } },
  { kind: "person", name: "Kağan Bahadır Durgut",    canonicalName: "mentor-kagan-durgut",    metadata: { role: "mentor", since: 2024, subteam: "build", note: "Founder of sponsor IndCoMach" } },
  { kind: "person", name: "Hasret Okumuş",           canonicalName: "mentor-hasret-okumus",   metadata: { role: "mentor", since: 2024 } },
  { kind: "person", name: "Buğra Canata",            canonicalName: "mentor-bugra-canata",    metadata: { role: "mentor", since: 2024, subteam: "outreach", note: "English teacher; owner of PitOS" } },
  { kind: "person", name: "Volkan Deniz",            canonicalName: "mentor-volkan-deniz",    metadata: { role: "mentor" } },
];

type FactSeed = {
  factType: "event" | "metric" | "decision" | "relation" | "milestone";
  statement: string;
  structuredData?: Record<string, unknown>;
  tagSuffix: string; // unique per fact to enable idempotency
  evidenceQuality?: "none" | "weak" | "strong";
  hasEvidence?: boolean;
};

const FACTS: FactSeed[] = [
  // ─── Identity ─────────────────────────────────────────────────────────────
  {
    factType: "decision",
    tagSuffix: "mission-tr",
    statement:
      "Takım misyonu (TR): Fırsat eşitliği sağlayarak gençleri STEM alanında teşvik etmek, takım çalışması ve yenilikçilik ruhuyla geleceğin mühendislerini yetiştirmek.",
    structuredData: { kind: "mission", lang: "tr" },
    hasEvidence: true,
    evidenceQuality: "strong",
  },
  {
    factType: "decision",
    tagSuffix: "mission-en",
    statement:
      "Team mission (EN): To inspire young people in STEM fields by providing equal opportunities, fostering the engineers of tomorrow with teamwork and innovation.",
    structuredData: { kind: "mission", lang: "en" },
    hasEvidence: true,
    evidenceQuality: "strong",
  },
  {
    factType: "decision",
    tagSuffix: "vision-tr",
    statement:
      "Takım vizyonu (TR): Türkiye'de robotik kültürünü yaygınlaştırarak uluslararası alanda başarılı, yenilikçi gençler yetiştirmek.",
    structuredData: { kind: "vision", lang: "tr" },
    hasEvidence: true,
    evidenceQuality: "strong",
  },
  {
    factType: "decision",
    tagSuffix: "vision-en",
    statement:
      "Team vision (EN): To spread robotics culture in Turkey and nurture successful, innovative youth on an international level.",
    structuredData: { kind: "vision", lang: "en" },
    hasEvidence: true,
    evidenceQuality: "strong",
  },
  {
    factType: "decision",
    tagSuffix: "values",
    statement:
      "Takım değerleri: İş Birliği, Yenilikçilik, Sorumluluk, Mükemmeliyetçilik, Dayanışma. (Ayrıca İş Planı'nda İnovasyon, Takım Çalışması, Gracious Professionalism, Coopertition, Etki, Keşif, Kapsayıcılık, İyi Vatandaşlık.)",
    structuredData: {
      kind: "values",
      public: ["İş Birliği", "Yenilikçilik", "Sorumluluk", "Mükemmeliyetçilik", "Dayanışma"],
      internal: ["İnovasyon", "Takım Çalışması", "Gracious Professionalism", "Coopertition", "Etki", "Keşif", "Kapsayıcılık", "İyi Vatandaşlık"],
    },
    hasEvidence: true,
    evidenceQuality: "strong",
  },
  {
    factType: "decision",
    tagSuffix: "brand-palette",
    statement: "Marka paleti: #512f75 (birincil mor), #673a8e (ikincil), #7e46a8 (vurgu). Mor renk cinsiyet eşitliğini simgeler.",
    structuredData: {
      kind: "brand-palette",
      primary: "#512f75",
      secondary: "#673a8e",
      accent: "#7e46a8",
      symbolism: "Purple symbolizes gender equality (per team business plan).",
    },
    hasEvidence: true,
    evidenceQuality: "strong",
  },
  {
    factType: "decision",
    tagSuffix: "brand-fonts",
    statement: "Marka fontları: Atkinson Hyperlegible (birincil, erişilebilirlik odaklı) + Inter (fallback).",
    structuredData: { kind: "brand-fonts", fonts: ["Atkinson Hyperlegible", "Inter"] },
    hasEvidence: true,
    evidenceQuality: "strong",
  },

  // ─── Milestones / season history ──────────────────────────────────────────
  { factType: "milestone", tagSuffix: "founded-2019",  statement: "Takım Haziran 2019'da Tekirdağ Çerkezköy'de Halit Narin MTAL'de kuruldu. Kurucu sponsorlar: BSH Türkiye ve Kodluyoruz Derneği.", structuredData: { year: 2019, event: "founding" }, hasEvidence: true, evidenceQuality: "strong" },
  { factType: "milestone", tagSuffix: "season-2020",   statement: "2020 Infinite Recharge: Bosphorus Regional 27. sıra, 4-4, Rookie All-Star Award 🏆", structuredData: { year: 2020, season: "Infinite Recharge", rank: 27, record: "4-4", award: "Rookie All-Star" }, hasEvidence: true, evidenceQuality: "strong" },
  { factType: "milestone", tagSuffix: "season-2021",   statement: "2021 Infinite Recharge at Home: Germanium Group 11. sıra. Veliköy OSB MTAL takıma katıldı; G.O.A.T. Jr. kuruldu.", structuredData: { year: 2021, season: "Infinite Recharge at Home", rank: 11 }, hasEvidence: true, evidenceQuality: "strong" },
  { factType: "milestone", tagSuffix: "season-2022",   statement: "2022 Rapid React: Bosphorus Regional 8. sıra, 5-5, çeyrek finalist.", structuredData: { year: 2022, season: "Rapid React", rank: 8, record: "5-5", stage: "quarterfinals" }, hasEvidence: true, evidenceQuality: "strong" },
  { factType: "milestone", tagSuffix: "season-2023",   statement: "2023 Charged Up: Bosphorus Regional 24. sıra, 5-4.", structuredData: { year: 2023, season: "Charged Up", rank: 24, record: "5-4" }, hasEvidence: true, evidenceQuality: "strong" },
  { factType: "milestone", tagSuffix: "season-2024",   statement: "2024 Crescendo: Yarışmaya katılınmadı; sponsorluk ağı genişletildi.", structuredData: { year: 2024, season: "Crescendo", competed: false }, hasEvidence: true, evidenceQuality: "strong" },
  { factType: "milestone", tagSuffix: "season-2025",   statement: "2025 REEFSCAPE: Bosphorus Regional 36. sıra, 3-6. Mecanum drive, 820x680 alüminyum şasi, 3 kademeli elevator, coral/alg intake.", structuredData: { year: 2025, season: "REEFSCAPE", rank: 36, record: "3-6" }, hasEvidence: true, evidenceQuality: "strong" },
  { factType: "milestone", tagSuffix: "season-2026",   statement: "2026 REBUILT: Avrasya Regional 34/40, 3-6. Judges' Award 🏆", structuredData: { year: 2026, season: "REBUILT", rank: 34, record: "3-6", award: "Judges" }, hasEvidence: true, evidenceQuality: "strong" },

  // ─── Impact / outreach metrics ────────────────────────────────────────────
  { factType: "metric", tagSuffix: "impact-students-reached", statement: "Etki: 400+ öğrenciye ulaşıldı (Impact Award essay).", structuredData: { value: 400, unit: "students_reached", source: "Impact essay" }, hasEvidence: true, evidenceQuality: "strong" },
  { factType: "metric", tagSuffix: "impact-schools-joined",   statement: "3 ek okul FIRST programlarına katıldı (ELMAS + G.O.A.T. Jr. etkisi).", structuredData: { value: 3, unit: "schools_joined_FIRST" }, hasEvidence: true, evidenceQuality: "weak" },
  { factType: "metric", tagSuffix: "impact-stem-rate",        statement: "Etki: Mezunların %85'i STEM alanında yüksek öğrenime devam etti.", structuredData: { value: 0.85, unit: "stem_continuation_rate" }, hasEvidence: true, evidenceQuality: "weak" },
  { factType: "metric", tagSuffix: "impact-alumni-return",    statement: "Etki: Mezunların %22'si mentor olarak takıma döndü.", structuredData: { value: 0.22, unit: "alumni_mentor_return_rate" }, hasEvidence: true, evidenceQuality: "weak" },
  { factType: "metric", tagSuffix: "gender-2025",             statement: "2025 sezonu cinsiyet dağılımı: 14 erkek, 6 kadın (30% kadın).", structuredData: { male: 14, female: 6 }, hasEvidence: true, evidenceQuality: "strong" },
  { factType: "metric", tagSuffix: "gender-2026-target",      statement: "2026 hedefi: ~22 kişilik takımda 8 kadın üye (~36%).", structuredData: { total: 22, female_target: 8 }, hasEvidence: true, evidenceQuality: "weak" },

  // ─── Organizational structure ────────────────────────────────────────────
  { factType: "relation", tagSuffix: "leadership-roles", statement: "Takım liderlik rolleri: Takım Kaptanı, Teknik Lider, PR Lideri, Finans & Lojistik Lideri.", structuredData: { roles: ["Takım Kaptanı", "Teknik Lider", "PR Lideri", "Finans & Lojistik Lideri"] }, hasEvidence: true, evidenceQuality: "strong" },
  { factType: "relation", tagSuffix: "subteams",         statement: "Alt takımlar: Mekanik, Elektrik/Elektronik, Yazılım, Güvenlik, Mentorluk. Ayrıca PR/Sosyal Medya, Finans/Lojistik, Strateji komiteleri.", structuredData: { subteams: ["Mekanik", "Elektrik", "Yazılım", "Güvenlik", "Mentorluk", "PR", "Finans", "Strateji"] }, hasEvidence: true, evidenceQuality: "strong" },

  // ─── 2025–26 contextual decisions ─────────────────────────────────────────
  { factType: "decision", tagSuffix: "season-theme-gp",  statement: "2025 Gracious Professionalism Yılı olarak ilan edildi.", structuredData: { year: 2025, theme: "Gracious Professionalism Yılı" }, hasEvidence: true, evidenceQuality: "strong" },
  { factType: "decision", tagSuffix: "gender-committee", statement: "Aylık cinsiyet eşitliği komitesi toplantıları İş Planı'nda belgelendi.", structuredData: { cadence: "monthly" }, hasEvidence: true, evidenceQuality: "strong" },
];

const IMPORT_TAG = "import:team-8092";
const IMPORT_META_SOURCE = "import-team-8092";

// ─── Runner ──────────────────────────────────────────────────────────────────

async function main() {
  const allTeams = await db.select().from(teams).all();
  const team = TEAM_ARG
    ? allTeams.find((t) => t.id === TEAM_ARG)
    : allTeams.find((t) => t.number === 8092 && t.name === "G.O.A.T.") ?? allTeams[0];
  if (!team) throw new Error("No team found.");
  console.log(`Target: ${team.name} #${team.number} (${team.id})`);

  // ─── Preview diff ─────────────────────────────────────────────────────────
  const teamDiff = (Object.entries(TEAM_UPDATES) as [keyof typeof TEAM_UPDATES, string | number][])
    .filter(([k, v]) => team[k as keyof typeof team] !== v)
    .map(([k, v]) => `    ${String(k)}: ${JSON.stringify(team[k as keyof typeof team])}  →  ${JSON.stringify(v)}`);
  console.log(`\n[teams] updates: ${teamDiff.length === 0 ? "(none)" : ""}`);
  if (teamDiff.length) console.log(teamDiff.join("\n"));

  console.log(`\n[entities] to upsert: ${ENTITIES.length}`);
  for (const e of ENTITIES) console.log(`    [${e.kind}] ${e.name}  (${e.canonicalName})`);

  console.log(`\n[extracted_facts] to upsert: ${FACTS.length}`);
  for (const f of FACTS) console.log(`    [${f.factType}] ${f.statement.slice(0, 90)}…`);

  if (!APPLY) {
    console.log("\n🔍 Preview only. Re-run with --apply to write to Turso.");
    return;
  }

  // ─── Apply ────────────────────────────────────────────────────────────────

  // 1. Update team row
  await db
    .update(teams)
    .set(TEAM_UPDATES)
    .where(eq(teams.id, team.id));
  console.log(`✅ Updated teams row.`);

  // 2. Remove prior import-tagged entities (idempotency)
  const existingEnts = await db.select().from(entities).where(eq(entities.teamId, team.id)).all();
  const toDeleteEnts = existingEnts.filter((e) => {
    const m = (e.metadata as Record<string, unknown> | null) ?? null;
    return m && m.source === IMPORT_META_SOURCE;
  });
  for (const e of toDeleteEnts) {
    await db.delete(entities).where(eq(entities.id, e.id));
  }
  if (toDeleteEnts.length) console.log(`🧹 Removed ${toDeleteEnts.length} prior import-tagged entities.`);

  // 3. Insert entities
  for (const e of ENTITIES) {
    await db.insert(entities).values({
      id: randomUUID(),
      teamId: team.id,
      kind: e.kind,
      name: e.name,
      canonicalName: e.canonicalName,
      aliases: e.aliases ?? null,
      metadata: { ...(e.metadata ?? {}), source: IMPORT_META_SOURCE },
      firstSeenMessageId: null,
    });
  }
  console.log(`✅ Inserted ${ENTITIES.length} entities.`);

  // 4. Remove prior import-tagged facts
  const existingFacts = await db.select().from(extractedFacts).where(eq(extractedFacts.teamId, team.id)).all();
  const toDeleteFacts = existingFacts.filter((f) => {
    const tags = (f.tags as string[] | null) ?? [];
    return tags.includes(IMPORT_TAG);
  });
  for (const f of toDeleteFacts) {
    await db.delete(extractedFacts).where(eq(extractedFacts.id, f.id));
  }
  if (toDeleteFacts.length) console.log(`🧹 Removed ${toDeleteFacts.length} prior import-tagged facts.`);

  // 5. Insert facts
  const now = new Date();
  for (const f of FACTS) {
    await db.insert(extractedFacts).values({
      id: randomUUID(),
      teamId: team.id,
      sourceMessageId: null,
      factType: f.factType,
      statement: f.statement,
      structuredData: f.structuredData ?? null,
      entityRefs: null,
      tags: [IMPORT_TAG, `fact:${f.tagSuffix}`],
      hasEvidence: f.hasEvidence ?? false,
      evidenceQuality: f.evidenceQuality ?? "none",
      confidence: 1.0,
      extractedAt: now,
      modelUsed: null,
    });
  }
  console.log(`✅ Inserted ${FACTS.length} facts.`);

  console.log("\n🎉 Import complete.");
}

main().catch((err) => { console.error(err); process.exit(1); });
