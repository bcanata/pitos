import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { loadTeamWorkspace } from "@/lib/data/team";
import ChannelSidebar from "@/components/workspace/channel-sidebar";
import CommandPalette from "@/components/workspace/command-palette";

export default async function WorkspaceAppLayout({ children }: { children: React.ReactNode }) {
  const { user } = await getSession();
  if (!user) redirect("/auth");

  const { team, channels, membership } = await loadTeamWorkspace(user.id);

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

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Left sidebar */}
      <ChannelSidebar
        team={team}
        channels={sidebarChannels}
        currentUserId={membership?.userId ?? null}
      />
      {/* Main content */}
      <main className="flex-1 overflow-hidden">{children}</main>
      {/* Cmd+K palette — global, mounted once per workspace */}
      <CommandPalette
        channels={sidebarChannels.map((c) => ({ id: c.id, name: c.name }))}
      />
    </div>
  );
}
