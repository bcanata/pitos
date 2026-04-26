"use client";

import { useState } from "react";
import { ArrowRight, LogOut } from "lucide-react";
import { useT } from "@/lib/i18n/client";
import { SectionHead } from "@/components/workspace/broadcast-atoms";

type Phase = "idle" | "interviewing" | "complete";

interface InterviewState {
  packId: string;
  currentQuestion: string;
  turnsCompleted: number;
}

export default function ExitInterviewPage() {
  const t = useT();
  const [phase, setPhase] = useState<Phase>("idle");
  const [interview, setInterview] = useState<InterviewState | null>(null);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleBegin() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/exit-interview", { method: "POST" });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? t("exitInterview.error.start"));
        return;
      }
      const data = (await res.json()) as { packId: string; firstQuestion: string };
      setInterview({ packId: data.packId, currentQuestion: data.firstQuestion, turnsCompleted: 0 });
      setPhase("interviewing");
    } catch {
      setError(t("exitInterview.error.start"));
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmitAnswer(e: React.FormEvent) {
    e.preventDefault();
    if (!interview || !answer.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/exit-interview/continue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packId: interview.packId, answer: answer.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? t("exitInterview.error.submit"));
        return;
      }

      const data = (await res.json()) as { nextQuestion: string; isComplete: boolean };
      setAnswer("");

      if (data.isComplete) {
        setPhase("complete");
      } else {
        setInterview({
          ...interview,
          currentQuestion: data.nextQuestion,
          turnsCompleted: interview.turnsCompleted + 1,
        });
      }
    } catch {
      setError(t("exitInterview.error.submit"));
    } finally {
      setLoading(false);
    }
  }

  if (phase === "complete") {
    return (
      <div className="pit-page">
        <SectionHead kicker="STATIONS / EXIT INTERVIEW" title="EXIT INTERVIEW" />
        <div className="pit-page-scroll pit-scroll">
          <div className="pit-page-body" style={{ maxWidth: 720 }}>
            <div className="pit-card" style={{ padding: 28, textAlign: "center" }}>
              <div className="pit-eyebrow" style={{ color: "var(--pit-green)" }}>SESSION COMPLETE</div>
              <h2 className="pit-display" style={{ fontSize: 28, marginTop: 8 }}>
                {t("exitInterview.complete")}
              </h2>
              <p style={{ fontSize: 13, color: "var(--pit-text-3)", marginTop: 12 }}>
                {t("exitInterview.completeMessage")}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "interviewing" && interview) {
    return (
      <div className="pit-page">
        <SectionHead
          kicker="STATIONS / EXIT INTERVIEW"
          title="EXIT INTERVIEW"
          right={
            <span className="pit-eyebrow">
              TURN {interview.turnsCompleted + 1} · 1:1 W/ PITOS
            </span>
          }
        />
        <div className="pit-page-scroll pit-scroll">
          <div className="pit-page-body" style={{ maxWidth: 720 }}>
            <div className="pit-card" style={{ padding: 22 }}>
              <div className="pit-judge-msg" style={{
                borderLeftColor: "var(--pit-red)",
                background: "var(--pit-red-soft)",
              }}>
                <div className="speaker" style={{ color: "var(--pit-red)" }}>PITOS</div>
                <div style={{ fontSize: 13, marginTop: 4, lineHeight: 1.55 }}>
                  {interview.currentQuestion}
                </div>
              </div>

              <form onSubmit={handleSubmitAnswer}>
                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder={t("exitInterview.answerPlaceholder")}
                  rows={6}
                  className="pit-compose-input"
                  required
                />
                {error && (
                  <p style={{ color: "var(--pit-red)", fontSize: 12, marginTop: 8 }}>{error}</p>
                )}
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12 }}>
                  <button
                    type="submit"
                    disabled={loading || !answer.trim()}
                    className="pit-btn pit-btn-primary"
                  >
                    {loading ? t("exitInterview.submitting") : (
                      <>
                        Next question <ArrowRight size={12} />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pit-page">
      <SectionHead
        kicker="STATIONS / EXIT INTERVIEW"
        title="EXIT INTERVIEW"
        right={<span className="pit-eyebrow">END OF SEASON · 1:1 W/ PITOS</span>}
      />
      <div className="pit-page-scroll pit-scroll">
        <div className="pit-page-body" style={{ maxWidth: 720 }}>
          <div className="pit-card" style={{ padding: 22 }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 14 }}>
              <span
                className="pit-display"
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 4,
                  background: "var(--pit-red)",
                  color: "white",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <LogOut size={20} />
              </span>
              <div>
                <div className="pit-eyebrow">SESSION · 1:1 W/ PITOS</div>
                <div className="pit-display" style={{ fontSize: 18, marginTop: 2 }}>
                  {t("exitInterview.title")}
                </div>
              </div>
            </div>
            <p style={{ fontSize: 13, color: "var(--pit-text-2)", lineHeight: 1.6 }}>
              {t("exitInterview.description")}
            </p>
            {error && (
              <p style={{ color: "var(--pit-red)", fontSize: 12, marginTop: 12 }}>{error}</p>
            )}
            <div style={{ marginTop: 18 }}>
              <button
                onClick={handleBegin}
                disabled={loading}
                className="pit-btn pit-btn-primary"
              >
                {loading ? t("exitInterview.starting") : t("exitInterview.begin")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
