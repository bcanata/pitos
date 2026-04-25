import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { loadTeamWorkspace } from "@/lib/data/team";

export default async function ChannelsPage() {
  const { user } = await getSession();
  if (!user) redirect("/auth");

  const { channels } = await loadTeamWorkspace(user.id);
  if (channels[0]) redirect(`/app/channels/${channels[0].id}`);
  redirect("/app");
}
