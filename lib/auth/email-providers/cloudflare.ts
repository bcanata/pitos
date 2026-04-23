export async function sendViaCloudflare(
  to: string,
  subject: string,
  html: string,
  text: string
): Promise<void> {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID!;
  const apiToken = process.env.CLOUDFLARE_EMAIL_API_TOKEN!;
  const from = process.env.FROM_EMAIL ?? "noreply@pitos.app";

  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/email/sending/send`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: `PitOS <${from}>`, to, subject, html, text }),
    }
  );

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Cloudflare Email send failed: ${res.status} ${body}`);
  }
}
