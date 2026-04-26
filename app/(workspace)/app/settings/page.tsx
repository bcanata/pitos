import { redirect } from "next/navigation";
import { db } from "@/db";
import { memberships, users, invites, teams } from "@/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { getSession } from "@/lib/session";
import { getTeamBundle } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/index";
import InviteForm from "@/components/workspace/invite-form";
import LanguageSettings from "@/components/workspace/language-settings";
import PendingMembers from "@/components/workspace/pending-members";
import TeamInfoForm from "@/components/workspace/team-info-form";
import { Avatar, SectionHead } from "@/components/workspace/broadcast-atoms";
import { displayEmail, displayName } from "@/lib/demo";

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
      status: memberships.status,
      userId: users.id,
      email: users.email,
      name: users.name,
    })
    .from(memberships)
    .leftJoin(users, eq(memberships.userId, users.id))
    .where(eq(memberships.teamId, membership.teamId))
    .all();

  const activeMemberships = teamMemberships.filter((m) => m.status === "active");
  const pendingMemberships = teamMemberships.filter((m) => m.status === "pending");

  const canInvite = membership.role === "lead_mentor" || membership.role === "captain";
  const canApprove = canInvite;

  const serializedPending = pendingMemberships.map((m) => ({
    membershipId: m.membershipId,
    email: displayEmail(m.email),
    name: displayName(m.name),
    joinedAt: m.joinedAt.getTime(),
  }));

  const pendingInvites = canInvite
    ? await db
        .select()
        .from(invites)
        .where(and(eq(invites.teamId, membership.teamId), isNull(invites.acceptedAt)))
        .all()
    : [];

  const serializedInvites = pendingInvites.map((inv) => ({
    id: inv.id,
    email: displayEmail(inv.email) ?? inv.email,
    expiresAt: inv.expiresAt ? inv.expiresAt.getTime() : null,
  }));

  return (
    <div className="pit-page">
      <SectionHead kicker="STATIONS / SETTINGS" title={t(bundle, "settings.title").toUpperCase()} />
      <div className="pit-page-scroll pit-scroll">
        <div className="pit-page-body" style={{ maxWidth: 720 }}>
          <div className="pit-eyebrow">TEAM</div>
          <div style={{ marginTop: 8, marginBottom: 24 }}>
            <TeamInfoForm team={{ name: team?.name ?? "", number: team?.number ?? null }} />
          </div>

          {canApprove && (
            <>
              <div className="pit-eyebrow" style={{ marginTop: 24 }}>PENDING REQUESTS</div>
              <div style={{ marginTop: 8, marginBottom: 24 }}>
                <PendingMembers initialPending={serializedPending} />
              </div>
            </>
          )}

          <div className="pit-eyebrow" style={{ marginTop: 24 }}>
            {t(bundle, "settings.teamMembers").toUpperCase()}
          </div>
          {activeMemberships.length === 0 ? (
            <p style={{ color: "var(--pit-text-3)", fontSize: 13, marginTop: 8 }}>
              {t(bundle, "settings.noMembers")}
            </p>
          ) : (
            <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
              {activeMemberships.map((m) => (
                <div
                  key={m.membershipId}
                  className="pit-card"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 12px",
                    fontSize: 13,
                  }}
                >
                  {(() => {
                    const shownName = displayName(m.name);
                    const shownEmail = displayEmail(m.email);
                    return (
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <Avatar name={shownName ?? shownEmail ?? "?"} />
                        <div>
                          <div style={{ fontWeight: 600 }}>{shownName ?? shownEmail ?? "Unknown"}</div>
                          {shownName && shownEmail && (
                            <div style={{ color: "var(--pit-text-3)", fontSize: 11 }}>{shownEmail}</div>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {m.subteam && (
                      <span className="pit-chip">
                        <span
                          className={`pit-subteam-dot pit-subteam-${
                            m.subteam === "programming"
                              ? "prog"
                              : m.subteam === "outreach"
                              ? "out"
                              : m.subteam === "business"
                              ? "biz"
                              : "build"
                          }`}
                        />
                        {m.subteam}
                      </span>
                    )}
                    <span className="pit-chip">{m.role.replace("_", " ")}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {canInvite && (
            <>
              <div className="pit-eyebrow" style={{ marginTop: 28 }}>
                {t(bundle, "settings.inviteMember").toUpperCase()}
              </div>
              <div style={{ marginTop: 8, marginBottom: 24 }}>
                <InviteForm initialPending={serializedInvites} />
              </div>
            </>
          )}

          <div className="pit-eyebrow" style={{ marginTop: 28 }}>
            {t(bundle, "settings.language").toUpperCase()}
          </div>
          <div style={{ marginTop: 8 }}>
            <LanguageSettings currentLang={user.language ?? "en"} />
          </div>
        </div>
      </div>
    </div>
  );
}
