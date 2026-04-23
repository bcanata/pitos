export async function sendViaResend(
  to: string,
  subject: string,
  html: string,
  text: string
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY!;
  const from = process.env.RESEND_FROM_EMAIL ?? process.env.FROM_EMAIL ?? "noreply@pitos.app";

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: `PitOS <${from}>`, to, subject, html, text }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Resend send failed: ${res.status} ${body}`);
  }
}
