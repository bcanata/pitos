"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface Decision {
  id: string;
  decision: string;
  rationale: string | null;
  alternativesConsidered: string | null;
  contextAtTime: string | null;
  recordedAt: string | number;
}

export default function DecisionsPage() {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [rationale, setRationale] = useState("");
  const [alternatives, setAlternatives] = useState("");
  const [context, setContext] = useState("");

  async function loadDecisions() {
    try {
      const res = await fetch("/api/decisions");
      const data = await res.json();
      setDecisions(data.decisions ?? []);
    } catch {
      setError("Failed to load decisions.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDecisions();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/decisions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          rationale: rationale.trim() || undefined,
          alternativesConsidered: alternatives.trim() || undefined,
          contextAtTime: context.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to record decision.");
        return;
      }

      setTitle("");
      setRationale("");
      setAlternatives("");
      setContext("");
      await loadDecisions();
    } catch {
      setError("Failed to record decision.");
    } finally {
      setSubmitting(false);
    }
  }

  function formatDate(val: string | number) {
    const d = new Date(typeof val === "number" ? val * 1000 : val);
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto">
    <div className="border-b border-border px-6 py-4">
      <h1 className="text-lg font-semibold">Decisions</h1>
      <p className="text-sm text-muted-foreground">Record and review key team decisions with rationale.</p>
    </div>
    <div className="p-6 max-w-3xl mx-auto w-full space-y-8">
      {/* Record a Decision */}
      <Card>
        <CardHeader>
          <CardTitle>Record a Decision</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="title" className="text-sm font-medium">Decision Title</label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What was decided?"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="rationale" className="text-sm font-medium">Rationale</label>
              <Textarea
                id="rationale"
                value={rationale}
                onChange={(e) => setRationale(e.target.value)}
                placeholder="Why did you make this choice?"
                rows={3}
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="alternatives" className="text-sm font-medium">Alternatives Considered</label>
              <Textarea
                id="alternatives"
                value={alternatives}
                onChange={(e) => setAlternatives(e.target.value)}
                placeholder="What else did you consider?"
                rows={3}
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="context" className="text-sm font-medium">Context at the Time</label>
              <Textarea
                id="context"
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="What was happening at the time?"
                rows={3}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" disabled={submitting || !title.trim()}>
              {submitting ? "Recording…" : "Record Decision"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Decision Log */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Decision Log</h2>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : decisions.length === 0 ? (
          <div className="rounded-lg border border-border bg-card py-10 text-center">
            <p className="text-sm font-medium text-muted-foreground">No decisions recorded yet</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Use the form above to log your first decision.</p>
          </div>
        ) : (
          decisions.map((d) => (
            <Card key={d.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base leading-snug">{d.decision}</CardTitle>
                <p className="text-xs text-muted-foreground">{formatDate(d.recordedAt)}</p>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {d.rationale && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Rationale</p>
                    <p className="text-foreground/90 leading-relaxed">{d.rationale}</p>
                  </div>
                )}
                {d.alternativesConsidered && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Alternatives Considered</p>
                    <p className="italic text-muted-foreground leading-relaxed">{d.alternativesConsidered}</p>
                  </div>
                )}
                {d.contextAtTime && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Context</p>
                    <p className="text-foreground/80 leading-relaxed">{d.contextAtTime}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
    </div>
  );
}
