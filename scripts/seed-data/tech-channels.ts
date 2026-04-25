import type { SeedGroup } from "./types";

/**
 * Tech-side channels for FRC #8092 G.O.A.T.
 * - #yazilim (cfb326d5-...) software / vision / autonomous
 * - #strateji (4768c6cc-...) game analysis / alliance criteria
 * - #scouting (c635757e-...) opponent data / pick list
 *
 * Voice: TR primary with English jargon (PathPlanner, Limelight, swerve, PID, OPR).
 * Time window: 2025-05-15 → 2026-04-25.
 */

// --- User UUIDs (from CONTEXT.md) ---
const U = {
 // mentors
 bugraReal: "aad122b8-7776-42c4-b9d7-51b6aa3ecf67",
 hakan: "18cb0c6b-5104-421d-a71c-828f2867c479",
 mustafa: "396129f5-b56a-4eff-94e9-d6ef051bcc01",
 ayse: "2ac6551e-a2b4-4698-a73e-604bcaff5225",
 mehmet: "f36056dd-998e-4048-a67a-43b54540bd2e",
 fatma: "e19b8805-8559-44db-8251-f640a519e3e2",
 kagan: "d5f5c1f1-59dc-4c58-ba1e-5ed213490492",
 yagiz: "77c39129-e3dd-4586-ba7f-91cf405766dc",
 bugraSeed: "ac1f9dc9-1727-4544-9cb3-f7ab8aa4f4be",
 // captain + students
 deniz: "69af37aa-117c-4e1c-a330-968ee1bd0982",
 ali: "9b049271-118e-446a-a624-7623fc9f9206",
 zeynep: "8590cff9-8649-4448-a4f6-a8d72ad45885",
 can: "404e74a7-ceaa-4f79-b7c9-bcf347151613",
 elif: "2de90e33-54ce-43f3-af8e-66ce82d5b2bf",
 eren: "db5376b7-cd4a-46af-a2ca-98a01b25c9de",
 merve: "8297b7d3-0d1e-42b9-a579-ba6414bb0a94",
} as const;

// --- Channel UUIDs ---
const CH = {
 yazilim: "cfb326d5-39f6-4b04-b7c7-1fffb04172d1",
 strateji: "4768c6cc-826e-481d-ac41-ec334070a933",
 scouting: "c635757e-6a53-4d1f-8607-d2a0b85e96e1",
} as const;

export const group: SeedGroup = {
 groupName: "tech",

 messages: [
 // =====================================================================
 // #yazilim — Limelight vs PhotonVision (Aug 2025)
 // =====================================================================
 {
 localId: "yz-001",
 channelId: CH.yazilim,
 authorUserId: U.eren,
 content:
 "I want to rebuild the vision pipeline from scratch for off-season. Last year we wrestled with Limelight 2+ but AprilTag detection latency was hovering around ~80ms. I'm proposing we move to PhotonVision and use an Orange Pi 5 as the co-processor.",
 createdAt: "2025-08-14T15:12:00.000Z",
 },
 {
 localId: "yz-002",
 channelId: CH.yazilim,
 authorUserId: U.can,
 content: "Do we have an Orange Pi 5 in stock? Last time the Pi 4 was choking on MJPEG decode.",
 createdAt: "2025-08-14T15:18:00.000Z",
 replyToLocalId: "yz-001",
 },
 {
 localId: "yz-003",
 channelId: CH.yazilim,
 authorUserId: U.eren,
 content:
 "Ali ordered 2 of them last month, came in through the Çetin Group sponsorship. We can use one for testing. We don't have the budget for Limelight 3 anyway — PhotonVision + Orange Pi runs about 3000 TL, Limelight 3 is around 25k TL.",
 createdAt: "2025-08-14T15:24:00.000Z",
 replyToLocalId: "yz-002",
 },
 {
 localId: "yz-004",
 channelId: CH.yazilim,
 authorUserId: U.kagan,
 content:
 "The cost argument is solid, but let's not decide before we measure latency and reliability. Let's test both systems with the same AprilTag set for 30 minutes and log frame rate and detection distance. Tomorrow we'll set up a bench in the workshop.",
 createdAt: "2025-08-14T15:41:00.000Z",
 replyToLocalId: "yz-003",
 },
 {
 localId: "yz-005",
 channelId: CH.yazilim,
 authorUserId: null,
 agentGenerated: true,
 agentType: "channel-agent",
 juryReflexKind: "proof_demand",
 content:
 "You're making the vision pipeline call here — this is gold for your end-of-season Impact narrative. Could you put the tested distances (1m, 3m, 5m), tag size, lighting conditions, and average/p95 latency into a table? I'll wire that data into the `decisions` module. — PitOS",
 createdAt: "2025-08-14T15:55:00.000Z",
 replyToLocalId: "yz-004",
 },
 {
 localId: "yz-006",
 channelId: CH.yazilim,
 authorUserId: U.eren,
 content:
 "Test results are in. Same AprilTag (8\" size), workshop lighting:\n\n```\nLimelight 2+ avg 78ms p95 112ms max range 4.8m\nPhotonVision/OPi5 avg 31ms p95 48ms max range 5.4m\n```\n\nPhotonVision is the clear winner. Only downside: we have to write our own NetworkTables config — none of the UI tooling Limelight gives you.",
 createdAt: "2025-08-15T17:30:00.000Z",
 replyToLocalId: "yz-005",
 },
 {
 localId: "yz-007",
 channelId: CH.yazilim,
 authorUserId: U.kagan,
 content:
 "Alright, we're moving to PhotonVision. @Eren you're pipeline lead, @Can help out on the NetworkTables side. Write up the README at `docs/vision-setup.md` — for next year's team, that's the most critical piece of institutional knowledge we can leave behind.",
 createdAt: "2025-08-15T17:42:00.000Z",
 replyToLocalId: "yz-006",
 },
 {
 localId: "yz-008",
 channelId: CH.yazilim,
 authorUserId: U.eren,
 content: "Got it 🚀 Setup + docs will be ready by the weekend.",
 createdAt: "2025-08-15T17:44:00.000Z",
 replyToLocalId: "yz-007",
 },

 // -------- GitHub branching discipline drama (Sep 2025) --------
 {
 localId: "yz-009",
 channelId: CH.yazilim,
 authorUserId: U.can,
 content:
 "Folks, please stop pushing directly to `main`. I was testing swerve module calibration today and the robot wouldn't drive all day because of a change that came in from Eren's vision branch. We need to switch to PR + review.",
 createdAt: "2025-09-08T19:02:00.000Z",
 },
 {
 localId: "yz-010",
 channelId: CH.yazilim,
 authorUserId: U.eren,
 content: "you're right, sorry — I meant to open a branch and forgot 😅",
 createdAt: "2025-09-08T19:05:00.000Z",
 replyToLocalId: "yz-009",
 },
 {
 localId: "yz-011",
 channelId: CH.yazilim,
 authorUserId: U.kagan,
 content:
 "This issue keeps coming back every season. Let's write the rules down and lock them in:\n\n1. `main` is protected — merge only via PR\n2. Feature branch naming: `feat/vision-photon`, `fix/can-deadlock`, `chore/...`\n3. Every PR needs at least 1 review (mentor approval not required, but cross-review between 2 students)\n4. In the 48 hours before a competition, **only** bug fixes can merge — features are frozen\n\nI'll protect `main` from the GitHub repo settings.",
 createdAt: "2025-09-08T19:28:00.000Z",
 replyToLocalId: "yz-010",
 },
 {
 localId: "yz-012",
 channelId: CH.yazilim,
 authorUserId: U.deniz,
 content: "Let's announce these rules in #genel too, so the electrical/mechanical side knows the merge process.",
 createdAt: "2025-09-08T19:35:00.000Z",
 replyToLocalId: "yz-011",
 },
 {
 localId: "yz-013",
 channelId: CH.yazilim,
 authorUserId: U.can,
 content: "👍",
 createdAt: "2025-09-08T19:36:00.000Z",
 replyToLocalId: "yz-012",
 },

 // -------- Off-season Onshape vault drift (Oct 2025) --------
 {
 localId: "yz-014",
 channelId: CH.yazilim,
 authorUserId: U.eren,
 content:
 "I opened a draft `2026-bot` repo branch for pre-kickoff codebase cleanup. Bumped WPILib from `2025.3.2` to `2026.1.0` — it's beta-1 but the docs are solid. CommandBased structure is unchanged.",
 createdAt: "2025-10-22T16:08:00.000Z",
 },
 {
 localId: "yz-015",
 channelId: CH.yazilim,
 authorUserId: U.kagan,
 content:
 "Let's not push WPILib 2026 beta into production until kickoff. There's a breaking YAGSL swerve config change coming in the beta — rolling that back later would be painful. Stable release drops mid-December.",
 createdAt: "2025-10-22T16:24:00.000Z",
 replyToLocalId: "yz-014",
 },
 {
 localId: "yz-016",
 channelId: CH.yazilim,
 authorUserId: U.eren,
 content: "Got it, I'll keep the beta on a sandbox branch.",
 createdAt: "2025-10-22T16:26:00.000Z",
 replyToLocalId: "yz-015",
 },

 // =====================================================================
 // #strateji — Off-season scrim cycle-time (Sep 2025)
 // =====================================================================
 {
 localId: "str-001",
 channelId: CH.strateji,
 authorUserId: U.deniz,
 content:
 "We wrapped the İstanbul off-season scrim, played 5 matches. Raw data:\n\n- Cycle time avg: **18.4s** (target was <14s)\n- Auton score: 11/15 possible\n- Endgame climb: 2/5 successful\n\nVideo recordings are on Drive under `8092/2025-offseason/istanbul/`. Should we review Friday at 19:00?",
 createdAt: "2025-09-20T20:15:00.000Z",
 },
 {
 localId: "str-002",
 channelId: CH.strateji,
 authorUserId: U.hakan,
 content:
 "What was the cycle time target exactly? Where did 14s come from? Last year our average was around 16, top-tier teams were running 11–12. Is 14 a realistic target or did we pick it arbitrarily? Let's pin this down — it'll be the foundation of our strategy DNA at the start of the season.",
 createdAt: "2025-09-20T20:38:00.000Z",
 replyToLocalId: "str-001",
 },
 {
 localId: "str-003",
 channelId: CH.strateji,
 authorUserId: U.deniz,
 content:
 "Fair question. I pulled it from last year's championship match data — at Bosphorus the winning alliance averaged 13.2, finalist alliance 14.8. So 14s = finals level. If we want to win the championship, we need to be under 12.",
 createdAt: "2025-09-20T20:44:00.000Z",
 replyToLocalId: "str-002",
 },
 {
 localId: "str-004",
 channelId: CH.strateji,
 authorUserId: U.yagiz,
 content:
 "Friday 19:00 works. For video review I'd use this framework: split each cycle into 4 segments and measure them separately — pickup, transit-to-score, score, transit-back. Let's isolate the bottleneck, otherwise we won't know how to get from 18.4 to 14.",
 createdAt: "2025-09-20T20:51:00.000Z",
 replyToLocalId: "str-003",
 },
 {
 localId: "str-005",
 channelId: CH.strateji,
 authorUserId: U.deniz,
 content: "That's exactly the framework I was looking for. I'll prep a spreadsheet for Friday with segment-based columns.",
 createdAt: "2025-09-20T20:55:00.000Z",
 replyToLocalId: "str-004",
 },
 {
 localId: "str-006",
 channelId: CH.strateji,
 authorUserId: U.deniz,
 content:
 "Friday review results — main bottleneck is **transit-back**. Avg 6.1s, target 3.5. Cause: no swerve heading-lock in field-edge traffic, the driver slows down to rotate. @Eren let's port heading-lock into the 2026 code over in #yazilim.",
 createdAt: "2025-09-26T22:10:00.000Z",
 },
 {
 localId: "str-007",
 channelId: CH.strateji,
 authorUserId: U.eren,
 content: "Heading-lock is already in YAGSL — just missing the button binding. I'll handle it tomorrow 👌",
 createdAt: "2025-09-26T22:14:00.000Z",
 replyToLocalId: "str-006",
 },

 // =====================================================================
 // #yazilim — continued, November short threads
 // =====================================================================
 {
 localId: "yz-017",
 channelId: CH.yazilim,
 authorUserId: U.zeynep,
 content:
 "Thinking about using Elastic instead of Shuffleboard for the driver dashboard. Faster, more customizable. What does the driver side think?",
 createdAt: "2025-11-12T18:20:00.000Z",
 },
 {
 localId: "yz-018",
 channelId: CH.yazilim,
 authorUserId: U.deniz,
 content:
 "Speaking as the driver: dashboard needs auto-selector + camera + battery voltage + climb-armed indicator, anything more is just clutter. If Elastic can do those, +1 from me.",
 createdAt: "2025-11-12T18:33:00.000Z",
 replyToLocalId: "yz-017",
 },
 {
 localId: "yz-019",
 channelId: CH.yazilim,
 authorUserId: U.zeynep,
 content: "All four are standard widgets. Done, we're switching to Elastic.",
 createdAt: "2025-11-12T18:36:00.000Z",
 replyToLocalId: "yz-018",
 },

 // =====================================================================
 // #strateji — 2026 Game Manual reveal (Jan 2026 kickoff)
 // =====================================================================
 {
 localId: "str-008",
 channelId: CH.strateji,
 authorUserId: U.deniz,
 content:
 "🎉 KICKOFF! Manual is out, notes from the first read:\n\n- Game name: REEFSCAPE-style pattern, placing objects on a coral structure\n- 3 height levels: L1 (1 pt), L2 (3 pts), L3 (5 pts)\n- Auton: place 4 objects = +bonus\n- Endgame: deep climb (10 pts), shallow climb (5 pts)\n- Penalty rules tightened — defense robot contact > 3s = foul\n\nEveryone read the manual once on your own — group read is tomorrow at 18:00.",
 createdAt: "2026-01-04T19:30:00.000Z",
 },
 {
 localId: "str-009",
 channelId: CH.strateji,
 authorUserId: U.hakan,
 content:
 "Finished my first read. Two critical observations:\n\n1. **L3 is 5x the points of L1** — without a high-scoring mechanism, our shot at the upper half is slim\n2. **Auton bonus +5** is mass-axis additional points — meaning a team scoring 4 objects in auton starts ~8 points ahead of a team scoring them in teleop\n\nOur strategy DNA: L3-capable + 4-piece auton.",
 createdAt: "2026-01-04T22:18:00.000Z",
 replyToLocalId: "str-008",
 },
 {
 localId: "str-010",
 channelId: CH.strateji,
 authorUserId: U.yagiz,
 content:
 "Read section 7.4.2 of the manual twice — the \"protected zone\" definition is different from last year. If a defense team enters the opponent's protected zone, it's an automatic tech foul. This changes the whole defense-robot conversation.",
 createdAt: "2026-01-04T22:34:00.000Z",
 replyToLocalId: "str-009",
 },
 {
 localId: "str-011",
 channelId: CH.strateji,
 authorUserId: U.bugraReal,
 content:
 "Great first reads. For tomorrow's kickoff meeting, let's run with this framework:\n\n**1. Score math** — what's our target score per match? (e.g. 95 points = playoffs)\n**2. Robot priorities (in order):** scoring height, cycle speed, auton, climb, defense\n**3. \"Things we won't do\" list** — what we're explicitly skipping this season (e.g. no ground intake → source intake only)\n\nAll three lock in our prototype decisions in the first week — no chance to second-guess later.",
 createdAt: "2026-01-04T23:02:00.000Z",
 replyToLocalId: "str-010",
 },
 {
 localId: "str-012",
 channelId: CH.strateji,
 authorUserId: U.deniz,
 content:
 "I put a 4-hour strategy workshop on the calendar for Friday. Buğra's framework will be the main agenda. Mechanical and software leads required, others optional.",
 createdAt: "2026-01-04T23:08:00.000Z",
 replyToLocalId: "str-011",
 },
 {
 localId: "str-013",
 channelId: CH.strateji,
 authorUserId: U.elif,
 content:
 "Read the manual twice and put together a sketch for the scoring zones: https://link.8092.tr/scoring-sketch (Onshape sketch). Distances are rough, mechanical will validate, but it's good as a mental map.",
 createdAt: "2026-01-05T11:12:00.000Z",
 },

 // -------- Defense robot debate --------
 {
 localId: "str-014",
 channelId: CH.strateji,
 authorUserId: U.can,
 content:
 "Let me open up the defense-robot conversation. Last year our alliance was weak on defense and we lost finals. This season — do we go defense-spec ourselves, or stay scorer and pick a defense partner?",
 createdAt: "2026-01-08T18:45:00.000Z",
 },
 {
 localId: "str-015",
 channelId: CH.strateji,
 authorUserId: U.deniz,
 content:
 "Clear position: **we stay scorer, we'll pick a defense partner.** Reasons:\n\n1. Our design strength is scoring (data from the last 2 seasons)\n2. Defense-spec robots typically score low with judges by default — bad for Impact\n3. Manual 7.4.2 makes defense hard to learn, too risky for a first year\n\nBut we'll teach the driver a 30-second defensive bumper-up mode — so if our partner goes down, we don't leave them stranded.",
 createdAt: "2026-01-08T19:02:00.000Z",
 replyToLocalId: "str-014",
 },
 {
 localId: "str-016",
 channelId: CH.strateji,
 authorUserId: U.hakan,
 content: "Reasonable and measurable. I'm logging this under decisions — it goes into our alliance selection criteria.",
 createdAt: "2026-01-08T19:05:00.000Z",
 replyToLocalId: "str-015",
 },

 // =====================================================================
 // #yazilim — PathPlanner autonomous routine fight (Feb 2026)
 // =====================================================================
 {
 localId: "yz-020",
 channelId: CH.yazilim,
 authorUserId: U.eren,
 content:
 "v1 of the 4-piece auton routine in PathPlanner is ready. Works in sim. First real-robot run — went 1.4s over while picking up the 3rd piece. Cause: rotation constraint is too aggressive, swerve is slipping.",
 createdAt: "2026-02-09T17:20:00.000Z",
 },
 {
 localId: "yz-021",
 channelId: CH.yazilim,
 authorUserId: U.eren,
 content:
 "v2 — dropped rotation max angular velocity from 540°/s → 360°/s. Total time: target 14.8, actual 15.2. Still over.",
 createdAt: "2026-02-09T19:45:00.000Z",
 replyToLocalId: "yz-020",
 },
 {
 localId: "yz-022",
 channelId: CH.yazilim,
 authorUserId: U.eren,
 content: "v3 still 1.2s over. What's going on with PID translation 🤔",
 createdAt: "2026-02-10T16:30:00.000Z",
 replyToLocalId: "yz-021",
 },
 {
 localId: "yz-023",
 channelId: CH.yazilim,
 authorUserId: U.kagan,
 content:
 "Are you testing on carpet or flat floor? Traction coefficient between field carpet and workshop linoleum differs by ~0.3. Have you measured the `wheelCOF` value in your PathPlanner config?",
 createdAt: "2026-02-10T16:42:00.000Z",
 replyToLocalId: "yz-022",
 },
 {
 localId: "yz-024",
 channelId: CH.yazilim,
 authorUserId: null,
 agentGenerated: true,
 agentType: "channel-agent",
 juryReflexKind: "why_question",
 content:
 "Under what field conditions did you test this autonomous routine? Carpet gives different friction — do you have measurements for smooth carpet vs rough carpet? And have you run the same routine at different battery voltages (12.6V vs 12.0V)? At end-of-season Impact, this measurement methodology is critical for the judges. — PitOS",
 createdAt: "2026-02-10T16:55:00.000Z",
 replyToLocalId: "yz-023",
 },
 {
 localId: "yz-025",
 channelId: CH.yazilim,
 authorUserId: U.eren,
 content:
 "You're right 🙃 I was testing on linoleum. wheelCOF is at default 1.19 — we never measured it. Hakan, can we do it Friday?",
 createdAt: "2026-02-10T17:01:00.000Z",
 replyToLocalId: "yz-024",
 },
 {
 localId: "yz-026",
 channelId: CH.yazilim,
 authorUserId: U.kagan,
 content:
 "Friday 18:00. We'll do a sled-test for wheelCOF — put the robot on carpet, apply a known force, and measure the slip point. Takes 30 minutes.",
 createdAt: "2026-02-10T17:05:00.000Z",
 replyToLocalId: "yz-025",
 },
 {
 localId: "yz-027",
 channelId: CH.yazilim,
 authorUserId: U.eren,
 content:
 "Sled test result: wheelCOF = **0.91** (on carpet). Way lower than the 1.19 default. Updated the config.\n\nv4 result: 14.6s, target 14.8 — **under!** 🚀\n\n```\n[PP] Auton path complete in 14.612s\n[PP] Translation error: 2.1cm avg, 4.3cm max\n[PP] Rotation error: 1.2° avg, 3.8° max\n```",
 createdAt: "2026-02-13T22:08:00.000Z",
 replyToLocalId: "yz-026",
 },
 {
 localId: "yz-028",
 channelId: CH.yazilim,
 authorUserId: U.deniz,
 content: "🔥🔥🔥",
 createdAt: "2026-02-13T22:09:00.000Z",
 replyToLocalId: "yz-027",
 },
 {
 localId: "yz-029",
 channelId: CH.yazilim,
 authorUserId: U.eren,
 content:
 "v5 — tried ChoreoLib as an alternative. Same path runs 14.4s vs PathPlanner's 14.6. 0.2s faster, but ChoreoLib's trajectory tooling has a weaker UI — PathPlanner is more sustainable for the team. Sticking with PathPlanner.",
 createdAt: "2026-02-15T20:12:00.000Z",
 replyToLocalId: "yz-027",
 },
 {
 localId: "yz-030",
 channelId: CH.yazilim,
 authorUserId: U.kagan,
 content:
 "Thanks for writing the trade-off out clearly. Sustainability > 0.2s. Logging this as a decision.",
 createdAt: "2026-02-15T20:18:00.000Z",
 replyToLocalId: "yz-029",
 },

 // =====================================================================
 // #scouting — Pre-Bosphorus app rollout (Feb 2026)
 // =====================================================================
 {
 localId: "sc-001",
 channelId: CH.scouting,
 authorUserId: U.merve,
 content:
 "Last year at Bosphorus we used a Google Form for scouting — after 47 matches everyone gave up 😅. This season I'm writing a simple mobile app. React Native + Supabase backend, offline-first.",
 createdAt: "2026-02-18T17:40:00.000Z",
 },
 {
 localId: "sc-002",
 channelId: CH.scouting,
 authorUserId: U.fatma,
 content:
 "Offline-first is critical — WiFi at the Bosphorus venue drops constantly. I was thinking it should run from a local queue and sync when you get back to the pit.",
 createdAt: "2026-02-18T17:48:00.000Z",
 replyToLocalId: "sc-001",
 },
 {
 localId: "sc-003",
 channelId: CH.scouting,
 authorUserId: U.merve,
 content:
 "Exactly. Schema looks like this:\n\n- match_number (int)\n- team_number (int)\n- alliance (red/blue)\n- auton_pieces (0–4)\n- teleop_l1, l2, l3 (counters)\n- climb (none/shallow/deep/failed)\n- defense_played (bool)\n- defense_quality (1–5, optional)\n- notes (text)\n\nI'll hand the beta out to 6 people tomorrow and we'll simulate over off-season video.",
 createdAt: "2026-02-18T17:55:00.000Z",
 replyToLocalId: "sc-002",
 },
 {
 localId: "sc-004",
 channelId: CH.scouting,
 authorUserId: U.deniz,
 content:
 "Schema looks good but missing: **starting position** (1/2/3) and **broke down** (bool). Robot's field-half performance matters for the pick list, and we don't want to alliance with a broken robot.",
 createdAt: "2026-02-18T18:02:00.000Z",
 replyToLocalId: "sc-003",
 },
 {
 localId: "sc-005",
 channelId: CH.scouting,
 authorUserId: U.merve,
 content: "Added 👍 They're in v0.2.",
 createdAt: "2026-02-18T18:04:00.000Z",
 replyToLocalId: "sc-004",
 },
 {
 localId: "sc-006",
 channelId: CH.scouting,
 authorUserId: U.merve,
 content:
 "Beta results: 6 people filled in 12 simulated matches. Feedback:\n\n- Counter buttons too small, hard with fingers (made bigger)\n- Replaced auton selection drop-down with 3 button presets (added)\n- Defense quality changed from 1–5 to \"none / light / aggressive\"\n- Sync bug: 2 records appeared twice → added an idempotency key\n\nv0.3 is ready, one more field test tomorrow before Bosphorus.",
 createdAt: "2026-02-22T20:30:00.000Z",
 },
 {
 localId: "sc-007",
 channelId: CH.scouting,
 authorUserId: U.fatma,
 content:
 "You're a star, Merve. We'll have 7 devices active at Bosphorus — 4 from the pit crew + 3 from scouting. @Deniz will announce the roster and device assignments in #pit-ekibi.",
 createdAt: "2026-02-22T20:35:00.000Z",
 replyToLocalId: "sc-006",
 },
 {
 localId: "sc-008",
 channelId: CH.scouting,
 authorUserId: null,
 agentGenerated: true,
 agentType: "channel-agent",
 juryReflexKind: "proof_demand",
 content:
 "You tested the scouting app over 12 matches — this is genuinely complex engineering work. If you start tracking how many scouting records were collected at Bosphorus, how many failed to sync, and how many drivers made changes — that becomes concrete evidence for an Engineering Inspiration submission. — PitOS",
 createdAt: "2026-02-22T20:48:00.000Z",
 replyToLocalId: "sc-007",
 },
 {
 localId: "sc-009",
 channelId: CH.scouting,
 authorUserId: U.merve,
 content: "I'll add a telemetry endpoint — the app will send metrics on every sync. Good idea 📊",
 createdAt: "2026-02-22T20:52:00.000Z",
 replyToLocalId: "sc-008",
 },

 // =====================================================================
 // #yazilim — CAN deadlock killing teleop (Mar 2026, Bosphorus week)
 // =====================================================================
 {
 localId: "yz-031",
 channelId: CH.yazilim,
 authorUserId: U.eren,
 content:
 "🚨 Critical — practice match 6, robot died completely at 1:42 in teleop. Driver station log:\n\n```\n[CAN] CAN frame errors: 4127 (avg 12/s)\n[CAN] Bus utilization: 94%\n[ERR] Watchdog not fed within 0.020000s\n[CAN] CAN ID 11 not responding\n[ERR] CommandScheduler exception: NullPointerException\n```\n\nID 11 = elevator left motor. Restarted in the pit and it came back.",
 createdAt: "2026-03-13T14:22:00.000Z",
 },
 {
 localId: "yz-032",
 channelId: CH.yazilim,
 authorUserId: U.can,
 content: "94% bus utilization is absurdly high. How many status frames are we asking for per loop iteration?",
 createdAt: "2026-03-13T14:25:00.000Z",
 replyToLocalId: "yz-031",
 },
 {
 localId: "yz-033",
 channelId: CH.yazilim,
 authorUserId: U.eren,
 content:
 "That's exactly the issue. 14 motor controllers, default status frame rates → each one runs 6 frames/period × 50Hz = 300 fps × 14 = 4200 fps. Bus capacity is around 4500, so we're saturating it.",
 createdAt: "2026-03-13T14:31:00.000Z",
 replyToLocalId: "yz-032",
 },
 {
 localId: "yz-034",
 channelId: CH.yazilim,
 authorUserId: U.kagan,
 content:
 "Solution: turn off the status frames we don't use. For example, we don't use quadrature on the SparkMaxes → push `Status3` and `Status4` to 65535ms. ~30% traffic drop per motor. Same idea for CTRE.",
 createdAt: "2026-03-13T14:38:00.000Z",
 replyToLocalId: "yz-033",
 },
 {
 localId: "yz-035",
 channelId: CH.yazilim,
 authorUserId: U.eren,
 content: "On it now, need to make qual match 23.",
 createdAt: "2026-03-13T14:40:00.000Z",
 replyToLocalId: "yz-034",
 },
 {
 localId: "yz-036",
 channelId: CH.yazilim,
 authorUserId: U.eren,
 content:
 "Match 23 commit is in, bus utilization now **62%**. Frame errors over the last 5 minutes: 11 (was 4127). Monitoring the log at the driver station.",
 createdAt: "2026-03-13T16:08:00.000Z",
 replyToLocalId: "yz-035",
 },
 {
 localId: "yz-037",
 channelId: CH.yazilim,
 authorUserId: U.eren,
 content:
 "Match 23 — robot ran clean the whole match. ✅ CAN deadlock fix verified. Writing the postmortem now — root cause wasn't NetworkTables flush timing, it was status frame traffic. Logs are under `logs/2026-03-13/`.",
 createdAt: "2026-03-13T16:48:00.000Z",
 replyToLocalId: "yz-036",
 },
 {
 localId: "yz-038",
 channelId: CH.yazilim,
 authorUserId: U.deniz,
 content: "GREAT WORK. Standing ovation from the bench 🙏",
 createdAt: "2026-03-13T16:49:00.000Z",
 replyToLocalId: "yz-037",
 },
 {
 localId: "yz-039",
 channelId: CH.yazilim,
 authorUserId: U.kagan,
 content:
 "Drop the postmortem at `docs/postmortems/2026-03-13-can-deadlock.md`. Next year's team shouldn't have to live through this again. Pass the same note to #elektrik — they should audit for ID conflicts too.",
 createdAt: "2026-03-13T16:55:00.000Z",
 replyToLocalId: "yz-037",
 },

 // -------- Commit-before-comp panic --------
 {
 localId: "yz-040",
 channelId: CH.yazilim,
 authorUserId: U.zeynep,
 content:
 "Eliminations start tomorrow — anyone still merging to master tonight? After 22:00 the bug-fix-only rule kicks in. If you've got a feature in flight, please hold it on your branch.",
 createdAt: "2026-03-13T20:45:00.000Z",
 },
 {
 localId: "yz-041",
 channelId: CH.yazilim,
 authorUserId: U.eren,
 content: "All I have is `fix/can-frame-rates`, which already merged yesterday. Not opening anything new.",
 createdAt: "2026-03-13T20:48:00.000Z",
 replyToLocalId: "yz-040",
 },
 {
 localId: "yz-042",
 channelId: CH.yazilim,
 authorUserId: U.can,
 content: "Had a small state machine fix for the climb sequence, merged it this morning. Tested across practice matches. Other than that, clean.",
 createdAt: "2026-03-13T20:52:00.000Z",
 replyToLocalId: "yz-040",
 },
 {
 localId: "yz-043",
 channelId: CH.yazilim,
 authorUserId: U.zeynep,
 content: "Alright, freeze in effect from 22:00. Everyone drop your last commit hash here 👇",
 createdAt: "2026-03-13T20:55:00.000Z",
 replyToLocalId: "yz-040",
 },
 {
 localId: "yz-044",
 channelId: CH.yazilim,
 authorUserId: U.eren,
 content: "`a4f2c1e` — main",
 createdAt: "2026-03-13T22:01:00.000Z",
 replyToLocalId: "yz-043",
 },
 {
 localId: "yz-045",
 channelId: CH.yazilim,
 authorUserId: U.can,
 content: "`a4f2c1e` ✅",
 createdAt: "2026-03-13T22:02:00.000Z",
 replyToLocalId: "yz-043",
 },
 {
 localId: "yz-046",
 channelId: CH.yazilim,
 authorUserId: U.zeynep,
 content: "Locked. Tomorrow morning at the pit let's confirm the same hash is physically deployed. Good night team 🌙",
 createdAt: "2026-03-13T22:05:00.000Z",
 replyToLocalId: "yz-043",
 },

 // -------- Post-comp recap (late Mar) --------
 {
 localId: "yz-047",
 channelId: CH.yazilim,
 authorUserId: U.eren,
 content:
 "Bosphorus retro — software side:\n\n✅ PathPlanner auton under the 14.6s target, consistent across all 12 matches\n✅ Vision PhotonVision 99% uptime, only 1 match with tag flicker\n❌ Climb state machine got stuck in the wrong state twice (need to diagnose with #elektrik)\n❌ Driver dashboard Elastic crashed in 2 matches (heap exhaustion, max-heap bumped up)\n\nJudges saw the CAN deadlock postmortem in the pit and were impressed. Could help on the Judges' Award 🏆",
 createdAt: "2026-03-22T19:20:00.000Z",
 },
 {
 localId: "yz-048",
 channelId: CH.yazilim,
 authorUserId: U.bugraReal,
 content:
 "The postmortem discipline is what I'm most proud of from this team. We'll talk about this at length in the end-of-season Exit Interview. Huge thanks to everyone who put work into the software side — Eren, Can, Zeynep, Merve, and Hakan/Kağan abis.",
 createdAt: "2026-03-22T20:45:00.000Z",
 replyToLocalId: "yz-047",
 },
 {
 localId: "yz-049",
 channelId: CH.yazilim,
 authorUserId: U.zeynep,
 content: "🐐",
 createdAt: "2026-03-22T20:46:00.000Z",
 replyToLocalId: "yz-048",
 },

 // -------- Off-season carryover --------
 {
 localId: "yz-050",
 channelId: CH.yazilim,
 authorUserId: U.eren,
 content:
 "My off-season todos:\n\n1. ChoreoLib + PathPlanner hybrid POC (for faster auton edits)\n2. Stand up AdvantageScope log replay tooling — match-by-match analysis from Bosphorus logs\n3. Driver feedback haptic prototype (controller rumble when climb-armed)\n\nI'll also write an onboarding doc for 2026 rookies — leaving it as a legacy for the 2027 team.",
 createdAt: "2026-04-08T18:30:00.000Z",
 },
 {
 localId: "yz-051",
 channelId: CH.yazilim,
 authorUserId: U.kagan,
 content: "AdvantageScope is critical. If we make log-replay a habit, most \"what happened on the field\" questions get answered from the couch instead of the pit.",
 createdAt: "2026-04-08T18:36:00.000Z",
 replyToLocalId: "yz-050",
 },

 // =====================================================================
 // #strateji — Alliance selection criteria (Feb–Mar 2026)
 // =====================================================================
 {
 localId: "str-017",
 channelId: CH.strateji,
 authorUserId: U.deniz,
 content:
 "2 weeks until Bosphorus. Let's lock down our alliance selection criteria. My proposed framework:\n\n**Top 8 (alliance captain pick):** rank by OPR\n**Top 16 (1st pick backup):** rank by climb success % + cycle time\n**Top 24 (2nd pick / defense):** rank by reliability (broke-down match count) + defense quality\n\nWeights are open for discussion. @Hakan @Yağız thoughts?",
 createdAt: "2026-02-25T19:10:00.000Z",
 },
 {
 localId: "str-018",
 channelId: CH.strateji,
 authorUserId: U.yagiz,
 content:
 "OPR alone can be misleading — if a robot accidentally puts up 80 points in one match, the OPR balloons. My suggestion: **OPR + EPA hybrid**, since EPA corrects for defense and schedule effects. We're already pulling EPA from The Blue Alliance.",
 createdAt: "2026-02-25T19:32:00.000Z",
 replyToLocalId: "str-017",
 },
 {
 localId: "str-019",
 channelId: CH.strateji,
 authorUserId: U.hakan,
 content:
 "Yağız is right. I'd add — we need a \"compatibility\" dimension in our picking framework:\n\n- Can the robot score solo for 30+ seconds? (auton + early teleop capacity)\n- Does our climb partner block us during climb?\n\nBoth are hard to get from offline data — they come from scouting notes. That's why Merve's app is critical.",
 createdAt: "2026-02-25T19:48:00.000Z",
 replyToLocalId: "str-018",
 },
 {
 localId: "str-020",
 channelId: CH.strateji,
 authorUserId: U.deniz,
 content:
 "Alright, final framework:\n\n**1st pick:** EPA × 0.6 + climb success % × 0.25 + scouter eyeball score × 0.15\n**2nd pick:** defense quality × 0.4 + reliability × 0.4 + EPA × 0.2\n\nMerve, can you build this calculation into the app's output? Auto-sorted list right after the match ends.",
 createdAt: "2026-02-25T20:02:00.000Z",
 replyToLocalId: "str-019",
 },
 {
 localId: "str-021",
 channelId: CH.strateji,
 authorUserId: U.merve,
 content: "Yes, can do. I'll add spreadsheet export + sortable columns. Ready by Monday.",
 createdAt: "2026-02-25T20:04:00.000Z",
 replyToLocalId: "str-020",
 },

 // -------- Strategy extra messages (mid-Feb prototype review) --------
 {
 localId: "str-022",
 channelId: CH.strateji,
 authorUserId: U.bugraReal,
 content:
 "Week 3 prototype review — observations:\n\n- Elevator hit L3 height (2.1m on the test stand), but robot stability is weak — 6° of side tilt\n- Intake takes 0.8s from source, target <0.6\n- Auton 4-piece v1 routine sims at 14.8s (right on the edge)\n\nBiggest risk: elevator stability. Probably need a cross-functional meeting with mechanical.",
 createdAt: "2026-02-01T17:30:00.000Z",
 },
 {
 localId: "str-023",
 channelId: CH.strateji,
 authorUserId: U.deniz,
 content: "Cross-functional meeting Friday at 16:00 on the calendar. Mechanical + software + strategy.",
 createdAt: "2026-02-01T17:35:00.000Z",
 replyToLocalId: "str-022",
 },
 {
 localId: "str-024",
 channelId: CH.strateji,
 authorUserId: U.hakan,
 content:
 "Let's also recalibrate the match target-score math. Per the manual's current scoring table:\n\n- 4-piece auton + bonus = 25 points\n- Teleop 8 cycles × L3 (5p) = 40 points\n- Endgame deep climb = 10 points\n- **Total target: 75 points/match (our own contribution)**\n\nWinning alliance avg ~210 last year. If we hit that target, we're a solid 1st or 2nd pick on the alliance.",
 createdAt: "2026-02-01T18:02:00.000Z",
 replyToLocalId: "str-022",
 },
 {
 localId: "str-024a",
 channelId: CH.strateji,
 authorUserId: null,
 agentGenerated: true,
 agentType: "channel-agent",
 juryReflexKind: "why_question",
 content:
 "You calibrated the 75 points/match target against last year's Bosphorus alliance averages. This season's manual scoring coefficients are different (L3 = 5p, last year 4p). Have you tested the \"winning alliance avg ~210\" assumption against the new scoring math? FRC scoring inflation can sometimes hit 15–20%. — PitOS",
 createdAt: "2026-02-01T18:18:00.000Z",
 replyToLocalId: "str-024",
 },
 {
 localId: "str-024b",
 channelId: CH.strateji,
 authorUserId: U.hakan,
 content:
 "Fair points. Once Week 1 events post on TBA I'll recalibrate the math in Week 2 — for now 75 is a \"working hypothesis.\" Keeping it as a measurement anchor.",
 createdAt: "2026-02-01T18:26:00.000Z",
 replyToLocalId: "str-024a",
 },
 {
 localId: "str-024c",
 channelId: CH.strateji,
 authorUserId: U.deniz,
 content: "Put a calendar reminder to revisit the target number after the Week 1 official matches 📌",
 createdAt: "2026-02-01T18:30:00.000Z",
 replyToLocalId: "str-024b",
 },

 // -------- Bosphorus week strategy --------
 {
 localId: "str-025",
 channelId: CH.strateji,
 authorUserId: U.deniz,
 content:
 "Qual matches are done at match 16 — top 8 standings:\n\n```\n1. 6014 (EPA 132)\n2. 8092 (EPA 121) ← us\n3. 7480 (EPA 118)\n4. 5805 (EPA 115)\n5. 4729 (EPA 109)\n6. 9024 (EPA 102)\n7. 7700 (EPA 98)\n8. 5613 (EPA 91)\n```\n\nIf we get captain, our 1st pick decision is between 7480 and 5805.",
 createdAt: "2026-03-14T11:20:00.000Z",
 },
 {
 localId: "str-026",
 channelId: CH.strateji,
 authorUserId: U.yagiz,
 content:
 "5805 climb 96% (12/12 + 1 fail), 7480 climb 78% (7/9). 7480's EPA is slightly higher but the climb risk compounds in playoffs. My recommendation: 5805.",
 createdAt: "2026-03-14T11:34:00.000Z",
 replyToLocalId: "str-025",
 },
 {
 localId: "str-027",
 channelId: CH.strateji,
 authorUserId: U.hakan,
 content:
 "Also 5805 cycle time is 11.8s (top 5 on the field), 7480 is 13.9s. Pairing with 5805 gives us very high combined teleop throughput. +1 for 5805.",
 createdAt: "2026-03-14T11:40:00.000Z",
 replyToLocalId: "str-026",
 },
 {
 localId: "str-028",
 channelId: CH.strateji,
 authorUserId: U.deniz,
 content: "1st pick: **5805**. For 2nd pick we'll go defense-focused — looking at scouting, candidates are 9024 or 7700.",
 createdAt: "2026-03-14T11:45:00.000Z",
 replyToLocalId: "str-027",
 },
 {
 localId: "str-029",
 channelId: CH.strateji,
 authorUserId: U.merve,
 content:
 "9024 defense quality in scout notes is \"aggressive but uncontrolled\" — high tech foul risk. 7700 is \"light but disciplined.\" Given manual 7.4.2, 7700 is the safer pick.",
 createdAt: "2026-03-14T11:52:00.000Z",
 replyToLocalId: "str-028",
 },
 {
 localId: "str-030",
 channelId: CH.strateji,
 authorUserId: U.deniz,
 content: "2nd pick: **7700**. Merve's scouter eyeball metric earned its keep right here 👏",
 createdAt: "2026-03-14T11:55:00.000Z",
 replyToLocalId: "str-029",
 },
 {
 localId: "str-031",
 channelId: CH.strateji,
 authorUserId: U.bugraReal,
 content:
 "Alliance: 8092 + 5805 + 7700. Will be announced in that order at the selection ceremony. Halil İbrahim will read the captain pick on the field.",
 createdAt: "2026-03-14T12:00:00.000Z",
 replyToLocalId: "str-030",
 },

 // -------- Post-Bosphorus strategy --------
 {
 localId: "str-032",
 channelId: CH.strateji,
 authorUserId: U.deniz,
 content:
 "Post-Bosphorus retro (strategy side):\n\n✅ Hit the 75/match target (averaged 78)\n✅ Alliance pick framework worked — 5805 + 7700 hybrid performance was high\n✅ Defense partner call was right; thanks to 7700 we won 2 matches on fouls\n❌ Quarterfinal 2 cycle time dropped to 19s — elevator overheat, climb skipped\n\nBiggest takeaway: stamina (sustained match endurance) is the agenda for next season.",
 createdAt: "2026-03-22T20:10:00.000Z",
 },

 // =====================================================================
 // #scouting — Match-by-match data collection (Bosphorus, Mar 2026)
 // =====================================================================
 {
 localId: "sc-010",
 channelId: CH.scouting,
 authorUserId: U.merve,
 content:
 "Day 1 morning quals are live. 7 devices active, I'm on sync monitor. 0 sync errors so far 🎯",
 createdAt: "2026-03-13T08:45:00.000Z",
 },
 {
 localId: "sc-011",
 channelId: CH.scouting,
 authorUserId: U.elif,
 content:
 "Match 12 — team 4729's elevator has serious vibration, scoring keeps dropping to L1. I marked \"broke down: false\" but flagged it in the notes field. Worth watching for the 1st pick list.",
 createdAt: "2026-03-13T10:22:00.000Z",
 },
 {
 localId: "sc-012",
 channelId: CH.scouting,
 authorUserId: U.merve,
 content:
 "👍 I'll surface your notes as red flags on the dashboard. Telemetry: 38 records this morning, 38 syncs, 0 conflicts. App is stable 🚀",
 createdAt: "2026-03-13T10:25:00.000Z",
 replyToLocalId: "sc-011",
 },
 {
 localId: "sc-013",
 channelId: CH.scouting,
 authorUserId: U.elif,
 content: "Match 18 — 6014 (top seed) hit a 4-piece in auton, 28 points in one shot. Already the favorite before EPA even comes out.",
 createdAt: "2026-03-13T11:48:00.000Z",
 },
 {
 localId: "sc-014",
 channelId: CH.scouting,
 authorUserId: U.elif,
 content:
 "Match 23 — first match after our CAN deadlock fix, robot ran clean. Cycle time 13.9, deep climb success ✅. I'll generate OPR + EPA this afternoon.",
 createdAt: "2026-03-13T16:55:00.000Z",
 },
 {
 localId: "sc-015",
 channelId: CH.scouting,
 authorUserId: U.merve,
 content:
 "Day 1 closeout telemetry:\n\n```\nTotal records: 128\nSyncs: 128\nSync conflicts: 0\nLate syncs (>5min): 3\nDevice uptime avg: 7.4 hr\n```\n\nBattery life is good — phones are cycling on charge in the pit.",
 createdAt: "2026-03-13T19:30:00.000Z",
 },
 {
 localId: "sc-016",
 channelId: CH.scouting,
 authorUserId: U.fatma,
 content:
 "Awesome work Merve. Feedback from the scouters too: they're spending ~3x less time on data entry than before the app. This is Engineering Inspiration evidence material.",
 createdAt: "2026-03-13T19:35:00.000Z",
 replyToLocalId: "sc-015",
 },
 {
 localId: "sc-017",
 channelId: CH.scouting,
 authorUserId: U.merve,
 content:
 "Day 2 morning, first pick list iteration is ready:\n\n| Rank | Team | EPA | Climb % | Cycle | Notes |\n|---|---|---|---|---|---|\n| 1 | 6014 | 132 | 88 | 12.1 | top scorer, no defense |\n| 2 | 8092 | 121 | 92 | 13.4 | us |\n| 3 | 7480 | 118 | 78 | 13.9 | climb risk |\n| 4 | 5805 | 115 | 96 | 11.8 | most reliable |\n| 5 | 4729 | 109 | 67 | 14.6 | elevator vibration ⚠️ |\n\nFull list: https://link.8092.tr/picklist-day2",
 createdAt: "2026-03-14T08:30:00.000Z",
 },
 {
 localId: "sc-018",
 channelId: CH.scouting,
 authorUserId: U.deniz,
 content: "Perfect. We're in the strategy meeting right now talking through this list.",
 createdAt: "2026-03-14T08:32:00.000Z",
 replyToLocalId: "sc-017",
 },
 {
 localId: "sc-019",
 channelId: CH.scouting,
 authorUserId: U.elif,
 content:
 "Pick list is missing a defense column — it's critical for the 2nd pick. Merve, can you add it?",
 createdAt: "2026-03-14T08:38:00.000Z",
 replyToLocalId: "sc-017",
 },
 {
 localId: "sc-020",
 channelId: CH.scouting,
 authorUserId: U.merve,
 content: "Added in v2. Two columns now: \"defense_seen_count\" + \"defense_quality_avg\".",
 createdAt: "2026-03-14T08:42:00.000Z",
 replyToLocalId: "sc-019",
 },
 {
 localId: "sc-021",
 channelId: CH.scouting,
 authorUserId: U.elif,
 content:
 "Consolidated 9024 defense scout notes:\n\n- Match 14: 2 tech fouls (early contact)\n- Match 19: aggressive but obstructed their own partner\n- Match 25: 1 yellow card\n\nBottom line: DO NOT alliance with 9024.",
 createdAt: "2026-03-14T09:55:00.000Z",
 },
 {
 localId: "sc-022",
 channelId: CH.scouting,
 authorUserId: U.deniz,
 content: "Noted — strategy decision is to go with 7700 for the 2nd pick.",
 createdAt: "2026-03-14T10:02:00.000Z",
 replyToLocalId: "sc-021",
 },

 // -------- Day 3 / playoff scouting --------
 {
 localId: "sc-023",
 channelId: CH.scouting,
 authorUserId: U.merve,
 content:
 "Quarterfinals are starting. Scouting method shifts in playoffs — instead of match-by-match, we track \"alliance trends\": energy, climb coordination, ability to adapt strategy.",
 createdAt: "2026-03-15T13:20:00.000Z",
 },
 {
 localId: "sc-024",
 channelId: CH.scouting,
 authorUserId: U.elif,
 content:
 "Elevator overheated in QF2 — climb skipped in match 3. I'll pass this to strategy — is there an option to shift the climb strategy onto our partners for semifinals?",
 createdAt: "2026-03-15T15:42:00.000Z",
 },
 {
 localId: "sc-025",
 channelId: CH.scouting,
 authorUserId: U.deniz,
 content: "Passed along. Going into SF1 we gave 5805 the \"primary climber\" role; we're secondary.",
 createdAt: "2026-03-15T15:48:00.000Z",
 replyToLocalId: "sc-024",
 },

 // -------- Final & post-comp --------
 {
 localId: "sc-026",
 channelId: CH.scouting,
 authorUserId: U.merve,
 content:
 "🏆 Bosphorus is done. Total scouting telemetry:\n\n```\nTotal records: 342\nSync success rate: 99.4% (340/342)\nManual entries: 0 (app caught everything)\nUser-reported bugs: 2 (counter UI sizing, deduplication corner case)\nScouter feedback: 6/7 \"would use again\"\n```\n\nv0.3 → v0.4 todo list is ready.",
 createdAt: "2026-03-22T18:40:00.000Z",
 },
 {
 localId: "sc-027",
 channelId: CH.scouting,
 authorUserId: U.fatma,
 content:
 "These numbers go straight into the Engineering Inspiration submission. Merve, can you write up a postmortem in blog form? @Buğra will quote it in the Impact narrative.",
 createdAt: "2026-03-22T18:48:00.000Z",
 replyToLocalId: "sc-026",
 },
 {
 localId: "sc-028",
 channelId: CH.scouting,
 authorUserId: U.merve,
 content: "Writing it this weekend 📝",
 createdAt: "2026-03-22T18:50:00.000Z",
 replyToLocalId: "sc-027",
 },
 {
 localId: "sc-029",
 channelId: CH.scouting,
 authorUserId: U.elif,
 content:
 "For off-season, let me wire our scouting dataset into The Blue Alliance — we can cross-validate our own data against TBA's EPA and surface our measurement error.",
 createdAt: "2026-04-05T16:20:00.000Z",
 },
 {
 localId: "sc-030",
 channelId: CH.scouting,
 authorUserId: U.merve,
 content: "Great idea, open the repo and I'll contribute too 👍",
 createdAt: "2026-04-05T16:25:00.000Z",
 replyToLocalId: "sc-029",
 },
 ],

 // ============================================================================
 // TASKS
 // ============================================================================
 tasks: [
 {
 localId: "task-yz-001",
 channelId: CH.yazilim,
 title: "Set up PhotonVision pipeline on Orange Pi 5 and document it",
 description: "AprilTag detection, NetworkTables config, README at docs/vision-setup.md.",
 assignedToUserId: U.eren,
 assignedByUserId: U.kagan,
 createdViaLocalMessageId: "yz-007",
 deadline: "2025-08-22T23:59:59.000Z",
 status: "done",
 completedAt: "2025-08-21T18:45:00.000Z",
 createdAt: "2025-08-15T17:42:00.000Z",
 },
 {
 localId: "task-yz-002",
 channelId: CH.yazilim,
 title: "Enable GitHub branch protection + PR review rules",
 description: "Protect main, naming conventions, 48-hour pre-comp freeze.",
 assignedToUserId: U.kagan,
 assignedByUserId: U.kagan,
 createdViaLocalMessageId: "yz-011",
 deadline: "2025-09-12T23:59:59.000Z",
 status: "done",
 completedAt: "2025-09-10T20:00:00.000Z",
 createdAt: "2025-09-08T19:28:00.000Z",
 },
 {
 localId: "task-yz-003",
 channelId: CH.yazilim,
 title: "WheelCOF sled-test + update PathPlanner config",
 description: "Slip measurement on carpet, set wheelCOF=0.91 in config.",
 assignedToUserId: U.eren,
 assignedByUserId: U.kagan,
 createdViaLocalMessageId: "yz-026",
 deadline: "2026-02-13T23:59:59.000Z",
 status: "done",
 completedAt: "2026-02-13T19:30:00.000Z",
 createdAt: "2026-02-10T17:05:00.000Z",
 },
 {
 localId: "task-yz-004",
 channelId: CH.yazilim,
 title: "CAN status frame rate optimization — bus utilization <70%",
 description: "Push unused SparkMax/CTRE status frames to 65535ms, target bus utilization <70%.",
 assignedToUserId: U.eren,
 assignedByUserId: U.kagan,
 createdViaLocalMessageId: "yz-034",
 deadline: "2026-03-13T15:30:00.000Z",
 status: "done",
 completedAt: "2026-03-13T16:08:00.000Z",
 createdAt: "2026-03-13T14:38:00.000Z",
 },
 {
 localId: "task-yz-005",
 channelId: CH.yazilim,
 title: "Write CAN deadlock postmortem",
 description: "Save under docs/postmortems/2026-03-13-can-deadlock.md. Root cause + fix + prevention.",
 assignedToUserId: U.eren,
 assignedByUserId: U.kagan,
 createdViaLocalMessageId: "yz-039",
 deadline: "2026-03-25T23:59:59.000Z",
 status: "done",
 completedAt: "2026-03-19T22:10:00.000Z",
 createdAt: "2026-03-13T16:55:00.000Z",
 },
 {
 localId: "task-yz-006",
 channelId: CH.yazilim,
 title: "Stand up AdvantageScope log replay tooling",
 description: "Match-by-match analysis pipeline over Bosphorus logs.",
 assignedToUserId: U.eren,
 assignedByUserId: U.kagan,
 createdViaLocalMessageId: "yz-051",
 deadline: "2026-05-15T23:59:59.000Z",
 status: "open",
 createdAt: "2026-04-08T18:36:00.000Z",
 },
 {
 localId: "task-yz-007",
 channelId: CH.yazilim,
 title: "Investigate climb state machine — root cause for 2 wrong-state matches",
 description: "Got stuck in the wrong state twice during Bosphorus QF/SF. Diagnose with electrical.",
 assignedToUserId: U.can,
 assignedByUserId: U.deniz,
 createdViaLocalMessageId: "yz-047",
 deadline: "2026-04-30T23:59:59.000Z",
 status: "in_progress",
 createdAt: "2026-03-22T19:30:00.000Z",
 },
 {
 localId: "task-str-001",
 channelId: CH.strateji,
 title: "Prepare segment-based cycle-time measurement spreadsheet",
 description: "Pickup / transit-to-score / score / transit-back columns for off-season video review.",
 assignedToUserId: U.deniz,
 assignedByUserId: U.yagiz,
 createdViaLocalMessageId: "str-005",
 deadline: "2025-09-26T19:00:00.000Z",
 status: "done",
 completedAt: "2025-09-26T17:45:00.000Z",
 createdAt: "2025-09-20T20:55:00.000Z",
 },
 {
 localId: "task-str-002",
 channelId: CH.strateji,
 title: "Write robot priority list + \"things we won't do\" list",
 description: "Output of the kickoff Friday workshop — target score math + ordered priority list.",
 assignedToUserId: U.deniz,
 assignedByUserId: U.bugraReal,
 createdViaLocalMessageId: "str-012",
 deadline: "2026-01-09T23:59:59.000Z",
 status: "done",
 completedAt: "2026-01-09T21:30:00.000Z",
 createdAt: "2026-01-04T23:08:00.000Z",
 },
 {
 localId: "task-sc-001",
 channelId: CH.scouting,
 title: "Scouting app v0.3 → Bosphorus field test",
 description: "4 devices from pit + 3 from scouting; idempotency + offline queue must be verified.",
 assignedToUserId: U.merve,
 assignedByUserId: U.fatma,
 createdViaLocalMessageId: "sc-007",
 deadline: "2026-03-12T23:59:59.000Z",
 status: "done",
 completedAt: "2026-03-11T19:00:00.000Z",
 createdAt: "2026-02-22T20:35:00.000Z",
 },
 {
 localId: "task-sc-002",
 channelId: CH.scouting,
 title: "Add EPA × 0.6 + climb % × 0.25 + eyeball × 0.15 calc to pick list app output",
 description: "Auto-sorted list right after match end, sortable columns + spreadsheet export.",
 assignedToUserId: U.merve,
 assignedByUserId: U.deniz,
 createdViaLocalMessageId: "str-020",
 deadline: "2026-03-02T23:59:59.000Z",
 status: "done",
 completedAt: "2026-03-01T22:15:00.000Z",
 createdAt: "2026-02-25T20:04:00.000Z",
 },
 {
 localId: "task-sc-003",
 channelId: CH.scouting,
 title: "Scouting app postmortem blog post",
 description: "For Engineering Inspiration submission. Telemetry + scouter feedback + lessons learned.",
 assignedToUserId: U.merve,
 assignedByUserId: U.fatma,
 createdViaLocalMessageId: "sc-027",
 deadline: "2026-04-15T23:59:59.000Z",
 status: "in_progress",
 createdAt: "2026-03-22T18:48:00.000Z",
 },
 {
 localId: "task-sc-004",
 channelId: CH.scouting,
 title: "TBA + scouting dataset cross-validation pipeline",
 description: "Off-season — compare our own EPA calculation against TBA's EPA.",
 assignedToUserId: U.elif,
 assignedByUserId: U.merve,
 createdViaLocalMessageId: "sc-029",
 deadline: "2026-06-30T23:59:59.000Z",
 status: "open",
 createdAt: "2026-04-05T16:25:00.000Z",
 },
 {
 localId: "task-yz-009",
 channelId: CH.yazilim,
 title: "Driver dashboard haptic feedback prototype",
 description: "Controller rumble when climb-armed. Low priority, off-season idea.",
 assignedToUserId: U.zeynep,
 assignedByUserId: U.deniz,
 createdViaLocalMessageId: "yz-050",
 deadline: "2026-07-31T23:59:59.000Z",
 status: "cancelled",
 createdAt: "2026-04-08T18:30:00.000Z",
 },
 {
 localId: "task-yz-010",
 channelId: CH.yazilim,
 title: "Driver Elastic crash root cause (heap exhaustion)",
 description: "Crashed in 2 matches at Bosphorus. Max-heap bump is a stopgap; need real leak diagnosis.",
 assignedToUserId: U.zeynep,
 assignedByUserId: U.kagan,
 createdViaLocalMessageId: "yz-047",
 deadline: "2026-04-25T23:59:59.000Z",
 status: "blocked",
 createdAt: "2026-03-22T19:25:00.000Z",
 },
 ],

 // ============================================================================
 // DECISIONS
 // ============================================================================
 decisions: [
 {
 localId: "dec-yz-001",
 sourceLocalMessageId: "yz-007",
 decision: "Using PhotonVision + Orange Pi 5 as the vision pipeline (instead of Limelight 2+).",
 rationale:
 "On the same AprilTag test, PhotonVision averaged 31ms latency vs Limelight's 78ms. Cost ~3000 TL vs Limelight 3 ~25000 TL. PhotonVision is open-source and within our control — that knowledge stays with the team.",
 alternativesConsidered: "Limelight 2+ (current), Limelight 3 (over budget), PhotonVision + Pi 4 (decode performance insufficient).",
 contextAtTime: "Off-season prep, August 2025. Sponsor support from Çetin Group made the Orange Pi 5 available.",
 decidedAt: "2025-08-15T17:42:00.000Z",
 },
 {
 localId: "dec-yz-002",
 sourceLocalMessageId: "yz-011",
 decision: "main branch protected + PR + cross-review + 48-hour feature-freeze before competitions.",
 rationale:
 "Direct pushes to main wiped out a full day of swerve calibration work. Discipline raises both code quality and competition reliability.",
 alternativesConsidered: "Status quo (free-for-all push), trunk-based with feature flags (high learning curve), GitFlow (overengineering).",
 contextAtTime: "September 2025, 4 months until kickoff, off-season error cost still low.",
 decidedAt: "2025-09-08T19:28:00.000Z",
 },
 {
 localId: "dec-str-001",
 sourceLocalMessageId: "str-015",
 decision: "Staying as a scorer robot; defense will come from the alliance partner pick.",
 rationale:
 "Two seasons of data show our design strength is scoring. The new manual 7.4.2 penalty rules make defense's learning curve risky. A scoring-focused identity is more consistent for the Judges' Award submission.",
 alternativesConsidered: "Defense-spec robot (learning curve + judges risk), hybrid scorer-defender (mediocre at both).",
 contextAtTime: "January 2026, post-kickoff, first read of the manual. Penalty rules in 7.4.2 tightened.",
 decidedAt: "2026-01-08T19:05:00.000Z",
 },
 {
 localId: "dec-str-002",
 sourceLocalMessageId: "str-011",
 decision: "Season target score is 75 points/match (our own contribution); robot priority order: scoring height → cycle speed → auton → climb → defense.",
 rationale:
 "The manual's scoring math makes L3 5x the value of L1. The 4-piece auton bonus adds +5. 75 points puts us as a solid 1st–2nd pick on alliances (last year winning alliance avg was 210).",
 alternativesConsidered: "60-point target (conservative, low rank risk), 90-point target (over-engineering, scope risk).",
 contextAtTime: "January 2026 kickoff workshop. We have last year's Bosphorus alliance averages on hand.",
 decidedAt: "2026-01-04T23:02:00.000Z",
 },
 {
 localId: "dec-yz-003",
 sourceLocalMessageId: "yz-030",
 decision: "Using PathPlanner for autonomous routines (over the ChoreoLib alternative).",
 rationale:
 "On the same 4-piece routine, ChoreoLib runs 14.4s vs PathPlanner's 14.6s — a 0.2s difference. PathPlanner's UI tooling lets the team edit sustainably; the ChoreoLib editor isn't mature yet. Sustainability > 0.2s.",
 alternativesConsidered: "ChoreoLib (0.2s faster but weak editor), pure trajectory math (custom code, expensive to debug).",
 contextAtTime: "February 2026, prototype phase. Auton time target is under 14.8s.",
 decidedAt: "2026-02-15T20:18:00.000Z",
 },
 {
 localId: "dec-str-003",
 sourceLocalMessageId: "str-020",
 decision: "Alliance pick framework: 1st pick = EPA × 0.6 + climb % × 0.25 + scouter eyeball × 0.15; 2nd pick = defense quality × 0.4 + reliability × 0.4 + EPA × 0.2.",
 rationale:
 "OPR alone is misleading (lucky-match inflation). EPA corrects for schedule effect. Climb % is decisive in playoffs (10-point swing per match). Scouter eyeball captures compatibility info that doesn't come from offline data.",
 alternativesConsidered: "Pure OPR ranking, pure rank-based, mentor gut-feeling.",
 contextAtTime: "Late February 2026, 2 weeks until Bosphorus. Scouting app v0.3 ready.",
 decidedAt: "2026-02-25T20:02:00.000Z",
 },
 {
 localId: "dec-str-004",
 sourceLocalMessageId: "str-031",
 decision: "Bosphorus alliance: 8092 + 5805 + 7700.",
 rationale:
 "5805 climb 96% + cycle 11.8s (top 5) → 1st pick. 7700 disciplined defense + low tech foul risk → 2nd pick (given manual 7.4.2). 9024 was eliminated (aggressive defense + 2 tech fouls + 1 yellow card).",
 alternativesConsidered: "1st: 7480 (climb 78% risk), 2nd: 9024 (high foul risk).",
 contextAtTime: "March 14, 2026 — end of Bosphorus qual matches. 8092 #2 seed.",
 decidedAt: "2026-03-14T12:00:00.000Z",
 },
 ],
};
