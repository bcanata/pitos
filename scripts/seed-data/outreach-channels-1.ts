import type { SeedGroup } from "./types";

// Channel UUIDs
const SPONSORLAR = "f73dce5e-c9eb-4ece-a4bd-57fccea8947a";
const MEDYA = "144277b6-7765-4e3d-824b-72bfb094ab7c";
const ODULLER = "0805d52b-ab18-4ed3-a0b7-564d0bb3330a";

// User UUIDs (only those used here)
const BUGRA = "aad122b8-7776-42c4-b9d7-51b6aa3ecf67"; // lead_mentor (real)
const HAKAN = "18cb0c6b-5104-421d-a71c-828f2867c479";
const MUSTAFA = "396129f5-b56a-4eff-94e9-d6ef051bcc01";
const AYSE = "2ac6551e-a2b4-4698-a73e-604bcaff5225";
const MEHMET = "f36056dd-998e-4048-a67a-43b54540bd2e";
const FATMA = "e19b8805-8559-44db-8251-f640a519e3e2";
const KAGAN = "d5f5c1f1-59dc-4c58-ba1e-5ed213490492";
const YAGIZ = "77c39129-e3dd-4586-ba7f-91cf405766dc";
const DENIZ = "69af37aa-117c-4e1c-a330-968ee1bd0982"; // captain
const ALI = "9b049271-118e-446a-a624-7623fc9f9206";
const ZEYNEP = "8590cff9-8649-4448-a4f6-a8d72ad45885";
const CAN = "404e74a7-ceaa-4f79-b7c9-bcf347151613";
const ELIF = "2de90e33-54ce-43f3-af8e-66ce82d5b2bf";
const EREN = "db5376b7-cd4a-46af-a2ca-98a01b25c9de";
const MERVE = "8297b7d3-0d1e-42b9-a579-ba6414bb0a94";

export const group: SeedGroup = {
 groupName: "outreach-comms",
 messages: [
 // ========================================================================
 // #sponsorlar — sponsor pipeline, Siemens renewal, Boeing, Çetin, plaque
 // ========================================================================

 // --- Siemens renewal arc (Sep 2025) ---
 {
 localId: "sp-001",
 channelId: SPONSORLAR,
 authorUserId: BUGRA,
 content:
 "I'm putting together the agenda for the Siemens annual renewal meeting. We did it in October last year, but let's move earlier this season — their budget cycle apparently closes in September, Ms. İlke mentioned it last year. Target: **meeting request out by Sep 10**. Any objections?",
 createdAt: "2025-09-02T09:14:00.000Z",
 },
 {
 localId: "sp-002",
 channelId: SPONSORLAR,
 authorUserId: HAKAN,
 content: "Makes sense. We were late last year and barely got the final payment in February. +1 on moving early.",
 createdAt: "2025-09-02T09:21:00.000Z",
 replyToLocalId: "sp-001",
 },
 {
 localId: "sp-003",
 channelId: SPONSORLAR,
 authorUserId: ELIF,
 content:
 "Coach Buğra, I updated last year's ROI report — for the 2025 season: 12 events, ~3,200 student touchpoints, 4 press hits. Putting it on a slide.",
 createdAt: "2025-09-02T11:42:00.000Z",
 replyToLocalId: "sp-001",
 },
 {
 localId: "sp-004",
 channelId: SPONSORLAR,
 authorUserId: BUGRA,
 content:
 "Excellent Elif. How did you derive the 3,200 number, from the sign-in sheets? I don't want to say \"approximately\" in the meeting — we need an exact figure.",
 createdAt: "2025-09-02T11:50:00.000Z",
 replyToLocalId: "sp-003",
 },
 {
 localId: "sp-005",
 channelId: SPONSORLAR,
 authorUserId: ELIF,
 content:
 "I have signed sign-in sheets per event + rough headcounts from two school visits. The STEM Days have exact signatures (1,847), the remaining ~1,350 is estimated. Should we show the estimated portion as a separate line item?",
 createdAt: "2025-09-02T11:58:00.000Z",
 replyToLocalId: "sp-004",
 },
 {
 localId: "sp-006",
 channelId: SPONSORLAR,
 authorUserId: BUGRA,
 content:
 "Yes, separate them. Format it as \"Verified: 1,847\" + \"Estimated: ~1,350\". Siemens has a sharp jury reflex — if we get caught inflating once, it takes years to recover.",
 createdAt: "2025-09-02T12:03:00.000Z",
 replyToLocalId: "sp-005",
 },
 {
 localId: "sp-007",
 channelId: SPONSORLAR,
 authorUserId: AYSE,
 content:
 "Should I send the email to Ms. İlke? I'll reference last year's subject line for continuity.",
 createdAt: "2025-09-04T08:30:00.000Z",
 replyToLocalId: "sp-001",
 },
 {
 localId: "sp-008",
 channelId: SPONSORLAR,
 authorUserId: BUGRA,
 content: "You send it, keep me on CC. As long as we land a slot before Sep 10, we're good.",
 createdAt: "2025-09-04T08:34:00.000Z",
 replyToLocalId: "sp-007",
 },
 {
 localId: "sp-009",
 channelId: SPONSORLAR,
 authorUserId: AYSE,
 content:
 "Sent. Subject: \"G.O.A.T. 8092 — 2025-26 season partnership discussion\". Proposed three dates: Sep 12, 15, 18.",
 createdAt: "2025-09-04T14:12:00.000Z",
 replyToLocalId: "sp-008",
 },
 {
 localId: "sp-010",
 channelId: SPONSORLAR,
 authorUserId: AYSE,
 content:
 "Reply: Sep 18, 14:00 on Teams works for them. Invite is out. Buğra hoca, Hakan hoca + me are joining. Can Elif get the slides ready by Sep 16?",
 createdAt: "2025-09-08T10:05:00.000Z",
 replyToLocalId: "sp-009",
 },
 {
 localId: "sp-011",
 channelId: SPONSORLAR,
 authorUserId: ELIF,
 content: "Draft up here by the evening of Sep 16, final revisions on the 17th. Done.",
 createdAt: "2025-09-08T10:21:00.000Z",
 replyToLocalId: "sp-010",
 },
 {
 localId: "sp-012",
 channelId: SPONSORLAR,
 authorUserId: ELIF,
 content:
 "v1 draft is up: https://drive (mock). 28 slides — season recap, ROI, 2026 plan, ask (last year + 15%). Waiting on feedback.",
 createdAt: "2025-09-16T19:48:00.000Z",
 replyToLocalId: "sp-011",
 },
 {
 localId: "sp-013",
 channelId: SPONSORLAR,
 authorUserId: HAKAN,
 content:
 "15% increase is aggressive. 12% is a safer anchor against inflation. And let's frame the rationale around \"new G.O.A.T. Jr. rookie program\", not just a raw number.",
 createdAt: "2025-09-16T20:11:00.000Z",
 replyToLocalId: "sp-012",
 },
 {
 localId: "sp-014",
 channelId: SPONSORLAR,
 authorUserId: BUGRA,
 content:
 "I'm with Hakan. 12% + Jr. program option (an additional 3% as \"optional sponsorship\"). That way even if they pass on the add-on, the main sponsorship still closes.",
 createdAt: "2025-09-16T20:24:00.000Z",
 replyToLocalId: "sp-013",
 },
 {
 localId: "sp-015",
 channelId: SPONSORLAR,
 authorUserId: ELIF,
 content: "Got it. v2 tomorrow evening. Can I ask Hasret hoca for a paragraph on the Jr. program?",
 createdAt: "2025-09-16T20:30:00.000Z",
 replyToLocalId: "sp-014",
 },
 {
 localId: "sp-016",
 channelId: SPONSORLAR,
 authorUserId: AYSE,
 content: "Talked to Hasret hoca, she'll send the paragraph by tomorrow noon.",
 createdAt: "2025-09-17T07:50:00.000Z",
 replyToLocalId: "sp-015",
 },
 {
 localId: "sp-017",
 channelId: SPONSORLAR,
 authorUserId: BUGRA,
 content:
 "Meeting wrapped. Recap:\n- 2025-26 main sponsorship **approved at 12% increase** (verbal) — contract end of October\n- G.O.A.T. Jr. option going through internal review, they'll get back to us mid-November\n- Ms. İlke wants to come to Bosphorus Regional as an observer\nGreat session, thanks team. Now we wait on the formal letter.",
 createdAt: "2025-09-18T16:42:00.000Z",
 },
 {
 localId: "sp-018",
 channelId: SPONSORLAR,
 authorUserId: HAKAN,
 content: "Congrats. Let's not let the Jr. option slip through the cracks in November — we should set a reminder for Hasret hoca.",
 createdAt: "2025-09-18T16:55:00.000Z",
 replyToLocalId: "sp-017",
 },

 // --- Boeing engagement arc (Oct 2025) ---
 {
 localId: "sp-019",
 channelId: SPONSORLAR,
 authorUserId: AYSE,
 content:
 "Two engineers from Boeing's İstanbul office showed up at STEM Day. They spent 40 minutes with the kids and were really engaged. They suggested a follow-up meeting — they'll walk us through their \"corporate giving\" channels. Proposed date: Oct 21.",
 createdAt: "2025-10-08T18:30:00.000Z",
 },
 {
 localId: "sp-020",
 channelId: SPONSORLAR,
 authorUserId: BUGRA,
 content:
 "This is big. Boeing has a STEM budget in Turkey but direct support for FRC teams has historically been hard. For Oct 21, do we go in with a proposal or just an intro email?",
 createdAt: "2025-10-08T19:02:00.000Z",
 replyToLocalId: "sp-019",
 },
 {
 localId: "sp-021",
 channelId: SPONSORLAR,
 authorUserId: HAKAN,
 content:
 "Too early to pitch in the first meeting. Just intro + walk them through what we already do, learn which channels they'd accept an application from. Save the pitch for round two.",
 createdAt: "2025-10-08T19:14:00.000Z",
 replyToLocalId: "sp-020",
 },
 {
 localId: "sp-022",
 channelId: SPONSORLAR,
 authorUserId: BUGRA,
 content: "Agreed. Oct 21 is intro-only. We'll need a short \"first contact\" version of pitch deck v3 (8 slides).",
 createdAt: "2025-10-08T19:18:00.000Z",
 replyToLocalId: "sp-021",
 },
 {
 localId: "sp-023",
 channelId: SPONSORLAR,
 authorUserId: ZEYNEP,
 content:
 "When I reached out to the Boeing engineers, Ms. Hayal was super positive. Should I send a thank-you on LinkedIn now or wait?",
 createdAt: "2025-10-09T10:15:00.000Z",
 replyToLocalId: "sp-019",
 },
 {
 localId: "sp-024",
 channelId: SPONSORLAR,
 authorUserId: AYSE,
 content: "Send it. Short, warm — and add a \"looking forward to Oct 21\" line at the end.",
 createdAt: "2025-10-09T10:21:00.000Z",
 replyToLocalId: "sp-023",
 },
 {
 localId: "sp-025",
 channelId: SPONSORLAR,
 authorUserId: AYSE,
 content:
 "Recap from Oct 21: Boeing has a local STEM budget, application windows are February and August. They suggested we prep for Feb 2026. Ms. Hayal said she'll champion us personally (she'll vouch for us internally). Formal application is in the ~$8K range.",
 createdAt: "2025-10-21T17:48:00.000Z",
 },
 {
 localId: "sp-026",
 channelId: SPONSORLAR,
 authorUserId: BUGRA,
 content:
 "Excellent. $8K is a meaningful range. Let's set a timeline for the Feb application — draft by mid-December, internal review in January, submit Feb 1. Let's turn this into a task.",
 createdAt: "2025-10-21T18:00:00.000Z",
 replyToLocalId: "sp-025",
 },
 {
 localId: "sp-027",
 channelId: SPONSORLAR,
 authorUserId: AYSE,
 content: "Got it, I'll open the timeline. Quick check-in with Ms. Hayal on Nov 8 — I'll ask about \"application requirements\".",
 createdAt: "2025-10-21T18:10:00.000Z",
 replyToLocalId: "sp-026",
 },

 // --- Çetin Group machining barter ---
 {
 localId: "sp-028",
 channelId: SPONSORLAR,
 authorUserId: KAGAN,
 content:
 "Mr. Ahmet from Çetin Group called. They can give us 30 hours of free CNC milling labor per year — in exchange they want the G.O.A.T. logo on their shop wall + social media posts. Would be huge for swerve plates this season.",
 createdAt: "2025-10-29T14:22:00.000Z",
 },
 {
 localId: "sp-029",
 channelId: SPONSORLAR,
 authorUserId: BUGRA,
 content:
 "Amazing. What does 30 hours buy us? How many hours did we outsource last year?",
 createdAt: "2025-10-29T14:35:00.000Z",
 replyToLocalId: "sp-028",
 },
 {
 localId: "sp-030",
 channelId: SPONSORLAR,
 authorUserId: KAGAN,
 content:
 "Last year we paid for around 18 hours (~₺22,000). 30 hours is more than enough — we'd even have room for off-season prototyping.",
 createdAt: "2025-10-29T14:42:00.000Z",
 replyToLocalId: "sp-029",
 },
 {
 localId: "sp-031",
 channelId: SPONSORLAR,
 authorUserId: BUGRA,
 content:
 "Great. Let's draw up a mini-contract for logo placement and post schedule — nothing should stay verbal. Posting plan to be coordinated in @medya.",
 createdAt: "2025-10-29T14:50:00.000Z",
 replyToLocalId: "sp-030",
 },

 // --- Pitch deck v3 ---
 {
 localId: "sp-032",
 channelId: SPONSORLAR,
 authorUserId: ELIF,
 content:
 "Pitch deck **v3** draft is ready. New stuff:\n- Pulling Impact data from #oduller (400+ students, 85% STEM retention, 22% alumni-mentor return)\n- New \"sponsor tiers\" page: Platinum / Gold / Silver / Bronze\n- 2026 Bosphorus targets are explicit\nFeedback welcome.",
 createdAt: "2025-11-05T20:12:00.000Z",
 },
 {
 localId: "sp-033",
 channelId: SPONSORLAR,
 authorUserId: BUGRA,
 content:
 "Let's rethink the tier names. \"Platinum/Gold/Silver/Bronze\" is way too cliché. Maybe something tied to our team values: \"Mentor / Champion / Supporter / Friend\" or similar. Thoughts?",
 createdAt: "2025-11-05T20:30:00.000Z",
 replyToLocalId: "sp-032",
 },
 {
 localId: "sp-034",
 channelId: SPONSORLAR,
 authorUserId: AYSE,
 content:
 "+1. Avoiding cliché is good. I'd order them \"Champion / Mentor / Supporter / Friend\" — Champion at the top hits harder.",
 createdAt: "2025-11-05T20:38:00.000Z",
 replyToLocalId: "sp-033",
 },
 {
 localId: "sp-035",
 channelId: SPONSORLAR,
 authorUserId: HAKAN,
 content:
 "Names are nice but every tier needs a **concrete** deliverable: \"Champion = robot logo position A + booth at every event + 2 shop visits per year\". Vague language makes sponsors uneasy.",
 createdAt: "2025-11-05T21:02:00.000Z",
 replyToLocalId: "sp-034",
 },
 {
 localId: "sp-036",
 channelId: SPONSORLAR,
 authorUserId: ELIF,
 content: "Got it. 3-4 concrete bullets per tier. v3.1 tomorrow.",
 createdAt: "2025-11-05T21:10:00.000Z",
 replyToLocalId: "sp-035",
 },

 // --- Agent jury reflex on numbers ---
 {
 localId: "sp-037",
 channelId: SPONSORLAR,
 authorUserId: null,
 agentGenerated: true,
 agentType: "channel-agent",
 juryReflexKind: "proof_demand",
 content:
 "I'm seeing 400+ students and 85% STEM retention in the pitch deck. What's the source date for these numbers? Citing the source on a sponsor slide instantly answers the inevitable \"how do you know?\" question in the meeting. — PitOS",
 createdAt: "2025-11-06T09:00:00.000Z",
 replyToLocalId: "sp-032",
 },
 {
 localId: "sp-038",
 channelId: SPONSORLAR,
 authorUserId: ELIF,
 content:
 "Right — source: May 2025 exit survey (n=412) + school records. Added a footnote on the slide.",
 createdAt: "2025-11-06T09:42:00.000Z",
 replyToLocalId: "sp-037",
 },

 // --- Plaque program ---
 {
 localId: "sp-039",
 channelId: SPONSORLAR,
 authorUserId: AYSE,
 content:
 "Last season we didn't send sponsors thank-you plaques, just emails. This year I'm thinking engraved wood plaques — end of March, 12 sponsors at ~₺3,500 total. Approve?",
 createdAt: "2025-11-12T13:18:00.000Z",
 },
 {
 localId: "sp-040",
 channelId: SPONSORLAR,
 authorUserId: BUGRA,
 content:
 "Approved. @medya can do the design — there's a plaque shop in Çerkezköy (Mert Abi). \"2025-26 season\" + sponsor name + small G.O.A.T. logo. He should be able to deliver by end of March.",
 createdAt: "2025-11-12T13:25:00.000Z",
 replyToLocalId: "sp-039",
 },
 {
 localId: "sp-041",
 channelId: SPONSORLAR,
 authorUserId: AYSE,
 content: "Got it, I'll write up the visual brief and send it to #medya.",
 createdAt: "2025-11-12T13:30:00.000Z",
 replyToLocalId: "sp-040",
 },

 // --- Politem & Saray Alüminyum micro-thread ---
 {
 localId: "sp-042",
 channelId: SPONSORLAR,
 authorUserId: AYSE,
 content:
 "Politem sent over 4mm polycarbonate sheets (3 of them). Saray Alüminyum wants a meeting in early December for 6061-T6 profile setup — for the pit panels. Added it to the list.",
 createdAt: "2025-12-03T10:42:00.000Z",
 },
 {
 localId: "sp-043",
 channelId: SPONSORLAR,
 authorUserId: KAGAN,
 content: "Better if someone from mechanical comes to the Saray meeting too — we can nail down the dimensions on the spot. I'll join if I'm free.",
 createdAt: "2025-12-03T11:00:00.000Z",
 replyToLocalId: "sp-042",
 },

 // --- Boeing follow-up ---
 {
 localId: "sp-044",
 channelId: SPONSORLAR,
 authorUserId: AYSE,
 content:
 "Sent the Nov 8 follow-up email. Ms. Hayal replied — application form drops on the portal mid-December, link will follow. Form is super detailed (12 pages), we need to start early.",
 createdAt: "2025-11-08T15:20:00.000Z",
 },
 {
 localId: "sp-045",
 channelId: SPONSORLAR,
 authorUserId: AYSE,
 content:
 "Boeing portal link came through. Form is 14 pages, asks for 11 attachments (tax exemption etc., we don't have a direct equivalent — how should I phrase \"comparable document\"?).",
 createdAt: "2025-12-15T11:18:00.000Z",
 },
 {
 localId: "sp-046",
 channelId: SPONSORLAR,
 authorUserId: BUGRA,
 content:
 "Just ask Ms. Hayal transparently: \"Turkey doesn't have tax-exempt status; we receive funds through a foundation; how should we phrase this?\" Since she's our personal champion, let's be upfront.",
 createdAt: "2025-12-15T11:35:00.000Z",
 replyToLocalId: "sp-045",
 },
 {
 localId: "sp-047",
 channelId: SPONSORLAR,
 authorUserId: AYSE,
 content:
 "Reply: they confirmed we can route it through Fikret Yüksel Eğitim Vakfı. We'll attach the foundation document. Application draft will be ready by Jan 20.",
 createdAt: "2025-12-17T14:45:00.000Z",
 replyToLocalId: "sp-046",
 },

 // --- Çetin contract signed ---
 {
 localId: "sp-048",
 channelId: SPONSORLAR,
 authorUserId: KAGAN,
 content:
 "Çetin Group barter contract is signed. We used the first 6-hour batch for swerve mounting plates (Dec 8). I think we should shoot a quick thank-you video for Mr. Ahmet.",
 createdAt: "2025-12-09T18:30:00.000Z",
 },
 {
 localId: "sp-049",
 channelId: SPONSORLAR,
 authorUserId: ZEYNEP,
 content: "Sending the brief to @medya — 30sec thank-you reel from the pit.",
 createdAt: "2025-12-09T18:42:00.000Z",
 replyToLocalId: "sp-048",
 },

 // --- ÇEMOBSAN & Asos Proses quick ---
 {
 localId: "sp-050",
 channelId: SPONSORLAR,
 authorUserId: AYSE,
 content:
 "ÇEMOBSAN is renewing this year too (email confirmation in). Asos Proses says they want to come on board for the new season — small tier (Friend) but symbolically important, we'd be their first corporate sponsorship.",
 createdAt: "2026-01-08T09:30:00.000Z",
 },

 // --- Siemens contract signed ---
 {
 localId: "sp-051",
 channelId: SPONSORLAR,
 authorUserId: BUGRA,
 content:
 "Siemens contract is signed — officially confirmed at 12% increase. They added a \"2026 Q2 review\" note for the Jr. option, so it's coming back to the table in May-June. Solid foundation for this season.",
 createdAt: "2025-10-28T17:00:00.000Z",
 },

 // ========================================================================
 // #medya — reveal video, reels, press release, b-roll, logo placement
 // ========================================================================

 // --- Reveal video script debate (Jan 2026) ---
 {
 localId: "med-001",
 channelId: MEDYA,
 authorUserId: ZEYNEP,
 content:
 "Let's start talking about the post-kickoff reveal video. Last year's 1-minute cut was too long — Instagram completion rate was 38%. I'd target 45sec this year.",
 createdAt: "2026-01-12T19:42:00.000Z",
 },
 {
 localId: "med-002",
 channelId: MEDYA,
 authorUserId: MERVE,
 content:
 "45sec is tight but doable. Rough structure:\n- 0-5sec: hook (the robot's most striking move)\n- 5-25sec: build scenes (workshop, assembly, late nights)\n- 25-40sec: full robot reveal + two ability demos\n- 40-45sec: team roster + social handles outro\nDo we brainstorm together or do I draft it solo?",
 createdAt: "2026-01-12T19:55:00.000Z",
 replyToLocalId: "med-001",
 },
 {
 localId: "med-003",
 channelId: MEDYA,
 authorUserId: BUGRA,
 content:
 "Structure is good but the 5-25sec stretch usually drags. \"Late nights at the workshop\" is cliché. What if we do it as a **student voiceover memory**? VO line like: \"It didn't work the first time, so we learned to take it apart\". Raw footage + raw audio — not staged.",
 createdAt: "2026-01-12T20:14:00.000Z",
 replyToLocalId: "med-002",
 },
 {
 localId: "med-004",
 channelId: MEDYA,
 authorUserId: ZEYNEP,
 content:
 "I like it but who does the VO? Pro audio booth? If we record on phones, background noise is going to be an issue.",
 createdAt: "2026-01-12T20:22:00.000Z",
 replyToLocalId: "med-003",
 },
 {
 localId: "med-005",
 channelId: MEDYA,
 authorUserId: BUGRA,
 content:
 "No need to professionalize — \"phone audio quality\" actually feels more authentic. We need 30sec memories from 3 students, then we cut down to 2 lines. Saturday at the workshop with @Halil İbrahim, @Deniz, and one of the new students.",
 createdAt: "2026-01-12T20:30:00.000Z",
 replyToLocalId: "med-004",
 },
 {
 localId: "med-006",
 channelId: MEDYA,
 authorUserId: DENIZ,
 content: "Saturday 14:00 works for me. What do I talk about? Got prepared questions?",
 createdAt: "2026-01-12T20:34:00.000Z",
 replyToLocalId: "med-005",
 },
 {
 localId: "med-007",
 channelId: MEDYA,
 authorUserId: BUGRA,
 content:
 "Not questions, prompts: \"The first mistake of this season we'll never forget\" + \"The hardest moment of this season\". Talk freely, we'll cut in edit.",
 createdAt: "2026-01-12T20:42:00.000Z",
 replyToLocalId: "med-006",
 },
 {
 localId: "med-008",
 channelId: MEDYA,
 authorUserId: MERVE,
 content: "Audio recordings are in. Halil's line — \"We mounted the first swerve module backwards, our mentor burst out laughing\" — is gold. Picked it for the VO.",
 createdAt: "2026-01-19T17:30:00.000Z",
 replyToLocalId: "med-007",
 },

 // --- Music decision ---
 {
 localId: "med-009",
 channelId: MEDYA,
 authorUserId: ZEYNEP,
 content:
 "I prepped 3 music options — all royalty-free (Epidemic Sound):\n1. \"Workshop Stories\" (acoustic guitar, intimate)\n2. \"Future City\" (electronic, high energy)\n3. \"Quiet Triumph\" (piano, emotional)\nWhich one rides best with the VO?",
 createdAt: "2026-01-20T11:14:00.000Z",
 },
 {
 localId: "med-010",
 channelId: MEDYA,
 authorUserId: BUGRA,
 content:
 "Between 1 and 3. The VO is already emotional — 3 (\"Quiet Triumph\") might push it into melodrama, into cliché territory. 1 is safer. Decision: 1.",
 createdAt: "2026-01-20T11:30:00.000Z",
 replyToLocalId: "med-009",
 },

 // --- Sponsor logo placement on robot ---
 {
 localId: "med-011",
 channelId: MEDYA,
 authorUserId: ZEYNEP,
 content:
 "Need a layout map for sponsor logos on the robot bumper. This season we have logos from 1 Champion (Siemens) + 3 Mentor tiers (Boeing, Çetin, Saray Alüminyum). @KAGAN what are the bumper dimensions, which areas are usable?",
 createdAt: "2026-02-02T15:18:00.000Z",
 },
 {
 localId: "med-012",
 channelId: MEDYA,
 authorUserId: KAGAN,
 content:
 "Front bumper: 28cm x 12cm clear area (next to the number). Side panels: 18cm x 10cm, two of them. Top section: not designed yet, no clear space.",
 createdAt: "2026-02-02T15:35:00.000Z",
 replyToLocalId: "med-011",
 },
 {
 localId: "med-013",
 channelId: MEDYA,
 authorUserId: BUGRA,
 content:
 "Champion (Siemens) goes on the front bumper — most visible spot. The 3 Mentor logos split across the two side panels. Do 3 logos fit narrow enough on a single side?",
 createdAt: "2026-02-02T15:42:00.000Z",
 replyToLocalId: "med-012",
 },
 {
 localId: "med-014",
 channelId: MEDYA,
 authorUserId: KAGAN,
 content:
 "3 logos can fit across two panels (2 on one side, 1 on the other). But that breaks symmetry. I could carve out room for the 3rd logo on top in CAD — I'll talk to Yağız hoca.",
 createdAt: "2026-02-02T15:48:00.000Z",
 replyToLocalId: "med-013",
 },
 {
 localId: "med-015",
 channelId: MEDYA,
 authorUserId: YAGIZ,
 content:
 "Carving space on top would shift the weight balance — robot's already at 118 lb. My suggestion: place all 3 logos on the side panels at equal size, stacked. For symmetry, put the same 3 logos on both sides (twice).",
 createdAt: "2026-02-02T16:05:00.000Z",
 replyToLocalId: "med-014",
 },
 {
 localId: "med-016",
 channelId: MEDYA,
 authorUserId: BUGRA,
 content:
 "Yağız's idea makes sense. Decision: Siemens front, the 3 Mentor logos repeated on both side panels. Symmetry + weight neutral.",
 createdAt: "2026-02-02T16:12:00.000Z",
 replyToLocalId: "med-015",
 },

 // --- Reels schedule ---
 {
 localId: "med-017",
 channelId: MEDYA,
 authorUserId: MERVE,
 content:
 "Build season Instagram reels schedule:\n- Mon: \"prototype of the week\" (15-20sec)\n- Wed: \"mentor wisdom\" (advice, 10sec)\n- Fri: \"build journal\" (from the late-night workshop, 30sec)\n- Sun: \"sponsor thanks\" (one sponsor per week, 15sec)\nLook good?",
 createdAt: "2026-01-15T10:08:00.000Z",
 },
 {
 localId: "med-018",
 channelId: MEDYA,
 authorUserId: ZEYNEP,
 content:
 "+1. \"Sponsor thanks\" on Sunday gets weak reach — can we move it to Tuesday? Sundays are weekends, fewer followers online.",
 createdAt: "2026-01-15T10:18:00.000Z",
 replyToLocalId: "med-017",
 },
 {
 localId: "med-019",
 channelId: MEDYA,
 authorUserId: MERVE,
 content: "Moving it to Tuesday. Drop additions as comments on the calendar.",
 createdAt: "2026-01-15T10:22:00.000Z",
 replyToLocalId: "med-018",
 },
 {
 localId: "med-020",
 channelId: MEDYA,
 authorUserId: MERVE,
 content:
 "Last week's reels metrics: Mon prototype 4.2k views, Wed mentor wisdom 8.1k (Hakan hoca's joke went viral 😂), Fri build journal 3.6k. Average 62% completion rate.",
 createdAt: "2026-02-01T12:30:00.000Z",
 },
 {
 localId: "med-021",
 channelId: MEDYA,
 authorUserId: BUGRA,
 content:
 "Hakan hoca's video crushed it. We need to keep the \"mentor wisdom\" format alive — he produces good content without trying. 8.1k is huge for us with a 2.4k follower base.",
 createdAt: "2026-02-01T12:42:00.000Z",
 replyToLocalId: "med-020",
 },

 // --- B-roll list at Bosphorus pit ---
 {
 localId: "med-022",
 channelId: MEDYA,
 authorUserId: ZEYNEP,
 content:
 "Bosphorus Regional pit b-roll shot list (Mar 13-15):\n- Pit setup (morning)\n- Mechanical repair moments (close-up hands)\n- Strategy table alliance talks\n- Pre-match team huddle\n- Stands (families and sponsors)\n- Robot wheel-out (slow-mo)\n- Awards ceremony reactions\nAnything missing?",
 createdAt: "2026-03-08T16:18:00.000Z",
 },
 {
 localId: "med-023",
 channelId: MEDYA,
 authorUserId: AYSE,
 content:
 "Two adds: (1) Halil's \"team captain\" moments talking to other teams — alliance diplomacy, (2) Students taking lunch breaks outside the pit, smiling faces — could be useful as Impact essay video evidence.",
 createdAt: "2026-03-08T16:35:00.000Z",
 replyToLocalId: "med-022",
 },
 {
 localId: "med-024",
 channelId: MEDYA,
 authorUserId: ZEYNEP,
 content: "Added. I'll share the final list in @medya. Gear: 2 phones + 1 Sony A6400 (Ali lent us his).",
 createdAt: "2026-03-08T16:42:00.000Z",
 replyToLocalId: "med-023",
 },

 // --- agent reflex on plan ---
 {
 localId: "med-025",
 channelId: MEDYA,
 authorUserId: null,
 agentGenerated: true,
 agentType: "channel-agent",
 juryReflexKind: "why_question",
 content:
 "In the reels schedule, \"sponsor thanks\" only fires once a week. In sponsor relationships, share-of-voice directly correlates with sponsor retention. Why only 1 — capacity or content drought? If it's capacity, 60sec of raw footage per sponsor is enough. — PitOS",
 createdAt: "2026-01-16T08:10:00.000Z",
 replyToLocalId: "med-019",
 },
 {
 localId: "med-026",
 channelId: MEDYA,
 authorUserId: MERVE,
 content:
 "Fair flag. It's capacity. I could actually do twice a week but keeping up with edits is the bottleneck. @ELIF could you help me with raw footage collection?",
 createdAt: "2026-01-16T09:02:00.000Z",
 replyToLocalId: "med-025",
 },
 {
 localId: "med-027",
 channelId: MEDYA,
 authorUserId: ELIF,
 content: "I can do that. Half hour Tue + Fri. Which sponsors are next up?",
 createdAt: "2026-01-16T09:18:00.000Z",
 replyToLocalId: "med-026",
 },

 // --- Press release for Judges' Award (Mar 2026) ---
 {
 localId: "med-028",
 channelId: MEDYA,
 authorUserId: AYSE,
 content:
 "WE WON JUDGES' AWARD 🏆🏆🏆 Ceremony just ended, everyone's crying. We need to write the press release tonight and send it out tomorrow morning — Turkish press + sponsors.",
 createdAt: "2026-03-15T20:42:00.000Z",
 },
 {
 localId: "med-029",
 channelId: MEDYA,
 authorUserId: BUGRA,
 content:
 "Congratulations team. Press release skeleton: (1) What we won + what it means, (2) Trakya's first FRC team context, (3) the numbers (student count, sponsor count), (4) sponsor + school thank-yous, (5) what's next post-season. Under 600 words, with photos.",
 createdAt: "2026-03-15T21:00:00.000Z",
 replyToLocalId: "med-028",
 },
 {
 localId: "med-030",
 channelId: MEDYA,
 authorUserId: AYSE,
 content: "Draft ready by 09:00 tomorrow. I'll need a one-paragraph quote each from Buğra hoca + Hakan hoca — for authentic voice.",
 createdAt: "2026-03-15T21:08:00.000Z",
 replyToLocalId: "med-029",
 },
 {
 localId: "med-031",
 channelId: MEDYA,
 authorUserId: AYSE,
 content:
 "Press release distributed. Local: Çerkezköy Olay, Tekirdağ Manşet — picked it up within 2 hours. National: Hürriyet education insert said they're interested, will run Thursday. Sponsors got personalized versions too.",
 createdAt: "2026-03-16T13:30:00.000Z",
 },
 {
 localId: "med-032",
 channelId: MEDYA,
 authorUserId: ZEYNEP,
 content:
 "Awards ceremony reaction video is also done — 32sec, raw footage, nothing filtered. Halil's hands on his face, Deniz running over. Going up on Instagram + LinkedIn first thing tomorrow.",
 createdAt: "2026-03-15T23:14:00.000Z",
 replyToLocalId: "med-028",
 },
 {
 localId: "med-033",
 channelId: MEDYA,
 authorUserId: MERVE,
 content: "Reaction reel hit 47k views in 11 hours — first time we've ever seen numbers like this. Comments are flooding in, including from sponsors.",
 createdAt: "2026-03-16T11:20:00.000Z",
 replyToLocalId: "med-032",
 },

 // ========================================================================
 // #oduller — Impact essay arc, EI, Dean's List, Judges' Award
 // ========================================================================

 // --- Impact essay drafting cycle (Oct - Dec 2025) ---
 {
 localId: "od-001",
 channelId: ODULLER,
 authorUserId: BUGRA,
 content:
 "Time to start the Impact essay. Goal this season: 10 pages that actually speak to the jury. Last year's read like an \"ad brochure\" — the jury feedback literally said \"too promotional\".\n\nMain claim (draft): **G.O.A.T. has built a school-industry-mentorship triangle that opened and sustains STEM access in Trakya from zero — proven by 7 years of student flow, 85% STEM retention and 22% alumni-mentor return.**\n\nThree supporting pillars I'm thinking about:\n1. Access (400+ students, MEB partnership, 38% female ratio)\n2. Sustainability (alumni-mentor cycle, sponsor stability)\n3. Impact (G.O.A.T. Jr., regional STEM Days, BSH-MEB program)\n\nObjections or additions?",
 createdAt: "2025-10-20T21:14:00.000Z",
 },
 {
 localId: "od-002",
 channelId: ODULLER,
 authorUserId: HAKAN,
 content:
 "The main claim is strong but \"opened from zero\" is contestable — was there really no STEM at all in Trakya? Maybe \"opened FRC-level STEM access\" is more defensible. The jury will trip on this.",
 createdAt: "2025-10-20T21:30:00.000Z",
 replyToLocalId: "od-001",
 },
 {
 localId: "od-003",
 channelId: ODULLER,
 authorUserId: BUGRA,
 content: "You're right. I'll add \"FRC-level\" — more accurate, more defensible.",
 createdAt: "2025-10-20T21:35:00.000Z",
 replyToLocalId: "od-002",
 },
 {
 localId: "od-004",
 channelId: ODULLER,
 authorUserId: AYSE,
 content:
 "The 85% STEM retention number is powerful but how do we prove it? University choice lists + LinkedIn + alumni survey — even with 3 sources the jury will ask \"what's the methodology\". We should explain it in a methodology callout.",
 createdAt: "2025-10-21T08:42:00.000Z",
 replyToLocalId: "od-001",
 },
 {
 localId: "od-005",
 channelId: ODULLER,
 authorUserId: BUGRA,
 content:
 "Yeah, methodology callout — that's the plan. But the essay has a 10-page limit, where do we squeeze the box in? Does putting it as an appendix make sense?",
 createdAt: "2025-10-21T09:15:00.000Z",
 replyToLocalId: "od-004",
 },
 {
 localId: "od-006",
 channelId: ODULLER,
 authorUserId: AYSE,
 content:
 "There's a limit, not sure if appendices are accepted. Let me check the rules. If they're not accepted, we squeeze the methodology into 1-2 sentences right next to the claims.",
 createdAt: "2025-10-21T09:22:00.000Z",
 replyToLocalId: "od-005",
 },
 {
 localId: "od-007",
 channelId: ODULLER,
 authorUserId: AYSE,
 content:
 "Rules: appendices are allowed but only as \"evidence\" — survey screenshots are fine, analysis isn't. We'll have to pack the methodology lines into the body of the essay.",
 createdAt: "2025-10-21T14:50:00.000Z",
 replyToLocalId: "od-006",
 },
 {
 localId: "od-008",
 channelId: ODULLER,
 authorUserId: BUGRA,
 content:
 "**Impact Essay v0.1 (draft)**\n\n*In Çerkezköy, in the summer of 2018, before there was even a robotics club, a group of teachers gathered and asked, \"Why is there no FRC team in Trakya?\" Today, in 2026, the G.O.A.T. team is not just an answer to that question; as **the region's first and only FRC team**, it has become the load-bearing column of a STEM bridge stretching from Tekirdağ to the European side of İstanbul.*\n\n*This essay tells the story of our team's impact through three pillars: (1) access, (2) sustainability, (3) systemic impact. In each pillar there is a story, a number, and an alumnus.*\n\n*Access. The combined student population of Halit Narin MTAL and Veliköy OSB MTAL is roughly 1,200. **More than 400** of those students have spent at least one hour in our G.O.A.T. workshop in the last 5 years. This isn't just a number — it tells the story of just how wide our workshop door has opened...*\n\n[continues — draft is on Drive, please leave comments: https://drive (mock)]\n\nAlso, I cut the Boeing section in half — too much detail. Left the MEB number blank until I can verify it.",
 createdAt: "2025-10-28T23:15:00.000Z",
 },
 {
 localId: "od-009",
 channelId: ODULLER,
 authorUserId: HAKAN,
 content:
 "Opening paragraph hits hard. But the \"load-bearing column\" metaphor is a stretch — the jury might read it as overclaiming. Maybe \"the bridge's founder and steward\" lands more humbly.",
 createdAt: "2025-10-29T08:18:00.000Z",
 replyToLocalId: "od-008",
 },
 {
 localId: "od-010",
 channelId: ODULLER,
 authorUserId: BUGRA,
 content: "Agreed. Cut the load-bearing column line. Hakan +1.",
 createdAt: "2025-10-29T08:25:00.000Z",
 replyToLocalId: "od-009",
 },
 {
 localId: "od-011",
 channelId: ODULLER,
 authorUserId: MEHMET,
 content:
 "How do we prove the 400+ students number? Got sign-in sheets? Saying \"400+\" without counting will make the jury ask. I scanned through the event logs we kept all summer — I count 412 signatures total across 5 years.",
 createdAt: "2025-10-29T19:30:00.000Z",
 replyToLocalId: "od-008",
 },
 {
 localId: "od-012",
 channelId: ODULLER,
 authorUserId: BUGRA,
 content:
 "412 signatures is huge. Thanks to Mehmet hoca. We'll write \"412 verified signatures\" in the essay — exact number, defensible. \"400+\" was generic.",
 createdAt: "2025-10-29T19:45:00.000Z",
 replyToLocalId: "od-011",
 },
 {
 localId: "od-013",
 channelId: ODULLER,
 authorUserId: ELIF,
 content:
 "I can compile the alumni survey results for the 85% retention number — last year we sent the survey to 47 alumni, 38 responded (80% response rate). 32 of them are studying / graduated in a STEM field. So 32/38 = **84.2%**. Sharing the Excel.",
 createdAt: "2025-10-30T15:10:00.000Z",
 replyToLocalId: "od-008",
 },
 {
 localId: "od-014",
 channelId: ODULLER,
 authorUserId: BUGRA,
 content:
 "Elif you're amazing. 85% isn't even rounded — it's actually 84.2%. We can write \"close to 85%\" in the essay along with the methodology line. That makes the jury feel there's a human behind the number.",
 createdAt: "2025-10-30T15:22:00.000Z",
 replyToLocalId: "od-013",
 },
 {
 localId: "od-015",
 channelId: ODULLER,
 authorUserId: null,
 agentGenerated: true,
 agentType: "channel-agent",
 juryReflexKind: "proof_demand",
 content:
 "On the alumni survey: 38 of 47 alumni responded. Of the 9 non-respondents, how many are non-STEM? If all of them are non-STEM, the true retention is 32/47 = 68%. The jury may flag \"non-response bias\". Stating this assumption transparently in the methodology line builds trust without dropping the number. — PitOS",
 createdAt: "2025-10-30T16:00:00.000Z",
 replyToLocalId: "od-014",
 },
 {
 localId: "od-016",
 channelId: ODULLER,
 authorUserId: BUGRA,
 content:
 "This is a critical flag. \"84% of respondents are in STEM\" + \"the status of the 9 non-respondents is being tracked via LinkedIn\" gives us transparency. Elif, can you trace the 9 on LinkedIn?",
 createdAt: "2025-10-30T16:18:00.000Z",
 replyToLocalId: "od-015",
 },
 {
 localId: "od-017",
 channelId: ODULLER,
 authorUserId: ELIF,
 content:
 "Found 7 of the 9 alumni. 4 are in STEM, 2 are non-STEM, 1 is unclear (private profile). So total STEM rate: (32 + 4) / 47 = 76.6%. If we exclude the unclear one it's 76.6%, if we count it as STEM it's 78.7%.",
 createdAt: "2025-10-31T14:42:00.000Z",
 replyToLocalId: "od-016",
 },
 {
 localId: "od-018",
 channelId: ODULLER,
 authorUserId: BUGRA,
 content:
 "76% is more honest. Writing \"76% STEM retention (36 of 47 alumni)\" + a methodology sentence into the essay. We just escaped the 85% overclaim — that's gold for the jury.",
 createdAt: "2025-10-31T15:00:00.000Z",
 replyToLocalId: "od-017",
 },
 {
 localId: "od-019",
 channelId: ODULLER,
 authorUserId: AYSE,
 content:
 "We said \"need a real number for MEB partnership, no estimates\" — Ms. Türkan, the school principal, sent the official letter: in the 2024-25 academic year, 6 events run jointly with us, 287 students. Official document is attachable.",
 createdAt: "2025-11-04T11:14:00.000Z",
 },
 {
 localId: "od-020",
 channelId: ODULLER,
 authorUserId: BUGRA,
 content: "Ms. Türkan's letter is gold. I'm writing \"287 MEB-verified students\" in the essay, and we can attach the letter as evidence.",
 createdAt: "2025-11-04T11:25:00.000Z",
 replyToLocalId: "od-019",
 },
 {
 localId: "od-021",
 channelId: ODULLER,
 authorUserId: BUGRA,
 content:
 "**Impact Essay v0.5** updated on Drive. Changes: 76% STEM retention, 412 signatures, 287 MEB-verified, alumni-mentor return updated from 22% to **23.4% (11 of the reported 47 alumni mentored at least 1 season)**. Mehmet and Elif please do the final read.",
 createdAt: "2025-11-12T22:10:00.000Z",
 },
 {
 localId: "od-022",
 channelId: ODULLER,
 authorUserId: MEHMET,
 content:
 "The last paragraph on page 4 is too packed. There are 6 sentences about \"G.O.A.T. Jr.\" buried in the body. Either pull them under a subheading or trim to 2 sentences.",
 createdAt: "2025-11-13T10:32:00.000Z",
 replyToLocalId: "od-021",
 },
 {
 localId: "od-023",
 channelId: ODULLER,
 authorUserId: BUGRA,
 content: "Added a subheading: \"Generation to Generation: G.O.A.T. Jr.\". Thanks Mehmet.",
 createdAt: "2025-11-13T11:00:00.000Z",
 replyToLocalId: "od-022",
 },
 {
 localId: "od-024",
 channelId: ODULLER,
 authorUserId: BUGRA,
 content:
 "**Impact Essay v0.9** is on Drive. Final read deadline Dec 28. If no major objections, I upload to the system on Jan 5.",
 createdAt: "2025-12-22T19:48:00.000Z",
 },
 {
 localId: "od-025",
 channelId: ODULLER,
 authorUserId: HAKAN,
 content: "Read it. Generally very clean. Just on page 7 in the sponsor section, make it clear that Boeing is not yet a confirmed sponsor — no surprises.",
 createdAt: "2025-12-26T14:18:00.000Z",
 replyToLocalId: "od-024",
 },
 {
 localId: "od-026",
 channelId: ODULLER,
 authorUserId: BUGRA,
 content:
 "Right — Boeing is framed as \"discussions in progress\". Fixed it, wrote \"Boeing in active discussion\". Final v1.0 uploads tomorrow.",
 createdAt: "2025-12-26T14:32:00.000Z",
 replyToLocalId: "od-025",
 },

 // --- Engineering Inspiration consideration ---
 {
 localId: "od-027",
 channelId: ODULLER,
 authorUserId: AYSE,
 content:
 "We should think about applying for Engineering Inspiration too. The criteria are narrower than Impact — \"spreading engineering culture in the region\". Fits our profile beautifully.",
 createdAt: "2025-11-25T16:10:00.000Z",
 },
 {
 localId: "od-028",
 channelId: ODULLER,
 authorUserId: BUGRA,
 content:
 "EI application is a slightly different scope from Impact — it requires a site visit + interview. Pursuing both Impact and EI in the same year strains the team, we have to think about capacity.",
 createdAt: "2025-11-25T16:30:00.000Z",
 replyToLocalId: "od-027",
 },
 {
 localId: "od-029",
 channelId: ODULLER,
 authorUserId: HAKAN,
 content:
 "EI shares ~70% material with Impact. The team is exhausted. I think we focus on Impact only and target EI for 2027.",
 createdAt: "2025-11-25T17:02:00.000Z",
 replyToLocalId: "od-028",
 },
 {
 localId: "od-030",
 channelId: ODULLER,
 authorUserId: BUGRA,
 content: "Agreed. This year: Impact + Dean's List + considered for Judges. EI in 2027.",
 createdAt: "2025-11-25T17:12:00.000Z",
 replyToLocalId: "od-029",
 },

 // --- Dean's List nominations ---
 {
 localId: "od-031",
 channelId: ODULLER,
 authorUserId: BUGRA,
 content:
 "We need to pick 2 students for Dean's List nominations. Junior + above, long-term contribution to the team + impact beyond the team. Mentor crew, send me names — decision by Thursday.",
 createdAt: "2025-12-08T20:14:00.000Z",
 },
 {
 localId: "od-032",
 channelId: ODULLER,
 authorUserId: HAKAN,
 content: "Halil İbrahim Öz is a clear pick — captain, 3rd season, lead coordinator for G.O.A.T. Jr. For the second slot I'm torn between Deniz and Zeynep.",
 createdAt: "2025-12-08T20:32:00.000Z",
 replyToLocalId: "od-031",
 },
 {
 localId: "od-033",
 channelId: ODULLER,
 authorUserId: AYSE,
 content:
 "Deniz leads the mechanical side, but Zeynep's community work (media + sponsor outreach) is unmatched in terms of value to the team. Dean's List asks for \"engineering + community\" — Zeynep is stronger on the community side.",
 createdAt: "2025-12-08T20:45:00.000Z",
 replyToLocalId: "od-032",
 },
 {
 localId: "od-034",
 channelId: ODULLER,
 authorUserId: MEHMET,
 content: "Deniz is strong technically but on Dean's List \"leadership\" criterion, Zeynep keeps coming up. I'm voting Zeynep.",
 createdAt: "2025-12-08T21:08:00.000Z",
 replyToLocalId: "od-033",
 },
 {
 localId: "od-035",
 channelId: ODULLER,
 authorUserId: BUGRA,
 content:
 "Balanced call: **Halil İbrahim Öz + Zeynep**. Save Deniz for next year as a combined captaincy + Dean's List nomination — two big roles in one season can create tension.",
 createdAt: "2025-12-09T08:42:00.000Z",
 replyToLocalId: "od-034",
 },
 {
 localId: "od-036",
 channelId: ODULLER,
 authorUserId: ZEYNEP,
 content: "I just heard 😳 Thank you so much. I'll do my best to be worthy of it. I'll work in sync with Halil on the essays.",
 createdAt: "2025-12-09T15:20:00.000Z",
 replyToLocalId: "od-035",
 },

 // --- Judges' Award announcement (Mar 2026) — emotional + reflection ---
 {
 localId: "od-037",
 channelId: ODULLER,
 authorUserId: DENIZ,
 content: "JUDGES' AWARD!!! WE WON!!! 🏆🏆🏆 I can't believe it",
 createdAt: "2026-03-15T20:38:00.000Z",
 },
 {
 localId: "od-038",
 channelId: ODULLER,
 authorUserId: ELIF,
 content: "I'M CRYING 😭😭",
 createdAt: "2026-03-15T20:39:00.000Z",
 },
 {
 localId: "od-039",
 channelId: ODULLER,
 authorUserId: ALI,
 content: "🐐🐐🐐🐐🐐",
 createdAt: "2026-03-15T20:39:00.000Z",
 },
 {
 localId: "od-040",
 channelId: ODULLER,
 authorUserId: HAKAN,
 content: "Congratulations team. 7 years. We earned this.",
 createdAt: "2026-03-15T20:45:00.000Z",
 },
 {
 localId: "od-041",
 channelId: ODULLER,
 authorUserId: BUGRA,
 content:
 "Team,\n\nIt's going to be a long night, I know. But I can't sleep without writing these lines.\n\nWhen we first gathered in a high school in Çerkezköy in 2018, we didn't yet know what starting an FRC team was going to cost us. There was no precedent in Trakya, we didn't even have a street address to knock on doors for sponsorship, and in our first season at Infinite Recharge our robot kept dying mid-tournament. From that day to today, over 7 years, we've been seven different G.O.A.T.s in seven different Çerkezköys — every season laying one more small brick on the last.\n\nTonight, the Bosphorus Regional jury saw that those bricks have built a building. The Judges' Award, unlike traditional competition awards, is the special one the judges hand out when they say \"we can't fit this team into a category, but we cannot ignore them\". Meaning: the jury didn't just hear our story; they paused, lingered, talked about it at length, and ultimately said \"we have to recognize this story\".\n\nThis award is the reward for those 412 signatures, those 287 MEB-verified students, that 76% STEM retention rate, those 11 of 47 alumni who came back to us. It's also the reward for Halil İbrahim's captaincy in his final season, for Zeynep producing 4 reels a week, for Deniz never closing the mechanical bay before midnight, for Elif scrubbing through alumni data in Excel.\n\nAnd most importantly: the reward for every time Hakan hoca asked \"how did you measure that?\", for every redline session where Ayşe said \"this sentence is making the wrong claim\", for every night Mehmet hoca brought tea to the workshop and just listened.\n\nWe'll talk more in the morning. Get some sleep now. With love.\n\n— Buğra",
 createdAt: "2026-03-15T23:42:00.000Z",
 },
 {
 localId: "od-042",
 channelId: ODULLER,
 authorUserId: AYSE,
 content: "Coach Buğra ❤️ Everything that needs to be said to this team is here. I'll read it again tomorrow, for now just thank you.",
 createdAt: "2026-03-16T00:18:00.000Z",
 replyToLocalId: "od-041",
 },
 {
 localId: "od-043",
 channelId: ODULLER,
 authorUserId: BUGRA,
 content:
 "One note: we need to use the visibility this award buys us correctly. March-April: Boeing application, ÇEMOBSAN renewal, new prospective sponsors — in every case, the line \"Judges' Award winner\" opens doors. Let's update the calendar in @sponsorlar.",
 createdAt: "2026-03-16T11:42:00.000Z",
 },
 {
 localId: "od-044",
 channelId: ODULLER,
 authorUserId: null,
 agentGenerated: true,
 agentType: "channel-agent",
 juryReflexKind: "teach_redirect",
 content:
 "The first 72 hours after an award is the golden window for sponsor outreach. Adding \"Judges' Award winner\" to a sponsor email subject typically lifts open rates by 35-50%. Want me to draft a personalized thank-you template for the active Boeing + ÇEMOBSAN conversations? — PitOS",
 createdAt: "2026-03-16T12:00:00.000Z",
 replyToLocalId: "od-043",
 },
 {
 localId: "od-045",
 channelId: ODULLER,
 authorUserId: AYSE,
 content: "Draft it, I'll personalize on top. Thanks PitOS.",
 createdAt: "2026-03-16T12:08:00.000Z",
 replyToLocalId: "od-044",
 },

 // --- Post-mortem ---
 {
 localId: "od-046",
 channelId: ODULLER,
 authorUserId: BUGRA,
 content:
 "Post-Judges' Award **post-mortem** notes (so I have a guide for myself):\n\nWhat worked:\n- Putting methodology behind the numbers (jury specifically called this out)\n- Framing Boeing as \"discussions ongoing\" instead of overclaiming\n- Lowering the alumni-mentor figure honestly (85% → 76%)\n\nWhat to improve:\n- Page 6 is still dense, jury said \"a bit cluttered\"\n- The G.O.A.T. Jr. narrative was thin, next year it could become its own standalone essay pillar\n- Visual support was lacking — no student portrait was included\n\nPlanning for 2027: kick off the EI application + Impact essay v2 skeleton in May.",
 createdAt: "2026-04-08T17:30:00.000Z",
 },
 {
 localId: "od-047",
 channelId: ODULLER,
 authorUserId: HAKAN,
 content: "Clean post-mortem. The visual support point is important — next season let's ask @medya for an early-on portrait series, so we're not scrambling at the end.",
 createdAt: "2026-04-08T18:14:00.000Z",
 replyToLocalId: "od-046",
 },
 ],

 tasks: [
 {
 localId: "task-sp-001",
 channelId: SPONSORLAR,
 title: "Sign and archive the Siemens 2025-26 contract",
 description: "12% increase approved, contract arrives end of October. Sign + file.",
 assignedToUserId: BUGRA,
 assignedByUserId: BUGRA,
 createdViaLocalMessageId: "sp-017",
 deadline: "2025-10-31T18:00:00.000Z",
 status: "done",
 completedAt: "2025-10-28T17:00:00.000Z",
 createdAt: "2025-09-18T16:50:00.000Z",
 },
 {
 localId: "task-sp-002",
 channelId: SPONSORLAR,
 title: "Prepare Boeing Feb 2026 application draft",
 description: "Form is 14 pages, 11 attachments required. Routed through the foundation. Ms. Hayal is championing.",
 assignedToUserId: AYSE,
 assignedByUserId: BUGRA,
 createdViaLocalMessageId: "sp-026",
 deadline: "2026-01-20T18:00:00.000Z",
 status: "in_progress",
 createdAt: "2025-10-21T18:05:00.000Z",
 },
 {
 localId: "task-sp-003",
 channelId: SPONSORLAR,
 title: "Send Nov 8 follow-up email to Ms. Hayal",
 assignedToUserId: AYSE,
 assignedByUserId: AYSE,
 createdViaLocalMessageId: "sp-027",
 deadline: "2025-11-08T17:00:00.000Z",
 status: "done",
 completedAt: "2025-11-08T15:20:00.000Z",
 createdAt: "2025-10-21T18:11:00.000Z",
 },
 {
 localId: "task-sp-004",
 channelId: SPONSORLAR,
 title: "Draft Çetin Group barter contract",
 description: "30 hours of CNC labor, in exchange for logo + posts. Mini-contract.",
 assignedToUserId: KAGAN,
 assignedByUserId: BUGRA,
 createdViaLocalMessageId: "sp-031",
 deadline: "2025-11-15T18:00:00.000Z",
 status: "done",
 completedAt: "2025-11-12T10:30:00.000Z",
 createdAt: "2025-10-29T15:00:00.000Z",
 },
 {
 localId: "task-sp-005",
 channelId: SPONSORLAR,
 title: "Season-end plaque design + order",
 description: "12 sponsors, wood + engraving, ~₺3,500 total. Must arrive by end of March.",
 assignedToUserId: AYSE,
 assignedByUserId: BUGRA,
 createdViaLocalMessageId: "sp-040",
 deadline: "2026-03-25T18:00:00.000Z",
 status: "open",
 createdAt: "2025-11-12T13:35:00.000Z",
 },
 {
 localId: "task-sp-006",
 channelId: SPONSORLAR,
 title: "Pitch deck v3.1 — add concrete deliverable bullets",
 assignedToUserId: ELIF,
 assignedByUserId: HAKAN,
 createdViaLocalMessageId: "sp-036",
 deadline: "2025-11-08T18:00:00.000Z",
 status: "done",
 completedAt: "2025-11-07T22:00:00.000Z",
 createdAt: "2025-11-05T21:15:00.000Z",
 },
 {
 localId: "task-sp-007",
 channelId: SPONSORLAR,
 title: "Saray Alüminyum pit panel meeting (December)",
 assignedToUserId: AYSE,
 assignedByUserId: AYSE,
 createdViaLocalMessageId: "sp-042",
 deadline: "2025-12-12T18:00:00.000Z",
 status: "open",
 createdAt: "2025-12-03T11:05:00.000Z",
 },
 {
 localId: "task-med-001",
 channelId: MEDYA,
 title: "Record reveal video VO (3 students, Saturday)",
 assignedToUserId: BUGRA,
 assignedByUserId: BUGRA,
 createdViaLocalMessageId: "med-005",
 deadline: "2026-01-17T18:00:00.000Z",
 status: "done",
 completedAt: "2026-01-17T18:00:00.000Z",
 createdAt: "2026-01-12T20:45:00.000Z",
 },
 {
 localId: "task-med-002",
 channelId: MEDYA,
 title: "Finalize Bosphorus pit b-roll shot list + lock equipment",
 assignedToUserId: ZEYNEP,
 assignedByUserId: ZEYNEP,
 createdViaLocalMessageId: "med-024",
 deadline: "2026-03-12T18:00:00.000Z",
 status: "done",
 completedAt: "2026-03-12T20:00:00.000Z",
 createdAt: "2026-03-08T16:50:00.000Z",
 },
 {
 localId: "task-med-003",
 channelId: MEDYA,
 title: "Judges' Award press release — draft and distribute",
 assignedToUserId: AYSE,
 assignedByUserId: BUGRA,
 createdViaLocalMessageId: "med-029",
 deadline: "2026-03-16T12:00:00.000Z",
 status: "done",
 completedAt: "2026-03-16T11:30:00.000Z",
 createdAt: "2026-03-15T21:10:00.000Z",
 },
 {
 localId: "task-od-001",
 channelId: ODULLER,
 title: "Alumni survey non-respondent LinkedIn trace (9 alumni)",
 assignedToUserId: ELIF,
 assignedByUserId: BUGRA,
 createdViaLocalMessageId: "od-016",
 deadline: "2025-11-04T18:00:00.000Z",
 status: "done",
 completedAt: "2025-10-31T14:42:00.000Z",
 createdAt: "2025-10-30T16:25:00.000Z",
 },
 {
 localId: "task-od-002",
 channelId: ODULLER,
 title: "Upload Impact Essay v1.0 to the system",
 assignedToUserId: BUGRA,
 assignedByUserId: BUGRA,
 createdViaLocalMessageId: "od-024",
 deadline: "2026-01-05T23:59:00.000Z",
 status: "done",
 completedAt: "2026-01-04T22:14:00.000Z",
 createdAt: "2025-12-22T19:55:00.000Z",
 },
 ],

 decisions: [
 {
 localId: "dec-sp-001",
 sourceLocalMessageId: "sp-014",
 decision: "Pitch Siemens at a 12% increase + an optional G.O.A.T. Jr. add-on of 3% sponsorship.",
 rationale:
 "12% is more defensible against inflation; the Jr. add-on is structured so that a possible 'no' won't block the main sponsorship. Even if the additional 3% is rejected, the 12% remains a solid floor.",
 alternativesConsidered:
 "(1) A flat 15% increase — felt aggressive, weak rationale. (2) Flat 10% + a separate Jr. proposal — keeping Jr. standalone created a 'two separate negotiations' perception with the sponsor and added friction.",
 contextAtTime: "September 2025, ahead of the Siemens annual renewal. Season ROI report: 12 events, 1,847 verified student touchpoints.",
 decidedAt: "2025-09-16T20:35:00.000Z",
 },
 {
 localId: "dec-sp-002",
 sourceLocalMessageId: "sp-021",
 decision: "Go to the Oct 21 Boeing meeting without a pitch — intro-only.",
 rationale:
 "Pitching in the first meeting, without first researching Boeing Turkey's corporate giving channels, risks an early rejection. Intro + learning the corporate-giving flow sets up a much stronger pitch in round two.",
 alternativesConsidered:
 "(1) Going in with a $5K ask in the first meeting — fast, but most likely answer would be 'apply via the standard channel'. (2) Pushing the meeting back — would have lost the STEM Day momentum.",
 contextAtTime: "Two Boeing engineers made warm contact with the team after STEM Day, hot follow-up.",
 decidedAt: "2025-10-08T19:18:00.000Z",
 },
 {
 localId: "dec-sp-003",
 sourceLocalMessageId: "sp-034",
 decision:
 "Sponsor tiers were renamed from cliché metals to 'Champion / Mentor / Supporter / Friend'; each tier carries 3-4 concrete deliverables.",
 rationale:
 "Platinum/Gold-style naming doesn't reflect the team's values (mentorship, community); the new names are both memorable and defensible. Whenever each tier's concrete deliverable isn't written down, sponsor friction increases (Hakan's observation).",
 alternativesConsidered:
 "(1) Metals (Platinum/Gold/Silver/Bronze) — cliché, undifferentiated. (2) A 3-tier 'Founder/Partner/Friend' structure — insufficient resolution for 4 sponsor tiers.",
 contextAtTime: "Pitch deck v3 prep, November 2025.",
 decidedAt: "2025-11-05T20:38:00.000Z",
 },
 {
 localId: "dec-med-001",
 sourceLocalMessageId: "med-005",
 decision:
 "Reveal video format: 45sec runtime + student phone-recorded VO + acoustic music (Workshop Stories). Cliché 'late-night workshop' structure dropped.",
 rationale:
 "Last season's 60sec video had a 38% completion rate — a shorter format will lift completion. Raw VO quality feels more genuine than 'professionalized' narration; creates a 'real team voice' impression for both jury and audience.",
 alternativesConsidered:
 "(1) 60sec drone+timelapse heavy — high production, low intimacy. (2) 30sec high-tempo — couldn't show off abilities. (3) Professional VO — budget + loss of authenticity.",
 contextAtTime: "Post-kickoff January 2026. Last year's reveal metrics: 4.2k views, 38% completion rate.",
 decidedAt: "2026-01-12T20:32:00.000Z",
 },
 {
 localId: "dec-med-002",
 sourceLocalMessageId: "med-016",
 decision:
 "Sponsor logo placement: Siemens (Champion) on the front bumper; the 3 Mentor logos (Boeing, Çetin, Saray Alüminyum) repeated symmetrically on both side panels.",
 rationale:
 "Adding a logo on top would push the robot's weight (118 lb) close to the limit. Symmetric repetition on side panels gives visual balance + visibility from both sides. Every sponsor is visible from every angle of the robot.",
 alternativesConsidered:
 "(1) Adding the 3rd logo on top — weight risk. (2) Asymmetric layout (2 on one side, 1 on the other) — visually awkward in photos.",
 contextAtTime: "February 2026 build period, robot weight margin ~2 lb.",
 decidedAt: "2026-02-02T16:12:00.000Z",
 },
 {
 localId: "dec-od-001",
 sourceLocalMessageId: "od-018",
 decision:
 "In the Impact essay, alumni-mentor / STEM retention numbers are reported with honest methodology and reduced: 76% STEM retention instead of 85%, with the methodology line embedded in the essay.",
 rationale:
 "PitOS agent flagged a non-response bias risk. Through LinkedIn, 7 of the 9 non-respondent alumni were located — true retention is 76%. A lower but verifiable number is more convincing to the jury than a higher but unsupportable one. Transparency builds jury trust.",
 alternativesConsidered:
 "(1) Holding 85% (responder-only) — vulnerable to non-response bias critique. (2) Just saying 'majority STEM' — loses the number, weakens impact.",
 contextAtTime:
 "October 2025, Impact essay v0.5 prep. Alumni survey: sent to 47 alumni, 38 responded.",
 decidedAt: "2025-10-31T15:00:00.000Z",
 },
 {
 localId: "dec-od-002",
 sourceLocalMessageId: "od-029",
 decision: "No Engineering Inspiration submission this season; focus only on Impact + Dean's List + Judges consideration. EI deferred to 2027.",
 rationale:
 "Even though EI shares 70% of materials with Impact, it requires a site visit + additional interview material. Current team capacity is already stretched between build season + Impact essay; opening a third major front would degrade quality.",
 alternativesConsidered:
 "(1) Apply for both Impact and EI — capacity insufficient, both end up mid-quality. (2) Go EI-only — would waste the 7-year data investment behind Impact.",
 contextAtTime: "November 2025, build season starts in 2 months. Mentor team of 8 with Impact essay being the primary load.",
 decidedAt: "2025-11-25T17:12:00.000Z",
 },
 {
 localId: "dec-od-003",
 sourceLocalMessageId: "od-035",
 decision: "Dean's List nominees: Halil İbrahim Öz + Zeynep Çelik. Deniz Arslan held back for the 2027 season.",
 rationale:
 "Halil İbrahim is in his 3rd season as captain + leads G.O.A.T. Jr. — clear first nominee. For the second slot, Zeynep's community + media + sponsor outreach work edges out Deniz's mechanical-heavy leadership on the Dean's List 'impact beyond leadership' criterion. Holding Deniz for a captaincy + Dean's List combined nomination next year prevents role tension.",
 alternativesConsidered:
 "(1) Halil + Deniz — strong mechanical leadership but 'community' dimension is more pronounced in Zeynep. (2) Nominating only Halil (using just 1 slot) — skipping the second nominee is a strategic loss for the team.",
 contextAtTime: "December 2025, Dean's List nomination meeting.",
 decidedAt: "2025-12-09T08:42:00.000Z",
 },
 ],
};
