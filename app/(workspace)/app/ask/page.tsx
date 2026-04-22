"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search } from "lucide-react";
import Link from "next/link";

interface Citation {
  messageId: string;
  channelName: string;
  preview: string;
}

interface AskResult {
  answer: string;
  citations: Citation[];
}

export default function AskPage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AskResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Something went wrong");
        return;
      }

      const data: AskResult = await res.json();
      setResult(data);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Header */}
      <div className="border-b border-border px-6 py-4">
        <h1 className="text-lg font-semibold">Ask PitOS</h1>
        <p className="text-sm text-muted-foreground">
          Search your team&apos;s history and get AI-synthesized answers with citations
        </p>
      </div>

      <div className="flex-1 px-6 py-6 max-w-3xl mx-auto w-full">
        {/* Search form */}
        <form onSubmit={handleSubmit} className="flex gap-2 mb-8">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. What did we decide about the drive train?"
            className="flex-1"
            disabled={loading}
          />
          <Button type="submit" disabled={loading || !query.trim()}>
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Searching…
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Search size={16} />
                Ask
              </span>
            )}
          </Button>
        </form>

        {/* Error state */}
        {error && (
          <Card className="border-destructive/50 bg-destructive/10 mb-6">
            <CardContent className="py-4 text-sm text-destructive">{error}</CardContent>
          </Card>
        )}

        {/* Result */}
        {result && (
          <div className="space-y-6">
            {/* Answer */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Answer</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{result.answer}</p>
              </CardContent>
            </Card>

            {/* Citations */}
            {result.citations.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                  Sources ({result.citations.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {result.citations.map((citation) => (
                    <Link key={citation.messageId} href="/app">
                      <div className="inline-flex flex-col gap-0.5 px-3 py-2 rounded-lg border border-border bg-card hover:bg-muted transition-colors cursor-pointer max-w-xs">
                        <span className="text-xs font-medium text-primary">
                          #{citation.channelName}
                        </span>
                        <span className="text-xs text-muted-foreground line-clamp-2">
                          {citation.preview}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Empty state */}
        {!result && !loading && !error && (
          <div className="text-center py-16 text-muted-foreground">
            <Search size={48} className="mx-auto mb-4 opacity-20" />
            <p className="text-sm">Ask anything about your team&apos;s history, decisions, or progress.</p>
          </div>
        )}
      </div>
    </div>
  );
}
