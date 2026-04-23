import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import ChannelView from "@/components/workspace/channel-view";
import RightPanel from "@/components/workspace/right-panel";

export default async function ChannelPage({ params }: { params: Promise<{ channelId: string }> }) {
  const { channelId } = await params;
  const cookieHeader = (await cookies()).toString();

  const [teamRes, msgRes] = await Promise.all([
    fetch(`${process.env.APP_URL}/api/teams/mine`, { headers: { cookie: cookieHeader }, cache: "no-store" }),
    fetch(`${process.env.APP_URL}/api/channels/${channelId}/messages`, { headers: { cookie: cookieHeader }, cache: "no-store" }),
  ]);

  if (!teamRes.ok) redirect("/auth");
  const { channels, membership } = await teamRes.json();
  const { messages: initialMessages } = msgRes.ok ? await msgRes.json() : { messages: [] };

  const channel = channels.find((c: { id: string }) => c.id === channelId);
  if (!channel) redirect("/app/channels");

  return (
    <div className="flex h-full overflow-hidden">
      <div className="flex-1 overflow-hidden">
        <ChannelView channel={channel} initialMessages={initialMessages} currentUserId={membership?.userId ?? null} />
      </div>
      <RightPanel channelId={channelId} />
    </div>
  );
}
