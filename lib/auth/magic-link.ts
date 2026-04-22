import { randomBytes } from "crypto";
import { db } from "@/db";
import { magicLinks } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function sendMagicLink(email: string): Promise<void> {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
  const id = crypto.randomUUID();

  await db.insert(magicLinks).values({ id, email, token, expiresAt });

  const url = `${process.env.APP_URL ?? "http://localhost:3000"}/api/auth/verify?token=${token}`;

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
          subject: "Your PitOS magic link",
          html: `<p>Click <a href="${url}">here</a> to sign in to PitOS. This link expires in 15 minutes.</p>`,
          text: `Sign in to PitOS: ${url}\n\nThis link expires in 15 minutes.`,
        }),
      }
    );
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Cloudflare Email send failed: ${res.status} ${body}`);
    }
  } else {
    console.log("[dev] Magic link:", url);
  }
}

export { eq };
