import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { loadTeamWorkspace } from "@/lib/data/team";
import { loadChannelMessages } from "@/lib/data/messages";
import ChannelView from "@/components/workspace/channel-view";
import RightPanel from "@/components/workspace/right-panel";

export default async function ChannelPage({ params }: { params: Promise<{ channelId: string }> }) {
  const { user } = await getSession();
  if (!user) redirect("/auth");

  const { channelId } = await params;

  const [{ channels, membership }, { messages: initialMessages, hasMore: initialHasMore }] =
    await Promise.all([
      loadTeamWorkspace(user.id),
      loadChannelMessages(channelId),
    ]);

  const channel = channels.find((c) => c.id === channelId);
  if (!channel) redirect("/app/channels");

  // Serialize Date → ISO strings at the server/client boundary. The loader
  // already projects authorRole / deletedAt / deletedByName via joins, so
  // they ride along on `...m`.
  const wireMessages = initialMessages.map((m) => ({
    ...m,
    createdAt: m.createdAt.toISOString(),
    deletedAt: m.deletedAt ? m.deletedAt.toISOString() : null,
  }));

  return (
    <div className="flex h-full overflow-hidden">
      <div className="flex-1 overflow-hidden">
        <ChannelView
          channel={channel}
          initialMessages={wireMessages}
          initialHasMore={initialHasMore}
          currentUserId={membership?.userId ?? null}
          viewerRole={membership.role as "lead_mentor" | "mentor" | "captain" | "student"}
        />
      </div>
      <RightPanel channelId={channelId} teamId={membership.teamId} />
    </div>
  );
}
