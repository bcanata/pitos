import { randomBytes } from "crypto";
import { db } from "@/db";
import { magicLinks } from "@/db/schema";
import { Resend } from "resend";
import { eq } from "drizzle-orm";

export async function sendMagicLink(email: string): Promise<void> {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
  const id = crypto.randomUUID();

  await db.insert(magicLinks).values({ id, email, token, expiresAt });

  const url = `${process.env.APP_URL ?? "http://localhost:3000"}/api/auth/verify?token=${token}`;

  if (process.env.RESEND_API_KEY) {
    await new Resend(process.env.RESEND_API_KEY).emails.send({
      from: "PitOS <noreply@pitos.app>",
      to: email,
      subject: "Your PitOS magic link",
      html: `<p>Click <a href="${url}">here</a> to sign in to PitOS. This link expires in 15 minutes.</p>`,
    });
  } else {
    console.log("Magic link:", url);
  }
}

export { eq };
