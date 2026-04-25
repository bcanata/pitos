import type { SeedGroup } from "./types";

// Channel UUIDs
const CH_TANITIM = "c16e7e42-aa1f-4c68-972b-bc9691c0cb51";
const CH_SEYAHAT = "cc76a840-e834-4f18-833a-759bfd1357da";
const CH_MEZUNLAR = "47a5940c-2cdf-4e07-aaff-8f99510a011f";

// User UUIDs
const U_BUGRA_REAL = "aad122b8-7776-42c4-b9d7-51b6aa3ecf67";
const U_HAKAN = "18cb0c6b-5104-421d-a71c-828f2867c479";
const U_MUSTAFA = "396129f5-b56a-4eff-94e9-d6ef051bcc01";
const U_AYSE = "2ac6551e-a2b4-4698-a73e-604bcaff5225";
const U_MEHMET = "f36056dd-998e-4048-a67a-43b54540bd2e";
const U_FATMA = "e19b8805-8559-44db-8251-f640a519e3e2";
const U_KAGAN = "d5f5c1f1-59dc-4c58-ba1e-5ed213490492";
const U_YAGIZ = "77c39129-e3dd-4586-ba7f-91cf405766dc";
const U_BUGRA_SEED = "ac1f9dc9-1727-4544-9cb3-f7ab8aa4f4be";
const U_DENIZ = "69af37aa-117c-4e1c-a330-968ee1bd0982";
const U_ALI = "9b049271-118e-446a-a624-7623fc9f9206";
const U_ZEYNEP = "8590cff9-8649-4448-a4f6-a8d72ad45885";
const U_CAN = "404e74a7-ceaa-4f79-b7c9-bcf347151613";
const U_ELIF = "2de90e33-54ce-43f3-af8e-66ce82d5b2bf";
const U_EREN = "db5376b7-cd4a-46af-a2ca-98a01b25c9de";
const U_MERVE = "8297b7d3-0d1e-42b9-a579-ba6414bb0a94";

export const group: SeedGroup = {
  groupName: "outreach-community",
  messages: [
    // ============================================================
    // #tanitim — community outreach, demos, recruiting
    // ============================================================

    // --- Thread A: Çerkezköy STEM Day prep + recap (Nov 2025) ---
    {
      localId: "tan-001",
      channelId: CH_TANITIM,
      authorUserId: U_DENIZ,
      content:
        "Date is locked in for Çerkezköy STEM Day: **Nov 8, 2025**, cultural hall at the Kaymakamlık building. It's running under the MEB protocol, and BSH Türkiye said they'll put up signage. Halit Narin and Veliköy OSB MTAL are invited; we're also getting students from the 6 middle schools in the district. Let's nail down role assignments this week.",
      createdAt: "2025-10-12T14:08:00.000Z",
    },
    {
      localId: "tan-002",
      channelId: CH_TANITIM,
      authorUserId: U_BUGRA_REAL,
      content:
        "Let's plan three stations:\n\n1. **2024 robot demo** (driving + intake) — mechanical kids run it\n2. **Onshape mini-workshop** — 25 min, groups of 20\n3. **G.O.A.T. Jr. table** — middle-school signup form, mini Lego challenge\n\nWe still have 200 Siemens brochures left — we can take those. Asos Proses is printing us t-shirts — 60 of them, volunteers only.",
      createdAt: "2025-10-12T14:21:00.000Z",
      replyToLocalId: "tan-001",
    },
    {
      localId: "tan-003",
      channelId: CH_TANITIM,
      authorUserId: U_ZEYNEP,
      content: "@Eren and I can take the Onshape station. We'll show a \"simple arm mechanism\" in 25 min. I'll send the slide draft tomorrow.",
      createdAt: "2025-10-12T14:34:00.000Z",
      replyToLocalId: "tan-002",
    },
    {
      localId: "tan-004",
      channelId: CH_TANITIM,
      authorUserId: U_EREN,
      content: "I'm in 👍 But we need laptops — the school lab has 8 machines and 4 of them won't even open Onshape (low RAM). I'll talk to IT.",
      createdAt: "2025-10-12T14:38:00.000Z",
      replyToLocalId: "tan-003",
    },
    {
      localId: "tan-005",
      channelId: CH_TANITIM,
      authorUserId: U_HAKAN,
      content:
        "For the robot demo we also need to bring the electrical team's extension cords. There's only one outlet at center stage — last year we spent 3 hours hunting for extensions.",
      createdAt: "2025-10-13T09:02:00.000Z",
    },
    {
      localId: "tan-006",
      channelId: CH_TANITIM,
      authorUserId: U_DENIZ,
      content: "Task list is up in PitOS. I'll share the registration form on Google Forms by morning, with a short link redirecting to iletisim@8092.tr.",
      createdAt: "2025-10-13T09:14:00.000Z",
      replyToLocalId: "tan-005",
    },
    {
      localId: "tan-007",
      channelId: CH_TANITIM,
      authorUserId: U_MERVE,
      content: "I want to take the G.O.A.T. Jr. table. We got 11 applications last year — I'm aiming for at least 25 this time.",
      createdAt: "2025-10-13T11:40:00.000Z",
    },
    {
      localId: "tan-008",
      channelId: CH_TANITIM,
      authorUserId: U_FATMA,
      content: "Let's put together a short info-sheet for parents: when G.O.A.T. Jr. meets, transportation, which school. If we don't win the parents over, the kid shows up but drops out by week 2.",
      createdAt: "2025-10-13T11:52:00.000Z",
      replyToLocalId: "tan-007",
    },
    {
      localId: "tan-009",
      channelId: CH_TANITIM,
      authorUserId: U_BUGRA_REAL,
      content: "Right. Last year our return rate was 22%. A 1-page PDF aimed at parents + a single WhatsApp group = 35%+ this year.",
      createdAt: "2025-10-13T11:58:00.000Z",
      replyToLocalId: "tan-008",
    },
    {
      localId: "tan-010",
      channelId: CH_TANITIM,
      authorUserId: U_DENIZ,
      content: "Latest update (Nov 4): around 180 students RSVP'd from the 6 middle schools. The 2 high schools (Halit Narin, Veliköy OSB) are already coming. Estimated turnout: 240-280.",
      createdAt: "2025-11-04T17:22:00.000Z",
    },
    {
      localId: "tan-011",
      channelId: CH_TANITIM,
      authorUserId: U_ALI,
      content: "Robot test drive done in the school yard today. Battery's draining but the frame is solid. We start loading at 7:30 Saturday morning.",
      createdAt: "2025-11-06T19:14:00.000Z",
    },
    {
      localId: "tan-012",
      channelId: CH_TANITIM,
      authorUserId: U_DENIZ,
      content: "**STEM Day RECAP — Nov 8, 2025**\n\n- **142 students** attended (58% of RSVPs, weather was bad)\n- **38 feedback surveys** filled out\n- **G.O.A.T. Jr. signups: 27** (last year was 11 🎉)\n- 2 parents reached out about sponsorship (a small CNC shop connected to Çetin Group)\n- BSH Türkiye rep stayed for 45 min, offered us a booth at the Bosphorus Regional in March\n- During the robot demo the intake jammed twice — @Hakan fixed it on the floor, kids didn't notice 😅\n\nUploading photos to #medya now.",
      createdAt: "2025-11-08T20:48:00.000Z",
    },
    {
      localId: "tan-013",
      channelId: CH_TANITIM,
      authorUserId: U_BUGRA_REAL,
      content: "27 signups is great. What matters isn't the headline number — it's how many of them are still showing up 8 weeks later. We retained 22% of our 2024 cohort; since signups doubled this year, the goal is keeping at least 12 of those 30-35 kids through mid-February.",
      createdAt: "2025-11-08T21:09:00.000Z",
      replyToLocalId: "tan-012",
    },
    {
      localId: "tan-014",
      channelId: CH_TANITIM,
      authorUserId: null,
      agentGenerated: true,
      agentType: "channel-agent",
      juryReflexKind: "proof_demand",
      content:
        "You've documented the STEM Day numbers really well. Two extra data points would help for the Impact essay: (1) the school/grade breakdown of the 142 attendees (including gender split), (2) the 3 strongest pull-quotes from the survey responses. If we turn these into a Notion table, it'll be ready to go in March. — PitOS",
      createdAt: "2025-11-08T21:15:00.000Z",
      replyToLocalId: "tan-012",
    },
    {
      localId: "tan-015",
      channelId: CH_TANITIM,
      authorUserId: U_DENIZ,
      content: "Moving it to Notion now. School breakdown: Mehmet Akif OO 38, Cumhuriyet OO 31, 75. Yıl OO 24, Atatürk OO 21, Mimar Sinan OO 17, Şehit Polis OO 11. Gender: 71 girls, 71 boys (exactly 50/50, first time ever).",
      createdAt: "2025-11-08T22:02:00.000Z",
      replyToLocalId: "tan-014",
    },

    // --- Thread B: Halit Narin demo for incoming 9th-graders (Sep 2025) ---
    {
      localId: "tan-016",
      channelId: CH_TANITIM,
      authorUserId: U_AYSE,
      content: "9th grade orientation at Halit Narin is **Sep 15**. The vice principal asked for 30 min of our time. Should we bring the robot, or just video + Q&A?",
      createdAt: "2025-09-08T10:11:00.000Z",
    },
    {
      localId: "tan-017",
      channelId: CH_TANITIM,
      authorUserId: U_DENIZ,
      content: "Bring the robot — 9th graders zone out 5 min into a video. @Ali drives, @Elif does a simple ball pickup demo with the intake.",
      createdAt: "2025-09-08T10:18:00.000Z",
      replyToLocalId: "tan-016",
    },
    {
      localId: "tan-018",
      channelId: CH_TANITIM,
      authorUserId: U_ELIF,
      content: "Sounds good but the 2024 robot's intake was already barely working. Let's swap in the spare pneumatic cylinder for the demo, and drop pressure from 90 psi to 75 — quieter for a classroom setting.",
      createdAt: "2025-09-08T10:24:00.000Z",
      replyToLocalId: "tan-017",
    },
    {
      localId: "tan-019",
      channelId: CH_TANITIM,
      authorUserId: U_AYSE,
      content: "75 psi is cleaner, +1. I'll prep an info brochure (Turkish, A5, double-sided), we'll print 80 copies.",
      createdAt: "2025-09-08T10:31:00.000Z",
    },
    {
      localId: "tan-020",
      channelId: CH_TANITIM,
      authorUserId: U_ALI,
      content: "Demo done. Best guess: 110-120 9th graders, 18 teachers, 4 parents. At the end, 14 students came up directly asking \"how do I join?\" @Ayşe has the list.",
      createdAt: "2025-09-15T15:48:00.000Z",
    },
    {
      localId: "tan-021",
      channelId: CH_TANITIM,
      authorUserId: U_AYSE,
      content: "Team intro session for the 14 students is next Friday at 5pm — school physics lab. WhatsApp group is open.",
      createdAt: "2025-09-15T16:09:00.000Z",
      replyToLocalId: "tan-020",
    },

    // --- Thread C: G.O.A.T. Jr. middle-school workshop cadence ---
    {
      localId: "tan-022",
      channelId: CH_TANITIM,
      authorUserId: U_MERVE,
      content:
        "We need a call on G.O.A.T. Jr. cadence. Last year we ran it **2 days a week** (Tue + Sat), and half the kids could only make Saturday because of transportation. Three options:\n\n- **A:** Saturday only, 4 hours (intense but one trip)\n- **B:** Tue 1.5 hr + Sat 2.5 hr (old model)\n- **C:** Every other Saturday, 5 hours (need to charter a shuttle)",
      createdAt: "2025-11-15T13:12:00.000Z",
    },
    {
      localId: "tan-023",
      channelId: CH_TANITIM,
      authorUserId: U_FATMA,
      content: "C solves the transportation problem but mentor rotation gets harder. Mentors are already in the lab on Saturdays for build. A is the most realistic, in my view.",
      createdAt: "2025-11-15T13:25:00.000Z",
      replyToLocalId: "tan-022",
    },
    {
      localId: "tan-024",
      channelId: CH_TANITIM,
      authorUserId: U_HAKAN,
      content: "+1 for A. 4 hours is intense but it's modular with the Lego SPIKE Prime kits. Hour 1 warmup, hours 2-3 project, hour 4 presentation. Repeatable.",
      createdAt: "2025-11-15T13:31:00.000Z",
      replyToLocalId: "tan-023",
    },
    {
      localId: "tan-025",
      channelId: CH_TANITIM,
      authorUserId: U_MERVE,
      content: "OK, going with A. First session is **Saturday Nov 22, 10:00-14:00**, joint classroom at Halit Narin. Sent the message to parents last night and got 27/27 confirmations.",
      createdAt: "2025-11-17T18:02:00.000Z",
      replyToLocalId: "tan-024",
    },
    {
      localId: "tan-026",
      channelId: CH_TANITIM,
      authorUserId: U_MERVE,
      content: "G.O.A.T. Jr. first session recap: **24 kids showed up** (3 sick), did line-following with Lego SPIKE, sketched out a 20-hour curriculum plan. Next session is Dec 6.",
      createdAt: "2025-11-22T15:30:00.000Z",
    },
    {
      localId: "tan-027",
      channelId: CH_TANITIM,
      authorUserId: U_BUGRA_REAL,
      content: "I'll swing by this weekend too. Last year about a third of the parents wanted to chaperone the first week — expect the same this year, be ready.",
      createdAt: "2025-11-19T21:14:00.000Z",
      replyToLocalId: "tan-025",
    },

    // --- Thread D: Mentor recruiting at university ---
    {
      localId: "tan-028",
      channelId: CH_TANITIM,
      authorUserId: U_BUGRA_REAL,
      content:
        "Trakya University Engineering Career Days is **Oct 18**. They gave us 1 booth + a 30-min talk slot. Ideal for mentor recruitment — especially mechatronics and software seniors. Let's get slides + a flyer ready.",
      createdAt: "2025-09-30T16:45:00.000Z",
    },
    {
      localId: "tan-029",
      channelId: CH_TANITIM,
      authorUserId: U_KAGAN,
      content: "+1, 2 of last year's mentors (mechatronics) came from there. This year let's emphasize why FRC is like a \"junior engineer\" role — position it as an alternative to internships.",
      createdAt: "2025-09-30T16:52:00.000Z",
      replyToLocalId: "tan-028",
    },
    {
      localId: "tan-030",
      channelId: CH_TANITIM,
      authorUserId: U_BUGRA_REAL,
      content: "Event's done. 47 students stopped by the booth, 19 left their email, **6 came to the follow-up meeting**. Right now 3 are in the trial period. Investment: 2 mentor-days + 600 TL in printing.",
      createdAt: "2025-10-19T22:18:00.000Z",
      replyToLocalId: "tan-028",
    },
    {
      localId: "tan-031",
      channelId: CH_TANITIM,
      authorUserId: U_YAGIZ,
      content: "47 → 19 → 6 → 3 funnel is super clean. We should put this in the Impact essay: \"sustainable mentor pipeline\".",
      createdAt: "2025-10-19T22:31:00.000Z",
      replyToLocalId: "tan-030",
    },
    {
      localId: "tan-032",
      channelId: CH_TANITIM,
      authorUserId: U_DENIZ,
      content: "Halil İbrahim (former captain) reached out: the ITÜ club wants to do a joint STEM event with us at the end of March. We'll talk after Bosphorus Regional wraps up.",
      createdAt: "2026-02-08T11:24:00.000Z",
    },

    // ============================================================
    // #seyahat — Bosphorus Regional travel logistics
    // ============================================================

    // --- Thread A: Bus reservation ---
    {
      localId: "sey-001",
      channelId: CH_SEYAHAT,
      authorUserId: U_DENIZ,
      content:
        "Bosphorus Regional is **Mar 12-15, 2026** in Maltepe, İstanbul. Departure: Wednesday Mar 11, 06:00 from in front of the Çerkezköy high school. Return: Sunday Mar 15 after 20:00. I'm getting bus quotes from 3 vendors this week.",
      createdAt: "2026-01-22T19:08:00.000Z",
    },
    {
      localId: "sey-002",
      channelId: CH_SEYAHAT,
      authorUserId: U_FATMA,
      content: "What's the total headcount? Robot crate + spare parts going in the rear of the bus, or a separate van?",
      createdAt: "2026-01-22T19:14:00.000Z",
      replyToLocalId: "sey-001",
    },
    {
      localId: "sey-003",
      channelId: CH_SEYAHAT,
      authorUserId: U_DENIZ,
      content: "32 students + 8 mentors = 40 people. We need a 45-seater (extra seats + luggage). Robot crate is 1.20m × 0.80m × 1.50m, normally fits in the bus cargo bay; but spare parts total ~140 kg, so we need a separate **van/light truck**.",
      createdAt: "2026-01-22T19:22:00.000Z",
      replyToLocalId: "sey-002",
    },
    {
      localId: "sey-004",
      channelId: CH_SEYAHAT,
      authorUserId: U_DENIZ,
      content:
        "**Bus quotes (3 vendors, 5 days):**\n\n| Vendor | Bus | Driver bunk | Total | Notes |\n|---|---|---|---|---|\n| Trakya Tur | 45-seat Mercedes Travego | Yes | 28,000 TL | Used them last year, no issues |\n| İstanbul Express | 50-seat Setra | No | 24,500 TL | Driver returns to a hotel each night (+ extra driving) |\n| Marmara Vip | 49-seat Neoplan | Yes | 31,000 TL | New fleet, USB & WiFi |\n\nVan is separate: ~5,500 TL (I'll ask Çetin Group if we can borrow theirs).",
      createdAt: "2026-01-25T14:33:00.000Z",
    },
    {
      localId: "sey-005",
      channelId: CH_SEYAHAT,
      authorUserId: U_BUGRA_REAL,
      content:
        "Let's go with Trakya Tur. Driver bunk matters — last year the İstanbul Express driver was driving back to Çerkezköy each night and there was that one nasty phone call about it. Bus with a bunk = guaranteed 06:00 departure. Marmara Vip isn't worth the extra 3K just for USB ports.",
      createdAt: "2026-01-25T14:48:00.000Z",
      replyToLocalId: "sey-004",
    },
    {
      localId: "sey-006",
      channelId: CH_SEYAHAT,
      authorUserId: U_KAGAN,
      content: "Çetin Group said they can lend us the van for 2 days (in-kind sponsor support). We need a driver — @Volkan might be free.",
      createdAt: "2026-01-26T10:15:00.000Z",
      replyToLocalId: "sey-004",
    },
    {
      localId: "sey-007",
      channelId: CH_SEYAHAT,
      authorUserId: U_DENIZ,
      content: "Decision made: **Trakya Tur 28,000 TL** + **Çetin Group van (in-kind, ~5,500 TL value)**. Contract signs tomorrow, 30% deposit goes out this week.",
      createdAt: "2026-01-26T18:02:00.000Z",
      replyToLocalId: "sey-006",
    },

    // --- Thread B: Hotel block ---
    {
      localId: "sey-008",
      channelId: CH_SEYAHAT,
      authorUserId: U_AYSE,
      content: "Got quotes from 3 hotels near the Maltepe Showground:",
      createdAt: "2026-01-28T11:40:00.000Z",
    },
    {
      localId: "sey-009",
      channelId: CH_SEYAHAT,
      authorUserId: U_AYSE,
      content:
        "**Hotel quotes (4 nights, Mar 11-15):**\n\n- **Maltepe Park Hotel** (3*): 22 rooms, 4-per-room possible. **1,450 TL/person/night** with breakfast. 8-min walk to Showground.\n- **Kartal Inn** (4*): only 2-3 person rooms. 1,850 TL/night with breakfast. 14-min drive to Showground.\n- **Pendik Marina Suites** (3*): 4-5 person suites. 1,620 TL/night. 22-min drive to Showground.\n\nMaltepe Park is in walking distance, 5,800 TL per person for 4 nights. 40 people × 5,800 = **232,000 TL**.",
      createdAt: "2026-01-28T11:42:00.000Z",
      replyToLocalId: "sey-008",
    },
    {
      localId: "sey-010",
      channelId: CH_SEYAHAT,
      authorUserId: U_FATMA,
      content: "Walking distance is a huge luxury. If the bus gets stuck in traffic at 06:30 pit-open, the walking option is a lifesaver.",
      createdAt: "2026-01-28T11:51:00.000Z",
      replyToLocalId: "sey-009",
    },
    {
      localId: "sey-011",
      channelId: CH_SEYAHAT,
      authorUserId: U_BUGRA_REAL,
      content:
        "Let's go with Maltepe Park. My only concern: 4-person rooms. Mixing gender + age groups gets messy. We'll match room assignments to **#pit-ekibi shift rotation** — your shift partner = your roommate, so morning pit handoff is quiet.",
      createdAt: "2026-01-28T12:05:00.000Z",
      replyToLocalId: "sey-010",
    },
    {
      localId: "sey-012",
      channelId: CH_SEYAHAT,
      authorUserId: U_DENIZ,
      content: "Got it. Reserving the 22-room block, 25% deposit by Jan 30. Mentors in 2 separate rooms (women/men), students in the remaining 20.",
      createdAt: "2026-01-28T12:18:00.000Z",
      replyToLocalId: "sey-011",
    },
    {
      localId: "sey-013",
      channelId: CH_SEYAHAT,
      authorUserId: U_AYSE,
      content: "Hotel confirmed. Reservation code: BSP2026-G8092. Cancellation policy: full refund up to 7 days out, 50% from 7-3 days, 0% under 3 days.",
      createdAt: "2026-01-30T10:22:00.000Z",
    },

    // --- Thread C: Dietary survey + parental consent ---
    {
      localId: "sey-014",
      channelId: CH_SEYAHAT,
      authorUserId: U_DENIZ,
      content: "Sent out the dietary survey, **38 of 40 people** responded. Results:\n\n- 4 vegetarian\n- 1 gluten-free\n- 2 lactose intolerant\n- 1 peanut allergy (carries epinephrine)\n- Remaining 30 standard\n\nPassed the notes to the hotel, the chef has 2 weeks lead time.",
      createdAt: "2026-02-15T14:08:00.000Z",
    },
    {
      localId: "sey-015",
      channelId: CH_SEYAHAT,
      authorUserId: U_FATMA,
      content: "Did you add the EpiPen serial number, expiration date, and parent phone number for the peanut-allergy student to the emergency file? We forgot this in Feb 2024 and ended up panicking on the floor.",
      createdAt: "2026-02-15T14:14:00.000Z",
      replyToLocalId: "sey-014",
    },
    {
      localId: "sey-016",
      channelId: CH_SEYAHAT,
      authorUserId: U_DENIZ,
      content: "Added. Emergency file: PDF + 1 physical copy on every mentor + 1 copy with the Halit Narin guidance counselor.",
      createdAt: "2026-02-15T14:22:00.000Z",
      replyToLocalId: "sey-015",
    },
    {
      localId: "sey-017",
      channelId: CH_SEYAHAT,
      authorUserId: U_AYSE,
      content:
        "**Parental consent form status (as of Feb 28):**\n\n- 32 students, 28 forms received (87%)\n- Missing: Mehmet K., Ayşe T., Burak D., Sude A.\n- @Deniz is calling the 4 parents by end of week\n\nThe bus list doesn't close until form + health declaration + emergency contact are all complete.",
      createdAt: "2026-02-28T17:33:00.000Z",
    },
    {
      localId: "sey-018",
      channelId: CH_SEYAHAT,
      authorUserId: U_DENIZ,
      content: "Update: 3 of the 4 parents signed the form, the fourth (Sude A.'s mother) hand-delivered paper to the school principal's office. Scanned it today, **32/32 done.**",
      createdAt: "2026-03-04T18:48:00.000Z",
      replyToLocalId: "sey-017",
    },

    // --- Thread D: Return logistics + budget recap ---
    {
      localId: "sey-019",
      channelId: CH_SEYAHAT,
      authorUserId: U_BUGRA_REAL,
      content:
        "Let's think through Sunday (Mar 15) return. Finals wrap around 17:00, awards at 19:00, closing at 19:45. Bus leaves Showground at 20:00; we get back to Çerkezköy around 22:30. There's a real risk of stretching parent pickup at the high school out to 1am — even if we win, the celebration has to be short.",
      createdAt: "2026-03-08T13:11:00.000Z",
    },
    {
      localId: "sey-020",
      channelId: CH_SEYAHAT,
      authorUserId: U_HAKAN,
      content: "+1. After we send the robot crate back in the van Saturday night, the Sunday return is lighter. Monday is a school day, late nights are a problem.",
      createdAt: "2026-03-08T13:18:00.000Z",
      replyToLocalId: "sey-019",
    },
    {
      localId: "sey-021",
      channelId: CH_SEYAHAT,
      authorUserId: U_DENIZ,
      content:
        "**Budget summary (Bosphorus Regional 2026):**\n\n- Bus: 28,000 TL\n- Hotel (22 rooms × 4 nights): 232,000 TL\n- FIRST registration fee (already paid): —\n- Food (lunch + dinner, hotel breakfast included): ~48,000 TL\n- Emergency fund: 15,000 TL\n- **Total: 323,000 TL**\n\nVan is in-kind. Sponsor coverage right now is **285,000 TL** (Siemens 100k, Çetin 50k, Saray Alüminyum 35k, ÇEMOBSAN 30k, IndCoMach 25k, Politem 20k, Boeing 25k). Gap: 38,000 TL — we'll go to the school parent association or do a 1,200 TL/student contribution call.",
      createdAt: "2026-02-20T16:02:00.000Z",
    },
    {
      localId: "sey-022",
      channelId: CH_SEYAHAT,
      authorUserId: U_BUGRA_REAL,
      content: "Family contribution should be a last resort. First let's go back to Asos Proses and Butan Makina — last year they said \"we'll be here next year too\" when we did the transportation ask.",
      createdAt: "2026-02-20T16:14:00.000Z",
      replyToLocalId: "sey-021",
    },
    {
      localId: "sey-023",
      channelId: CH_SEYAHAT,
      authorUserId: U_KAGAN,
      content: "Asos Proses came in with another 25,000 TL (sponsoring t-shirts + transport for 2 students). Gap is down to 13,000.",
      createdAt: "2026-02-26T11:30:00.000Z",
      replyToLocalId: "sey-022",
    },
    {
      localId: "sey-024",
      channelId: CH_SEYAHAT,
      authorUserId: U_DENIZ,
      content: "If we trim the emergency fund from 15k to 10k, the gap closes. Last year we used 4,500 of it (broken radio + last-day taxi). 10k is plenty.",
      createdAt: "2026-02-26T11:48:00.000Z",
      replyToLocalId: "sey-023",
    },
    {
      localId: "sey-025",
      channelId: CH_SEYAHAT,
      authorUserId: U_DENIZ,
      content:
        "**Final logistics check-list (Mar 10, 1 day to departure)**\n\n- [x] Bus confirmed, driver contact info shared\n- [x] Hotel reservation, rooming list sent to hotel\n- [x] 32/32 consent forms\n- [x] Diet/health file\n- [x] Robot crate, spare parts loaded into the van\n- [x] Emergency contact tree (3 mentors + 2 parent reps)\n- [ ] 05:30 morning gathering coffee (left to @Mustafa)\n\n🚀",
      createdAt: "2026-03-10T22:14:00.000Z",
    },
    {
      localId: "sey-026",
      channelId: CH_SEYAHAT,
      authorUserId: null,
      agentGenerated: true,
      agentType: "channel-agent",
      juryReflexKind: "teach_redirect",
      content:
        "This checklist is gold for next year's rookie captain. Want to archive it in Notion at season's end as 'Bosphorus 2026 — travel runbook'? Budget lines, vendor names, and checklist items all in one file. — PitOS",
      createdAt: "2026-03-10T22:21:00.000Z",
      replyToLocalId: "sey-025",
    },

    // ============================================================
    // #mezunlar — alumni
    // ============================================================

    // --- Thread A: Alumni catch-up post-graduation (Jun 2025) ---
    {
      localId: "mez-001",
      channelId: CH_MEZUNLAR,
      authorUserId: U_BUGRA_REAL,
      content:
        "Our 2025 graduates got their diplomas last week. 9 of them (8 university + 1 gap year). University breakdown:\n\n- ITÜ: 2 (mechatronics, mechanical)\n- Boğaziçi: 1 (computer science)\n- ODTÜ: 1 (electrical-electronics)\n- Yıldız Technical: 2 (mechanical, industrial)\n- Trakya: 2 (mechatronics, software)\n- Gap year: 1 (military service)\n\nAdded everyone to the alumni WhatsApp group. Let's set up a get-together in early September.",
      createdAt: "2025-06-22T16:08:00.000Z",
    },
    {
      localId: "mez-002",
      channelId: CH_MEZUNLAR,
      authorUserId: U_HAKAN,
      content: "Congrats, that's a proud distribution. Did you ask if any of them want to come back as mentors?",
      createdAt: "2025-06-22T16:15:00.000Z",
      replyToLocalId: "mez-001",
    },
    {
      localId: "mez-003",
      channelId: CH_MEZUNLAR,
      authorUserId: U_BUGRA_REAL,
      content:
        "I asked. 4 said \"I'll come back over winter break,\" 2 said \"I can contribute online\" (CAD review, code review). But the pattern we keep seeing: ~40% return rate first year, drops to ~22% after the second year. We'll highlight that number in the Impact essay, but the goal is to push it up.",
      createdAt: "2025-06-22T16:24:00.000Z",
      replyToLocalId: "mez-002",
    },
    {
      localId: "mez-004",
      channelId: CH_MEZUNLAR,
      authorUserId: U_BUGRA_REAL,
      content:
        "Some longer thinking on mentor return rate — not to call anyone out, just to share the pattern.\n\n**Why are we stuck at 22%?** Three observations:\n\n1. **Geography.** Unless an alum stays in Trakya for university, a 2.5-hour weekend trip from Çerkezköy is a real deterrent. ITÜ/ODTÜ/Boğaziçi grads are tapped out during internship season.\n2. **Calendar mismatch.** The FRC season (Jan-Mar) collides with Turkish university midterms. An alum says \"I'll help,\" midterm week hits, the season is over.\n3. **Role ambiguity.** When we say \"come back as a mentor,\" what does that actually mean — owning a subsystem, ad-hoc Q&A, game strategy advisor?\n\n**Three things we want to try in 2025-26:**\n\n- Online \"office hours\" — every Wednesday 21:00-22:00, one alum on duty, fielding student questions over Discord. Solves geography.\n- Single-topic owners: \"swerve PID review goes to Hakan,\" \"PathPlanner goes to Selin.\" Roles get clear.\n- Post-midterm return: target mid-February to early March, leave the midterm window alone.\n\nGoal this season: **return rate 22% → 32%**. Measurement: alumni making active contribution (>2 hrs/month) divided by total 2024-2025 graduates.",
      createdAt: "2025-07-08T22:40:00.000Z",
    },
    {
      localId: "mez-005",
      channelId: CH_MEZUNLAR,
      authorUserId: U_FATMA,
      content: "I'm signing all three lines. The \"office hours\" idea is especially good — I can post the weekly reminder Monday morning if you want.",
      createdAt: "2025-07-08T22:51:00.000Z",
      replyToLocalId: "mez-004",
    },
    {
      localId: "mez-006",
      channelId: CH_MEZUNLAR,
      authorUserId: U_KAGAN,
      content: "Selin (2023 grad, ITÜ mechatronics) already reviewed our PathPlanner code last season. Let's officially make her the \"swerve owner.\"",
      createdAt: "2025-07-09T09:15:00.000Z",
      replyToLocalId: "mez-004",
    },

    // --- Thread B: University lab tour invitations ---
    {
      localId: "mez-007",
      channelId: CH_MEZUNLAR,
      authorUserId: U_BUGRA_REAL,
      content:
        "Two of our alumni in the ITÜ Mechatronics department invited us for a robotics lab tour in December. We can take 15 students from 11th and 12th grade. Date options: Saturday Dec 13 or Dec 20.",
      createdAt: "2025-11-25T10:33:00.000Z",
    },
    {
      localId: "mez-008",
      channelId: CH_MEZUNLAR,
      authorUserId: U_DENIZ,
      content: "Dec 13 is better — semester finals start on the 20th, the kids won't want to come.",
      createdAt: "2025-11-25T10:42:00.000Z",
      replyToLocalId: "mez-007",
    },
    {
      localId: "mez-009",
      channelId: CH_MEZUNLAR,
      authorUserId: U_BUGRA_REAL,
      content: "Locked in for Dec 13. Transportation: team minibus + 1 mentor car. Lunch at the university cafeteria. 10:00-15:00.",
      createdAt: "2025-11-25T10:48:00.000Z",
      replyToLocalId: "mez-008",
    },
    {
      localId: "mez-010",
      channelId: CH_MEZUNLAR,
      authorUserId: U_BUGRA_REAL,
      content:
        "ITÜ lab tour report: **15 students + 2 mentors** went. Selin (alum) hosted us, we toured the mechatronics workshop and the robotics club. On the way back, 4 of our students said \"I'm thinking about mechatronics now\" (it was 1 before the trip). That's priceless. 🚀",
      createdAt: "2025-12-13T20:18:00.000Z",
    },
    {
      localId: "mez-011",
      channelId: CH_MEZUNLAR,
      authorUserId: U_HAKAN,
      content: "Our 2024 alum at ODTÜ also said \"I can host a tour any day in February that isn't exam week.\" Combined with our Trakya alumni, that's 3 different lab tours — nice geographic diversity.",
      createdAt: "2025-12-15T14:02:00.000Z",
      replyToLocalId: "mez-010",
    },

    // --- Thread C: Exit Interview agent rollout (Apr 2026) ---
    {
      localId: "mez-012",
      channelId: CH_MEZUNLAR,
      authorUserId: U_DENIZ,
      content:
        "PitOS Exit Interview agent is live. We'll use it for our 8 graduating seniors (2026 cohort). Format:\n\n- 30-45 min conversation, voice recorded (with student consent)\n- Agent generates the transcript + thematic summary\n- Captain (me) + lead mentor (Buğra) review it\n- Original recording is deleted after 90 days, transcript stays in Notion\n\n**I'm sending out 8 invitation emails this week.**",
      createdAt: "2026-04-08T15:22:00.000Z",
    },
    {
      localId: "mez-013",
      channelId: CH_MEZUNLAR,
      authorUserId: U_FATMA,
      content: "Recipient policy matters. **Only** the captain + lead mentor should see the transcript. Other mentors get general themes (anonymized summary). If a student objects, that recording gets fully deleted.",
      createdAt: "2026-04-08T15:34:00.000Z",
      replyToLocalId: "mez-012",
    },
    {
      localId: "mez-014",
      channelId: CH_MEZUNLAR,
      authorUserId: U_BUGRA_REAL,
      content: "+1. Wrote up the policy doc, it's at /docs/exit-interview-policy.md. The invitation email will link to it. The kids should clearly see what they're sharing and where it goes.",
      createdAt: "2026-04-08T15:48:00.000Z",
      replyToLocalId: "mez-013",
    },
    {
      localId: "mez-015",
      channelId: CH_MEZUNLAR,
      authorUserId: U_DENIZ,
      content:
        "Two format options were discussed:\n\n- **A: Structured** — agent asks 12 fixed questions, in order\n- **B: Semi-structured** — 4 main themes, agent does free-form follow-ups\n\nThe team picked B. Reason: order doesn't matter for surfacing genuine feelings, natural flow does. A feels too much like an interview, suppresses honesty.",
      createdAt: "2026-04-09T11:08:00.000Z",
    },
    {
      localId: "mez-016",
      channelId: CH_MEZUNLAR,
      authorUserId: null,
      agentGenerated: true,
      agentType: "exit-interview",
      juryReflexKind: "teach_redirect",
      content:
        "After running the semi-structured format, two things will be worth tracking at season end: (1) average conversation length, (2) number of topics the student volunteered on their own. If you don't have last year's (structured) measurements, this season becomes the baseline. — PitOS",
      createdAt: "2026-04-09T11:15:00.000Z",
      replyToLocalId: "mez-015",
    },
    {
      localId: "mez-017",
      channelId: CH_MEZUNLAR,
      authorUserId: U_DENIZ,
      content: "First 3 Exit Interviews done (Apr 12-14). Average length 38 min. Transcripts are in Notion, captain + Buğra access only. Thematic summary is pending.",
      createdAt: "2026-04-15T20:48:00.000Z",
    },
    {
      localId: "mez-018",
      channelId: CH_MEZUNLAR,
      authorUserId: U_BUGRA_REAL,
      content:
        "Common themes from the first 3 transcripts (still early, n=3):\n\n- **\"Stuck on the mechanical subteam in 11th grade.\"** All three said \"the switch to software came too late.\"\n- **\"Mentor access disappears during midterms.\"** This is the same pattern we already see on the alumni side.\n- **\"Pit crew rotation wasn't fair.\"** Didn't expect that one — I need to dig deeper.\n\nFull report in May, after the remaining 5 interviews.",
      createdAt: "2026-04-22T17:14:00.000Z",
      replyToLocalId: "mez-017",
    },

    // --- Thread D: Alumni mentor return rate update ---
    {
      localId: "mez-019",
      channelId: CH_MEZUNLAR,
      authorUserId: U_BUGRA_REAL,
      content:
        "End-of-season mentor return rate measurement:\n\n- 2024 cohort (n=11): 4 actively contributing → **36%**\n- 2025 cohort (n=9): 3 actively contributing → **33%**\n\nLast year was 22%, target was 32%. **Both hit.** Office hours + single-topic ownership worked. Details in the Impact essay.",
      createdAt: "2026-04-18T13:08:00.000Z",
    },
    {
      localId: "mez-020",
      channelId: CH_MEZUNLAR,
      authorUserId: U_HAKAN,
      content: "22% → 35% blended (n=20 total, 7 active). 14-point jump year over year, in 18 months. We need to be careful how we phrase this for the judges — claim it confidently but no embellishment.",
      createdAt: "2026-04-18T13:21:00.000Z",
      replyToLocalId: "mez-019",
    },
    {
      localId: "mez-021",
      channelId: CH_MEZUNLAR,
      authorUserId: U_BUGRA_REAL,
      content: "Right. In the Impact essay it goes like this: \"22% (2024) → 35% (2026), n=20\". One line, link to Notion as the source. Polishing it further would hurt us.",
      createdAt: "2026-04-18T13:28:00.000Z",
      replyToLocalId: "mez-020",
    },
    {
      localId: "mez-022",
      channelId: CH_MEZUNLAR,
      authorUserId: U_KAGAN,
      content: "Selin (swerve owner) did 14 PR reviews this season, averaging 2.3 hours/week of contribution. Meaningful.",
      createdAt: "2026-04-19T10:08:00.000Z",
    },
    {
      localId: "mez-023",
      channelId: CH_MEZUNLAR,
      authorUserId: U_BUGRA_REAL,
      content: "Once the Exit Interview transcripts are in, I'll spin up a single \"Alumni Engagement 2025-2026\" page in Notion. How 22% → 35% happened, which practices didn't stick (e.g. the group chat alone didn't work), what we'll try next season. A runbook for the next captain.",
      createdAt: "2026-04-23T19:11:00.000Z",
    },
  ],

  tasks: [
    {
      localId: "task-tan-001",
      channelId: CH_TANITIM,
      title: "STEM Day role assignments + sponsor logo deck",
      description: "3 stations, registration form, brochure printing, BSH/Siemens/Asos logo placement table.",
      assignedToUserId: U_DENIZ,
      assignedByUserId: U_BUGRA_REAL,
      createdViaLocalMessageId: "tan-002",
      deadline: "2025-10-25T17:00:00.000Z",
      status: "done",
      completedAt: "2025-10-26T20:11:00.000Z",
      createdAt: "2025-10-12T14:25:00.000Z",
    },
    {
      localId: "task-tan-002",
      channelId: CH_TANITIM,
      title: "G.O.A.T. Jr. parent info-sheet (1-page PDF)",
      description: "Location, time, transportation, who mentors, single WhatsApp link to join. Aimed at retaining parents through week 2.",
      assignedToUserId: U_FATMA,
      assignedByUserId: U_BUGRA_REAL,
      createdViaLocalMessageId: "tan-009",
      deadline: "2025-11-05T17:00:00.000Z",
      status: "done",
      completedAt: "2025-11-04T15:48:00.000Z",
      createdAt: "2025-10-13T12:02:00.000Z",
    },
    {
      localId: "task-tan-003",
      channelId: CH_TANITIM,
      title: "Move STEM Day school/gender breakdown into Notion",
      description: "For the PitOS Impact narrative. 142 attendees, 38 surveys, 27 G.O.A.T. Jr. signups.",
      assignedToUserId: U_DENIZ,
      assignedByUserId: U_BUGRA_REAL,
      createdViaLocalMessageId: "tan-014",
      deadline: "2025-11-15T23:59:00.000Z",
      status: "done",
      completedAt: "2025-11-13T22:30:00.000Z",
      createdAt: "2025-11-08T21:18:00.000Z",
    },
    {
      localId: "task-tan-004",
      channelId: CH_TANITIM,
      title: "G.O.A.T. Jr. 8-week retention measurement",
      description: "Of the 27 signups, how many are still attending as of Jan 17? Target is 12. Measurement + a one-paragraph summary.",
      assignedToUserId: U_MERVE,
      assignedByUserId: U_BUGRA_REAL,
      createdViaLocalMessageId: "tan-013",
      deadline: "2026-01-17T23:59:00.000Z",
      status: "in_progress",
      createdAt: "2025-11-08T21:22:00.000Z",
    },
    {
      localId: "task-sey-001",
      channelId: CH_SEYAHAT,
      title: "Confirm Çetin Group van + get Volkan's OK as driver",
      description: "For hauling the robot crate + ~140 kg of spare parts. Çetin Group in-kind sponsor support.",
      assignedToUserId: U_KAGAN,
      assignedByUserId: U_DENIZ,
      createdViaLocalMessageId: "sey-006",
      deadline: "2026-02-05T17:00:00.000Z",
      status: "done",
      completedAt: "2026-01-29T11:15:00.000Z",
      createdAt: "2026-01-26T10:20:00.000Z",
    },
    {
      localId: "task-sey-002",
      channelId: CH_SEYAHAT,
      title: "Collect the 4 missing parental consent forms (Mehmet K., Ayşe T., Burak D., Sude A.)",
      description: "Form + health declaration + emergency contact. Bus list closes Mar 5.",
      assignedToUserId: U_DENIZ,
      assignedByUserId: U_AYSE,
      createdViaLocalMessageId: "sey-017",
      deadline: "2026-03-04T23:59:00.000Z",
      status: "done",
      completedAt: "2026-03-04T18:48:00.000Z",
      createdAt: "2026-02-28T17:40:00.000Z",
    },
    {
      localId: "task-sey-003",
      channelId: CH_SEYAHAT,
      title: "Ask Asos Proses + Butan Makina for an additional 38k TL transportation sponsorship",
      description: "To close the budget gap. They committed to it last year.",
      assignedToUserId: U_KAGAN,
      assignedByUserId: U_BUGRA_REAL,
      createdViaLocalMessageId: "sey-022",
      deadline: "2026-03-01T23:59:00.000Z",
      status: "done",
      completedAt: "2026-02-26T11:30:00.000Z",
      createdAt: "2026-02-20T16:18:00.000Z",
    },
    {
      localId: "task-sey-004",
      channelId: CH_SEYAHAT,
      title: "Archive the Bosphorus 2026 travel runbook in Notion",
      description: "Budget lines, vendor names, checklist items, rooming rules. For next year's captain.",
      assignedToUserId: U_DENIZ,
      assignedByUserId: U_BUGRA_REAL,
      createdViaLocalMessageId: "sey-026",
      deadline: "2026-04-30T23:59:00.000Z",
      status: "open",
      createdAt: "2026-03-10T22:25:00.000Z",
    },
    {
      localId: "task-mez-001",
      channelId: CH_MEZUNLAR,
      title: "Send Exit Interview invitation emails to the 8 graduates",
      description: "Policy link, format explainer, scheduling form.",
      assignedToUserId: U_DENIZ,
      assignedByUserId: U_BUGRA_REAL,
      createdViaLocalMessageId: "mez-012",
      deadline: "2026-04-12T23:59:00.000Z",
      status: "done",
      completedAt: "2026-04-10T14:22:00.000Z",
      createdAt: "2026-04-08T15:40:00.000Z",
    },
    {
      localId: "task-mez-002",
      channelId: CH_MEZUNLAR,
      title: "Alumni Engagement 2025-2026 Notion page",
      description: "How 22% → 35% happened, which practices didn't stick, plan for next season. Linked to the Exit Interview thematic summary.",
      assignedToUserId: U_BUGRA_REAL,
      assignedByUserId: U_BUGRA_REAL,
      createdViaLocalMessageId: "mez-023",
      deadline: "2026-05-15T23:59:00.000Z",
      status: "open",
      createdAt: "2026-04-23T19:18:00.000Z",
    },
    {
      localId: "task-mez-003",
      channelId: CH_MEZUNLAR,
      title: "Plan ODTÜ + Trakya lab tours for February",
      description: "Hoping to repeat the ITÜ tour's success (15 students → 4 considering a major change).",
      assignedToUserId: U_HAKAN,
      assignedByUserId: U_BUGRA_REAL,
      createdViaLocalMessageId: "mez-011",
      deadline: "2026-02-15T23:59:00.000Z",
      status: "blocked",
      createdAt: "2025-12-15T14:10:00.000Z",
    },
  ],

  decisions: [
    {
      localId: "dec-tan-001",
      sourceLocalMessageId: "tan-025",
      decision: "G.O.A.T. Jr. cadence: Saturday only, 10:00-14:00 (4-hour intensive block)",
      rationale:
        "Last season's twice-a-week model halved Tuesday attendance because of transportation. A single 4-hour block on Saturday is modular (1 warmup + 2 project + 1 presentation) and means a single trip for parents.",
      alternativesConsidered:
        "B: Tue 1.5 hr + Sat 2.5 hr (old model — Tuesday attendance was poor). C: Every other Saturday, 5 hours (requires chartering a shuttle, mentor rotation gets hard).",
      contextAtTime:
        "27 G.O.A.T. Jr. signups after STEM Day (last year was 11). 27/27 parental confirmations in. Goal: retain ≥44% (12 students) at the 8-week mark instead of 22% (4 students).",
      decidedAt: "2025-11-17T18:05:00.000Z",
    },
    {
      localId: "dec-sey-001",
      sourceLocalMessageId: "sey-007",
      decision: "Bus vendor: Trakya Tur (45-seat Mercedes Travego, 28,000 TL, 5 days)",
      rationale:
        "Driver bunk guarantees the 06:00 morning departure (last year İstanbul Express's bunk-less model caused delays). Vendor is proven from last year. Marmara Vip's extra 3,000 TL is for USB+WiFi — not necessary.",
      alternativesConsidered:
        "İstanbul Express (24,500 TL, no driver bunk — delay risk). Marmara Vip (31,000 TL, new fleet+USB — 3k premium isn't worth it).",
      contextAtTime:
        "32 students + 8 mentors = 40 passengers. Spare parts (~140 kg) need separate transport — Çetin Group is providing the van in-kind.",
      decidedAt: "2026-01-26T18:05:00.000Z",
    },
    {
      localId: "dec-sey-002",
      sourceLocalMessageId: "sey-011",
      decision: "Hotel: Maltepe Park Hotel, 22 rooms × 4-per-room, 4 nights (5,800 TL/person, breakfast included)",
      rationale:
        "Showground is an 8-min walk → being independent of morning traffic is critical (pit opens at 06:30). Rooming pairs match #pit-ekibi shift partners to minimize morning noise.",
      alternativesConsidered:
        "Kartal Inn 4* (1,850 TL/night, 14-min drive — pit-open risk). Pendik Marina Suites 3* (1,620 TL, 22-min drive — too far).",
      contextAtTime: "Budget gap is closeable (Asos Proses + emergency-fund trim covers the +38k).",
      decidedAt: "2026-01-28T12:20:00.000Z",
    },
    {
      localId: "dec-mez-001",
      sourceLocalMessageId: "mez-015",
      decision: "Exit Interview format: semi-structured (4 themes, agent free-form follow-ups)",
      rationale:
        "The structured 12-question model feels like an interview and suppresses honesty. 4 themes + agent follow-ups give natural flow — topics the alum volunteers on their own surface organically.",
      alternativesConsidered: "A: Structured 12 fixed questions, in order. No baseline data for comparison, but we accept the format change as a one-time switch.",
      contextAtTime: "PitOS Exit Interview agent is live. Will be used for 8 graduates (2026 cohort). Recipient: captain + lead mentor only. Recordings deleted after 90 days, transcript in Notion.",
      decidedAt: "2026-04-09T11:12:00.000Z",
    },
    {
      localId: "dec-mez-002",
      sourceLocalMessageId: "mez-021",
      decision: "Mentor return rate metric in Impact essay: present as a single line — \"22% (2024) → 35% (2026), n=20\"",
      rationale:
        "The number is verifiable (small n, but honest). Polishing it (\"50%+ year-on-year growth\" framings) would draw skepticism from judges. Notion link makes the source transparent.",
      alternativesConsidered:
        "Softer metric (just the 2026 cohort 33%). Year-over-year growth-rate framing (overstatement signal on the judges' floor). Single line + source link won.",
      contextAtTime: "2024 cohort 4/11 active (36%), 2025 cohort 3/9 active (33%), blended 7/20 (35%). Office hours + single-topic ownership practices stuck, so the increase is organic.",
      decidedAt: "2026-04-18T13:30:00.000Z",
    },
  ],
};
