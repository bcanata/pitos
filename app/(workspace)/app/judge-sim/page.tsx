"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Gavel, RotateCcw } from "lucide-react";

type Message = { role: "judge" | "team"; content: string };

const AWARDS = [
  "Chairman's Award",
  "Engineering Inspiration",
  "Rookie All Star",
  "Safety Award",
  "Industrial Design Award",
  "Quality Award",
  "Judges Award",
];

type Step = "select" | "interview" | "report";

export default function JudgeSimPage() {
  const [step, setStep] = useState<Step>("select");
  const [selectedAward, setSelectedAward] = useState<string>("");
  const [sessionId, setSessionId] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [turnCount, setTurnCount] = useState(0);
  const [gapReport, setGapReport] = useState<string>("");
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
        setError(data.error ?? "Failed to start session");
        return;
      }

      const data: { sessionId: string; firstQuestion: string } = await res.json();
      setSessionId(data.sessionId);
      setMessages([{ role: "judge", content: data.firstQuestion }]);
      setTurnCount(0);
      setStep("interview");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRespond(e: React.FormEvent) {
    e.preventDefault();
    const text = response.trim();
    if (!text || loading) return;

    const newMessages: Message[] = [
      ...messages,
      { role: "team", content: text },
    ];
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
        setError(data.error ?? "Something went wrong");
        return;
      }

      const data: {
        judgeReply: string;
        isComplete: boolean;
        gapReport?: string;
      } = await res.json();

      const nextTurn = turnCount + 1;
      setTurnCount(nextTurn);

      setMessages([
        ...newMessages,
        { role: "judge", content: data.judgeReply },
      ]);

      if (data.isComplete && data.gapReport) {
        setGapReport(data.gapReport);
        setStep("report");
      }
    } catch {
      setError("Network error. Please try again.");
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
    setGapReport("");
  }

  // ── Step 1: Award selection ──────────────────────────────────────────────────
  if (step === "select") {
    return (
      <div className="flex flex-col h-full overflow-y-auto">
        <div className="border-b border-border px-6 py-4">
          <h1 className="text-lg font-semibold flex items-center gap-2">
            <Gavel size={20} />
            Judge Simulator
          </h1>
          <p className="text-sm text-muted-foreground">
            Practice your judging interview with a skeptical AI judge. 6 rounds, then a gap report.
          </p>
        </div>

        <div className="flex-1 px-6 py-8 max-w-2xl mx-auto w-full">
          {error && (
            <Card className="border-destructive/50 bg-destructive/10 mb-6">
              <CardContent className="py-4 text-sm text-destructive">{error}</CardContent>
            </Card>
          )}

          <p className="text-sm font-medium mb-4 text-muted-foreground uppercase tracking-wider">
            Select an award to practice
          </p>

          <div className="grid gap-3">
            {AWARDS.map((award) => (
              <button
                key={award}
                onClick={() => startSession(award)}
                disabled={loading}
                className="w-full text-left px-4 py-3 rounded-lg border border-border bg-card hover:bg-muted hover:border-primary/50 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {award}
              </button>
            ))}
          </div>

          {loading && (
            <div className="flex items-center justify-center gap-2 mt-8 text-muted-foreground text-sm">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Starting interview...
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Step 3: Gap report ───────────────────────────────────────────────────────
  if (step === "report") {
    return (
      <div className="flex flex-col h-full overflow-y-auto">
        <div className="border-b border-border px-6 py-4">
          <h1 className="text-lg font-semibold flex items-center gap-2">
            <Gavel size={20} />
            Judge Simulator — {selectedAward}
          </h1>
          <p className="text-sm text-muted-foreground">Interview complete</p>
        </div>

        <div className="flex-1 px-6 py-8 max-w-2xl mx-auto w-full space-y-6">
          {/* Transcript summary */}
          <div className="space-y-3">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "team" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2.5 text-sm ${
                    msg.role === "judge"
                      ? "bg-muted text-foreground"
                      : "bg-primary text-primary-foreground"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Gap report card */}
          <Card className="border-primary/30 bg-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Gavel size={16} />
                Evidence Gap Report
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{gapReport}</p>
            </CardContent>
          </Card>

          <Button onClick={resetSession} variant="outline" className="w-full gap-2">
            <RotateCcw size={16} />
            Start New Session
          </Button>
        </div>
      </div>
    );
  }

  // ── Step 2: Interview ────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-border px-6 py-4 flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-lg font-semibold flex items-center gap-2">
            <Gavel size={20} />
            Judge Simulator — {selectedAward}
          </h1>
          <p className="text-sm text-muted-foreground">
            Turn {turnCount} / 6
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={resetSession} className="gap-1 text-muted-foreground">
          <RotateCcw size={14} />
          Restart
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "team" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[78%] rounded-lg px-4 py-2.5 text-sm ${
                msg.role === "judge"
                  ? "bg-muted text-foreground"
                  : "bg-primary text-primary-foreground"
              }`}
            >
              <p className="text-xs font-medium mb-1 opacity-60">
                {msg.role === "judge" ? "Judge" : "You"}
              </p>
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-lg px-4 py-3 text-sm text-muted-foreground flex items-center gap-2">
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Judge is thinking...
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Error */}
      {error && (
        <div className="px-6 pb-2">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Input */}
      <form
        onSubmit={handleRespond}
        className="border-t border-border px-6 py-4 flex gap-3 items-end shrink-0"
      >
        <Textarea
          value={response}
          onChange={(e) => setResponse(e.target.value)}
          placeholder="Type your response to the judge..."
          className="flex-1 min-h-[60px] max-h-40 resize-none"
          disabled={loading}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleRespond(e as unknown as React.FormEvent);
            }
          }}
        />
        <Button
          type="submit"
          disabled={loading || !response.trim()}
          className="shrink-0"
        >
          {loading ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            "Respond"
          )}
        </Button>
      </form>
    </div>
  );
}
