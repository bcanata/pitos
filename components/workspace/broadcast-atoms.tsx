"use client";

import { cn } from "@/lib/utils";

// ─────────── Avatar — initials, no images ───────────
export function Avatar({
  name,
  size,
  className,
}: {
  name: string | null | undefined;
  size?: "lg";
  className?: string;
}) {
  const init =
    (name || "?")
      .split(/\s+/)
      .slice(0, 2)
      .map((s) => s[0] || "")
      .join("")
      .toUpperCase() || "?";
  return (
    <span
      className={cn(
        "pit-avatar",
        size === "lg" && "pit-avatar-lg",
        className,
      )}
      aria-label={name ?? undefined}
    >
      {init}
    </span>
  );
}

// ─────────── Live indicator ───────────
export function LiveDot({
  tone = "red",
  className,
}: {
  tone?: "red" | "amber" | "green";
  className?: string;
}) {
  const cls =
    tone === "amber"
      ? "pit-livedot pit-livedot-amber"
      : tone === "green"
      ? "pit-livedot pit-livedot-green"
      : "pit-livedot";
  return <span className={cn(cls, className)} />;
}

// ─────────── On-air pill ───────────
export function OnAir({
  label = "ON AIR",
  tone = "red",
}: {
  label?: string;
  tone?: "red" | "amber" | "green";
}) {
  return (
    <span className="pit-onair">
      <LiveDot tone={tone} /> {label}
    </span>
  );
}

// ─────────── Telemetry strip ───────────
export interface TelemetryItem {
  label: string;
  value: string | number;
}
export function Telemetry({ items }: { items: TelemetryItem[] }) {
  return (
    <div className="pit-tele">
      {items.map((it, i) => (
        <div key={i} className="pit-tele-cell">
          <div className="pit-tele-label">{it.label}</div>
          <div className="pit-tele-value pit-tnum">{it.value}</div>
        </div>
      ))}
    </div>
  );
}

// ─────────── Subteam tag ───────────
const SUBTEAM_LABEL: Record<string, string> = {
  build: "Build",
  programming: "Programming",
  outreach: "Outreach",
  business: "Business",
};

const SUBTEAM_DOT: Record<string, string> = {
  build: "pit-subteam-build",
  programming: "pit-subteam-prog",
  outreach: "pit-subteam-out",
  business: "pit-subteam-biz",
};

export function SubteamTag({ team }: { team?: string | null }) {
  if (!team) return null;
  const label = SUBTEAM_LABEL[team] ?? team;
  const dotCls = SUBTEAM_DOT[team] ?? "";
  return (
    <span className="pit-chip" style={{ gap: 6 }}>
      <span className={cn("pit-subteam-dot", dotCls)} />
      {label}
    </span>
  );
}

// ─────────── Section heading ───────────
export function SectionHead({
  kicker,
  title,
  right,
}: {
  kicker?: string;
  title: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="pit-section-head">
      <div>
        {kicker && <div className="pit-eyebrow">{kicker}</div>}
        <h1 className="pit-display pit-section-title">{title}</h1>
      </div>
      {right && <div className="pit-section-right">{right}</div>}
    </div>
  );
}
