# Seed Data Authoring Context — read before writing any seed file

You are writing realistic mock chat data for **PitOS**, an AI-native team workspace for FRC Team 8092 "G.O.A.T." in Çerkezköy, Tekirdağ, Türkiye. The mock data must look like a real team's year of conversations across Slack-like channels — not WhatsApp fragments.

## Team identity (treat as canonical)

- **Team:** G.O.A.T. (Greatest Of All Times), FRC #8092, Çerkezköy/Tekirdağ
- **Schools:** Halit Narin MTAL + Veliköy OSB MTAL
- **Founded:** Haziran 2019 (rookie 2020 Infinite Recharge)
- **Region:** First & only FRC team in Trakya
- **Awards:** 2020 Rookie All-Star, **2026 Judges' Award** (canonical — happened during the seeded timeline)
- **Subteams:** Mekanik · Elektrik · Yazılım · Güvenlik · Mentorluk
- **Outreach arm:** G.O.A.T. Jr. (middle-school squad)
- **Brand colors:** #512f75 (purple, gender-equality symbol), #673a8e, #7e46a8
- **Contact:** iletisim@8092.tr, IG/X/LinkedIn `@goat8092`

## Sponsors (use these names — never invent)

- **Main:** Siemens
- **Corporate:** Boeing, Çetin Group, Saray Alüminyum, ÇEMOBSAN, Politem, Asos Proses, Butan Makina, IndCoMach
- **Institutional:** SSB (Savunma Sanayii Başkanlığı), MEB (Millî Eğitim Bakanlığı), Fikret Yüksel Eğitim Vakfı, ELMAS Programı
- **Local:** Çerkezköy Kaymakamlığı, BSH Türkiye, Kodluyoruz Derneği

## Public-safe people (you may name these)

**Mentors:** Hakan Köse, Ecem Çolak, Selin Ertan, Yağız Engin, Ömer Faruk Günal, Ali Erkan Saruhan, Kağan Bahadır Durgut, Hasret Okumuş, Buğra Canata (lead/owner), Volkan Deniz.

**Students** (only first names already public on 8092.tr): Halil İbrahim Öz (team captain), plus the seeded roster below — Deniz Arslan (captain seat in DB), Ali, Zeynep, Can, Elif, Eren, Merve.

**RULE — never invent additional minor names.** If you need to attribute something to "a freshman," say "yeni gelen bir öğrenci" or use one of the seeded student IDs.

## User ID map (use these UUIDs as authorUserId)

| Role | Name | UUID |
|---|---|---|
| lead_mentor | Buğra Canata (real) | `aad122b8-7776-42c4-b9d7-51b6aa3ecf67` |
| lead_mentor | Hakan Köse | `18cb0c6b-5104-421d-a71c-828f2867c479` |
| lead_mentor | Mustafa YAZI | `396129f5-b56a-4eff-94e9-d6ef051bcc01` |
| lead_mentor | Ayşe Demir (seed) | `2ac6551e-a2b4-4698-a73e-604bcaff5225` |
| mentor | Mehmet Yılmaz | `f36056dd-998e-4048-a67a-43b54540bd2e` |
| mentor | Fatma Kaya | `e19b8805-8559-44db-8251-f640a519e3e2` |
| mentor | Kağan Bahadır Durgut | `d5f5c1f1-59dc-4c58-ba1e-5ed213490492` |
| mentor | Yağız Engin | `77c39129-e3dd-4586-ba7f-91cf405766dc` |
| mentor | Buğra Canata (seed) | `ac1f9dc9-1727-4544-9cb3-f7ab8aa4f4be` |
| captain | Deniz Arslan | `69af37aa-117c-4e1c-a330-968ee1bd0982` |
| student | Ali Öztürk | `9b049271-118e-446a-a624-7623fc9f9206` |
| student | Zeynep Çelik | `8590cff9-8649-4448-a4f6-a8d72ad45885` |
| student | Can Aydın | `404e74a7-ceaa-4f79-b7c9-bcf347151613` |
| student | Elif Doğan | `2de90e33-54ce-43f3-af8e-66ce82d5b2bf` |
| student | Eren Şahin | `db5376b7-cd4a-46af-a2ca-98a01b25c9de` |
| student | Merve Taş | `8297b7d3-0d1e-42b9-a579-ba6414bb0a94` |
| student | Demo Guest | `899f5279-ac26-4dc7-8e45-672b4e81b75e` |

## Channel ID map (use these UUIDs as channelId)

| ID | Name | Description |
|---|---|---|
| `1106939d-9d9b-4d2e-9b3f-9c72a6539ef3` | sohbet | Sosyal, takım kültürü |
| `246af821-24f7-4c8e-8cd0-c955cb2cac00` | mentorlar | Mentor koordinasyonu (private) |
| `c2710ced-dd88-49d8-88bd-8a05daba5db8` | mekanik | Tasarım, montaj, test |
| `cfb326d5-39f6-4b04-b7c7-1fffb04172d1` | yazilim | Kod, görüntü işleme |
| `ca8b1e84-c553-4613-b827-2bc05e68d99c` | elektrik | Kablolama, sürücüler, sensörler |
| `8419a670-3a15-413e-a96e-4159de75260b` | cad | Onshape/SolidWorks |
| `4768c6cc-826e-481d-ac41-ec334070a933` | strateji | Oyun analizi, ittifak |
| `f73dce5e-c9eb-4ece-a4bd-57fccea8947a` | sponsorlar | Sponsor ilişkileri |
| `144277b6-7765-4e3d-824b-72bfb094ab7c` | medya | Sosyal medya, foto/video |
| `0805d52b-ab18-4ed3-a0b7-564d0bb3330a` | oduller | Impact, Engineering Inspiration, Dean's List |
| `c635757e-6a53-4d1f-8607-d2a0b85e96e1` | scouting | Rakip analizi, maç verileri |
| `92de2aa2-3a61-4928-b16f-9cde02d59ff6` | pit-ekibi | Turnuva pit operasyonları |
| `cc76a840-e834-4f18-833a-759bfd1357da` | seyahat | Ulaşım, konaklama |
| `70209dd4-e94d-481e-b46c-1644b6659d34` | kit-parcalari | KOP envanteri |
| `8fd2d7d3-bc40-446b-94b3-38b9ed4b9ec2` | guvenlik | Güvenlik olayları |
| `47a5940c-2cdf-4e07-aaff-8f99510a011f` | mezunlar | Mezun bağlantısı |
| `bff9357d-5991-46e6-ac9a-67085e54f95e` | genel | Duyurular |
| `c16e7e42-aa1f-4c68-972b-bc9691c0cb51` | tanitim | Topluluk etkinlikleri, demolar |

## Time window

All `createdAt` values must fall in **2025-05-15 → 2026-04-25**. Use this season arc to space messages:

- **Mayıs–Haziran 2025:** post-2025 season decompress, mezuniyet, summer projects
- **Temmuz–Ağustos 2025:** off-season tournaments, rookie recruiting
- **Eylül–Ekim 2025:** STEM days, sponsor cultivation, kickoff prep
- **Kasım–Aralık 2025:** business plan, Impact essay drafts, budget sign-offs
- **Ocak 2026:** kickoff (game manual reveal), 6-week build start
- **Şubat 2026:** prototype phase, late nights, kit-of-parts issues
- **Mart 2026:** Bosphorus Regional → Judges' Award win 🏆
- **Nisan 2026:** post-mortem, season recap, Exit Interviews, planning

## Voice guidelines

- **Turkish primary** — students/mentors talk in TR. Code/CAD jargon stays English: "swerve", "PathPlanner", "Onshape", "Limelight", "PID tuning". Mix is realistic.
- **Mentors** are calm, ask "neden", push for evidence. They use markdown subtly (lists, bold occasionally).
- **Captain** (Deniz/Halil) coordinates, posts deadlines, tags people.
- **Students** are casual, sometimes playful, use emojis (🔧 ⚡ 🚀 🤖 😅 — not over the top).
- **Lead mentor Buğra** writes long-form occasionally — strategy posts, Impact narrative drafts.

## What "meaningful" looks like (read carefully)

Real team chat has:

1. **Threads with arcs.** A topic recurs over weeks: "shooter prototype isn't grouping" → 4 messages over 2 days → "fixed it, here's the bracket" → 1 message a week later asking if the new bracket survived comp.
2. **Decisions with rationale.** "Swerve mi tank mı?" gets debated. The decision message is explicit and references trade-offs. (The seed script will record this in `decisions`.)
3. **Evidence anchors.** "Robot 65 lb tartıldı bugün, hedefimiz 120 max" — concrete numbers, dates, links. Judges love these.
4. **Mentor jury reflexes.** Sometimes the mentor (or PitOS agent — `agentGenerated: true`) responds "Bunu nasıl ölçtün?" or "Hangi alternatifleri denediniz?" with `juryReflexKind: "proof_demand"` or `"why_question"`. Sprinkle 1–3 of these per channel.
5. **Cross-references.** Mentions of other channels (#yazilim, #cad), people (@Yağız Engin), and tasks ("o görevi @Deniz'e atadım").
6. **Failures and recoveries.** A part snapped, a sponsor meeting got cancelled, a code merge broke autonomous. Real teams document the recovery, not just the win.
7. **Imperfection.** Some messages are short ("👍", "tamam abi"), some are paragraphs. The mix is what makes it feel alive — but **avoid the previous import's failure mode**: long stretches of "okay sir / thank you" with no substance.

## Agent-generated messages

Sprinkle PitOS-authored messages where they fit:

```ts
{
  authorUserId: null,
  agentGenerated: true,
  agentType: "channel-agent",
  juryReflexKind: "proof_demand",
  content: "Bu prototipi kaç haftadır test ediyorsunuz? Kaç atışta hangi gruplama? Sayı/foto eklerseniz sezon sonu Impact narrative'inde kullanırız. — PitOS",
  ...
}
```

Use them sparingly (~1 per 10-15 messages), only when they add value. Make them sound like a teammate, not a chatbot.

## Output contract

Each group writes one file: `scripts/seed-data/<group>.ts` exporting:

```ts
import type { SeedGroup } from "./types";

export const group: SeedGroup = {
  groupName: "build",
  messages: [ /* SeedMessage[] */ ],
  tasks: [ /* SeedTask[] */ ],
  decisions: [ /* SeedDecision[] */ ],
};
```

`localId` strings must be unique within your file (prefix with group abbrev: `mek-001`, `yz-014`, etc.). The master script will translate them to UUIDs and resolve `replyToLocalId` / `createdViaLocalMessageId` references.

## Quality gate

Before declaring done, re-read your file as if you were a judge:
- Could you tell a 30-second story about the team from 5 random messages?
- Are there at least 3 decisions worth recording?
- Are there at least 5 tasks (some open, some done, some blocked)?
- Does each channel have ≥ 30 messages with ≥ 3 distinct threads?
- Do mentor reflexes appear naturally?

If yes → you're done. If not → expand the weak channels.
