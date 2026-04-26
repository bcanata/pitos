"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowUpRight, Plus } from "lucide-react";
import { useT } from "@/lib/i18n/client";
import { SectionHead, Telemetry } from "@/components/workspace/broadcast-atoms";

interface Decision {
  id: string;
  decision: string;
  rationale: string | null;
  alternativesConsidered: string | null;
  contextAtTime: string | null;
  recordedAt: string | number;
  sourceMessageId: string | null;
  sourceChannelId: string | null;
}

// Helper kept outside the component so Date.now() doesn't trip
// react-hooks/purity during render.
function countThisWeek(decisions: Decision[]): number {
  const sevenDaysAgo = Date.now() - 7 * 24 * 3600 * 1000;
  return decisions.filter((d) => {
    const ts = new Date(typeof d.recordedAt === "number" ? d.recordedAt * 1000 : d.recordedAt).getTime();
    return ts >= sevenDaysAgo;
  }).length;
}

export default function DecisionsPage() {
  const t = useT();
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

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
      setError(t("decisions.error.load"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadDecisions();
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
        setError(data.error ?? t("decisions.error.record"));
        return;
      }

      setTitle("");
      setRationale("");
      setAlternatives("");
      setContext("");
      setShowForm(false);
      await loadDecisions();
    } catch {
      setError(t("decisions.error.record"));
    } finally {
      setSubmitting(false);
    }
  }

  function formatDate(val: string | number) {
    const d = new Date(typeof val === "number" ? val * 1000 : val);
    return d
      .toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
      .toUpperCase();
  }

  // Decisions are stored newest-first; reverse for display so the oldest is #1.
  const numbered = decisions
    .slice()
    .reverse()
    .map((d, i) => ({ ...d, num: i + 1 }))
    .reverse();

  const thisWeek = countThisWeek(decisions);

  return (
    <div className="pit-page">
      <SectionHead
        kicker="STATIONS / DECISIONS"
        title="DECISION LOG"
        right={
          <>
            <Telemetry
              items={[
                { label: "TOTAL", value: decisions.length },
                { label: "THIS WEEK", value: thisWeek },
              ]}
            />
            <button
              type="button"
              onClick={() => setShowForm((v) => !v)}
              className="pit-btn pit-btn-primary"
            >
              <Plus size={12} /> {showForm ? "Close" : "Record decision"}
            </button>
          </>
        }
      />
      <div className="pit-page-scroll pit-scroll">
        <div className="pit-page-body">
          {showForm && (
            <form onSubmit={handleSubmit} className="pit-card" style={{ padding: 18, marginBottom: 18 }}>
              <div className="pit-eyebrow" style={{ marginBottom: 10 }}>{t("decisions.recordCard")}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div>
                  <label className="pit-eyebrow" htmlFor="title">{t("decisions.labelTitle")}</label>
                  <input
                    id="title"
                    className="pit-input"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={t("decisions.titlePlaceholder")}
                    required
                  />
                </div>
                <div>
                  <label className="pit-eyebrow" htmlFor="rationale">{t("decisions.labelRationale")}</label>
                  <textarea
                    id="rationale"
                    className="pit-input"
                    value={rationale}
                    onChange={(e) => setRationale(e.target.value)}
                    placeholder={t("decisions.rationalePlaceholder")}
                    rows={3}
                  />
                </div>
                <div>
                  <label className="pit-eyebrow" htmlFor="alternatives">{t("decisions.labelAlternatives")}</label>
                  <textarea
                    id="alternatives"
                    className="pit-input"
                    value={alternatives}
                    onChange={(e) => setAlternatives(e.target.value)}
                    placeholder={t("decisions.alternativesPlaceholder")}
                    rows={3}
                  />
                </div>
                <div>
                  <label className="pit-eyebrow" htmlFor="context">{t("decisions.labelContext")}</label>
                  <textarea
                    id="context"
                    className="pit-input"
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                    placeholder={t("decisions.contextPlaceholder")}
                    rows={3}
                  />
                </div>
                {error && <p style={{ color: "var(--pit-red)", fontSize: 12 }}>{error}</p>}
                <button
                  type="submit"
                  className="pit-btn pit-btn-primary"
                  disabled={submitting || !title.trim()}
                  style={{ alignSelf: "flex-start" }}
                >
                  {submitting ? t("decisions.recording") : t("decisions.record")}
                </button>
              </div>
            </form>
          )}

          <div className="pit-eyebrow" style={{ marginBottom: 10 }}>
            DECISIONS THIS BUILD SEASON
          </div>

          {loading ? (
            <p className="pit-eyebrow">{t("decisions.loading")}</p>
          ) : decisions.length === 0 ? (
            <div className="pit-card" style={{ padding: 32, textAlign: "center" }}>
              <p className="pit-display" style={{ fontSize: 14 }}>{t("decisions.empty")}</p>
              <p style={{ fontSize: 12, color: "var(--pit-text-3)", marginTop: 6 }}>
                {t("decisions.emptyHint")}
              </p>
            </div>
          ) : (
            numbered.map((d) => (
              <div key={d.id} className="pit-decision-card">
                <div className="pit-decision-head">
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                    <span className="pit-decision-num pit-tnum">#{d.num}</span>
                    <div>
                      <div className="pit-eyebrow pit-mono" style={{ fontSize: 10 }}>
                        RECORDED · {formatDate(d.recordedAt)}
                      </div>
                      <div className="pit-decision-title">{d.decision}</div>
                    </div>
                  </div>
                  {d.sourceMessageId && d.sourceChannelId && (
                    <Link
                      href={`/app/channels/${d.sourceChannelId}#msg-${d.sourceMessageId}`}
                      className="pit-cite-chip pit-mono"
                      style={{ flexShrink: 0 }}
                    >
                      <ArrowUpRight size={10} /> source
                    </Link>
                  )}
                </div>
                <div className="pit-decision-grid">
                  {d.rationale && (
                    <>
                      <div className="lbl">RATIONALE</div>
                      <div className="val">{d.rationale}</div>
                    </>
                  )}
                  {d.alternativesConsidered && (
                    <>
                      <div className="lbl">ALTERNATIVES</div>
                      <div className="val"><em>{d.alternativesConsidered}</em></div>
                    </>
                  )}
                  {d.contextAtTime && (
                    <>
                      <div className="lbl">CONTEXT</div>
                      <div className="val">{d.contextAtTime}</div>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
