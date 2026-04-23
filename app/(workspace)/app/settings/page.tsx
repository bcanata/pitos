import { redirect } from "next/navigation";
import { db } from "@/db";
import { memberships, users, invites, teams } from "@/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { getSession } from "@/lib/session";
import { getTeamBundle } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/index";
import InviteForm from "@/components/workspace/invite-form";
import LanguageSettings from "@/components/workspace/language-settings";

export default async function SettingsPage() {
  const { user } = await getSession();
  if (!user) redirect("/auth");

  const membership = await db
    .select()
    .from(memberships)
    .where(eq(memberships.userId, user.id))
    .get();

  if (!membership) redirect("/onboarding");

  const team = await db
    .select()
    .from(teams)
    .where(eq(teams.id, membership.teamId))
    .get();

  const { bundle } = await getTeamBundle(user.id);

  const teamMemberships = await db
    .select({
      membershipId: memberships.id,
      role: memberships.role,
      subteam: memberships.subteam,
      joinedAt: memberships.joinedAt,
      userId: users.id,
      email: users.email,
      name: users.name,
    })
    .from(memberships)
    .leftJoin(users, eq(memberships.userId, users.id))
    .where(eq(memberships.teamId, membership.teamId))
    .all();

  const pendingInvites = await db
    .select()
    .from(invites)
    .where(and(eq(invites.teamId, membership.teamId), isNull(invites.acceptedAt)))
    .all();

  const serializedInvites = pendingInvites.map((inv) => ({
    id: inv.id,
    email: inv.email,
    expiresAt: inv.expiresAt ? inv.expiresAt.getTime() : null,
  }));

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <h1 className="text-xl font-semibold">{t(bundle, "settings.title")}</h1>

      <section className="space-y-3">
        <h2 className="text-base font-medium border-b border-border pb-2">
          {t(bundle, "settings.teamMembers")}
        </h2>
        {teamMemberships.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t(bundle, "settings.noMembers")}</p>
        ) : (
          <ul className="space-y-2">
            {teamMemberships.map((m) => (
              <li
                key={m.membershipId}
                className="flex items-center justify-between rounded border border-border px-3 py-2 text-sm"
              >
                <div>
                  <span className="font-medium">{m.name ?? m.email ?? "Unknown"}</span>
                  {m.name && m.email && (
                    <span className="ml-2 text-muted-foreground text-xs">{m.email}</span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {m.subteam && <span className="capitalize">{m.subteam}</span>}
                  <span className="capitalize">{m.role.replace("_", " ")}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-medium border-b border-border pb-2">
          {t(bundle, "settings.inviteMember")}
        </h2>
        <InviteForm initialPending={serializedInvites} />
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-medium border-b border-border pb-2">
          {t(bundle, "settings.language")}
        </h2>
        <LanguageSettings
          currentLang={user.language ?? "en"}
        />
      </section>
    </div>
  );
}
