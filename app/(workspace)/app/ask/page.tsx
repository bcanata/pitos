"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Send } from "lucide-react";
import { useT } from "@/lib/i18n/client";
import { SectionHead } from "@/components/workspace/broadcast-atoms";

interface Citation {
  messageId: string;
  channelId: string;
  channelName: string;
  preview: string;
}

interface AskResult {
  answer: string;
  citations: Citation[];
}

export default function AskPage() {
  const t = useT();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AskResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Track elapsed time so we can show the broadcast latency line on results.
  const [elapsedMs, setElapsedMs] = useState<number | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;

    setLoading(true);
    setError(null);
    setResult(null);
    setElapsedMs(null);

    const start = performance.now();
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? t("ask.error.generic"));
        return;
      }

      const data: AskResult = await res.json();
      setResult(data);
      setElapsedMs(performance.now() - start);
    } catch {
      setError(t("ask.error.network"));
    } finally {
      setLoading(false);
    }
  }

  const suggestions = [
    "What did we decide about bumpers?",
    "Who has run the elevator weight calc?",
    "Which tasks are blocked on parts?",
    "Show the 2025 swerve drift fix",
  ];

  return (
    <div className="pit-page">
      <SectionHead
        kicker="STATIONS / ASK"
        title="ASK PITOS"
        right={<span className="pit-eyebrow">SEMANTIC SEARCH</span>}
      />
      <div className="pit-page-scroll pit-scroll">
        <div className="pit-page-body">
          <form onSubmit={handleSubmit} className="pit-ask-hero">
            <div className="pit-eyebrow" style={{ marginBottom: 10 }}>QUESTION</div>
            <div className="pit-ask-input-wrap">
              <input
                className="pit-ask-input"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("ask.placeholder")}
                disabled={loading}
                autoFocus
              />
              <button
                type="submit"
                className="pit-ask-go"
                aria-label={t("ask.button")}
                disabled={loading || !query.trim()}
              >
                {loading ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <Send size={16} />
                )}
              </button>
            </div>
            <div className="pit-ask-suggest">
              <span className="pit-eyebrow" style={{ marginRight: 4 }}>TRY</span>
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  className="pit-chip"
                  onClick={() => setQuery(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </form>

          {error && (
            <div
              className="pit-card"
              style={{
                marginTop: 16,
                padding: 16,
                borderColor: "var(--pit-red)",
                background: "var(--pit-red-soft)",
                color: "var(--pit-red)",
                fontSize: 13,
              }}
            >
              {error}
            </div>
          )}

          {result && (
            <div className="pit-ask-answer">
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
                <span
                  className="pit-display"
                  style={{
                    color: "var(--pit-red)",
                    fontSize: 12,
                    letterSpacing: "0.18em",
                  }}
                >
                  PITOS · ANSWER
                </span>
                <span className="pit-eyebrow pit-mono">
                  {elapsedMs !== null && `${(elapsedMs / 1000).toFixed(1)}s · `}
                  {result.citations.length} SOURCE{result.citations.length === 1 ? "" : "S"}
                </span>
              </div>
              <p style={{ fontSize: 14, lineHeight: 1.65, color: "var(--pit-text)", whiteSpace: "pre-wrap" }}>
                {result.answer}
              </p>
              {result.citations.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <div className="pit-eyebrow" style={{ marginBottom: 8 }}>SOURCES</div>
                  <div className="pit-ask-sources">
                    {result.citations.map((c) => (
                      <Link
                        key={c.messageId}
                        href={`/app/channels/${c.channelId}#msg-${c.messageId}`}
                        className="pit-source-card"
                      >
                        <div className="src-ch"># {c.channelName}</div>
                        <div style={{ marginTop: 4 }}>{c.preview}</div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {!result && !loading && !error && (
            <div style={{ textAlign: "center", padding: "48px 16px", color: "var(--pit-text-3)" }}>
              <Search size={40} style={{ margin: "0 auto 12px", opacity: 0.2 }} />
              <p className="pit-eyebrow">{t("ask.empty")}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
