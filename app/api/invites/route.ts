import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { db } from "@/db";
import { invites } from "@/db/schema";
import { eq, isNull, and } from "drizzle-orm";
import { isDemoUser } from "@/lib/demo";
import { requireActiveMembership, requireRole, scopeErrorResponse } from "@/lib/auth/scope";

const INVITE_ROLES = ["lead_mentor", "captain"] as const;

export async function POST(request: Request) {
  let user, membership;
  try {
    ({ user, membership } = await requireActiveMembership());
    requireRole(membership, INVITE_ROLES);
  } catch (e) {
    const r = scopeErrorResponse(e);
    if (r) return r;
    throw e;
  }

  if (isDemoUser(user.email)) {
    return NextResponse.json({ error: "Not available in demo" }, { status: 403 });
  }

  const body = await request.json();
  const email: string | undefined = body?.email;
  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Valid email required" }, { status: 400 });
  }

  const { teamId } = membership;
  const token = randomBytes(32).toString("hex");
  const id = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await db.insert(invites).values({
    id,
    teamId,
    email,
    role: "student",
    token,
    expiresAt,
    invitedByUserId: user.id,
  });

  const url = `${process.env.APP_URL ?? "http://localhost:3000"}/api/invites/accept?token=${token}`;

  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_EMAIL_API_TOKEN;
  const fromEmail = process.env.FROM_EMAIL ?? "noreply@pitos.app";

  if (accountId && apiToken) {
    const res = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/email/sending/send`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: `PitOS <${fromEmail}>`,
          to: email,
          subject: "You've been invited to PitOS",
          html: `<p>You've been invited to join the team on PitOS. <a href="${url}">Accept invitation</a> (expires in 7 days).</p>`,
          text: `You've been invited to join the team on PitOS. Accept invitation: ${url} (expires in 7 days).`,
        }),
      }
    );
    if (!res.ok) {
      const errBody = await res.text();
      console.error(`[invite] Cloudflare Email send failed: ${res.status} ${errBody}`);
    }
  } else {
    console.log("[dev] Invite link:", url);
  }

  return NextResponse.json({ success: true });
}

export async function GET() {
  let user, membership;
  try {
    ({ user, membership } = await requireActiveMembership());
    requireRole(membership, INVITE_ROLES);
  } catch (e) {
    const r = scopeErrorResponse(e);
    if (r) return r;
    throw e;
  }

  if (isDemoUser(user.email)) {
    return NextResponse.json({ error: "Not available in demo" }, { status: 403 });
  }

  const pending = await db
    .select()
    .from(invites)
    .where(and(eq(invites.teamId, membership.teamId), isNull(invites.acceptedAt)))
    .all();

  return NextResponse.json({ invites: pending });
}
