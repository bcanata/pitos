"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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

        // Detect numbered section headers like "1." or "1." at line start
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
        setError(data.error ?? "Failed to start generation.");
        setGenerating(false);
        return;
      }
      startPolling();
    } catch {
      setError("Failed to start generation.");
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
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Season Recap</h1>
        <Button onClick={handleGenerate} disabled={generating}>
          {generating ? "Generating…" : "Generate Season Recap"}
        </Button>
      </div>

      {generating && (
        <Card>
          <CardContent className="py-8 text-center space-y-3">
            <div className="flex justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
            <p className="text-sm text-muted-foreground">
              Generating… this takes about 30 seconds.
            </p>
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
            <p className="text-sm font-medium text-muted-foreground">No season recap yet</p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              Click &ldquo;Generate Season Recap&rdquo; to create one from your channel history.
            </p>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
