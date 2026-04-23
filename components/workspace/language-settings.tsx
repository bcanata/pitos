"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useT } from "@/lib/i18n/client";

const LANGUAGES = [
  { value: "en", name: "English" },
  { value: "tr", name: "Türkçe" },
  { value: "es", name: "Español" },
  { value: "fr", name: "Français" },
  { value: "de", name: "Deutsch" },
  { value: "pt", name: "Português" },
  { value: "zh", name: "中文" },
  { value: "ja", name: "日本語" },
  { value: "he", name: "עברית" },
  { value: "other", name: "Other / Diğer / Otro..." },
];

interface Props {
  teamId: string;
  currentLang: string;
}

export default function LanguageSettings({ teamId, currentLang }: Props) {
  const t = useT();
  const router = useRouter();
  const [selected, setSelected] = useState(currentLang);
  const [otherName, setOtherName] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">("idle");

  async function handleSave() {
    const lang = selected === "other" ? otherName.trim().toLowerCase() : selected;
    if (!lang) return;

    setStatus("saving");
    try {
      const res = await fetch("/api/settings/language", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamId, lang }),
      });
      if (!res.ok) {
        setStatus("error");
        return;
      }
      setStatus("done");
      router.refresh();
    } catch {
      setStatus("error");
    }
  }

  const saving = status === "saving";

  return (
    <div className="space-y-3">
      <div className="flex gap-2 items-center flex-wrap">
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          disabled={saving}
          className="rounded border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          {LANGUAGES.map((l) => (
            <option key={l.value} value={l.value}>
              {l.name}
            </option>
          ))}
        </select>

        {selected === "other" && (
          <input
            type="text"
            value={otherName}
            onChange={(e) => setOtherName(e.target.value)}
            placeholder={t("settings.languageOtherPlaceholder")}
            className="rounded border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={saving}
          />
        )}

        <button
          onClick={handleSave}
          disabled={saving || (selected === "other" && !otherName.trim())}
          className="rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
        >
          {saving
            ? selected === "other"
              ? t("settings.languageTranslating")
              : t("settings.languageSaving")
            : t("settings.languageSave")}
        </button>
      </div>

      {status === "done" && (
        <p className="text-sm text-green-600">{t("settings.languageUpdated")}</p>
      )}
      {status === "error" && (
        <p className="text-sm text-destructive">Failed to update language.</p>
      )}
    </div>
  );
}
