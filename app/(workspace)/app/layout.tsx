import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import ChannelSidebar from "@/components/workspace/channel-sidebar";
import CommandPalette from "@/components/workspace/command-palette";

export default async function WorkspaceAppLayout({ children }: { children: React.ReactNode }) {
  const cookieHeader = (await cookies()).toString();
  const res = await fetch(`${process.env.APP_URL}/api/teams/mine`, {
    headers: { cookie: cookieHeader },
    cache: "no-store",
  });

  if (!res.ok) redirect("/auth");

  const { team, channels, membership } = await res.json();

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Left sidebar */}
      <ChannelSidebar
        team={team}
        channels={channels}
        currentUserId={membership?.userId ?? null}
      />
      {/* Main content */}
      <main className="flex-1 overflow-hidden">{children}</main>
      {/* Cmd+K palette — global, mounted once per workspace */}
      <CommandPalette
        channels={channels.map((c: { id: string; name: string }) => ({ id: c.id, name: c.name }))}
      />
    </div>
  );
}
