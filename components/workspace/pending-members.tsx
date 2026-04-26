"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

interface PendingMember {
  membershipId: string;
  email: string | null;
  name: string | null;
  joinedAt: number;
}

interface Props {
  initialPending: PendingMember[];
}

export default function PendingMembers({ initialPending }: Props) {
  const router = useRouter();
  const [pending, setPending] = useState<PendingMember[]>(initialPending);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  async function act(membershipId: string, action: "approve" | "reject") {
    setBusyId(membershipId);
    setError(null);
    try {
      const res = await fetch(`/api/memberships/${membershipId}/${action}`, { method: "POST" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? `Failed to ${action}`);
        return;
      }
      setPending((prev) => prev.filter((p) => p.membershipId !== membershipId));
      // Refresh server-rendered roster.
      startTransition(() => router.refresh());
    } catch {
      setError("Network error — try again.");
    } finally {
      setBusyId(null);
    }
  }

  if (pending.length === 0) {
    return <p className="text-sm text-muted-foreground">No pending requests.</p>;
  }

  return (
    <div className="space-y-2">
      {error && <p className="text-sm text-destructive">{error}</p>}
      <ul className="space-y-2">
        {pending.map((m) => (
          <li
            key={m.membershipId}
            className="flex items-center justify-between rounded border border-amber-500/40 bg-amber-500/5 px-3 py-2 text-sm"
          >
            <div>
              <span className="font-medium">{m.name ?? m.email ?? "Unknown"}</span>
              {m.name && m.email && (
                <span className="ml-2 text-muted-foreground text-xs">{m.email}</span>
              )}
              <span className="ml-2 text-amber-600 dark:text-amber-400 text-xs uppercase tracking-wide">
                Pending
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={busyId === m.membershipId}
                onClick={() => act(m.membershipId, "approve")}
                className="rounded bg-primary px-3 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
              >
                {busyId === m.membershipId ? "..." : "Approve"}
              </button>
              <button
                type="button"
                disabled={busyId === m.membershipId}
                onClick={() => act(m.membershipId, "reject")}
                className="rounded border border-border px-3 py-1 text-xs font-medium hover:bg-muted disabled:opacity-60"
              >
                Reject
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
