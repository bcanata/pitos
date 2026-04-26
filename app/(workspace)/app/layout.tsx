import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { loadTeamWorkspace } from "@/lib/data/team";
import { db } from "@/db";
import { tasks, decisions } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import ChannelSidebar from "@/components/workspace/channel-sidebar";
import CommandPalette from "@/components/workspace/command-palette";
import BroadcastBar from "@/components/workspace/broadcast-bar";
import { displayName } from "@/lib/demo";
import { MobileShellProvider } from "@/lib/mobile-shell-context";

export default async function WorkspaceAppLayout({ children }: { children: React.ReactNode }) {
  const { user } = await getSession();
  if (!user) redirect("/auth");

  const { team, channels, membership } = await loadTeamWorkspace(user.id);

  // Telemetry — light agg queries to feed the scoreboard. Each is a single
  // count so the cost is small even on the workspace layout.
  const [openTasksRow, blockedTasksRow, decisionsRow] = await Promise.all([
    db
      .select({ c: tasks.id })
      .from(tasks)
      .where(and(eq(tasks.teamId, team.id), eq(tasks.status, "open")))
      .all(),
    db
      .select({ c: tasks.id })
      .from(tasks)
      .where(and(eq(tasks.teamId, team.id), eq(tasks.status, "blocked")))
      .all(),
    db
      .select({ c: decisions.id })
      .from(decisions)
      .where(eq(decisions.teamId, team.id))
      .all(),
  ]);

  const channelCount = channels.length;
  const openTaskCount = openTasksRow.length;
  const blockedTaskCount = blockedTasksRow.length;
  const decisionCount = decisionsRow.length;

  // Serialize Date fields → ISO strings for client component props.
  const sidebarChannels = channels.map((c) => ({
    id: c.id,
    name: c.name,
    description: c.description,
    unreadCount: c.unreadCount,
    lastMessage: c.lastMessage
      ? { ...c.lastMessage, createdAt: c.lastMessage.createdAt.toISOString() }
      : null,
  }));

  const wireTeam = { id: team.id, name: team.name, number: team.number };
  // displayName masks personal names on the public demo instance only —
  // see lib/demo.ts. Team name + number stay unmasked.
  const wireUser = { id: user.id, name: displayName(user.name) };

  return (
    <div className="pit-root flex flex-col h-screen bg-background overflow-hidden">
      <BroadcastBar
        team={wireTeam}
        user={wireUser}
        telemetry={[
          { label: "CH", value: channelCount },
          { label: "TASKS OPEN", value: openTaskCount },
          { label: "BLOCKED", value: blockedTaskCount },
          { label: "DEC LOG", value: decisionCount },
        ]}
      />
      <MobileShellProvider>
        <div className="flex flex-1 min-h-0 overflow-hidden">
          <ChannelSidebar
            team={team}
            channels={sidebarChannels}
            currentUserId={membership?.userId ?? null}
          />
          <main className="flex-1 overflow-hidden min-w-0">{children}</main>
          <CommandPalette
            channels={sidebarChannels.map((c) => ({ id: c.id, name: c.name }))}
          />
        </div>
      </MobileShellProvider>
    </div>
  );
}
