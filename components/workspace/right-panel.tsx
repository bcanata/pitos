"use client";

import { useState } from "react";
import { ChevronRight, ChevronLeft } from "lucide-react";
import TaskPanel from "./task-panel";
import AgentActivity from "./agent-activity";
import { useT } from "@/lib/i18n/client";

interface Props {
  channelId: string;
}

export default function RightPanel({ channelId }: Props) {
  const t = useT();
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="flex shrink-0 h-full">
      {/* Toggle button — always visible */}
      <div className="flex items-center justify-center w-6 border-l border-border bg-card shrink-0">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center justify-center w-5 h-10 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          aria-label={expanded ? t("rightPanel.collapse") : t("rightPanel.expand")}
        >
          {expanded ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* Panel body */}
      {expanded && (
        <div
          className="flex flex-col h-full bg-card border-l border-border overflow-hidden"
          style={{ width: 280 }}
        >
          {/* Tasks section */}
          <div className="shrink-0 max-h-72 overflow-y-auto border-b border-border">
            <TaskPanel channelId={channelId} />
          </div>

          {/* Agent activity section — fills remaining height */}
          <div className="flex-1 overflow-hidden flex flex-col min-h-0">
            <AgentActivity channelId={channelId} />
          </div>
        </div>
      )}
    </div>
  );
}
