"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n/client";

interface GeneratedDocument {
  id: string;
  title: string;
  contentMd: string;
  createdAt: string | number;
}

function RecapContent({ content }: { content: string }) {
  const paragraphs = content.split(/\n\n+/);

  return (
    <div className="space-y-4 text-sm leading-relaxed">
      {paragraphs.map((para, i) => {
        const trimmed = para.trim();
        if (!trimmed) return null;

        const isSection = /^\d+\.\s+\S/.test(trimmed) && trimmed.split("\n").length === 1;

        if (isSection) {
          return (
            <h3 key={i} className="text-base font-semibold text-foreground mt-6 first:mt-0">
              {trimmed}
            </h3>
          );
        }

        return (
          <p key={i} className="text-foreground/90 whitespace-pre-wrap">
            {trimmed}
          </p>
        );
      })}
    </div>
  );
}

export default function SeasonRecapPage() {
  const t = useT();
  const [document, setDocument] = useState<GeneratedDocument | null>(null);
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  async function fetchRecap() {
    try {
      const res = await fetch("/api/season-recap");
      const data = await res.json();
      return data.document as GeneratedDocument | null;
    } catch {
      return null;
    }
  }

  useEffect(() => {
    fetchRecap().then((doc) => {
      setDocument(doc);
      setLoading(false);
    });

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  function startPolling() {
    if (pollRef.current) return;
    pollRef.current = setInterval(async () => {
      const doc = await fetchRecap();
      if (doc) {
        setDocument(doc);
        setGenerating(false);
        if (pollRef.current) {
          clearInterval(pollRef.current);
          pollRef.current = null;
        }
      }
    }, 5000);
  }

  async function handleGenerate() {
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/season-recap", { method: "POST" });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? t("seasonRecap.error.start"));
        setGenerating(false);
        return;
      }
      startPolling();
    } catch {
      setError(t("seasonRecap.error.start"));
      setGenerating(false);
    }
  }

  function formatDate(val: string | number) {
    const d = new Date(typeof val === "number" ? val * 1000 : val);
    return d.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
  }

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-sm text-muted-foreground">{t("seasonRecap.loading")}</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{t("seasonRecap.title")}</h1>
        <Button onClick={handleGenerate} disabled={generating}>
          {generating ? t("seasonRecap.generating") : t("seasonRecap.generate")}
        </Button>
      </div>

      {generating && (
        <Card>
          <CardContent className="py-8 text-center space-y-3">
            <div className="flex justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
            <p className="text-sm text-muted-foreground">{t("seasonRecap.generatingHint")}</p>
          </CardContent>
        </Card>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      {document ? (
        <Card>
          <CardHeader>
            <CardTitle>{document.title}</CardTitle>
            <p className="text-xs text-muted-foreground">{formatDate(document.createdAt)}</p>
          </CardHeader>
          <CardContent>
            <RecapContent content={document.contentMd} />
          </CardContent>
        </Card>
      ) : !generating ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-sm font-medium text-muted-foreground">{t("seasonRecap.empty")}</p>
            <p className="text-xs text-muted-foreground/60 mt-1">{t("seasonRecap.emptyHint")}</p>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
