import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { db } from "@/db";
import { users, teams, memberships, channels, channelMembers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { runOnboardingStep } from "@/lib/agents/onboarding-agent";

export async function GET() {
  const { user } = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const membership = await db
    .select()
    .from(memberships)
    .where(eq(memberships.userId, user.id))
    .get();

  return NextResponse.json({ hasTeam: !!membership });
}

export async function POST(req: Request) {
  const { user } = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const messages: Array<{ role: "user" | "assistant"; content: string }> =
    body?.messages ?? [];

  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "messages is required" }, { status: 400 });
  }

  let result;
  try {
    result = await runOnboardingStep(messages, user.id);
  } catch (err) {
    console.error("[onboarding] agent error:", err);
    return NextResponse.json({ error: "Agent error" }, { status: 500 });
  }

  if (result.done && result.teamData) {
    const { name, number, memberName, role } = result.teamData;
    const now = new Date();
    const teamId = crypto.randomUUID();

    await db.insert(teams).values({
      id: teamId,
      name,
      number,
      createdByUserId: user.id,
      createdAt: now,
    });

    const validRole = (["lead_mentor", "mentor", "captain", "student"] as const).includes(
      role as "lead_mentor" | "mentor" | "captain" | "student"
    )
      ? (role as "lead_mentor" | "mentor" | "captain" | "student")
      : ("student" as const);

    await db.insert(memberships).values({
      id: crypto.randomUUID(),
      userId: user.id,
      teamId,
      role: validRole,
      joinedAt: now,
    });

    if (memberName) {
      await db.update(users).set({ name: memberName }).where(eq(users.id, user.id));
    }

    const defaultChannels: { name: string; description: string; type?: "public" | "private" }[] = [
      // Çekirdek
      { name: "genel",       description: "Duyurular, takım çapında konular" },
      { name: "sohbet",      description: "Sosyal, takım kültürü, off-topic" },
      { name: "mentorlar",   description: "Mentor koordinasyonu", type: "private" },
      // Alt takımlar
      { name: "mekanik",     description: "Tasarım, montaj, test" },
      { name: "yazilim",     description: "Kod, vision, elektrik-yazılım entegrasyonu" },
      { name: "elektrik",    description: "Kablolama, motor controller, sensör" },
      { name: "cad",         description: "Onshape/SolidWorks tasarım, parça listesi" },
      { name: "strateji",    description: "Oyun analizi, ittifak seçimi, scouting" },
      // Business / Outreach
      { name: "outreach",    description: "Topluluk etkinlikleri, okul ziyaretleri, demolar" },
      { name: "sponsorlar",  description: "Sponsor ilişkileri, toplantılar, takip" },
      { name: "medya",       description: "Sosyal medya, fotoğraf, video, basın" },
      { name: "oduller",     description: "Impact, Engineering Inspiration, Dean's List başvuruları" },
      // Sezona özel
      { name: "scouting",    description: "Rakip analiz, maç verisi, ittifak seçimi" },
      { name: "pit-ekibi",   description: "Turnuva pit operasyonları" },
      { name: "seyahat",     description: "Ulaşım, konaklama, lojistik" },
      // Opsiyonel
      { name: "kit-parcalari", description: "KOP envanter, kayıp parça takibi" },
      { name: "guvenlik",    description: "Güvenlik olayları, ekipman bakımı" },
      { name: "mezunlar",    description: "Mezunlarla bağlantı — Exit Interview kaydı" },
    ];

    for (const ch of defaultChannels) {
      const channelId = crypto.randomUUID();
      await db.insert(channels).values({
        id: channelId,
        teamId,
        name: ch.name,
        description: ch.description,
        type: ch.type ?? "public",
        createdAt: now,
      });
      await db.insert(channelMembers).values({
        id: crypto.randomUUID(),
        channelId,
        userId: user.id,
        joinedAt: now,
      });
    }

    return NextResponse.json({ reply: result.reply, done: true });
  }

  return NextResponse.json({ reply: result.reply, done: false });
}
