"use client";

import { useState, useRef, useEffect } from "react";
import { RotateCcw, Send } from "lucide-react";
import { useT } from "@/lib/i18n/client";
import { LiveDot, SectionHead } from "@/components/workspace/broadcast-atoms";

type Message = { role: "judge" | "team"; content: string };

type GapReport = {
  score: number;
  scoreLine: string;
  strengths: string[];
  evidenceGaps: string[];
  suggestions: string[];
  raw?: string;
};

interface AwardDef {
  id: string;
  name: string;
  letter: string;
  blurb: string;
}

const AWARDS: AwardDef[] = [
  { id: "impact",      name: "FIRST Impact Award",       letter: "I",  blurb: "Deepest impact on FIRST's mission, sustained over years." },
  { id: "ei",          name: "Engineering Inspiration",  letter: "E",  blurb: "Outstanding success advancing engineering in the school + community." },
  { id: "rookie",      name: "Rookie All Star",          letter: "R",  blurb: "Rookie team that embodies the FIRST mission." },
  { id: "safety",      name: "Safety Award",             letter: "S",  blurb: "Team that prioritizes safety in design, build, and pit." },
  { id: "industrial",  name: "Industrial Design Award",  letter: "ID", blurb: "Industrial design integrating form and function." },
  { id: "quality",     name: "Quality Award",            letter: "Q",  blurb: "Robustness in concept and fabrication." },
  { id: "judges",      name: "Judges Award",             letter: "J",  blurb: "Team the judges feel deserves recognition." },
];

type Step = "select" | "interview" | "report";

export default function JudgeSimPage() {
  const t = useT();
  const [step, setStep] = useState<Step>("select");
  const [selectedAward, setSelectedAward] = useState<string>("");
  const [sessionId, setSessionId] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [turnCount, setTurnCount] = useState(0);
  const [gapReport, setGapReport] = useState<GapReport | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function startSession(award: string) {
    setSelectedAward(award);
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/judge-sim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ award }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? t("judgeSim.error.start"));
        return;
      }

      const data: { sessionId: string; firstQuestion: string } = await res.json();
      setSessionId(data.sessionId);
      setMessages([{ role: "judge", content: data.firstQuestion }]);
      setTurnCount(0);
      setStep("interview");
    } catch {
      setError(t("judgeSim.error.network"));
    } finally {
      setLoading(false);
    }
  }

  async function handleRespond(e: React.FormEvent) {
    e.preventDefault();
    const text = response.trim();
    if (!text || loading) return;

    const newMessages: Message[] = [...messages, { role: "team", content: text }];
    setMessages(newMessages);
    setResponse("");
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/judge-sim/${sessionId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ response: text }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? t("judgeSim.error.submit"));
        return;
      }

      const data: { judgeReply: string; isComplete: boolean; gapReport?: GapReport } = await res.json();

      const nextTurn = turnCount + 1;
      setTurnCount(nextTurn);

      setMessages([...newMessages, { role: "judge", content: data.judgeReply }]);

      if (data.isComplete && data.gapReport) {
        setGapReport(data.gapReport);
        setStep("report");
      }
    } catch {
      setError(t("judgeSim.error.network"));
    } finally {
      setLoading(false);
    }
  }

  function resetSession() {
    setStep("select");
    setSelectedAward("");
    setSessionId("");
    setMessages([]);
    setResponse("");
    setError(null);
    setTurnCount(0);
    setGapReport(null);
  }

  if (step === "select") {
    return (
      <div className="pit-page">
        <SectionHead
          kicker="STATIONS / JUDGE SIM"
          title="JUDGE INTERVIEW"
          right={<span className="pit-eyebrow">SELECT AWARD TO BEGIN</span>}
        />
        <div className="pit-page-scroll pit-scroll">
          <div className="pit-page-body">
            {error && (
              <div
                className="pit-card"
                style={{
                  padding: 14,
                  marginBottom: 14,
                  borderColor: "var(--pit-red)",
                  background: "var(--pit-red-soft)",
                  color: "var(--pit-red)",
                  fontSize: 13,
                }}
              >
                {error}
              </div>
            )}
            <div className="pit-eyebrow" style={{ marginBottom: 8 }}>
              SELECT THE AWARD YOU&apos;RE PRACTICING FOR
            </div>
            <div className="pit-judge-grid">
              {AWARDS.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  className="pit-award-card"
                  onClick={() => startSession(a.name)}
                  disabled={loading}
                >
                  <div className="pit-award-name">{a.name}</div>
                  <div className="pit-award-blurb">{a.blurb}</div>
                  <div className="pit-award-trophy">{a.letter}</div>
                </button>
              ))}
            </div>
            {loading && (
              <div className="pit-eyebrow" style={{ textAlign: "center", marginTop: 24 }}>
                <span className="pit-thinking" style={{ marginRight: 8 }}>
                  <i /><i /><i />
                </span>
                {t("judgeSim.starting")}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (step === "report") {
    return (
      <div className="pit-page">
        <SectionHead
          kicker="STATIONS / JUDGE SIM"
          title={`REPORT · ${selectedAward.toUpperCase()}`}
          right={
            <button onClick={resetSession} className="pit-btn">
              <RotateCcw size={12} /> {t("judgeSim.startNew")}
            </button>
          }
        />
        <div className="pit-page-scroll pit-scroll">
          <div className="pit-page-body">
            <div className="pit-card" style={{ padding: 18, marginBottom: 18 }}>
              {messages.map((m, i) => (
                <div key={i} className={m.role === "judge" ? "pit-judge-msg" : "pit-team-msg"}>
                  <div className="speaker">
                    {m.role === "judge" ? "JUDGE" : t("judgeSim.you").toUpperCase()}
                  </div>
                  <div style={{ fontSize: 13, marginTop: 4, lineHeight: 1.55, whiteSpace: "pre-wrap" }}>
                    {m.content}
                  </div>
                </div>
              ))}
            </div>
            {gapReport && <GapReportCards report={gapReport} />}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pit-page">
      <SectionHead
        kicker="STATIONS / JUDGE SIM"
        title={`INTERVIEW · ${selectedAward.toUpperCase()}`}
        right={
          <>
            <span className="pit-onair">
              <LiveDot tone="amber" /> TURN {turnCount}
            </span>
            <button onClick={resetSession} className="pit-btn">
              <RotateCcw size={12} /> {t("judgeSim.restart")}
            </button>
          </>
        }
      />
      <div className="pit-page-scroll pit-scroll">
        <div className="pit-page-body">
          <div className="pit-card" style={{ padding: 18, marginBottom: 12 }}>
            {messages.map((m, i) => (
              <div key={i} className={m.role === "judge" ? "pit-judge-msg" : "pit-team-msg"}>
                <div className="speaker">
                  {m.role === "judge" ? "JUDGE" : t("judgeSim.you").toUpperCase()}
                </div>
                <div style={{ fontSize: 13, marginTop: 4, lineHeight: 1.55, whiteSpace: "pre-wrap" }}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="pit-judge-msg pit-msg-thinking">
                <div className="speaker">JUDGE</div>
                <span className="pit-thinking" style={{ marginTop: 6 }}>
                  <i /><i /><i />
                </span>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {error && (
            <p style={{ color: "var(--pit-red)", fontSize: 12, marginBottom: 8 }}>{error}</p>
          )}

          <form onSubmit={handleRespond} className="pit-card" style={{ padding: 14 }}>
            <div className="pit-eyebrow" style={{ marginBottom: 8 }}>YOUR RESPONSE</div>
            <textarea
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              placeholder={t("judgeSim.responsePlaceholder")}
              className="pit-compose-input"
              rows={3}
              disabled={loading}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleRespond(e as unknown as React.FormEvent);
                }
              }}
            />
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
              <button
                type="submit"
                disabled={loading || !response.trim()}
                className="pit-btn pit-btn-primary"
              >
                <Send size={12} /> {t("judgeSim.respond")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function GapReportCards({ report }: { report: GapReport }) {
  if (
    !report.scoreLine &&
    report.strengths.length === 0 &&
    report.evidenceGaps.length === 0 &&
    report.suggestions.length === 0
  ) {
    return (
      <div className="pit-card" style={{ padding: 16 }}>
        <div className="pit-eyebrow" style={{ color: "var(--pit-amber)" }}>GAP REPORT</div>
        <pre style={{ fontFamily: "var(--pit-sans)", fontSize: 13, lineHeight: 1.55, whiteSpace: "pre-wrap", marginTop: 8 }}>
          {report.raw ?? ""}
        </pre>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
      <div className="pit-card" style={{ padding: 14, gridColumn: "1 / -1" }}>
        <div className="pit-eyebrow">PROVISIONAL SCORE</div>
        <div className="pit-bigscore" style={{ marginTop: 4 }}>
          <span className="num pit-tnum">{report.score}</span>
          <span className="denom">/ 100</span>
        </div>
        {report.scoreLine && (
          <p style={{ fontSize: 12, color: "var(--pit-text-3)", marginTop: 4 }}>{report.scoreLine}</p>
        )}
      </div>
      {report.strengths.length > 0 && (
        <div className="pit-card" style={{ padding: 14 }}>
          <div className="pit-eyebrow" style={{ color: "var(--pit-green)" }}>STRENGTHS</div>
          <ul style={{ margin: "6px 0 0", paddingLeft: 16, fontSize: 12, lineHeight: 1.55 }}>
            {report.strengths.map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        </div>
      )}
      {report.evidenceGaps.length > 0 && (
        <div className="pit-card" style={{ padding: 14 }}>
          <div className="pit-eyebrow" style={{ color: "var(--pit-amber)" }}>EVIDENCE GAPS</div>
          <ul style={{ margin: "6px 0 0", paddingLeft: 16, fontSize: 12, lineHeight: 1.55 }}>
            {report.evidenceGaps.map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        </div>
      )}
      {report.suggestions.length > 0 && (
        <div className="pit-card" style={{ padding: 14 }}>
          <div className="pit-eyebrow" style={{ color: "var(--pit-red)" }}>RUN BACK</div>
          <ul style={{ margin: "6px 0 0", paddingLeft: 16, fontSize: 12, lineHeight: 1.55 }}>
            {report.suggestions.map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}
