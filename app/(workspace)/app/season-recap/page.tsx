"use client";

import { useState, useEffect, useRef } from "react";
import { FileText, RefreshCw } from "lucide-react";
import { useT } from "@/lib/i18n/client";
import { SectionHead } from "@/components/workspace/broadcast-atoms";

interface GeneratedDocument {
  id: string;
  title: string;
  contentMd: string;
  createdAt: string | number;
}

function RecapContent({ content }: { content: string }) {
  const paragraphs = content.split(/\n\n+/);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, fontSize: 13, lineHeight: 1.65 }}>
      {paragraphs.map((para, i) => {
        const trimmed = para.trim();
        if (!trimmed) return null;

        const isSection = /^\d+\.\s+\S/.test(trimmed) && trimmed.split("\n").length === 1;

        if (isSection) {
          return (
            <h3
              key={i}
              className="pit-display"
              style={{
                fontSize: 16,
                marginTop: 12,
                color: "var(--pit-text)",
                letterSpacing: "0.02em",
              }}
            >
              {trimmed}
            </h3>
          );
        }

        return (
          <p key={i} style={{ color: "var(--pit-text-2)", whiteSpace: "pre-wrap" }}>
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
    return d
      .toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })
      .toUpperCase();
  }

  if (loading) {
    return (
      <div className="pit-page">
        <SectionHead kicker="STATIONS / SEASON RECAP" title="SEASON RECAP" />
        <div className="pit-page-body">
          <p className="pit-eyebrow">{t("seasonRecap.loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pit-page">
      <SectionHead
        kicker="STATIONS / SEASON RECAP"
        title="SEASON RECAP"
        right={
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="pit-btn pit-btn-primary"
          >
            {generating ? (
              <>
                <RefreshCw size={12} className="animate-spin" />
                {t("seasonRecap.generating")}
              </>
            ) : (
              <>
                <RefreshCw size={12} />
                {t("seasonRecap.generate")}
              </>
            )}
          </button>
        }
      />
      <div className="pit-page-scroll pit-scroll">
        <div className="pit-page-body">
          {generating && (
            <div className="pit-recap-hero" style={{ marginBottom: 18 }}>
              <div className="pit-eyebrow">PROCESSING</div>
              <h2 className="pit-display" style={{ marginTop: 6 }}>GENERATING RECAP</h2>
              <p style={{ fontSize: 12, color: "var(--pit-text-2)", marginTop: 12 }}>
                <span className="pit-thinking" style={{ marginRight: 8 }}>
                  <i /><i /><i />
                </span>
                {t("seasonRecap.generatingHint")}
              </p>
            </div>
          )}

          {error && (
            <p style={{ color: "var(--pit-red)", fontSize: 12, marginBottom: 12 }}>{error}</p>
          )}

          {document ? (
            <>
              <div className="pit-recap-hero">
                <div className="pit-eyebrow" style={{ color: "var(--pit-text-2)" }}>
                  {formatDate(document.createdAt)}
                </div>
                <h2 className="pit-display">{document.title}</h2>
              </div>

              <div className="pit-card" style={{ padding: 22, marginTop: 18 }}>
                <div className="pit-eyebrow" style={{ marginBottom: 14 }}>PITOS · SUMMARY</div>
                <RecapContent content={document.contentMd} />
              </div>
            </>
          ) : !generating ? (
            <div className="pit-card" style={{ padding: 36, textAlign: "center" }}>
              <FileText size={36} style={{ margin: "0 auto", opacity: 0.3 }} />
              <p className="pit-display" style={{ fontSize: 14, marginTop: 12 }}>
                {t("seasonRecap.empty")}
              </p>
              <p style={{ fontSize: 12, color: "var(--pit-text-3)", marginTop: 6 }}>
                {t("seasonRecap.emptyHint")}
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
