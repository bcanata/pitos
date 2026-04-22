"use client";

import { useState } from "react";

interface PendingInvite {
  id: string;
  email: string;
  expiresAt: string | number | null;
}

interface Props {
  initialPending: PendingInvite[];
}

export default function InviteForm({ initialPending }: Props) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [pending, setPending] = useState<PendingInvite[]>(initialPending);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus("error");
        setErrorMsg(data.error ?? "Failed to send invite");
        return;
      }
      setStatus("success");
      setEmail("");
      // Refresh pending list
      const listRes = await fetch("/api/invites");
      if (listRes.ok) {
        const listData = await listRes.json();
        setPending(listData.invites ?? []);
      }
    } catch {
      setStatus("error");
      setErrorMsg("Network error — please try again");
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          required
          placeholder="teammate@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 rounded border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
        >
          {status === "loading" ? "Sending…" : "Send Invite"}
        </button>
      </form>

      {status === "success" && (
        <p className="text-sm text-green-600">Invite sent!</p>
      )}
      {status === "error" && (
        <p className="text-sm text-destructive">{errorMsg}</p>
      )}

      {pending.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Pending invites
          </p>
          <ul className="space-y-1">
            {pending.map((inv) => (
              <li key={inv.id} className="flex items-center justify-between rounded border border-border px-3 py-2 text-sm">
                <span>{inv.email}</span>
                <span className="text-xs text-muted-foreground">
                  {inv.expiresAt
                    ? `Expires ${new Date(inv.expiresAt).toLocaleDateString()}`
                    : "No expiry"}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
