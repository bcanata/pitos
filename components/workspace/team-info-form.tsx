"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  team: { name: string; number: number | null };
}

export default function TeamInfoForm({ team }: Props) {
  const router = useRouter();
  const [name, setName] = useState(team.name);
  const [number, setNumber] = useState(team.number?.toString() ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) return;
    setSaving(true);
    setError("");
    setSaved(false);

    const parsed = number.trim() ? parseInt(number.trim(), 10) : undefined;
    const res = await fetch("/api/teams/mine", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: trimmedName, ...(parsed ? { number: parsed } : {}) }),
    });

    setSaving(false);
    if (res.ok) {
      setSaved(true);
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError((data as { error?: string }).error ?? "Failed to save");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex gap-3">
        <div className="flex-1 space-y-1">
          <label className="text-xs text-muted-foreground">Team name</label>
          <input
            value={name}
            onChange={(e) => { setName(e.target.value); setSaved(false); }}
            className="w-full rounded border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            required
          />
        </div>
        <div className="w-28 space-y-1">
          <label className="text-xs text-muted-foreground">Team number</label>
          <input
            type="number"
            value={number}
            onChange={(e) => { setNumber(e.target.value); setSaved(false); }}
            placeholder="e.g. 8092"
            className="w-full rounded border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
      <button
        type="submit"
        disabled={saving}
        className="rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
      >
        {saving ? "Saving…" : saved ? "Saved" : "Save"}
      </button>
    </form>
  );
}
