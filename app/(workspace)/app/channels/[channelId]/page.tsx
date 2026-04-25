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

  // Serialize Date → ISO string at the server/client boundary.
  const wireMessages = initialMessages.map((m) => ({
    ...m,
    createdAt: m.createdAt.toISOString(),
  }));

  return (
    <div className="flex h-full overflow-hidden">
      <div className="flex-1 overflow-hidden">
        <ChannelView
          channel={channel}
          initialMessages={wireMessages}
          initialHasMore={initialHasMore}
          currentUserId={membership?.userId ?? null}
        />
      </div>
      <RightPanel channelId={channelId} teamId={membership.teamId} />
    </div>
  );
}
