/**
 * Build/Design channels seed group: #mekanik, #cad, #elektrik
 * Generated for FRC Team 8092 G.O.A.T. — 2025-05-15 → 2026-04-25 timeline.
 */

import type { SeedGroup } from "./types";

// Channel UUIDs
const CH_MEKANIK = "c2710ced-dd88-49d8-88bd-8a05daba5db8";
const CH_CAD = "8419a670-3a15-413e-a96e-4159de75260b";
const CH_ELEKTRIK = "ca8b1e84-c553-4613-b827-2bc05e68d99c";

// User UUIDs
const U_BUGRA_REAL = "aad122b8-7776-42c4-b9d7-51b6aa3ecf67";
const U_HAKAN = "18cb0c6b-5104-421d-a71c-828f2867c479";
const U_AYSE = "2ac6551e-a2b4-4698-a73e-604bcaff5225";
const U_KAGAN = "d5f5c1f1-59dc-4c58-ba1e-5ed213490492";
const U_YAGIZ = "77c39129-e3dd-4586-ba7f-91cf405766dc";
const U_MEHMET = "f36056dd-998e-4048-a67a-43b54540bd2e";
const U_DENIZ = "69af37aa-117c-4e1c-a330-968ee1bd0982";
const U_ALI = "9b049271-118e-446a-a624-7623fc9f9206";
const U_ZEYNEP = "8590cff9-8649-4448-a4f6-a8d72ad45885";
const U_CAN = "404e74a7-ceaa-4f79-b7c9-bcf347151613";
const U_ELIF = "2de90e33-54ce-43f3-af8e-66ce82d5b2bf";
const U_EREN = "db5376b7-cd4a-46af-a2ca-98a01b25c9de";
const U_MERVE = "8297b7d3-0d1e-42b9-a579-ba6414bb0a94";

export const group: SeedGroup = {
  groupName: "build-design",

  messages: [
    // ===========================================================
    // #mekanik — 41 messages
    // Storyline 1: Swerve vs Tank decision (Sep 2025)
    // ===========================================================
    {
      localId: "mek-001",
      channelId: CH_MEKANIK,
      authorUserId: U_DENIZ,
      content:
        "Hey team 👋 season's kicking off, we need to settle the drivetrain choice this week. **Swerve vs tank** — come prepared, decision meeting Friday 19:00 at the shop.",
      createdAt: "2025-09-08T16:42:00.000Z",
    },
    {
      localId: "mek-002",
      channelId: CH_MEKANIK,
      authorUserId: U_ALI,
      content:
        "Last season tank was getting us about 2.8 m/s. With swerve and SDS Mk4i it's typically 4.5-5 m/s. I watched match footage — swerve teams handle defense way better.",
      createdAt: "2025-09-08T17:05:00.000Z",
      replyToLocalId: "mek-001",
    },
    {
      localId: "mek-003",
      channelId: CH_MEKANIK,
      authorUserId: U_EREN,
      content:
        "Swerve runs ~58k TL per module, 4 modules = 232k. Tank-side with a West Coast chassis you finish around 70-80k TL. Budget needs a chat with @Buğra Canata.",
      createdAt: "2025-09-08T17:18:00.000Z",
      replyToLocalId: "mek-001",
    },
    {
      localId: "mek-004",
      channelId: CH_MEKANIK,
      authorUserId: U_YAGIZ,
      content:
        "Money matters, but the real question is: do we have the driver practice to actually run swerve? We were already struggling with autonomous on tank last year. Give me your reasons for swerve in 3 sentences.",
      createdAt: "2025-09-08T18:30:00.000Z",
    },
    {
      localId: "mek-005",
      channelId: CH_MEKANIK,
      authorUserId: U_DENIZ,
      content:
        "@Yağız Engin 1) Defense resistance — holding position under lateral force 2) Auto path flexibility — holonomic motion makes PathPlanner easier 3) Maneuvering in the pit without changing orientation. For driver practice we'll plan 2 hours/week from September through December.",
      createdAt: "2025-09-08T18:55:00.000Z",
      replyToLocalId: "mek-004",
    },
    {
      localId: "mek-006",
      channelId: CH_MEKANIK,
      authorUserId: U_HAKAN,
      content:
        "Two of the three points are real. 'Auto path flexibility' alone isn't a reason — non-holonomic paths work fine on tank too. Let's talk budget and driver training side by side.",
      createdAt: "2025-09-08T19:14:00.000Z",
      replyToLocalId: "mek-005",
    },
    {
      localId: "mek-007",
      channelId: CH_MEKANIK,
      authorUserId: U_BUGRA_REAL,
      content:
        "On the budget side: with the Siemens title sponsor support + Çetin Group shop contribution, our build envelope is 320k TL. If we go swerve, that eats 72% on chassis alone; 90k left for mechanisms. I don't know if shooter+intake both fit in that — mechanism team has to decide.",
      createdAt: "2025-09-09T09:20:00.000Z",
    },
    {
      localId: "mek-008",
      channelId: CH_MEKANIK,
      authorUserId: U_ZEYNEP,
      content:
        "We had the same squeeze last year. My suggestion: swerve, but design the mechanism modular — weeks 1-3 just intake testing, shooter module shows up week 4. Otherwise neither one ends up finished.",
      createdAt: "2025-09-09T10:05:00.000Z",
      replyToLocalId: "mek-007",
    },
    {
      localId: "mek-009",
      channelId: CH_MEKANIK,
      authorUserId: U_DENIZ,
      content:
        "Final to be voted at Friday's meeting: **Swerve (SDS Mk4i, NEO Vortex, COTS)** + modular mechanism. If anyone has a counter-argument, @ me — record will be kept in #mentorlar.",
      createdAt: "2025-09-10T17:30:00.000Z",
    },
    {
      localId: "mek-010",
      channelId: CH_MEKANIK,
      authorUserId: U_HAKAN,
      content:
        "Decision approved. Logging it in PitOS as a decision: **Drivetrain = Swerve, Mk4i, L2 ratio.** Rationale: defense resistance + investment in driver development. Alternative (West Coast Tank) was discussed for the budget advantage and rejected.",
      createdAt: "2025-09-12T20:48:00.000Z",
      replyToLocalId: "mek-009",
    },
    // Storyline 2: Shooter prototype not grouping (Feb 2026)
    {
      localId: "mek-011",
      channelId: CH_MEKANIK,
      authorUserId: U_ALI,
      content:
        "Shooter prototype v1 is up 🔧. Dual Kraken, 6 inch compliant wheels. **At 4.2m, only 11 hits out of 30 shots (37%)**. Grouping is all over the place — landing ±50cm left/right/high of target.",
      createdAt: "2026-02-04T19:22:00.000Z",
    },
    {
      localId: "mek-012",
      channelId: CH_MEKANIK,
      authorUserId: U_YAGIZ,
      content: "What RPM did it hold? Got encoder logs? Is the ball feed consistent?",
      createdAt: "2026-02-04T19:31:00.000Z",
      replyToLocalId: "mek-011",
    },
    {
      localId: "mek-013",
      channelId: CH_MEKANIK,
      authorUserId: U_ALI,
      content:
        "RPM setpoint 4800, actual measured oscillating 4750-4820 (we talked about the encoder thing in #elektrik, CTRE Phoenix Tuner is logging). Ball feed is manual — one person dropping them in by hand 😅 might be the cause.",
      createdAt: "2026-02-04T19:38:00.000Z",
      replyToLocalId: "mek-012",
    },
    {
      localId: "mek-014",
      channelId: CH_MEKANIK,
      authorUserId: U_HAKAN,
      content:
        "Isolate your variables: solve feed consistency first, then measure wheel COF. If you change two things at once you'll never find the cause. Old engineering rule.",
      createdAt: "2026-02-04T20:02:00.000Z",
      replyToLocalId: "mek-013",
    },
    {
      localId: "mek-015",
      channelId: CH_MEKANIK,
      authorUserId: null,
      agentGenerated: true,
      agentType: "channel-agent",
      juryReflexKind: "proof_demand",
      content:
        "How many weeks have you tested this prototype? Do you have a shot-distance vs group-radius curve? For end-of-season Engineering Inspiration, this kind of data is gold as 'iteration' evidence — I'd open a table in Notion. — PitOS",
      createdAt: "2026-02-04T20:15:00.000Z",
    },
    {
      localId: "mek-016",
      channelId: CH_MEKANIK,
      authorUserId: U_ALI,
      content:
        "Done — built an automatic feed jig, old kit-of-parts servo + 3D printed funnel. Test 2 tomorrow at 18:00.",
      createdAt: "2026-02-05T16:40:00.000Z",
      replyToLocalId: "mek-014",
    },
    {
      localId: "mek-017",
      channelId: CH_MEKANIK,
      authorUserId: U_ALI,
      content:
        "🚀 Test 2 results: **30/40 hits (75%) at 4.2m**. Auto feed + dropped spindexer angle from 12° to 8°. Wheel COF still feels a bit low — going to compare blue nitrile vs grey neoprene.",
      createdAt: "2026-02-06T20:11:00.000Z",
    },
    {
      localId: "mek-018",
      channelId: CH_MEKANIK,
      authorUserId: U_DENIZ,
      content: "Huge jump. What distance matrix should we run for Test 3? 3m / 4m / 5m / 6m?",
      createdAt: "2026-02-06T20:18:00.000Z",
      replyToLocalId: "mek-017",
    },
    {
      localId: "mek-019",
      channelId: CH_MEKANIK,
      authorUserId: U_ALI,
      content:
        "Yeah, those distances. Targeting 4200 RPM at 3m, 5400 RPM at 6m. We'll get a lookup table out of it — need to talk PID interpolation with #yazilim.",
      createdAt: "2026-02-06T20:25:00.000Z",
      replyToLocalId: "mek-018",
    },
    {
      localId: "mek-020",
      channelId: CH_MEKANIK,
      authorUserId: U_AYSE,
      content:
        "Ali, you're crushing it. One suggestion: spend 2 minutes after every test logging a Notion row (date, RPM, distance, hits/shots, what changed). At end of season, the 'iterative engineering' section of our Impact narrative will write itself from that table.",
      createdAt: "2026-02-07T11:30:00.000Z",
    },
    // Storyline 3: Robot weight overshoot (Mar 2026)
    {
      localId: "mek-021",
      channelId: CH_MEKANIK,
      authorUserId: U_EREN,
      content:
        "⚠️ Weighed the robot. **58.4 kg, rule limit is 56.7 kg (125 lb).** 1.7 kg over. Bumper not included; with bumpers it's 62.1 kg.",
      createdAt: "2026-03-02T17:15:00.000Z",
    },
    {
      localId: "mek-022",
      channelId: CH_MEKANIK,
      authorUserId: U_DENIZ,
      content: "How bad? Bosphorus is in 11 days. Where's the weight coming from?",
      createdAt: "2026-03-02T17:18:00.000Z",
      replyToLocalId: "mek-021",
    },
    {
      localId: "mek-023",
      channelId: CH_MEKANIK,
      authorUserId: U_EREN,
      content:
        "Suspects:\n- Shooter mount plate (aluminum 8mm, was supposed to be 6mm) → +900g\n- Spindexer brackets (3D printed, 100% infill, overkill) → +320g\n- Intake tube (steel, we thought it was aluminum) → +540g\n\nTotal ~1.76 kg. About right.",
      createdAt: "2026-03-02T17:35:00.000Z",
      replyToLocalId: "mek-022",
    },
    {
      localId: "mek-024",
      channelId: CH_MEKANIK,
      authorUserId: U_HAKAN,
      content:
        "Cut the easy stuff first: drop spindexer brackets to 30% infill + run topology optimization, swap the intake tube for aluminum. Save the shooter plate for last — it's a precision mount.",
      createdAt: "2026-03-02T17:50:00.000Z",
      replyToLocalId: "mek-023",
    },
    {
      localId: "mek-025",
      channelId: CH_MEKANIK,
      authorUserId: U_ZEYNEP,
      content:
        "I'll take the CAD revision, opening a new Onshape branch in #cad tonight. Tomorrow evening let's send Çetin Group shop a new aluminum tube order.",
      createdAt: "2026-03-02T18:01:00.000Z",
    },
    {
      localId: "mek-026",
      channelId: CH_MEKANIK,
      authorUserId: U_EREN,
      content:
        "Re-weigh: **56.2 kg** ✅ — 500g of margin. Bumper weighs 5.2 kg (rule max 6.8 kg). Robot inspection is in three days, I can sleep now.",
      createdAt: "2026-03-06T19:42:00.000Z",
    },
    {
      localId: "mek-027",
      channelId: CH_MEKANIK,
      authorUserId: U_DENIZ,
      content: "🎉 Well done team. This pace is becoming our signature. We're ready for Bosphorus (I think).",
      createdAt: "2026-03-06T19:48:00.000Z",
      replyToLocalId: "mek-026",
    },
    // Storyline 4: Intake snapped at Bosphorus pit (Mar 2026)
    {
      localId: "mek-028",
      channelId: CH_MEKANIK,
      authorUserId: U_CAN,
      content:
        "🚨 PIT — after qual match 14 the intake polycarbonate side plate cracked. Robot took some defense, crack started from the bottom corner. 22 minutes to match 15.",
      createdAt: "2026-03-13T11:22:00.000Z",
    },
    {
      localId: "mek-029",
      channelId: CH_MEKANIK,
      authorUserId: U_ALI,
      content:
        "Do we have a spare? I had Çetin Group cut 2 spares last Monday, should be in the pit toolbox — Eren?",
      createdAt: "2026-03-13T11:23:00.000Z",
      replyToLocalId: "mek-028",
    },
    {
      localId: "mek-030",
      channelId: CH_MEKANIK,
      authorUserId: U_EREN,
      content: "Got 'em ✅ red box, top shelf. 6 M4 bolts ready too. Starting the teardown.",
      createdAt: "2026-03-13T11:24:00.000Z",
      replyToLocalId: "mek-029",
    },
    {
      localId: "mek-031",
      channelId: CH_MEKANIK,
      authorUserId: U_CAN,
      content:
        "📸 Old plate out, new plate in, bolts torqued + zip tie reinforcement. **Done in 14 minutes**, robot in the queue with 8 minutes to spare before match 15.",
      createdAt: "2026-03-13T11:36:00.000Z",
    },
    {
      localId: "mek-032",
      channelId: CH_MEKANIK,
      authorUserId: U_HAKAN,
      content:
        "This is exactly why we revise the spare parts checklist every season. After match 15, write a post-mortem: 1) Where exactly did the crack start? 2) Do we need a design change or is replacing the material enough?",
      createdAt: "2026-03-13T11:55:00.000Z",
    },
    {
      localId: "mek-033",
      channelId: CH_MEKANIK,
      authorUserId: U_ALI,
      content:
        "Crack started from the lower-rear corner — there's a stress concentration there, radius is too sharp. I'll smooth it in CAD off-season. For now the plate is holding, took defense in qual 15 too, no cracks.",
      createdAt: "2026-03-13T13:40:00.000Z",
      replyToLocalId: "mek-032",
    },
    {
      localId: "mek-034",
      channelId: CH_MEKANIK,
      authorUserId: U_DENIZ,
      content:
        "Pit crew is legendary. @Can Aydın @Eren Şahin 14-minute robot repair is a team record. We're putting this story in the Judges' Award presentation.",
      createdAt: "2026-03-13T14:08:00.000Z",
    },
    {
      localId: "mek-035",
      channelId: CH_MEKANIK,
      authorUserId: U_MERVE,
      content:
        "Got photos too, before/after + the pit crew together. Dropped them in #medya. 📷",
      createdAt: "2026-03-13T14:12:00.000Z",
    },
    // Tail / misc
    {
      localId: "mek-036",
      channelId: CH_MEKANIK,
      authorUserId: U_ZEYNEP,
      content:
        "Off-season idea: change the intake side plate design to 4mm aluminum + 2mm UHMW liner. Similar weight, much better durability. We'll cut a prototype early summer.",
      createdAt: "2026-04-08T18:30:00.000Z",
    },
    {
      localId: "mek-037",
      channelId: CH_MEKANIK,
      authorUserId: U_HAKAN,
      content:
        "Approved, but write the shooter and intake post-mortems for this season first. Design changes without data = guessing.",
      createdAt: "2026-04-08T19:00:00.000Z",
      replyToLocalId: "mek-036",
    },
    {
      localId: "mek-038",
      channelId: CH_MEKANIK,
      authorUserId: U_DENIZ,
      content:
        "Mechanical off-season plan:\n- [ ] Shooter post-mortem (Ali)\n- [ ] Intake post-mortem (Zeynep)\n- [ ] Spare parts checklist 2026 → 2027 update (Eren)\n- [ ] New rookie training module: weigh-in & weight discipline\n\nDeadline: May 1.",
      createdAt: "2026-04-15T17:22:00.000Z",
    },
    {
      localId: "mek-039",
      channelId: CH_MEKANIK,
      authorUserId: U_YAGIZ,
      content:
        "During the swerve vote last season, we said 'driver practice will happen.' Did it? How many hours? What was the outcome? We can revisit the decision off-season.",
      createdAt: "2026-04-18T10:11:00.000Z",
    },
    {
      localId: "mek-040",
      channelId: CH_MEKANIK,
      authorUserId: U_DENIZ,
      content:
        "@Yağız Engin Notion has the log: **47 hours** of driver practice between September and March. At Bosphorus auto score average was 18, teleop drive uptime 94%. I'd say the swerve call is validated.",
      createdAt: "2026-04-18T10:35:00.000Z",
      replyToLocalId: "mek-039",
    },
    {
      localId: "mek-041",
      channelId: CH_MEKANIK,
      authorUserId: U_BUGRA_REAL,
      content:
        "This was the most disciplined channel of the season. Decisions, post-mortems, photo evidence — half of the \"how we work\" story we showed the judges on the way to Judges' Award came out of here. Thank you. 🐐",
      createdAt: "2026-04-22T20:00:00.000Z",
    },

    // ===========================================================
    // #cad — 32 messages
    // Storyline 1: Onshape file structure cleanup (Jul 2025)
    // ===========================================================
    {
      localId: "cad-001",
      channelId: CH_CAD,
      authorUserId: U_ZEYNEP,
      content:
        "The Onshape file structure is total chaos. 47 leftover parts from the 2024-2025 season, 12 assemblies, 8 different versions named 'final_v3', 'final_v3_FIX', 'last_FINAL' 😅. I say we do a cleanup this week.",
      createdAt: "2025-07-08T15:00:00.000Z",
    },
    {
      localId: "cad-002",
      channelId: CH_CAD,
      authorUserId: U_HAKAN,
      content:
        "Good idea. But first let's set rules: **folder structure + naming convention + revision policy.** Otherwise it'll be the same mess in 6 months.",
      createdAt: "2025-07-08T15:22:00.000Z",
      replyToLocalId: "cad-001",
    },
    {
      localId: "cad-003",
      channelId: CH_CAD,
      authorUserId: U_ZEYNEP,
      content:
        "My proposal:\n```\n8092-2026/\n  00-Drivetrain/\n  01-Intake/\n  02-Shooter/\n  03-Climber/\n  04-Electrical-Mounts/\n  99-Archive/\n```\nNaming: `<sub>-<part>-<rev>` (e.g. `INT-SidePlate-A`). Revs are letters, A→B→C. The word 'final' is banned.",
      createdAt: "2025-07-08T15:40:00.000Z",
    },
    {
      localId: "cad-004",
      channelId: CH_CAD,
      authorUserId: U_ALI,
      content: "+1, I'm still ashamed I uploaded an 'asd_son_son.step' once.",
      createdAt: "2025-07-08T15:45:00.000Z",
      replyToLocalId: "cad-003",
    },
    {
      localId: "cad-005",
      channelId: CH_CAD,
      authorUserId: U_HAKAN,
      content:
        "Approved. Additional rule: **major rev (A→B) = machined geometry changed, minor rev (A.1→A.2) = only tolerance/finish changed.** CAM files will always map to the major rev.",
      createdAt: "2025-07-08T16:10:00.000Z",
      replyToLocalId: "cad-003",
    },
    {
      localId: "cad-006",
      channelId: CH_CAD,
      authorUserId: U_ZEYNEP,
      content:
        "It's basically going to be a migration script, but we're doing it by hand. Sunday 14:00 at the shop — CAD party, pizza included 🍕. @Ali Öztürk @Eren Şahin @Can Aydın come through.",
      createdAt: "2025-07-09T11:00:00.000Z",
    },
    {
      localId: "cad-007",
      channelId: CH_CAD,
      authorUserId: U_ZEYNEP,
      content:
        "✅ Sunday wrapped. Old 47 parts → 18 active + 29 archived. Renamed to the new convention. Onshape link guide is in Notion.",
      createdAt: "2025-07-13T20:35:00.000Z",
    },
    // Storyline 2: Main breakdown finalization (Jan-Feb 2026)
    {
      localId: "cad-008",
      channelId: CH_CAD,
      authorUserId: U_DENIZ,
      content:
        "Kickoff is done, game manual read. We need the main breakdown CAD this week. **Subsystems:** drivetrain (swerve), intake, shooter, climber, electronics tray, bumper. Let's assign owners.",
      createdAt: "2026-01-06T18:00:00.000Z",
    },
    {
      localId: "cad-009",
      channelId: CH_CAD,
      authorUserId: U_ZEYNEP,
      content:
        "I'll take main assembly + drivetrain integration. @Ali Öztürk shooter, @Eren Şahin intake, @Can Aydın climber. Electronics tray shared with @Kağan Bahadır Durgut.",
      createdAt: "2026-01-06T18:05:00.000Z",
      replyToLocalId: "cad-008",
    },
    {
      localId: "cad-010",
      channelId: CH_CAD,
      authorUserId: U_ALI,
      content: "I need the drivetrain mating to lock in shooter frame attachment points. Zeynep, when are you committing the Mk4i top plate hole pattern?",
      createdAt: "2026-01-08T19:30:00.000Z",
    },
    {
      localId: "cad-011",
      channelId: CH_CAD,
      authorUserId: U_ZEYNEP,
      content: "Tomorrow evening (rev A). SDS's official STEP is imported into Onshape, I'll mate it with an in-context reference. Bind to rev A — if it changes in B I'll let you know.",
      createdAt: "2026-01-08T19:42:00.000Z",
      replyToLocalId: "cad-010",
    },
    {
      localId: "cad-012",
      channelId: CH_CAD,
      authorUserId: U_EREN,
      content:
        "Intake breakdown is out:\n- INT-SidePlate-A (left/right)\n- INT-RollerTube-A\n- INT-PivotShaft-A\n- INT-Gearbox-A (versaplanetary 3:1)\n- INT-PolyRoller-A (compliant)\n\nMass estimate: 4.2 kg. Bumper-aware envelope check tomorrow.",
      createdAt: "2026-01-10T16:25:00.000Z",
    },
    {
      localId: "cad-013",
      channelId: CH_CAD,
      authorUserId: U_HAKAN,
      content:
        "Make the pivot shaft 14mm instead of 12mm. We bent it at 12mm last season. Did you account for the encoder mount side?",
      createdAt: "2026-01-10T17:00:00.000Z",
      replyToLocalId: "cad-012",
    },
    {
      localId: "cad-014",
      channelId: CH_CAD,
      authorUserId: U_EREN,
      content:
        "Pivot shaft bumped to 14mm (rev A.1), adding an encoder mount bracket — we'll use a REV Through Bore encoder. Let's hash that out with @Kağan Bahadır Durgut in #elektrik.",
      createdAt: "2026-01-10T17:18:00.000Z",
      replyToLocalId: "cad-013",
    },
    {
      localId: "cad-015",
      channelId: CH_CAD,
      authorUserId: U_ZEYNEP,
      content:
        "📐 Main breakdown rev A is committed. 132 unique parts, 11 sub-assemblies, total mass estimate **52.8 kg** (no bumper). Target is 56 kg max, **~3.2 kg of margin**. We'll re-measure during mechanism testing.",
      createdAt: "2026-01-22T21:00:00.000Z",
    },
    {
      localId: "cad-016",
      channelId: CH_CAD,
      authorUserId: U_DENIZ,
      content: "🎉 Great work Zeynep. Can you put together a manufacturing release plan by Feb 1?",
      createdAt: "2026-01-22T21:08:00.000Z",
      replyToLocalId: "cad-015",
    },
    // Storyline 3: CAM file mismatch with Çetin Group (Feb 2026)
    {
      localId: "cad-017",
      channelId: CH_CAD,
      authorUserId: U_ZEYNEP,
      content:
        "🚨 Heard back from Çetin Group shop: the shooter mount plate in the CAM file was machined as 8mm aluminum, **but CAD has it at 6mm.** The plates arrived, they're 8mm thick. 4 pieces, ~900g of extra weight (this connects to mek-023 above).",
      createdAt: "2026-02-25T14:50:00.000Z",
    },
    {
      localId: "cad-018",
      channelId: CH_CAD,
      authorUserId: U_HAKAN,
      content: "Which rev's CAM got sent? Check the history in Onshape.",
      createdAt: "2026-02-25T14:55:00.000Z",
      replyToLocalId: "cad-017",
    },
    {
      localId: "cad-019",
      channelId: CH_CAD,
      authorUserId: U_ZEYNEP,
      content:
        "The CAM that went to the shop = SH-MountPlate-A (old rev, 8mm). Current in CAD = SH-MountPlate-B (6mm, committed Feb 11). **Per our convention, a major rev change should have triggered a fresh CAM, but the old A stayed at the shop.** This one's on us.",
      createdAt: "2026-02-25T15:08:00.000Z",
    },
    {
      localId: "cad-020",
      channelId: CH_CAD,
      authorUserId: U_HAKAN,
      content:
        "OK. This isn't a convention failure, it's a **handoff failure.** The revision of every CAM file we send to the shop has to be logged in a Notion row. Let's set this up immediately, more files are going out before Bosphorus.",
      createdAt: "2026-02-25T15:25:00.000Z",
      replyToLocalId: "cad-019",
    },
    {
      localId: "cad-021",
      channelId: CH_CAD,
      authorUserId: null,
      agentGenerated: true,
      agentType: "channel-agent",
      juryReflexKind: "why_question",
      content:
        "What process will you put in place so this doesn't happen again? \"Notion row\" is a good start, but what happens when someone doesn't fill it in? At end-of-season Engineering Inspiration, the 'failure → process change' story is a powerful one. — PitOS",
      createdAt: "2026-02-25T15:40:00.000Z",
    },
    {
      localId: "cad-022",
      channelId: CH_CAD,
      authorUserId: U_ZEYNEP,
      content:
        "Process: before any CAM file is exported, **two signatures required (CAD lead + shop liaison).** Notion template is ready, link is dropped in Notion. CAM revision tracker is now mandatory. No more mismatches this season.",
      createdAt: "2026-02-25T16:30:00.000Z",
      replyToLocalId: "cad-021",
    },
    {
      localId: "cad-023",
      channelId: CH_CAD,
      authorUserId: U_DENIZ,
      content: "What do we do with the 8mm plates?",
      createdAt: "2026-02-25T16:35:00.000Z",
      replyToLocalId: "cad-017",
    },
    {
      localId: "cad-024",
      channelId: CH_CAD,
      authorUserId: U_ZEYNEP,
      content:
        "Sent them back to Çetin Group, the new 6mm ones arrive in 3 days (fast turnaround since they're a sponsor). The old 8mm plates we set aside for off-season prototyping, not the scrap bin 👍",
      createdAt: "2026-02-25T16:48:00.000Z",
      replyToLocalId: "cad-023",
    },
    // Storyline 4: Revision tracking discipline (continued)
    {
      localId: "cad-025",
      channelId: CH_CAD,
      authorUserId: U_HAKAN,
      content:
        "Looking at the revision tracker Notion page: 14 CAM exports in the last 2 weeks, all signed off, zero mismatches. Discipline has stuck 👏",
      createdAt: "2026-03-08T11:00:00.000Z",
    },
    {
      localId: "cad-026",
      channelId: CH_CAD,
      authorUserId: U_ZEYNEP,
      content:
        "Final manufacturing release list for Bosphorus:\n- 23 parts to Çetin Group (waterjet + CNC)\n- 14 parts to Saray Alüminyum (extrusion cut)\n- 8 parts in-shop (3D print + bandsaw)\n\nAll in the rev tracker, deadline March 4.",
      createdAt: "2026-02-28T10:00:00.000Z",
    },
    {
      localId: "cad-027",
      channelId: CH_CAD,
      authorUserId: U_CAN,
      content:
        "Climber assembly rev B is committed. Hook geometry changed (radius 8mm → 12mm), winch drum unchanged. Mass +120g. @Zeynep Çelik can you merge it into main?",
      createdAt: "2026-02-19T20:15:00.000Z",
    },
    {
      localId: "cad-028",
      channelId: CH_CAD,
      authorUserId: U_ZEYNEP,
      content: "Merged, checked in-context references, no frame interference. ✅",
      createdAt: "2026-02-19T20:42:00.000Z",
      replyToLocalId: "cad-027",
    },
    {
      localId: "cad-029",
      channelId: CH_CAD,
      authorUserId: U_ALI,
      content:
        "Off-season idea: standardize **named views** in Onshape — front, side, top, iso, exploded. Faster reviews, easier to grab screenshots for jury presentations.",
      createdAt: "2026-04-10T16:00:00.000Z",
    },
    {
      localId: "cad-030",
      channelId: CH_CAD,
      authorUserId: U_HAKAN,
      content: "Approved. Make this part of the rookie CAD onboarding too.",
      createdAt: "2026-04-10T16:18:00.000Z",
      replyToLocalId: "cad-029",
    },
    {
      localId: "cad-031",
      channelId: CH_CAD,
      authorUserId: U_ZEYNEP,
      content:
        "Season stats:\n- 187 unique parts\n- 14 sub-assemblies, 1 main\n- 32 commits/week peak (Feb 2026)\n- 1 CAM mismatch (lesson learned)\n- 0 frame interferences\n\nFirst real 'engineering process' season we've had.",
      createdAt: "2026-04-20T19:00:00.000Z",
    },
    {
      localId: "cad-032",
      channelId: CH_CAD,
      authorUserId: U_DENIZ,
      content: "🐐 So proud. We're putting these numbers on the rookie training slides too.",
      createdAt: "2026-04-20T19:08:00.000Z",
      replyToLocalId: "cad-031",
    },

    // ===========================================================
    // #elektrik — 31 messages
    // Storyline 1: Kraken vs Falcon motor selection (Sep 2025)
    // ===========================================================
    {
      localId: "elek-001",
      channelId: CH_ELEKTRIK,
      authorUserId: U_KAGAN,
      content:
        "Season's starting, we need to nail down motor selection. **Kraken X60 vs Falcon 500.** Drivetrain is going swerve (decision is in #mekanik), and I say we standardize on the same motor family for shooter and intake too.",
      createdAt: "2025-09-15T18:30:00.000Z",
    },
    {
      localId: "elek-002",
      channelId: CH_ELEKTRIK,
      authorUserId: U_CAN,
      content:
        "Kraken: integrated CANcoder, 5800 rpm peak, higher torque density, but ~6900 TL each. Falcon 500 is ~5400 TL but CTRE is doing a production cut this season — supply concern.",
      createdAt: "2025-09-15T18:48:00.000Z",
      replyToLocalId: "elek-001",
    },
    {
      localId: "elek-003",
      channelId: CH_ELEKTRIK,
      authorUserId: U_KAGAN,
      content:
        "Supply risk matters. 8 swerve drive + 4 steer + 2 shooter + 2 intake = 16 motors. If we can't stock Falcons we'll freeze halfway through the season.",
      createdAt: "2025-09-15T18:55:00.000Z",
      replyToLocalId: "elek-002",
    },
    {
      localId: "elek-004",
      channelId: CH_ELEKTRIK,
      authorUserId: U_HAKAN,
      content:
        "What other alternatives did you discuss? There's also NEO Vortex — REV side is cheaper, comes with the Spark Flex driver.",
      createdAt: "2025-09-15T19:30:00.000Z",
    },
    {
      localId: "elek-005",
      channelId: CH_ELEKTRIK,
      authorUserId: U_KAGAN,
      content:
        "We did look at NEO Vortex — 6784 rpm peak, integrated encoder, ~5100 TL. But we've been on the CTRE ecosystem for years, all our muscle memory is in Phoenix tooling. Switching to NEO = relearning the entire tuner workflow.",
      createdAt: "2025-09-15T19:45:00.000Z",
      replyToLocalId: "elek-004",
    },
    {
      localId: "elek-006",
      channelId: CH_ELEKTRIK,
      authorUserId: U_BUGRA_REAL,
      content:
        "Cost difference across 16 motors is ~24k TL — not in Kraken's favor, against it. But with Çetin Group's sponsor support we can get Krakens through their CTRE distributor; I put a hold on 16 of them in early September. Supply side is solved for Kraken.",
      createdAt: "2025-09-15T20:10:00.000Z",
    },
    {
      localId: "elek-007",
      channelId: CH_ELEKTRIK,
      authorUserId: U_KAGAN,
      content:
        "OK. Decision: **Kraken X60 standard, all 16 motors.** Rationale: supply secured, CTRE ecosystem familiarity, torque advantage critical for the shooter. Falcon and NEO Vortex were considered and eliminated.",
      createdAt: "2025-09-16T11:00:00.000Z",
    },
    {
      localId: "elek-008",
      channelId: CH_ELEKTRIK,
      authorUserId: U_HAKAN,
      content:
        "Approved. Logging this as a decision in PitOS. **Off-season check:** end of March, evaluate Phoenix 6 vs Phoenix 5 firmware experience as input for next season.",
      createdAt: "2025-09-16T11:22:00.000Z",
      replyToLocalId: "elek-007",
    },
    // Storyline 2: CAN bus terminator burnout (Feb 2026)
    {
      localId: "elek-009",
      channelId: CH_ELEKTRIK,
      authorUserId: U_CAN,
      content:
        "🚨 Started testing this morning, robot enables but the drivetrain doesn't move. Phoenix Tuner shows all 8 swerve motors as 'lost contact', only the elevator motors are visible. CAN bus is down I think.",
      createdAt: "2026-02-18T10:15:00.000Z",
    },
    {
      localId: "elek-010",
      channelId: CH_ELEKTRIK,
      authorUserId: U_KAGAN,
      content: "Did you measure the 120Ω terminator? What's the resistance between CAN H and CAN L?",
      createdAt: "2026-02-18T10:18:00.000Z",
      replyToLocalId: "elek-009",
    },
    {
      localId: "elek-011",
      channelId: CH_ELEKTRIK,
      authorUserId: U_CAN,
      content: "Checked with the multimeter: **65Ω instead of 240Ω.** I think a terminator burned out, or there's a short.",
      createdAt: "2026-02-18T10:24:00.000Z",
      replyToLocalId: "elek-010",
    },
    {
      localId: "elek-012",
      channelId: CH_ELEKTRIK,
      authorUserId: U_KAGAN,
      content:
        "65Ω = two terminators in parallel + an extra low-resistance path. Probably the Pigeon 2's terminator switch is in the wrong position + a CAN H to chassis short. **Step 1:** verify RIO side terminator ON, last device terminator ON, everything in between OFF.",
      createdAt: "2026-02-18T10:32:00.000Z",
      replyToLocalId: "elek-011",
    },
    {
      localId: "elek-013",
      channelId: CH_ELEKTRIK,
      authorUserId: U_CAN,
      content:
        "👀 Pigeon 2 terminator switch was left ON (mid-bus device!) + swerve azimuth motor #3 has a scuff on its cable, CAN H is touching the chassis. Two issues at once.",
      createdAt: "2026-02-18T11:05:00.000Z",
      replyToLocalId: "elek-012",
    },
    {
      localId: "elek-014",
      channelId: CH_ELEKTRIK,
      authorUserId: U_KAGAN,
      content:
        "Pigeon switch OFF, swap the cable, double heat shrink, zip tie it 5cm off the chassis. Test it.",
      createdAt: "2026-02-18T11:10:00.000Z",
      replyToLocalId: "elek-013",
    },
    {
      localId: "elek-015",
      channelId: CH_ELEKTRIK,
      authorUserId: U_CAN,
      content:
        "✅ CAN bus is alive, all 16 devices visible, **CAN utilization 42%** (healthy). Resistance back to 119Ω. Lost 4 hours this morning but we learned a lot.",
      createdAt: "2026-02-18T13:40:00.000Z",
    },
    {
      localId: "elek-016",
      channelId: CH_ELEKTRIK,
      authorUserId: U_HAKAN,
      content:
        "That was a really valuable debug. **Turn it into a written SOP** — \"CAN bus debug checklist\". End of season this becomes gold for rookies and next year.",
      createdAt: "2026-02-18T14:00:00.000Z",
    },
    {
      localId: "elek-017",
      channelId: CH_ELEKTRIK,
      authorUserId: null,
      agentGenerated: true,
      agentType: "channel-agent",
      juryReflexKind: "proof_demand",
      content:
        "Are you logging CAN utilization through the whole match? 42% idle is fine, but what's typical during enable + autonomous? Above 85% you risk packet loss. — PitOS",
      createdAt: "2026-02-18T14:30:00.000Z",
    },
    {
      localId: "elek-018",
      channelId: CH_ELEKTRIK,
      authorUserId: U_KAGAN,
      content:
        "PitOS has a point — looking at the match log, autonomous peak is **67%**, teleop average **54%**. Margin's healthy. Still, I can optimize Phoenix 6 status frames and reduce unnecessary frequencies.",
      createdAt: "2026-02-18T15:02:00.000Z",
      replyToLocalId: "elek-017",
    },
    // Storyline 3: Battery rotation policy (Mar 2026)
    {
      localId: "elek-019",
      channelId: CH_ELEKTRIK,
      authorUserId: U_KAGAN,
      content:
        "We need a battery rotation policy for Bosphorus. **5 batteries, 8-10 match days.** Right now we just grab a random one and have no idea of its state.",
      createdAt: "2026-03-04T17:00:00.000Z",
    },
    {
      localId: "elek-020",
      channelId: CH_ELEKTRIK,
      authorUserId: U_HAKAN,
      content:
        "Proposed policy: each battery numbered (B1-B5), **load test (Battery Beak)** after every use, internal resistance logged in Notion. Anything >18mΩ goes to practice only, no matches.",
      createdAt: "2026-03-04T17:18:00.000Z",
    },
    {
      localId: "elek-021",
      channelId: CH_ELEKTRIK,
      authorUserId: U_KAGAN,
      content:
        "Agreed. I prepped the Notion template — columns: date, battery #, match #, voltage start/end, internal resistance, charge time. @Kağan Bahadır will update the battery log after each match — i.e. me 😅",
      createdAt: "2026-03-04T17:35:00.000Z",
      replyToLocalId: "elek-020",
    },
    {
      localId: "elek-022",
      channelId: CH_ELEKTRIK,
      authorUserId: U_CAN,
      content:
        "Current readings:\n- B1: 14.2mΩ ✅\n- B2: 13.8mΩ ✅\n- B3: 16.1mΩ ⚠️\n- B4: 19.4mΩ ❌ (practice only)\n- B5: 14.5mΩ ✅\n\nB4 is retired, let's pick up a new battery off-season.",
      createdAt: "2026-03-05T15:20:00.000Z",
    },
    {
      localId: "elek-023",
      channelId: CH_ELEKTRIK,
      authorUserId: U_BUGRA_REAL,
      content: "New battery is the MK ES17-12 — getting it through Saray Alüminyum's sponsor support, in our hands within 2 weeks.",
      createdAt: "2026-03-05T16:00:00.000Z",
      replyToLocalId: "elek-022",
    },
    // Storyline 4: Pneumatics leak diagnosis
    {
      localId: "elek-024",
      channelId: CH_ELEKTRIK,
      authorUserId: U_ELIF,
      content:
        "Testing climber pneumatics. The compressor barely hits 90 PSI in 5 minutes, then takes another 8 minutes to reach 120. Not normal.",
      createdAt: "2026-02-22T19:30:00.000Z",
    },
    {
      localId: "elek-025",
      channelId: CH_ELEKTRIK,
      authorUserId: U_KAGAN,
      content: "Did you do a leak test? Shut off at 120 PSI, check pressure 5 minutes later, scan fittings with soapy water.",
      createdAt: "2026-02-22T19:38:00.000Z",
      replyToLocalId: "elek-024",
    },
    {
      localId: "elek-026",
      channelId: CH_ELEKTRIK,
      authorUserId: U_ELIF,
      content:
        "Did the soap test — found bubbles at the push-to-connect fitting on the solenoid inlet, plus a small leak around the tank pressure switch. Two separate sources.",
      createdAt: "2026-02-22T20:15:00.000Z",
    },
    {
      localId: "elek-027",
      channelId: CH_ELEKTRIK,
      authorUserId: U_ELIF,
      content:
        "Fitting replaced (PTFE tape + redo), pressure switch o-ring renewed. Re-test: 120 PSI in **3 minutes 12 seconds**. No leaks. ✅",
      createdAt: "2026-02-23T11:00:00.000Z",
    },
    {
      localId: "elek-028",
      channelId: CH_ELEKTRIK,
      authorUserId: U_HAKAN,
      content:
        "Nice work Elif. Add this line to the pneumatics inspection checklist: \"compressor time to 120 PSI, anything over 4 minutes = suspect leak\".",
      createdAt: "2026-02-23T11:30:00.000Z",
      replyToLocalId: "elek-027",
    },
    // Tail
    {
      localId: "elek-029",
      channelId: CH_ELEKTRIK,
      authorUserId: U_KAGAN,
      content:
        "Bosphorus electrical post-mortem:\n- 0 CAN failures (post-February fix)\n- 1 minor pneumatic top-up (qual 22)\n- 5 batteries, all but B4 stayed on the log discipline\n- Average match brownouts: 0\n\nMight be our first \"zero electrical loss\" season.",
      createdAt: "2026-03-22T20:00:00.000Z",
    },
    {
      localId: "elek-030",
      channelId: CH_ELEKTRIK,
      authorUserId: U_DENIZ,
      content: "Definitely going in the Judges' Award presentation. The data speaks 📊",
      createdAt: "2026-03-22T20:08:00.000Z",
      replyToLocalId: "elek-029",
    },
    {
      localId: "elek-031",
      channelId: CH_ELEKTRIK,
      authorUserId: U_KAGAN,
      content:
        "Off-season plan:\n- [ ] CAN bus debug SOP write-up (we promised)\n- [ ] New battery B6 purchase\n- [ ] Phoenix 6 status frame optimization write-up\n- [ ] Rookie electrical onboarding (for September)\n\nDeadline: June 1. Who's taking what?",
      createdAt: "2026-04-12T18:00:00.000Z",
    },
  ],

  tasks: [
    {
      localId: "task-mek-001",
      channelId: CH_MEKANIK,
      title: "Shooter prototype distance matrix (3m/4m/5m/6m) test and lookup table",
      description:
        "After Test 3, target 70%+ accuracy at every distance. Log results in a Notion table. Hand off to #yazilim for PID interpolation.",
      assignedToUserId: U_ALI,
      assignedByUserId: U_DENIZ,
      createdViaLocalMessageId: "mek-019",
      deadline: "2026-02-14T17:00:00.000Z",
      status: "done",
      completedAt: "2026-02-13T20:30:00.000Z",
      createdAt: "2026-02-06T20:30:00.000Z",
    },
    {
      localId: "task-mek-002",
      channelId: CH_MEKANIK,
      title: "Spindexer bracket topology optimization + intake tube swap to aluminum",
      description: "Robot is 1.7 kg over. Drop spindexer infill to 30%, swap the intake tube for 6063 aluminum.",
      assignedToUserId: U_EREN,
      assignedByUserId: U_HAKAN,
      createdViaLocalMessageId: "mek-024",
      deadline: "2026-03-05T18:00:00.000Z",
      status: "done",
      completedAt: "2026-03-05T17:15:00.000Z",
      createdAt: "2026-03-02T17:55:00.000Z",
    },
    {
      localId: "task-mek-003",
      channelId: CH_MEKANIK,
      title: "Intake side plate stress concentration redesign",
      description:
        "Crack observed at the lower-rear corner in the Bosphorus pit. Off-season CAD revision — radius smoothing + prototype the 4mm Al + 2mm UHMW liner alternative.",
      assignedToUserId: U_ZEYNEP,
      assignedByUserId: U_HAKAN,
      createdViaLocalMessageId: "mek-036",
      deadline: "2026-06-15T18:00:00.000Z",
      status: "open",
      createdAt: "2026-04-08T19:05:00.000Z",
    },
    {
      localId: "task-cad-001",
      channelId: CH_CAD,
      title: "Onshape folder structure + naming convention migration",
      description:
        "47 old parts → archive, active parts renamed under the new convention (`<sub>-<part>-<rev>`). Notion guide to be written.",
      assignedToUserId: U_ZEYNEP,
      assignedByUserId: U_HAKAN,
      createdViaLocalMessageId: "cad-006",
      deadline: "2025-07-13T20:00:00.000Z",
      status: "done",
      completedAt: "2025-07-13T20:35:00.000Z",
      createdAt: "2025-07-09T11:05:00.000Z",
    },
    {
      localId: "task-cad-002",
      channelId: CH_CAD,
      title: "Manufacturing release list (Bosphorus)",
      description: "23 parts to Çetin Group, 14 parts to Saray Alüminyum, 8 parts in-shop. All in the rev tracker.",
      assignedToUserId: U_ZEYNEP,
      assignedByUserId: U_DENIZ,
      createdViaLocalMessageId: "cad-026",
      deadline: "2026-03-04T18:00:00.000Z",
      status: "done",
      completedAt: "2026-03-03T19:00:00.000Z",
      createdAt: "2026-02-28T10:05:00.000Z",
    },
    {
      localId: "task-cad-003",
      channelId: CH_CAD,
      title: "CAM revision tracker + two-signature handoff process",
      description:
        "Following the Çetin Group mismatch: every CAM file requires CAD lead + shop liaison signatures before export. Notion template is live.",
      assignedToUserId: U_ZEYNEP,
      assignedByUserId: U_HAKAN,
      createdViaLocalMessageId: "cad-022",
      deadline: "2026-02-26T18:00:00.000Z",
      status: "done",
      completedAt: "2026-02-25T18:00:00.000Z",
      createdAt: "2026-02-25T15:30:00.000Z",
    },
    {
      localId: "task-elek-001",
      channelId: CH_ELEKTRIK,
      title: "Battery rotation policy + Notion log",
      description:
        "Batteries numbered B1-B5, Battery Beak measurement after every use. >18mΩ practice only. Kağan to update daily.",
      assignedToUserId: U_KAGAN,
      assignedByUserId: U_HAKAN,
      createdViaLocalMessageId: "elek-021",
      deadline: "2026-03-08T18:00:00.000Z",
      status: "done",
      completedAt: "2026-03-05T18:00:00.000Z",
      createdAt: "2026-03-04T17:40:00.000Z",
    },
    {
      localId: "task-elek-002",
      channelId: CH_ELEKTRIK,
      title: "CAN bus debug SOP write-up",
      description:
        "Turn the Feb 18 outage debug experience into an SOP: terminator switch checklist, multimeter resistance values, device order. Rookie training material.",
      assignedToUserId: U_KAGAN,
      assignedByUserId: U_HAKAN,
      createdViaLocalMessageId: "elek-016",
      deadline: "2026-06-01T18:00:00.000Z",
      status: "in_progress",
      createdAt: "2026-02-18T14:05:00.000Z",
    },
    {
      localId: "task-elek-003",
      channelId: CH_ELEKTRIK,
      title: "Phoenix 6 status frame optimization",
      description:
        "Cut unnecessary status frame frequencies, increase CAN utilization margin. Off-season work.",
      assignedToUserId: U_KAGAN,
      assignedByUserId: U_KAGAN,
      createdViaLocalMessageId: "elek-018",
      deadline: "2026-06-01T18:00:00.000Z",
      status: "in_progress",
      createdAt: "2026-02-18T15:10:00.000Z",
    },
    {
      localId: "task-elek-004",
      channelId: CH_ELEKTRIK,
      title: "B6 backup battery purchase (Saray Alüminyum support)",
      description: "MK ES17-12 model. Sponsor approval + logistics 2 weeks. Delivery post-Bosphorus.",
      assignedToUserId: U_BUGRA_REAL,
      assignedByUserId: U_KAGAN,
      createdViaLocalMessageId: "elek-023",
      deadline: "2026-03-20T18:00:00.000Z",
      status: "blocked",
      createdAt: "2026-03-05T16:05:00.000Z",
    },
    {
      localId: "task-mek-004",
      channelId: CH_MEKANIK,
      title: "Spare parts checklist 2026 → 2027 update",
      description:
        "The 14-minute intake fix in the Bosphorus pit only worked because the spares were ready. We revise this list every season — 2027 version should be ready before September kickoff.",
      assignedToUserId: U_EREN,
      assignedByUserId: U_DENIZ,
      createdViaLocalMessageId: "mek-038",
      deadline: "2026-05-01T18:00:00.000Z",
      status: "open",
      createdAt: "2026-04-15T17:25:00.000Z",
    },
  ],

  decisions: [
    {
      localId: "dec-mek-001",
      sourceLocalMessageId: "mek-010",
      decision: "Drivetrain: SDS Mk4i swerve modules, L2 ratio, 4 modules COTS",
      rationale:
        "Defense resistance and auto path flexibility favored swerve. A September-December driver practice plan was made and 47 hours were logged across the season. Validated end of March: auto score average 18, teleop drive uptime 94%.",
      alternativesConsidered:
        "West Coast Tank: budget advantage (~150k TL cheaper), easier driver training, but weak position-holding under defense. Rejected.",
      contextAtTime:
        "320k TL build envelope; swerve consumes 72% of it, leaving 90k for mechanisms. Çetin Group + Siemens sponsor support makes that number work.",
      decidedAt: "2025-09-12T20:48:00.000Z",
    },
    {
      localId: "dec-elek-001",
      sourceLocalMessageId: "elek-007",
      decision: "All motors Kraken X60 (16 units — 8 drive + 4 steer + 2 shooter + 2 intake)",
      rationale:
        "CTRE Phoenix ecosystem familiarity + 16-unit Kraken stock held in early September through the Çetin Group distributor. Torque density is critical for the shooter. Standardization simplified firmware and spare-part logistics.",
      alternativesConsidered:
        "Falcon 500: cheaper but supply risk due to CTRE production cut. NEO Vortex: cheapest, but the cost of relearning the entire Phoenix tooling workflow. Both eliminated.",
      contextAtTime:
        "Drivetrain swerve decision had been made 4 days earlier; the motor decision built on top of it. Budget had margin for Kraken.",
      decidedAt: "2025-09-16T11:00:00.000Z",
    },
    {
      localId: "dec-cad-001",
      sourceLocalMessageId: "cad-005",
      decision: "Onshape revision policy: major rev (A→B) for machined geometry change, minor (A.1→A.2) for tolerance/finish; CAM always mapped to major rev",
      rationale:
        "The 2024-2025 season had 8 different 'final_v3'-style files in chaos. Without a convention, handoff errors were inevitable. The Çetin Group CAM mismatch in February 2026 caused us to extend this policy with a handoff process.",
      alternativesConsidered:
        "Numeric versioning (v1, v2, v3): unclear what each represents. Date-based versioning: hard to search. Letter-based + major/minor split was found to be the most readable.",
      contextAtTime:
        "Summer off-season (July 2025), the team was setting up the new season's infrastructure. After the mid-season CAM mismatch, the handoff portion of the process was added.",
      decidedAt: "2025-07-08T16:10:00.000Z",
    },
    {
      localId: "dec-cad-002",
      sourceLocalMessageId: "cad-022",
      decision: "CAM file export requires two signatures: CAD lead + shop liaison; revision logged in the Notion tracker",
      rationale:
        "Feb 25, 2026 Çetin Group mismatch: shooter mount plate's old rev (8mm) went to the shop while CAD had the current rev (6mm). 4 plates * 225g = 900g of extra weight, directly contributing to a robot weigh-in violation. Not a convention failure — a handoff failure.",
      alternativesConsidered:
        "Single signature (CAD lead only): fast but the same chaos as 2024-2025. Automated script: doable via Onshape API but wouldn't fit in the 6-week build window. Two-signature + Notion tracker accepted as a minimum-viable solution.",
      contextAtTime:
        "Mid robot weight overshoot crisis, 11 days before Bosphorus. Needed a fast + reliable process.",
      decidedAt: "2026-02-25T16:30:00.000Z",
    },
    {
      localId: "dec-elek-002",
      sourceLocalMessageId: "elek-020",
      decision: "Battery rotation policy: 5 numbered batteries, Battery Beak measurement on every use, >18mΩ practice-only",
      rationale:
        "Bosphorus's 8-10 match days demanded battery selection discipline. Without measurement + logging, a worn battery could have ended up in a match. On the March 4 measurement, B4 = 19.4mΩ was identified and retired.",
      alternativesConsidered:
        "Voltage-only check: insufficient — can look full while internal resistance is high. Charge timer alone: doesn't catch wear. Battery Beak + log was the most comprehensive.",
      contextAtTime:
        "9 days to the regional, 5-battery inventory. A 6th battery purchase via sponsor support was kicked off in parallel.",
      decidedAt: "2026-03-04T17:18:00.000Z",
    },
  ],
};
