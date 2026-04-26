"use client";

import { useEffect, useState } from "react";
import { Menu, Moon, Sun } from "lucide-react";
import { Avatar, LiveDot, Telemetry, type TelemetryItem } from "./broadcast-atoms";
import { useMobileShell } from "@/lib/mobile-shell-context";

interface Team {
  id: string;
  name: string;
  number: number | null;
}

interface AgentRunSummary {
  channelId: string;
  action: string | null;
  createdAt: string;
}

interface Props {
  team: Team;
  user: { id: string; name: string | null };
  telemetry: TelemetryItem[];
}

// Top-of-app strip — team mark on the left, scoreboard telemetry in the
// middle, agent state pill + theme toggle + user avatar on the right.
// Listens to the team SSE stream so the PITOS pill flips between
// STANDBY / LIVE in real time when an agent run is active.
export default function BroadcastBar({ team, user, telemetry }: Props) {
  const { toggleSidebar } = useMobileShell();
  const [agentLive, setAgentLive] = useState(false);
  // Read applied class — the inline script in layout.tsx has already resolved
  // localStorage vs system pref before first paint, so this is always correct.
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    if (typeof document === "undefined") return "dark";
    return document.documentElement.classList.contains("dark") ? "dark" : "light";
  });

  // Live agent state — flip the indicator when we see a run come through.
  useEffect(() => {
    if (!team.id) return;
    const es = new EventSource(`/api/teams/${team.id}/sse`);
    let clearTimer: ReturnType<typeof setTimeout> | null = null;
    es.onmessage = (e) => {
      let parsed: { type?: string; data?: unknown } = {};
      try {
        parsed = JSON.parse(e.data);
      } catch {
        return;
      }
      if (parsed.type === "agent_run") {
        const run = parsed.data as AgentRunSummary;
        // Only show LIVE for runs that produced a response or task. no_action
        // happens on every message and would keep the bar permanently lit.
        if (run.action === "respond" || run.action === "create_task") {
          setAgentLive(true);
          if (clearTimer) clearTimeout(clearTimer);
          clearTimer = setTimeout(() => setAgentLive(false), 2400);
        }
      }
    };
    return () => {
      es.close();
      if (clearTimer) clearTimeout(clearTimer);
    };
  }, [team.id]);

  // Sync with system preference changes when no manual override is saved.
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    function onSystemChange(e: MediaQueryListEvent) {
      if (localStorage.getItem("pitos-theme")) return;
      document.documentElement.classList.toggle("dark", e.matches);
      setTheme(e.matches ? "dark" : "light");
    }
    mq.addEventListener("change", onSystemChange);
    return () => mq.removeEventListener("change", onSystemChange);
  }, []);

  function toggleTheme() {
    const html = document.documentElement;
    const next = html.classList.contains("dark") ? "light" : "dark";
    html.classList.toggle("dark", next === "dark");
    localStorage.setItem("pitos-theme", next);
    setTheme(next);
  }

  const teamNumber = team.number ?? "—";
  const teamName = team.name || "TEAM";

  return (
    <div className="pit-broadcast-bar">
      <div className="pit-broadcast-left">
        <button
          type="button"
          onClick={toggleSidebar}
          className="pit-icon-btn pit-mobile-hamburger"
          aria-label="Open menu"
        >
          <Menu size={16} />
        </button>
        <div className="pit-team-mark">
          <div className="pit-team-num pit-tnum">{teamNumber}</div>
          <div className="pit-team-name">{teamName}</div>
        </div>
      </div>

      <div className="pit-broadcast-center">
        {telemetry.length > 0 && <Telemetry items={telemetry} />}
      </div>

      <div className="pit-broadcast-right">
        {agentLive ? (
          <span className="pit-onair">
            <LiveDot /> PITOS · LIVE
          </span>
        ) : (
          <span className="pit-chip" style={{ gap: 6 }}>
            <LiveDot tone="green" />
            PITOS STANDBY
          </span>
        )}
        <button
          type="button"
          onClick={toggleTheme}
          className="pit-icon-btn"
          aria-label="Toggle theme"
          title={theme === "dark" ? "Switch to light" : "Switch to dark"}
        >
          {theme === "dark" ? <Moon size={14} /> : <Sun size={14} />}
        </button>
        <Avatar name={user.name ?? "?"} size="lg" />
      </div>
    </div>
  );
}
