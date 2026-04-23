/**
 * Backfill the full Turkish channel list into every existing team.
 * Run with: npx tsx scripts/backfill-channels.ts
 *
 * Reads Turso credentials from env (TURSO_DATABASE_URL + TURSO_AUTH_TOKEN)
 * via db/index.ts — same behavior as the app runtime.
 */

import { randomUUID } from "crypto";
import { eq, and } from "drizzle-orm";
import { db } from "../db";
import { teams, channels, channelMembers, memberships } from "../db/schema";

type ChannelDef = {
  name: string;
  description: string;
  type?: "public" | "private";
};

const defaultChannels: ChannelDef[] = [
  { name: "genel",       description: "Duyurular, takım çapında konular" },
  { name: "sohbet",      description: "Sosyal, takım kültürü, off-topic" },
  { name: "mentorlar",   description: "Mentor koordinasyonu", type: "private" },
  { name: "mekanik",     description: "Tasarım, montaj, test" },
  { name: "yazilim",     description: "Kod, vision, elektrik-yazılım entegrasyonu" },
  { name: "elektrik",    description: "Kablolama, motor controller, sensör" },
  { name: "cad",         description: "Onshape/SolidWorks tasarım, parça listesi" },
  { name: "strateji",    description: "Oyun analizi, ittifak seçimi, scouting" },
  { name: "outreach",    description: "Topluluk etkinlikleri, okul ziyaretleri, demolar" },
  { name: "sponsorlar",  description: "Sponsor ilişkileri, toplantılar, takip" },
  { name: "medya",       description: "Sosyal medya, fotoğraf, video, basın" },
  { name: "oduller",     description: "Impact, Engineering Inspiration, Dean's List başvuruları" },
  { name: "scouting",    description: "Rakip analiz, maç verisi, ittifak seçimi" },
  { name: "pit-ekibi",   description: "Turnuva pit operasyonları" },
  { name: "seyahat",     description: "Ulaşım, konaklama, lojistik" },
  { name: "kit-parcalari", description: "KOP envanter, kayıp parça takibi" },
  { name: "guvenlik",    description: "Güvenlik olayları, ekipman bakımı" },
  { name: "mezunlar",    description: "Mezunlarla bağlantı — Exit Interview kaydı" },
];

async function main() {
  const target = process.env.TURSO_DATABASE_URL ? "Turso" : "local SQLite";
  console.log(`\n🔧 Backfilling channels into ${target}\n`);

  const allTeams = await db.select().from(teams).all();
  console.log(`Found ${allTeams.length} team(s).`);

  for (const team of allTeams) {
    console.log(`\n— Team: ${team.name} (${team.id})`);

    const existing = await db
      .select()
      .from(channels)
      .where(eq(channels.teamId, team.id))
      .all();
    const existingNames = new Set(existing.map(c => c.name));

    const teamMemberships = await db
      .select()
      .from(memberships)
      .where(eq(memberships.teamId, team.id))
      .all();

    const now = new Date();

    for (const ch of defaultChannels) {
      if (existingNames.has(ch.name)) {
        console.log(`  · skip #${ch.name} (exists)`);
        continue;
      }

      const channelId = randomUUID();
      const type = ch.type ?? "public";

      await db.insert(channels).values({
        id: channelId,
        teamId: team.id,
        name: ch.name,
        description: ch.description,
        type,
        createdAt: now,
      });

      const eligible = type === "private"
        ? teamMemberships.filter(m => m.role === "lead_mentor" || m.role === "mentor")
        : teamMemberships;

      for (const m of eligible) {
        await db.insert(channelMembers).values({
          id: randomUUID(),
          channelId,
          userId: m.userId,
          joinedAt: now,
        });
      }

      console.log(`  ✓ add #${ch.name} (${type}, ${eligible.length} member(s))`);
    }
  }

  console.log("\n✅ Done.\n");
}

main().catch(err => {
  console.error("Backfill failed:", err);
  process.exit(1);
});
