"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import TaskPanel from "./task-panel";
import AgentActivity from "./agent-activity";
import { useT } from "@/lib/i18n/client";
import { useMobileShell } from "@/lib/mobile-shell-context";

interface Props {
  channelId: string;
  teamId: string;
}

export default function RightPanel({ channelId, teamId }: Props) {
  const t = useT();
  const [expanded, setExpanded] = useState(true);
  const { rightOpen, setRightOpen } = useMobileShell();

  const panelContent = (
    <>
      <div
        className="shrink-0 max-h-72 overflow-y-auto"
        style={{ borderBottom: "1px solid var(--pit-line)" }}
      >
        <TaskPanel channelId={channelId} teamId={teamId} />
      </div>
      <div className="flex-1 overflow-hidden flex flex-col min-h-0">
        <AgentActivity channelId={channelId} teamId={teamId} />
      </div>
    </>
  );

  return (
    <>
      {/* Mobile overlay backdrop */}
      {rightOpen && (
        <div
          className="pit-sidebar-backdrop"
          onClick={() => setRightOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Desktop: chevron toggle rail + expandable panel */}
      <div className="pit-right-shell flex shrink-0 h-full">
        <div
          className="flex items-center justify-center w-6 shrink-0"
          style={{
            borderLeft: "1px solid var(--pit-line)",
            background: "var(--pit-surface)",
          }}
        >
          <button
            onClick={() => setExpanded((v) => !v)}
            className="pit-icon-btn"
            style={{ width: 20, height: 36, border: 0 }}
            aria-label={expanded ? t("rightPanel.collapse") : t("rightPanel.expand")}
          >
            {expanded ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>
        {expanded && (
          <div className="pit-right" style={{ width: 280 }}>
            {panelContent}
          </div>
        )}
      </div>

      {/* Mobile: slide-in overlay, triggered by header button */}
      <div className={`pit-right${rightOpen ? " is-mobile-open" : ""}`}>
        {panelContent}
      </div>
    </>
  );
}
