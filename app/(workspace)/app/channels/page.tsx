import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function ChannelsPage() {
  const cookieHeader = (await cookies()).toString();
  const res = await fetch(`${process.env.APP_URL}/api/teams/mine`, {
    headers: { cookie: cookieHeader },
    cache: "no-store",
  });
  if (!res.ok) redirect("/auth");
  const { channels } = await res.json();
  if (channels?.[0]) redirect(`/app/channels/${channels[0].id}`);
  redirect("/app");
}
