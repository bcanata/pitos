"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n/client";

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
      const data = await res.json() as { packId: string; firstQuestion: string };
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

      const data = await res.json() as { nextQuestion: string; isComplete: boolean };
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
      <div className="p-6 max-w-2xl mx-auto flex items-center justify-center min-h-[50vh]">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-center text-xl">{t("exitInterview.complete")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground">
              {t("exitInterview.completeMessage")}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (phase === "interviewing" && interview) {
    return (
      <div className="p-6 max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl font-semibold">{t("exitInterview.title")}</h1>
          <p className="text-xs text-muted-foreground mt-1">
            {t("exitInterview.turn", { turn: String(interview.turnsCompleted + 1) })}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">{t("exitInterview.question")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed">{interview.currentQuestion}</p>
          </CardContent>
        </Card>

        <form onSubmit={handleSubmitAnswer} className="space-y-3">
          <Textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder={t("exitInterview.answerPlaceholder")}
            rows={6}
            required
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" disabled={loading || !answer.trim()}>
            {loading ? t("exitInterview.submitting") : t("exitInterview.submit")}
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto flex items-center justify-center min-h-[50vh]">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{t("exitInterview.title")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {t("exitInterview.description")}
          </p>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button onClick={handleBegin} disabled={loading}>
            {loading ? t("exitInterview.starting") : t("exitInterview.begin")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
