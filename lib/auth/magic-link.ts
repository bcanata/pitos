import { randomBytes } from "crypto";
import { db } from "@/db";
import { magicLinks } from "@/db/schema";
import { eq } from "drizzle-orm";
import { sendViaResend } from "./email-providers/resend";
import { sendViaCloudflare } from "./email-providers/cloudflare";

export async function sendMagicLink(email: string): Promise<void> {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
  const id = crypto.randomUUID();

  await db.insert(magicLinks).values({ id, email, token, expiresAt });

  const url = `${process.env.APP_URL ?? "http://localhost:3000"}/api/auth/verify?token=${token}`;
  const subject = "Your PitOS magic link";
  const html = `<p>Click <a href="${url}">here</a> to sign in to PitOS. This link expires in 15 minutes.</p>`;
  const text = `Sign in to PitOS: ${url}\n\nThis link expires in 15 minutes.`;

  if (process.env.RESEND_API_KEY) {
    await sendViaResend(email, subject, html, text);
  } else if (process.env.CLOUDFLARE_ACCOUNT_ID && process.env.CLOUDFLARE_EMAIL_API_TOKEN) {
    await sendViaCloudflare(email, subject, html, text);
  } else {
    console.log("[dev] Magic link:", url);
  }
}

export { eq };
