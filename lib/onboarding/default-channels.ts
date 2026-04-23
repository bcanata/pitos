export type ChannelDef = {
  name: string;
  description: string;
  type?: "public" | "private";
};

export const defaultChannels: ChannelDef[] = [
  { name: "general",    description: "Announcements, team-wide topics" },
  { name: "chat",       description: "Social, team culture, off-topic" },
  { name: "mentors",    description: "Mentor coordination", type: "private" },
  { name: "mechanical", description: "Design, assembly, testing" },
  { name: "software",   description: "Code, vision, electrical-software integration" },
  { name: "electrical", description: "Wiring, motor controllers, sensors" },
  { name: "cad",        description: "Onshape/SolidWorks design, parts list" },
  { name: "strategy",   description: "Game analysis, alliance selection, scouting" },
  { name: "outreach",   description: "Community events, school visits, demos" },
  { name: "sponsors",   description: "Sponsor relations, meetings, follow-ups" },
  { name: "media",      description: "Social media, photos, videos, press" },
  { name: "awards",     description: "Impact, Engineering Inspiration, Dean's List submissions" },
  { name: "scouting",   description: "Opponent analysis, match data, alliance selection" },
  { name: "pit-crew",   description: "Tournament pit operations" },
  { name: "travel",     description: "Transportation, lodging, logistics" },
  { name: "kit-parts",  description: "KOP inventory, missing parts tracking" },
  { name: "safety",     description: "Safety incidents, equipment maintenance" },
  { name: "alumni",     description: "Alumni connection — Exit Interview records" },
];
