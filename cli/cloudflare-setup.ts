/**
 * Cloudflare DNS + email setup helpers for the PitOS CLI.
 *
 * Uses a scoped API Token (Bearer auth) rather than the Global API Key.
 * Required token permissions:
 *   - Zone:Zone:Read        (to look up zone ID by domain name)
 *   - Zone:DNS:Edit         (to create CNAME + TXT records)
 *   - Zone:Email Routing Rules:Read (optional, for DKIM key discovery)
 * Scope to "All zones" or the specific zone being configured.
 */

export interface CfAuth {
  token: string;
}

async function cfFetch(url: string, auth: CfAuth, opts?: RequestInit): Promise<Response> {
  return fetch(url, {
    ...opts,
    headers: {
      Authorization: `Bearer ${auth.token}`,
      "Content-Type": "application/json",
    },
  });
}

/** Verify the token is valid and has the right shape. */
export async function verifyToken(auth: CfAuth): Promise<boolean> {
  try {
    const res = await cfFetch("https://api.cloudflare.com/client/v4/user/tokens/verify", auth);
    const j = (await res.json()) as { success?: boolean };
    return j.success === true;
  } catch {
    return false;
  }
}

/** Find the Cloudflare zone ID for a domain (handles subdomains). */
export async function findZone(domain: string, auth: CfAuth): Promise<string | null> {
  const parts = domain.split(".");
  // Try from outermost (whole domain) down to just TLD+1
  for (let i = 0; i < parts.length - 1; i++) {
    const name = parts.slice(i).join(".");
    const res = await cfFetch(
      `https://api.cloudflare.com/client/v4/zones?name=${encodeURIComponent(name)}`,
      auth
    );
    const j = (await res.json()) as { result?: { id: string }[] };
    if (j.result?.[0]?.id) return j.result[0].id;
  }
  return null;
}

async function getDnsRecords(
  zoneId: string,
  type: string,
  name: string,
  auth: CfAuth
): Promise<{ id: string; content: string }[]> {
  const res = await cfFetch(
    `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records?type=${type}&name=${encodeURIComponent(name)}`,
    auth
  );
  const j = (await res.json()) as { result?: { id: string; content: string }[] };
  return j.result ?? [];
}

async function createDnsRecord(
  zoneId: string,
  type: string,
  name: string,
  content: string,
  auth: CfAuth,
  extra: Record<string, unknown> = {}
): Promise<void> {
  await cfFetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records`, auth, {
    method: "POST",
    body: JSON.stringify({ type, name, content, ttl: 1, proxied: false, ...extra }),
  });
}

async function deleteDnsRecord(zoneId: string, id: string, auth: CfAuth): Promise<void> {
  await cfFetch(
    `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records/${id}`,
    auth,
    { method: "DELETE" }
  );
}

export interface SetupResult {
  cname: "created" | "exists";
  spf: "created" | "exists";
  dkim: "created" | "skipped";
  errors: string[];
}

/**
 * Set up DNS records on Cloudflare so `domain` points to Vercel
 * and can send email via Cloudflare.
 */
export async function setupDomainDns(
  zoneId: string,
  domain: string,
  auth: CfAuth
): Promise<SetupResult> {
  const result: SetupResult = { cname: "exists", spf: "exists", dkim: "skipped", errors: [] };

  // 1. CNAME → Vercel (replace A record if present)
  try {
    const aRecords = await getDnsRecords(zoneId, "A", domain, auth);
    const cnameRecords = await getDnsRecords(zoneId, "CNAME", domain, auth);
    const hasCorrectCname = cnameRecords.some((r) => r.content.includes("vercel"));

    if (!hasCorrectCname) {
      for (const r of [...aRecords, ...cnameRecords]) {
        await deleteDnsRecord(zoneId, r.id, auth);
      }
      await createDnsRecord(zoneId, "CNAME", domain, "cname.vercel-dns.com", auth);
      result.cname = "created";
    }
  } catch (e) {
    result.errors.push(`CNAME: ${e instanceof Error ? e.message : String(e)}`);
  }

  // 2. SPF TXT record
  try {
    const spfContent = "v=spf1 include:_spf.mx.cloudflare.net ~all";
    const existing = await getDnsRecords(zoneId, "TXT", domain, auth);
    const hasSpf = existing.some((r) => r.content.includes("_spf.mx.cloudflare.net"));

    if (!hasSpf) {
      await createDnsRecord(zoneId, "TXT", domain, spfContent, auth);
      result.spf = "created";
    }
  } catch (e) {
    result.errors.push(`SPF: ${e instanceof Error ? e.message : String(e)}`);
  }

  // 3. DKIM — best-effort: pull key from zone email routing if available
  try {
    const routingRes = await cfFetch(
      `https://api.cloudflare.com/client/v4/zones/${zoneId}/email/routing`,
      auth
    );
    const routing = (await routingRes.json()) as {
      result?: {
        errors?: Array<{
          code: string;
          missing?: { name: string; content: string };
        }>;
      };
    };

    const dkimError = routing.result?.errors?.find((e) => e.code === "dkim.missing");
    if (dkimError?.missing?.content) {
      const selector = "cf2024-1";
      const dkimName = `${selector}._domainkey.${domain}`;
      const existing = await getDnsRecords(zoneId, "TXT", dkimName, auth);
      if (!existing.length) {
        await createDnsRecord(zoneId, "TXT", dkimName, dkimError.missing.content, auth);
      }
      result.dkim = "created";
    }
  } catch {
    // DKIM is best-effort — don't fail the whole setup
  }

  return result;
}
