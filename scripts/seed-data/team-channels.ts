import type { SeedGroup } from "./types";

/**
 * Team-life channels for FRC 8092 G.O.A.T.
 * - #sohbet (1106939d-9d9b-4d2e-9b3f-9c72a6539ef3) — social, team culture
 * - #genel (bff9357d-5991-46e6-ac9a-67085e54f95e) — announcements
 * - #mentorlar (246af821-24f7-4c8e-8cd0-c955cb2cac00) — mentor-only (no agent msgs)
 *
 * Running gags / callbacks woven through:
 * 1) "100 m of cable" — Eren accidentally orders 100 metres of CAN cable instead of 10.
 * Becomes the "100 m club" running joke for the rest of the season.
 * 2) "Shop at 02:14" — late-night build-week photo of everyone passed out. Recurs.
 * 3) "Yağız's simit" — Yağız brings simit at exactly 09:00 every Saturday.
 */

const SOHBET = "1106939d-9d9b-4d2e-9b3f-9c72a6539ef3";
const GENEL = "bff9357d-5991-46e6-ac9a-67085e54f95e";
const MENTOR = "246af821-24f7-4c8e-8cd0-c955cb2cac00";

// Users
const BUGRA = "aad122b8-7776-42c4-b9d7-51b6aa3ecf67"; // lead mentor (real)
const HAKAN = "18cb0c6b-5104-421d-a71c-828f2867c479";
const MUSTAFA = "396129f5-b56a-4eff-94e9-d6ef051bcc01";
const AYSE = "2ac6551e-a2b4-4698-a73e-604bcaff5225";
const MEHMET = "f36056dd-998e-4048-a67a-43b54540bd2e";
const FATMA = "e19b8805-8559-44db-8251-f640a519e3e2";
const KAGAN = "d5f5c1f1-59dc-4c58-ba1e-5ed213490492";
const YAGIZ = "77c39129-e3dd-4586-ba7f-91cf405766dc";

const DENIZ = "69af37aa-117c-4e1c-a330-968ee1bd0982"; // captain (DB)
const ALI = "9b049271-118e-446a-a624-7623fc9f9206";
const ZEYNEP = "8590cff9-8649-4448-a4f6-a8d72ad45885";
const CAN = "404e74a7-ceaa-4f79-b7c9-bcf347151613";
const ELIF = "2de90e33-54ce-43f3-af8e-66ce82d5b2bf";
const EREN = "db5376b7-cd4a-46af-a2ca-98a01b25c9de";
const MERVE = "8297b7d3-0d1e-42b9-a579-ba6414bb0a94";

export const group: SeedGroup = {
 groupName: "team",

 messages: [
 // ───────────────────────────────────────────────────────────────────────
 // #sohbet — late May 2025, post-season decompress
 // ───────────────────────────────────────────────────────────────────────
 {
 localId: "sb-001",
 channelId: SOHBET,
 authorUserId: DENIZ,
 content: "season's over guys. robot's still standing, we're not 😅",
 createdAt: "2025-05-18T19:42:00+03:00",
 },
 {
 localId: "sb-002",
 channelId: SOHBET,
 authorUserId: ELIF,
 content: "i've been asleep for 14 hours and i'm still tired",
 createdAt: "2025-05-18T20:11:00+03:00",
 },
 {
 localId: "sb-003",
 channelId: SOHBET,
 authorUserId: EREN,
 content: "who has the shop key? did Coach Volkan take it?",
 createdAt: "2025-05-19T11:03:00+03:00",
 },
 {
 localId: "sb-004",
 channelId: SOHBET,
 authorUserId: ZEYNEP,
 content: "it's Eren's birthday today 🎂 everyone post something",
 createdAt: "2025-05-22T08:30:00+03:00",
 },
 {
 localId: "sb-005",
 channelId: SOHBET,
 authorUserId: ALI,
 content: "happy birthday bro, 100 m of cable is your gift 🎁",
 createdAt: "2025-05-22T08:34:00+03:00",
 replyToLocalId: "sb-004",
 },
 {
 localId: "sb-006",
 channelId: SOHBET,
 authorUserId: EREN,
 content: "i will not forget this ali. i will not forget.",
 createdAt: "2025-05-22T08:36:00+03:00",
 replyToLocalId: "sb-005",
 },
 {
 localId: "sb-007",
 channelId: SOHBET,
 authorUserId: MERVE,
 content: "happy birthday Eren! 🥳 president of the 100 m club",
 createdAt: "2025-05-22T08:41:00+03:00",
 replyToLocalId: "sb-004",
 },

 // Summer — Bosphorus van karaoke seeds the joke for later
 {
 localId: "sb-008",
 channelId: SOHBET,
 authorUserId: CAN,
 content: "let's do van karaoke on the way to the off-season tournament. opening up the playlist now.",
 createdAt: "2025-07-12T22:14:00+03:00",
 },
 {
 localId: "sb-009",
 channelId: SOHBET,
 authorUserId: ZEYNEP,
 content: "one condition: Coach Hakan has to sing 'Aynalı' 😂",
 createdAt: "2025-07-12T22:18:00+03:00",
 replyToLocalId: "sb-008",
 },
 {
 localId: "sb-010",
 channelId: SOHBET,
 authorUserId: HAKAN,
 content: "i'll sing it but the mic stays with me",
 createdAt: "2025-07-12T22:33:00+03:00",
 replyToLocalId: "sb-009",
 },

 // September — exam stress + meme social
 {
 localId: "sb-011",
 channelId: SOHBET,
 authorUserId: ELIF,
 content: "math exam tomorrow and i'm still thinking about the swerve module CAD, my brain is broken",
 createdAt: "2025-09-29T23:47:00+03:00",
 },
 {
 localId: "sb-012",
 channelId: SOHBET,
 authorUserId: ALI,
 content: "[shop at 02:14, everyone passed out 😴 — simit crumbs on the table, projector still showing Onshape]",
 createdAt: "2025-10-04T02:14:00+03:00",
 },
 {
 localId: "sb-013",
 channelId: SOHBET,
 authorUserId: DENIZ,
 content: "Ali why were you awake to take that photo",
 createdAt: "2025-10-04T08:02:00+03:00",
 replyToLocalId: "sb-012",
 },
 {
 localId: "sb-014",
 channelId: SOHBET,
 authorUserId: ALI,
 content: "history was being made captain. couldn't miss history.",
 createdAt: "2025-10-04T08:09:00+03:00",
 replyToLocalId: "sb-013",
 },

 // November — sponsor kickoff prep, exam-week pause
 {
 localId: "sb-015",
 channelId: SOHBET,
 authorUserId: MERVE,
 content: "i have 4 exams this week, can't make it to the shop, sorry guys 🥲",
 createdAt: "2025-11-10T07:55:00+03:00",
 },
 {
 localId: "sb-016",
 channelId: SOHBET,
 authorUserId: BUGRA,
 content: "Merve, exams come first. The shop will wait for you. Good luck 💪",
 createdAt: "2025-11-10T08:12:00+03:00",
 replyToLocalId: "sb-015",
 },

 // January — kickoff hype
 {
 localId: "sb-017",
 channelId: SOHBET,
 authorUserId: CAN,
 content: "KICKOFF COUNTDOWN 3 DAYS 🚀🚀🚀",
 createdAt: "2026-01-07T18:40:00+03:00",
 },
 {
 localId: "sb-018",
 channelId: SOHBET,
 authorUserId: EREN,
 content: "i want to order 100 m of cable again, it's tradition now",
 createdAt: "2026-01-07T18:43:00+03:00",
 },
 {
 localId: "sb-019",
 channelId: SOHBET,
 authorUserId: DENIZ,
 content: "EREN NO",
 createdAt: "2026-01-07T18:43:30+03:00",
 replyToLocalId: "sb-018",
 },
 {
 localId: "sb-020",
 channelId: SOHBET,
 authorUserId: ZEYNEP,
 content: "100 m club still going strong 🤝",
 createdAt: "2026-01-07T18:45:00+03:00",
 replyToLocalId: "sb-018",
 },

 // February — build-week burnout
 {
 localId: "sb-021",
 channelId: SOHBET,
 authorUserId: ELIF,
 content: "spent 11 hours at the shop today, my mom said 'who are you?' when i got home 😭",
 createdAt: "2026-02-08T23:11:00+03:00",
 },
 {
 localId: "sb-022",
 channelId: SOHBET,
 authorUserId: CAN,
 content: "my parents have started giving me directions to the shop instead of home",
 createdAt: "2026-02-08T23:14:00+03:00",
 replyToLocalId: "sb-021",
 },
 {
 localId: "sb-023",
 channelId: SOHBET,
 authorUserId: ALI,
 content: "[shop at 02:14 again — this time it's Eren faceplanted on the table, mouth open]",
 createdAt: "2026-02-12T02:14:00+03:00",
 },
 {
 localId: "sb-024",
 channelId: SOHBET,
 authorUserId: DENIZ,
 content: "02:14 has officially become a cult, let's add it to the calendar",
 createdAt: "2026-02-12T08:31:00+03:00",
 replyToLocalId: "sb-023",
 },
 {
 localId: "sb-025",
 channelId: SOHBET,
 authorUserId: BUGRA,
 content: "Folks, half-day off this weekend. Saturday after 15:00 the shop is closed. Rest. Sunday everybody stays home. That's an order 😄",
 createdAt: "2026-02-13T19:20:00+03:00",
 },
 {
 localId: "sb-026",
 channelId: SOHBET,
 authorUserId: MERVE,
 content: "BUĞRA HOCAM WE LOVE YOU ❤️",
 createdAt: "2026-02-13T19:22:00+03:00",
 replyToLocalId: "sb-025",
 },
 {
 localId: "sb-027",
 channelId: SOHBET,
 authorUserId: EREN,
 content: "i'll grab snacks and sneak into the shop on sunday, no one will see",
 createdAt: "2026-02-13T19:24:00+03:00",
 replyToLocalId: "sb-025",
 },
 {
 localId: "sb-028",
 channelId: SOHBET,
 authorUserId: HAKAN,
 content: "Eren i changed the shop door lock, i have the code 😎",
 createdAt: "2026-02-13T19:30:00+03:00",
 replyToLocalId: "sb-027",
 },

 // Bosphorus trip — van karaoke callback
 {
 localId: "sb-029",
 channelId: SOHBET,
 authorUserId: CAN,
 content: "ON THE ROAD TO BOSPHORUS 🚐 everyone's asleep in the van, i'm keeping the driver company, thanks Coach Volkan",
 createdAt: "2026-03-12T07:42:00+03:00",
 },
 {
 localId: "sb-030",
 channelId: SOHBET,
 authorUserId: ZEYNEP,
 content: "will Coach Hakan keep his Aynalı promise? biggest question of the season",
 createdAt: "2026-03-12T07:48:00+03:00",
 },
 {
 localId: "sb-031",
 channelId: SOHBET,
 authorUserId: HAKAN,
 content: "i will. but i said the mic stays with me. i guess no one heard.",
 createdAt: "2026-03-12T07:55:00+03:00",
 replyToLocalId: "sb-030",
 },

 // Bosphorus — Judges' Award raw celebration
 {
 localId: "sb-032",
 channelId: SOHBET,
 authorUserId: ALI,
 content: "WE WON THE JUDGES AWARDDDDDDDDD 🏆🏆🏆",
 createdAt: "2026-03-15T17:48:00+03:00",
 },
 {
 localId: "sb-033",
 channelId: SOHBET,
 authorUserId: ELIF,
 content: "I'M CRYING. ALL THOSE 02:14 NIGHTS AT THE SHOP WERE FOR THIS",
 createdAt: "2026-03-15T17:49:00+03:00",
 replyToLocalId: "sb-032",
 },
 {
 localId: "sb-034",
 channelId: SOHBET,
 authorUserId: EREN,
 content: "100 m of cable got us here, admit it",
 createdAt: "2026-03-15T17:51:00+03:00",
 replyToLocalId: "sb-032",
 },
 {
 localId: "sb-035",
 channelId: SOHBET,
 authorUserId: DENIZ,
 content: "Eren stop i'm crying 😭",
 createdAt: "2026-03-15T17:52:00+03:00",
 replyToLocalId: "sb-034",
 },
 {
 localId: "sb-036",
 channelId: SOHBET,
 authorUserId: MERVE,
 content: "Halil İbrahim's knees were shaking when he was on stage, i noticed 🥺",
 createdAt: "2026-03-15T18:02:00+03:00",
 },
 {
 localId: "sb-037",
 channelId: SOHBET,
 authorUserId: ZEYNEP,
 content: "[photo: team on stage with the trophy, tears on every face]",
 createdAt: "2026-03-15T18:14:00+03:00",
 },

 // April — captain transition vibes
 {
 localId: "sb-038",
 channelId: SOHBET,
 authorUserId: CAN,
 content: "the rumor mill about the next captain has started but no one is saying anything out loud 👀",
 createdAt: "2026-04-08T20:11:00+03:00",
 },
 {
 localId: "sb-039",
 channelId: SOHBET,
 authorUserId: DENIZ,
 content: "i swear i don't know either",
 createdAt: "2026-04-08T20:14:00+03:00",
 replyToLocalId: "sb-038",
 },
 {
 localId: "sb-040",
 channelId: SOHBET,
 authorUserId: ALI,
 content: "could be Eren — president of the 100 m club, strong CV",
 createdAt: "2026-04-08T20:16:00+03:00",
 replyToLocalId: "sb-038",
 },
 {
 localId: "sb-041",
 channelId: SOHBET,
 authorUserId: EREN,
 content: "ali i'm shutting this club down",
 createdAt: "2026-04-08T20:17:00+03:00",
 replyToLocalId: "sb-040",
 },
 {
 localId: "sb-042",
 channelId: SOHBET,
 authorUserId: ELIF,
 content: "you can't, it's a people's club 🤝",
 createdAt: "2026-04-08T20:18:00+03:00",
 replyToLocalId: "sb-041",
 },

 // ───────────────────────────────────────────────────────────────────────
 // #genel — Captain announcements + heartfelt season-end
 // ───────────────────────────────────────────────────────────────────────
 {
 localId: "gen-001",
 channelId: GENEL,
 authorUserId: BUGRA,
 content:
 "Welcome everyone. The 2025 season is closed, 2026 has begun. This channel is for announcements. Anything social goes in #sohbet, mentor-to-mentor discussions in #mentorlar, technical topics in the sub-team channels. Please keep channel discipline.",
 createdAt: "2025-05-15T09:00:00+03:00",
 },
 {
 localId: "gen-002",
 channelId: GENEL,
 authorUserId: DENIZ,
 content:
 "**Graduation celebration** 🎓\n📍 Halit Narin shop courtyard\n⏰ Saturday May 24, 18:00\nFor the 4 graduating seniors. New folks should come too, you'll get to meet everyone. Each person brings one dish.",
 createdAt: "2025-05-19T10:14:00+03:00",
 },
 {
 localId: "gen-003",
 channelId: GENEL,
 authorUserId: HAKAN,
 content:
 "Summer off-season plan:\n- Early Jul: rookie recruiting STEM Day, waiting on Çerkezköy Kaymakamlığı for the venue approval\n- Late Jul: our own mini-tournament (last year's robot, new captains)\n- Aug: CAD training sprint for newcomers\nDetails next week.",
 createdAt: "2025-06-09T08:31:00+03:00",
 },
 {
 localId: "gen-004",
 channelId: GENEL,
 authorUserId: BUGRA,
 content:
 "**Important — school leave protocol**\nThe leave protocol for the 2025-26 season was signed today with the Halit Narin and Veliköy OSB MTAL (Vocational and Technical Anatolian High School) administrations. Saturday-Sunday plus up to 2 weekdays, without disrupting classes. Sole condition: GPA must not drop.\nIf a student's GPA drops, **we** are the ones who impose a shop ban — that was a unanimous decision in the previous mentor meeting.",
 createdAt: "2025-09-02T19:22:00+03:00",
 },
 {
 localId: "gen-005",
 channelId: GENEL,
 authorUserId: BUGRA,
 content:
 "**School visit — Tekirdağ Anadolu Lisesi**\n📅 Saturday Oct 18\n📍 TAL campus\n⏰ 10:00–13:00\nDemo robot + short presentation. Headcount needed: 6 students + 2 mentors.\nIf you can come, drop a 👍 under this message **by Friday 17:00**.",
 createdAt: "2025-10-13T08:00:00+03:00",
 },
 {
 localId: "gen-006",
 channelId: GENEL,
 authorUserId: ELIF,
 content: "👍 i'm in",
 createdAt: "2025-10-13T08:04:00+03:00",
 replyToLocalId: "gen-005",
 },
 {
 localId: "gen-007",
 channelId: GENEL,
 authorUserId: CAN,
 content: "👍 me too",
 createdAt: "2025-10-13T08:11:00+03:00",
 replyToLocalId: "gen-005",
 },
 {
 localId: "gen-008",
 channelId: GENEL,
 authorUserId: ZEYNEP,
 content: "👍",
 createdAt: "2025-10-13T08:33:00+03:00",
 replyToLocalId: "gen-005",
 },
 {
 localId: "gen-009",
 channelId: GENEL,
 authorUserId: ALI,
 content: "👍 should i bring the pit setup for the demo too? we did a Kaymakamlık-style booth last time and it worked",
 createdAt: "2025-10-13T08:44:00+03:00",
 replyToLocalId: "gen-005",
 },

 // PitOS agent — teach_redirect (cross-channel)
 {
 localId: "gen-010",
 channelId: GENEL,
 authorUserId: null,
 agentGenerated: true,
 agentType: "channel-agent",
 juryReflexKind: "teach_redirect",
 content:
 "The pit setup checklist was standardized in #pit-ekibi last season (Feb 24, 2025 message). Reusing the same template will speed things up and keep your outreach consistent. I've added the link. — PitOS",
 createdAt: "2025-10-13T08:46:00+03:00",
 replyToLocalId: "gen-009",
 },
 {
 localId: "gen-011",
 channelId: GENEL,
 authorUserId: ALI,
 content: "got it pitos thanks 🤖",
 createdAt: "2025-10-13T08:52:00+03:00",
 replyToLocalId: "gen-010",
 },

 // Kickoff watch party
 {
 localId: "gen-012",
 channelId: GENEL,
 authorUserId: DENIZ,
 content:
 "**Jan 15 — Kickoff watch party** 🚀\n📍 Halit Narin shop\n⏰ 21:00 (12:00 ET in the US)\nEveryone brings a dish. Pizza on the team (approved out of the Saray Alüminyum sponsor budget, thanks @Buğra).\nA permission form for parents was shared in gen-013.",
 createdAt: "2026-01-08T14:11:00+03:00",
 },
 {
 localId: "gen-013",
 channelId: GENEL,
 authorUserId: AYSE,
 content:
 "Parental consent form uploaded as PDF (attached). Please print, sign and bring it to the shop **by the evening of Jan 14**. Mandatory for first-year students.",
 createdAt: "2026-01-08T14:34:00+03:00",
 replyToLocalId: "gen-012",
 },
 {
 localId: "gen-014",
 channelId: GENEL,
 authorUserId: DENIZ,
 content:
 "**Build-week calendar (6 weeks)**\n- Week 1 (Jan 10-16): concept, prototyping\n- Week 2 (Jan 17-23): subsystem CAD\n- Week 3 (Jan 24-30): first assembly\n- Week 4 (Jan 31-Feb 6): robot moving\n- Week 5 (Feb 7-13): autonomous + driver practice\n- Week 6 (Feb 14-19): polish, bag/stop-build (if any) or unbag\n\n**Weekday shop hours:** 17:00–22:00\n**Saturday:** 09:00–22:00\n**Sunday:** 13:00–20:00 (not mandatory, mentor's discretion)",
 createdAt: "2026-01-15T10:00:00+03:00",
 },
 {
 localId: "gen-015",
 channelId: GENEL,
 authorUserId: HAKAN,
 content:
 "On the Sunday hours: this was decided in the mentor meeting — **every other Sunday the shop is closed.** Students need room to breathe. No arguments on this one.",
 createdAt: "2026-01-15T10:22:00+03:00",
 replyToLocalId: "gen-014",
 },
 {
 localId: "gen-016",
 channelId: GENEL,
 authorUserId: BUGRA,
 content:
 "Let me also state this clearly: **during exam weeks the shop is optional.** This isn't just me, it's a mentor council decision. We're the ones who have to deal with the fallout if grades drop, so we're getting ahead of it.",
 createdAt: "2026-01-15T10:31:00+03:00",
 replyToLocalId: "gen-014",
 },

 // Comp roster
 {
 localId: "gen-017",
 channelId: GENEL,
 authorUserId: DENIZ,
 content:
 "**Bosphorus Regional roster — draft**\nDriver: Halil İbrahim Öz\nOperator: Ali Öztürk\nHuman player: Eren Şahin\nDrive coach: @Hakan Köse\nPit chief: Zeynep Çelik\nAwards/Judges: Elif Doğan, Merve Taş\nScouting: Can Aydın + 2 newcomers\nMedia: team photographer (Halil İbrahim)\n\nIf you have an objection or suggestion, DM me — not this channel. Locks in Wednesday.",
 createdAt: "2026-02-22T19:00:00+03:00",
 },
 {
 localId: "gen-018",
 channelId: GENEL,
 authorUserId: KAGAN,
 content:
 "Roster looks solid. I agree with Zeynep as pit chief — she was the most systematic on pit logistics last season.",
 createdAt: "2026-02-22T19:14:00+03:00",
 replyToLocalId: "gen-017",
 },

 // Bosphorus — Judges' Award formal
 {
 localId: "gen-019",
 channelId: GENEL,
 authorUserId: BUGRA,
 content:
 "**Bosphorus Regional 2026 — Judges' Award 🏆**\n\nToday the panel presented the Judges' Award to G.O.A.T., the first and only FRC team from the Trakya region of Türkiye. This award wasn't given for robot performance — it was for the team's story, the mentorship model, and our bond with the community.\n\nEveryone contributed. Every student, mentor, sponsor, parent — this is yours.\n\nI'll share a longer write-up on Monday, we're a bit emotional right now 🥹",
 createdAt: "2026-03-15T19:30:00+03:00",
 },
 {
 localId: "gen-020",
 channelId: GENEL,
 authorUserId: AYSE,
 content: "Congratulations team 🎉 This award didn't come overnight, it's a 6-year story.",
 createdAt: "2026-03-15T19:42:00+03:00",
 replyToLocalId: "gen-019",
 },
 {
 localId: "gen-021",
 channelId: GENEL,
 authorUserId: MUSTAFA,
 content: "Congrats 👏 I'm drafting an official letter to the Halit Narin administration, will send Monday.",
 createdAt: "2026-03-15T19:55:00+03:00",
 replyToLocalId: "gen-019",
 },

 // Post-comp recap + agent message #2
 {
 localId: "gen-022",
 channelId: GENEL,
 authorUserId: DENIZ,
 content:
 "**Post-comp recap — summary**\n- 8 matches, 6-2 W-L\n- Quals 4th seed\n- Alliance: picked into the 2nd alliance (capt: 5990)\n- Playoff semifinal\n- **Judges' Award** 🏆\n\nFull analysis drops in #strateji tomorrow evening.",
 createdAt: "2026-03-17T18:00:00+03:00",
 },
 {
 localId: "gen-023",
 channelId: GENEL,
 authorUserId: null,
 agentGenerated: true,
 agentType: "channel-agent",
 juryReflexKind: "teach_redirect",
 content:
 "@Deniz there's a post-comp recap template from last year in #strateji (W-L breakdown + autonomous performance + drivetrain reliability matrix). Reusing the same structure makes season-over-season comparison easier. I've linked it. — PitOS",
 createdAt: "2026-03-17T18:04:00+03:00",
 replyToLocalId: "gen-022",
 },

 // Captain transition
 {
 localId: "gen-024",
 channelId: GENEL,
 authorUserId: HAKAN,
 content:
 "**New season captain selection**\nProcess:\n1) Current captains (Halil & Deniz) propose candidates\n2) Mentor council reviews\n3) Presented to the team — there's a right of objection\n\nCriteria were discussed in #mentorlar — short version: leadership, communication, technical foundation, **team first**.\nAnnounced end of April.",
 createdAt: "2026-04-02T19:30:00+03:00",
 },

 // Heartfelt season-end (Buğra, multi-paragraph, no fluff)
 {
 localId: "gen-025",
 channelId: GENEL,
 authorUserId: BUGRA,
 content:
 "I want to close out this season in writing, because every time I try to say it out loud I cry.\n\nWhen we founded this team in 2019, nobody in Çerkezköy knew what FRC was. Parents asked, 'my kid is going to build robots instead of studying?' Sponsors asked, 'what do we get out of this?' We didn't have a good answer back then. The judges gave the answer this week: the first FRC team from Trakya, one of the few award-winning teams in Türkiye.\n\nBut the real pride isn't the award. The real pride is this: on this team, a 16-year-old student can tell a 50-year-old engineer 'this approach is wrong, here's why' — and the engineer listens. On this team nobody judges you for missing the shop during exam week. On this team you're the person who drapes their jacket over a friend who's passed out at the shop at 02:14.\n\nWhat makes us G.O.A.T. isn't the robot. We make the robot, and the team is exactly how we hold each other up.\n\nI'm not rewriting the team values, because they haven't changed:\n- **Student first.** Exams, health, family — ahead of the robot.\n- **Answer questions with questions.** Don't get tired of asking 'why?'\n- **Purple — equality.** Not just on the logo, but in every door we open.\n- **Firsts in Trakya.** If nobody's done it, we'll do it, then we'll teach others.\n\nTo the graduating ağabeylere/ablalara: we watched you grow up. Come back soon.\nTo those staying: you carry the tradition now, I know its weight.\nTo the newcomers: welcome. There's a lot to ask about.\n\nI'm proud. I'm tired. I'm okay.\n\n— Buğra",
 createdAt: "2026-04-20T22:14:00+03:00",
 },
 {
 localId: "gen-026",
 channelId: GENEL,
 authorUserId: DENIZ,
 content: "🥹",
 createdAt: "2026-04-20T22:18:00+03:00",
 replyToLocalId: "gen-025",
 },
 {
 localId: "gen-027",
 channelId: GENEL,
 authorUserId: HAKAN,
 content: "Exactly that. Co-signed.",
 createdAt: "2026-04-20T22:25:00+03:00",
 replyToLocalId: "gen-025",
 },
 {
 localId: "gen-028",
 channelId: GENEL,
 authorUserId: ELIF,
 content: "Coach Buğra i cried reading it, i always wondered who put their jacket on me at 02:14 in the shop 🥺",
 createdAt: "2026-04-20T22:31:00+03:00",
 replyToLocalId: "gen-025",
 },
 {
 localId: "gen-029",
 channelId: GENEL,
 authorUserId: ALI,
 content: "it was Coach Hakan, i saw him do it once",
 createdAt: "2026-04-20T22:33:00+03:00",
 replyToLocalId: "gen-028",
 },
 {
 localId: "gen-030",
 channelId: GENEL,
 authorUserId: HAKAN,
 content: "ali quiet",
 createdAt: "2026-04-20T22:34:00+03:00",
 replyToLocalId: "gen-029",
 },

 // Summer transition logistics
 {
 localId: "gen-031",
 channelId: GENEL,
 authorUserId: AYSE,
 content:
 "**Summer program — draft**\n- May 8: Exit interviews (mentor + student 1-1)\n- May 15: Graduation & thank-you evening\n- Jun: captain handover, sub-team lead elections\n- Jul: rookie recruiting + STEM Day\n\nCalendar coming soon.",
 createdAt: "2026-04-22T11:00:00+03:00",
 },
 {
 localId: "gen-032",
 channelId: GENEL,
 authorUserId: ZEYNEP,
 content: "Will Coach Yağız be running the summer CAD training again this year? Last year was great.",
 createdAt: "2026-04-22T11:14:00+03:00",
 replyToLocalId: "gen-031",
 },
 {
 localId: "gen-033",
 channelId: GENEL,
 authorUserId: YAGIZ,
 content: "I will, we'll talk once the calendar's set. We need to start at 09:00 on Saturday mornings, simit's on me 🥯",
 createdAt: "2026-04-22T11:22:00+03:00",
 replyToLocalId: "gen-032",
 },
 {
 localId: "gen-034",
 channelId: GENEL,
 authorUserId: DENIZ,
 content:
 "**Season closing evening**\n📅 Friday May 8\n📍 Halit Narin shop + courtyard\n⏰ 19:00\n- Exit interviews throughout the day (individual slots)\n- 19:00 shared dinner\n- Graduates will give speeches\n- New captain announcement\nTo attend, fill out the RSVP form (link from Ayşe).",
 createdAt: "2026-04-23T17:00:00+03:00",
 },
 {
 localId: "gen-035",
 channelId: GENEL,
 authorUserId: AYSE,
 content: "RSVP form is live, please fill it in by Friday 17:00 — I'll plan the shopping list around the headcount.",
 createdAt: "2026-04-23T17:14:00+03:00",
 replyToLocalId: "gen-034",
 },

 // ───────────────────────────────────────────────────────────────────────
 // #mentorlar — private, candid, NO agent messages
 // ───────────────────────────────────────────────────────────────────────
 {
 localId: "men-001",
 channelId: MENTOR,
 authorUserId: BUGRA,
 content:
 "This channel is mentor-only. Students don't read here. Let's talk openly — especially about student wellbeing, sponsor strategy, and disagreements between us.",
 createdAt: "2025-05-15T09:30:00+03:00",
 },
 {
 localId: "men-002",
 channelId: MENTOR,
 authorUserId: HAKAN,
 content:
 "First item: in the 2025 season Z. (student) was seriously burnt out by the end of build-week. I spoke with the parent — academic grades dropped. We need to spread her workload differently this season. Details at the meeting.",
 createdAt: "2025-05-19T20:11:00+03:00",
 },
 {
 localId: "men-003",
 channelId: MENTOR,
 authorUserId: AYSE,
 content:
 "Agreed. Let's make it a general policy: the 2 weeks before exam weeks the shop is **optional**. If any mentor pushes back on a student over this, send them straight to me, I'll handle it.",
 createdAt: "2025-05-19T20:23:00+03:00",
 replyToLocalId: "men-002",
 },
 {
 localId: "men-004",
 channelId: MENTOR,
 authorUserId: BUGRA,
 content:
 "Done. Policy is clear: **during exam periods the shop is optional, no pressure.** I'll write this clearly to the students in #genel — let's be transparent, but the discussion itself stays in this channel.",
 createdAt: "2025-05-19T20:31:00+03:00",
 replyToLocalId: "men-003",
 },

 // Sponsor diplomacy
 {
 localId: "men-005",
 channelId: MENTOR,
 authorUserId: BUGRA,
 content:
 "Sponsor topic — Boeing is considering a 30% budget bump this year, but in return they want a logo on the front of the robot **bigger than Siemens'**. Per our brand guide, Siemens is the main sponsor and no logo can be larger than theirs. We need a diplomatic way out.",
 createdAt: "2025-09-08T14:11:00+03:00",
 },
 {
 localId: "men-006",
 channelId: MENTOR,
 authorUserId: KAGAN,
 content:
 "I'd frame it like this: 'Because Siemens is the main sponsor, the size hierarchy is contractually fixed. We can offer Boeing different visibility surfaces — pit area wall, team banner, scouting tablet covers.' That way we keep the Siemens hierarchy intact while still creating value for Boeing.",
 createdAt: "2025-09-08T14:33:00+03:00",
 replyToLocalId: "men-005",
 },
 {
 localId: "men-007",
 channelId: MENTOR,
 authorUserId: AYSE,
 content:
 "Kağan's framing is right. We could also tell Boeing: 'instead of logo size, give them a panel slot — a featured page in our annual report with a photo.' For their visibility metrics a page in the report is worth more than square meters of vinyl.",
 createdAt: "2025-09-08T14:48:00+03:00",
 replyToLocalId: "men-006",
 },
 {
 localId: "men-008",
 channelId: MENTOR,
 authorUserId: BUGRA,
 content:
 "Okay. Kağan and I will go to the Boeing meeting. Proposed package: pit area + scouting covers + an annual report page, robot logo stays smaller than Siemens'. Decision in writing: **the main-sponsor logo hierarchy is non-negotiable; we offer alternative visibility instead.**",
 createdAt: "2025-09-08T15:02:00+03:00",
 replyToLocalId: "men-007",
 },

 // University recommendation letters coordination
 {
 localId: "men-009",
 channelId: MENTOR,
 authorUserId: HAKAN,
 content:
 "3 of our graduating students are asking for university recommendation letters. Halil İbrahim — applying to Bilkent ME, Ali — Sabancı CS, Zeynep — Boğaziçi EE.\nWho can write which? Let's coordinate so we don't overlap.",
 createdAt: "2025-11-14T09:00:00+03:00",
 },
 {
 localId: "men-010",
 channelId: MENTOR,
 authorUserId: BUGRA,
 content:
 "I'll write Halil İbrahim's — we've worked together for 4 years, I know his technical growth best. Kağan, can you take Ali's? It has a CS angle.\n@Yağız Engin, for Zeynep an EE perspective from you would be ideal.",
 createdAt: "2025-11-14T09:14:00+03:00",
 replyToLocalId: "men-009",
 },
 {
 localId: "men-011",
 channelId: MENTOR,
 authorUserId: KAGAN,
 content: "Got it, I'll take Ali. I'll have it ready by mid-December.",
 createdAt: "2025-11-14T09:22:00+03:00",
 replyToLocalId: "men-010",
 },
 {
 localId: "men-012",
 channelId: MENTOR,
 authorUserId: YAGIZ,
 content: "I've got Zeynep. I'll also have her add the technical writeup of her EE project to her portfolio — strengthens the application.",
 createdAt: "2025-11-14T09:31:00+03:00",
 replyToLocalId: "men-010",
 },

 // Mentor coverage rotation — build week
 {
 localId: "men-013",
 channelId: MENTOR,
 authorUserId: AYSE,
 content:
 "**Build-week mentor rotation**\n6 weeks x avg 5 shop days = 30 shifts. Each mentor min 2, max 6. Nobody comes every day — let's not burn out.\nI have the Google sheet, link via DM. Pick your slots by Wednesday 17:00.",
 createdAt: "2026-01-05T12:00:00+03:00",
 },
 {
 localId: "men-014",
 channelId: MENTOR,
 authorUserId: MEHMET,
 content:
 "I'll be abroad for two weeks in February so I can't take those weeks. To make up for it, I'll take extra shifts the first week of March for scouting training.",
 createdAt: "2026-01-05T12:14:00+03:00",
 replyToLocalId: "men-013",
 },
 {
 localId: "men-015",
 channelId: MENTOR,
 authorUserId: FATMA,
 content: "I have an exam week Jan 27-Feb 3 (university), I'm out that stretch. I'll take 4 shifts across the other weeks.",
 createdAt: "2026-01-05T12:21:00+03:00",
 replyToLocalId: "men-013",
 },
 {
 localId: "men-016",
 channelId: MENTOR,
 authorUserId: BUGRA,
 content:
 "Official decision: **mentor rotation runs through the sheet, everyone commits at least 2 weeks in advance, and we set up a backup mentor chain for last-minute changes** (Hakan → Kağan → Yağız → me).",
 createdAt: "2026-01-05T12:33:00+03:00",
 replyToLocalId: "men-013",
 },

 // Student wellbeing — quiet mentor intervention
 {
 localId: "men-017",
 channelId: MENTOR,
 authorUserId: HAKAN,
 content:
 "One of the students has been visibly tense this week. I saw them crying twice at the shop (quietly, in their own corner). I know the home situation — the family is having financial difficulties. I'm quietly reducing their workload this month, please don't say anything to anyone. I pulled them off the critical build-week task and put them on scouting.",
 createdAt: "2026-02-04T22:00:00+03:00",
 },
 {
 localId: "men-018",
 channelId: MENTOR,
 authorUserId: BUGRA,
 content:
 "Right move. One note: nobody should say 'they got an easier job.' Hakan, share this with the pit chief / drive coach side too so they don't visibly react to the workload change either.",
 createdAt: "2026-02-04T22:08:00+03:00",
 replyToLocalId: "men-017",
 },
 {
 localId: "men-019",
 channelId: MENTOR,
 authorUserId: AYSE,
 content:
 "I called the parent — used the FRC permission form as a pretext to ask how the family is holding up. They're really grateful right now, but I didn't bring up the financial side. If needed, we can support meals/transport from the team fund — I'll book it under 'training materials' in the year-end report so it doesn't show up.",
 createdAt: "2026-02-04T22:21:00+03:00",
 replyToLocalId: "men-018",
 },
 {
 localId: "men-020",
 channelId: MENTOR,
 authorUserId: BUGRA,
 content:
 "Approved. **Decision: in case of need, mentor council majority can authorize spending from the team fund for quiet student support.** Per our usual practice we don't write up the details — this is sensitive ground.",
 createdAt: "2026-02-04T22:30:00+03:00",
 replyToLocalId: "men-019",
 },

 // Conflict resolution
 {
 localId: "men-021",
 channelId: MENTOR,
 authorUserId: KAGAN,
 content:
 "I need to raise something — there's tension between software and mechanical this week. Software asked for a sensor mount tolerance for the swerve odometry, mechanical said 'we already did it that way,' but when I checked, the mount is out of tolerance. The mechanical student is being defensive about it. I shouldn't get personally involved because I'm on the software side. @Hakan @Buğra can one of you talk to them?",
 createdAt: "2026-02-09T19:00:00+03:00",
 },
 {
 localId: "men-022",
 channelId: MENTOR,
 authorUserId: HAKAN,
 content:
 "I'll talk to them. I'll work off measurement data, not blame the mechanical student. It's not an ego issue — it's a 'measure and redo' issue, I'll make that clear. Tomorrow at the shop at 10:00.",
 createdAt: "2026-02-09T19:11:00+03:00",
 replyToLocalId: "men-021",
 },
 {
 localId: "men-023",
 channelId: MENTOR,
 authorUserId: BUGRA,
 content:
 "I trust Hakan on this. One note: regardless of the outcome, the mechanical student needs the right setting to be able to say 'I was wrong first.' Talk behind closed doors, not in front of others. We want to fix the measurement without bruising their pride.",
 createdAt: "2026-02-09T19:22:00+03:00",
 replyToLocalId: "men-022",
 },
 {
 localId: "men-024",
 channelId: MENTOR,
 authorUserId: HAKAN,
 content:
 "Resolved. The student came to it themselves and said 'let me measure again,' and once it came back out of tolerance, they redid the assembly. No ego damage — software actually said 'thanks bro.' Mentorship win.",
 createdAt: "2026-02-10T13:14:00+03:00",
 replyToLocalId: "men-023",
 },

 // Build-week burnout — the half-day off, behind the scenes
 {
 localId: "men-025",
 channelId: MENTOR,
 authorUserId: AYSE,
 content:
 "The kids are exhausted this week. The 02:14 photos aren't a joke anymore, they're real. My suggestion: close the shop after 15:00 this Saturday and cancel Sunday entirely. The robot won't collapse in a day — we will.",
 createdAt: "2026-02-13T18:00:00+03:00",
 },
 {
 localId: "men-026",
 channelId: MENTOR,
 authorUserId: BUGRA,
 content:
 "Approved. I'm posting the announcement to #genel now. The important thing is that it goes out as a **mentor council decision**, not one mentor's call — otherwise tomorrow some student will say 'but Coach Yağız said Sunday is open.'",
 createdAt: "2026-02-13T18:14:00+03:00",
 replyToLocalId: "men-025",
 },
 {
 localId: "men-027",
 channelId: MENTOR,
 authorUserId: YAGIZ,
 content: "You've got my approval too, I'll be home Sunday. Just don't let Eren into the shop 😅",
 createdAt: "2026-02-13T18:18:00+03:00",
 replyToLocalId: "men-026",
 },

 // Bosphorus pre-comp + post-comp debrief
 {
 localId: "men-028",
 channelId: MENTOR,
 authorUserId: BUGRA,
 content:
 "Mental note before Bosphorus: I'm prepping Halil İbrahim 1-1 for the judges presentation. My concern — will he get the shakes on stage? Specific worry: when judges ask for 'Impact metrics,' he needs to fire numbers back. Last season he said 'I don't know' and we lost points there.",
 createdAt: "2026-03-08T20:00:00+03:00",
 },
 {
 localId: "men-029",
 channelId: MENTOR,
 authorUserId: HAKAN,
 content:
 "Halil İbrahim has come a long way in the last 2 months. Let's run mock interviews — I'll play hard-judge, you play soft. He needs to learn how to handle conflict.",
 createdAt: "2026-03-08T20:14:00+03:00",
 replyToLocalId: "men-028",
 },
 {
 localId: "men-030",
 channelId: MENTOR,
 authorUserId: BUGRA,
 content:
 "Judges' Award is in 🏆 Now I'm thinking, what didn't get us this award:\n- Robot performance (we were mid-tier)\n- Budget (sponsor numbers below average)\n\nAnd what did:\n- The 'first in Trakya' story\n- The purple-as-equality narrative (Halil İbrahim told the judges 'we use purple because 42% of our students are girls' and the judges paused)\n- 6 years of consistent outreach as evidence (annual report pages, MEB protocol, BSH partnership)\n- Alumni connection (3 alumni sent video messages to the judges — that hit hard)\n\nI'll share this with the students Monday. Tonight let's just talk about how we feel — honestly, I'm still a bit shaken.",
 createdAt: "2026-03-15T22:00:00+03:00",
 },
 {
 localId: "men-031",
 channelId: MENTOR,
 authorUserId: AYSE,
 content:
 "Buğra, do you remember 6 years ago when we sat down to talk about whether this team could even exist? You said, 'it can, because someone has to start.' Well, here we are. You've earned the right to cry tonight.",
 createdAt: "2026-03-15T22:08:00+03:00",
 replyToLocalId: "men-030",
 },
 {
 localId: "men-032",
 channelId: MENTOR,
 authorUserId: KAGAN,
 content:
 "One more note on the award — the MEB protocol and the BSH partnership were submitted to the judges as written evidence. We put extra time into that paperwork and it paid off. Going into next season, the alumni video collection process needs the same discipline — let's start in September.",
 createdAt: "2026-03-15T22:21:00+03:00",
 replyToLocalId: "men-030",
 },

 // Captain succession criteria
 {
 localId: "men-033",
 channelId: MENTOR,
 authorUserId: BUGRA,
 content:
 "Let's get clear on the new captain criteria:\n1) **Leadership:** can read the team, no individual ego\n2) **Communication:** can switch register across mentor + student + sponsor layers\n3) **Technical foundation:** enough to understand every sub-team, even if not expert in any\n4) **Team first:** under pressure, says 'this is what's right for the team'\n\nCandidates: Deniz (current), Elif, Ali. I'll do the 1-1s. Decision with the mentor council.",
 createdAt: "2026-04-05T18:00:00+03:00",
 },
 {
 localId: "men-034",
 channelId: MENTOR,
 authorUserId: HAKAN,
 content:
 "Agree on the criteria. One addition: **burnout management**. The last 2 seasons captains burned out in March. The new captain has to be able to name their own limit and hand off without resisting it.",
 createdAt: "2026-04-05T18:14:00+03:00",
 replyToLocalId: "men-033",
 },
 {
 localId: "men-035",
 channelId: MENTOR,
 authorUserId: AYSE,
 content:
 "Approved. Writing it up: **'ability to communicate one's own limit + not refuse to hand off' added to the captain criteria.** Let's tell the candidates this explicitly so it isn't a surprise.",
 createdAt: "2026-04-05T18:25:00+03:00",
 replyToLocalId: "men-034",
 },

 // Final mentor reflection
 {
 localId: "men-036",
 channelId: MENTOR,
 authorUserId: BUGRA,
 content:
 "You saw the season-end message I posted in #genel. Here's the thing I couldn't say there: the decision I'm proudest of this year was making exam weeks optional rather than required — Ayşe's suggestion. We chose the kid over the trophy. Order matters.\n\nGoing into next season: same policy, same transparency, same discipline. Where's the new ground? Captain succession + the mentor rotation sheet + the quiet student-support protocol — these are now institution.\n\nGlad you're here.",
 createdAt: "2026-04-21T08:30:00+03:00",
 },
 {
 localId: "men-037",
 channelId: MENTOR,
 authorUserId: HAKAN,
 content: "Mentor dinner next Saturday — Ayşe's place in Veliköy, sound good? Spouses welcome.",
 createdAt: "2026-04-21T08:42:00+03:00",
 replyToLocalId: "men-036",
 },
 {
 localId: "men-038",
 channelId: MENTOR,
 authorUserId: AYSE,
 content: "We're in, door's open. Tell me who's bringing what so I can plan the shopping accordingly.",
 createdAt: "2026-04-21T09:00:00+03:00",
 replyToLocalId: "men-037",
 },
 {
 localId: "men-039",
 channelId: MENTOR,
 authorUserId: KAGAN,
 content: "I'll handle the meat. Yağız brings simit, obviously 🥯",
 createdAt: "2026-04-21T09:14:00+03:00",
 replyToLocalId: "men-038",
 },
 {
 localId: "men-040",
 channelId: MENTOR,
 authorUserId: YAGIZ,
 content: "Simit + olives + cheese. Season hasn't changed.",
 createdAt: "2026-04-21T09:18:00+03:00",
 replyToLocalId: "men-039",
 },
 ],

 // ─────────────────────────────────────────────────────────────────────────
 // Tasks (mostly logistics)
 // ─────────────────────────────────────────────────────────────────────────
 tasks: [
 {
 localId: "tsk-team-001",
 channelId: GENEL,
 title: "TAL school visit headcount confirmation + permission forms",
 description:
 "Oct 18 Tekirdağ Anadolu Lisesi demo: 6 students + 2 mentors confirmed, MEB permission form delivered to school administrations.",
 assignedToUserId: DENIZ,
 assignedByUserId: BUGRA,
 createdViaLocalMessageId: "gen-005",
 deadline: "2025-10-17T17:00:00+03:00",
 status: "done",
 completedAt: "2025-10-17T16:42:00+03:00",
 createdAt: "2025-10-13T08:01:00+03:00",
 },
 {
 localId: "tsk-team-002",
 channelId: GENEL,
 title: "Collect parental consent forms (kickoff watch party)",
 description: "Get signed parental consent forms physically delivered to the shop from first-year students.",
 assignedToUserId: AYSE,
 assignedByUserId: BUGRA,
 createdViaLocalMessageId: "gen-013",
 deadline: "2026-01-14T22:00:00+03:00",
 status: "done",
 completedAt: "2026-01-14T20:12:00+03:00",
 createdAt: "2026-01-08T14:35:00+03:00",
 },
 {
 localId: "tsk-team-003",
 channelId: GENEL,
 title: "Bosphorus roster final lock + alliance partner outreach prep",
 description: "Roster locks Wednesday. Final list shared with #seyahat and #pit-ekibi.",
 assignedToUserId: DENIZ,
 assignedByUserId: BUGRA,
 createdViaLocalMessageId: "gen-017",
 deadline: "2026-02-25T23:00:00+03:00",
 status: "done",
 completedAt: "2026-02-25T21:30:00+03:00",
 createdAt: "2026-02-22T19:01:00+03:00",
 },
 {
 localId: "tsk-team-004",
 channelId: MENTOR,
 title: "Boeing logo hierarchy meeting",
 description:
 "Monday with the Boeing CSR team: present the alternative package — pit area + scouting covers + annual report page. Robot logo must stay smaller than Siemens'.",
 assignedToUserId: BUGRA,
 assignedByUserId: BUGRA,
 createdViaLocalMessageId: "men-008",
 deadline: "2025-09-22T18:00:00+03:00",
 status: "done",
 completedAt: "2025-09-22T17:20:00+03:00",
 createdAt: "2025-09-08T15:03:00+03:00",
 },
 {
 localId: "tsk-team-005",
 channelId: MENTOR,
 title: "University recommendation letters delivery",
 description: "Written recommendation letters for Halil İbrahim (Bilkent ME), Ali (Sabancı CS), Zeynep (Boğaziçi EE).",
 assignedToUserId: BUGRA,
 assignedByUserId: HAKAN,
 createdViaLocalMessageId: "men-009",
 deadline: "2025-12-15T23:59:00+03:00",
 status: "done",
 completedAt: "2025-12-12T22:00:00+03:00",
 createdAt: "2025-11-14T09:01:00+03:00",
 },
 {
 localId: "tsk-team-006",
 channelId: MENTOR,
 title: "Lock the build-week mentor rotation sheet",
 description: "30 shifts, each mentor min 2 max 6. Wednesday 17:00 deadline, then auto-assigned slots.",
 assignedToUserId: AYSE,
 assignedByUserId: AYSE,
 createdViaLocalMessageId: "men-013",
 deadline: "2026-01-07T17:00:00+03:00",
 status: "done",
 completedAt: "2026-01-07T16:48:00+03:00",
 createdAt: "2026-01-05T12:01:00+03:00",
 },
 {
 localId: "tsk-team-007",
 channelId: GENEL,
 title: "Captain succession 1-1 interviews",
 description: "Half-hour 1-1s with Deniz, Elif, Ali; criteria list reviewed. Report back to mentor council.",
 assignedToUserId: BUGRA,
 assignedByUserId: HAKAN,
 createdViaLocalMessageId: "men-033",
 deadline: "2026-04-25T23:59:00+03:00",
 status: "in_progress",
 createdAt: "2026-04-05T18:01:00+03:00",
 },
 {
 localId: "tsk-team-008",
 channelId: GENEL,
 title: "Publish summer CAD training calendar",
 description: "Coach With Yağız, a 6-week Saturday-morning CAD sprint calendar — simit included.",
 assignedToUserId: YAGIZ,
 assignedByUserId: AYSE,
 createdViaLocalMessageId: "gen-033",
 deadline: "2026-05-10T18:00:00+03:00",
 status: "open",
 createdAt: "2026-04-22T11:23:00+03:00",
 },
 ],

 // ─────────────────────────────────────────────────────────────────────────
 // Decisions (with rationale)
 // ─────────────────────────────────────────────────────────────────────────
 decisions: [
 {
 localId: "dec-team-001",
 sourceLocalMessageId: "men-004",
 decision: "Shop attendance during exam weeks is optional; mentor pressure is prohibited.",
 rationale:
 "By the end of the 2025 season at least 2 students saw a clear drop in academic grades. If the team's academic standing erodes, family + school support follows over the long run. Announced in #genel for transparency.",
 alternativesConsidered:
 "Shortening shop hours during exam weeks (insufficient — some students still feel obligated); per-student exemptions (would look discriminatory politically).",
 contextAtTime:
 "Start-of-season setup; the year-end 2025 review of student wellbeing policies.",
 decidedAt: "2025-05-19T20:35:00+03:00",
 },
 {
 localId: "dec-team-002",
 sourceLocalMessageId: "men-008",
 decision:
 "The main-sponsor logo hierarchy (Siemens > others) is non-negotiable; sponsors are offered an alternative visibility package (pit area, scouting covers, annual report page).",
 rationale:
 "The brand guide is a measurable consistency cue for the judges' Impact narrative. Breaking the logo hierarchy would erode trust with the main sponsor. Visibility grows more from storytelling than from square meters.",
 alternativesConsidered:
 "Enlarging Boeing's logo in exchange for a 30% budget increase (rejected — damages the Siemens relationship); rejecting the budget bump (unnecessary — the alternative package preserves both money and hierarchy).",
 contextAtTime:
 "September 2025 sponsor cultivation period; Boeing offer arrives in year 2 of the Siemens main sponsorship contract.",
 decidedAt: "2025-09-08T15:02:00+03:00",
 },
 {
 localId: "dec-team-003",
 sourceLocalMessageId: "gen-015",
 decision: "Through build-week, the shop is closed every other Sunday.",
 rationale:
 "In a 6-week build cycle, uninterrupted work leads to burnout by week 4 (per 2024 and 2025 data). A Sunday off also protects students' academic balance.",
 alternativesConsidered:
 "Open every Sunday but shorter (insufficient rest); closed every Sunday (build velocity risk in weeks 4-6).",
 contextAtTime: "Build-week calendar announcement, after the January 2026 kickoff.",
 decidedAt: "2026-01-15T10:22:00+03:00",
 },
 {
 localId: "dec-team-004",
 sourceLocalMessageId: "men-016",
 decision:
 "Build-week mentor rotation runs through a Google Sheet with at least 2-week advance commitment; backup mentor chain for last-minute changes (Hakan → Kağan → Yağız → Buğra).",
 rationale:
 "Mentor burnout precedes student burnout; without rotation the lead mentor (Buğra) ends up taking most shifts. The sheet + backup chain provides predictability.",
 alternativesConsidered:
 "Ad-hoc WhatsApp coordination (failed last season); forced equal split (disrespectful to mentors' personal calendars).",
 contextAtTime: "Start of the January 2026 build-week, mentor capacity planning.",
 decidedAt: "2026-01-05T12:33:00+03:00",
 },
 {
 localId: "dec-team-005",
 sourceLocalMessageId: "men-020",
 decision:
 "Quiet student-support protocol: in case of need, a mentor council majority can authorize student support spending (food, transport) from the team fund; reported under the 'training materials' line item.",
 rationale:
 "Quiet support must be possible without bruising the family's dignity. To prevent abuse, majority approval is required.",
 alternativesConsidered:
 "An explicit 'scholarship' program (stigmatizing); not providing support (unethical, against team values).",
 contextAtTime: "Mid-build-week February 2026, policy formed off a concrete student situation.",
 decidedAt: "2026-02-04T22:30:00+03:00",
 },
 {
 localId: "dec-team-006",
 sourceLocalMessageId: "men-035",
 decision:
 "New captain criteria: leadership, communication (3 layers: mentor/student/sponsor), technical foundation, team first, **ability to communicate one's own limit + not refuse to hand off**.",
 rationale:
 "The last two seasons, captains burned out in March and didn't hand off. Without making burnout management an explicit criterion, the same pattern repeats.",
 alternativesConsidered:
 "Only technical + leadership (incomplete — see 2024 and 2025 examples); appointment instead of selection (against team culture).",
 contextAtTime: "Start of the April 2026 captain succession process.",
 decidedAt: "2026-04-05T18:25:00+03:00",
 },
 ],
};
