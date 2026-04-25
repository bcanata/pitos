"use client";

import { useEffect, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { MessageSquare, MinusCircle, PlusSquare } from "lucide-react";
import { useT } from "@/lib/i18n/client";

interface AgentRun {
  id: string;
  action: string | null;
  juryReflexKind: string | null;
  reasoning: string | null;
  output: string | null;
  createdAt: string;
  durationMs: number | null;
}

interface Props {
  channelId: string;
  teamId: string;
}

function parseAction(run: AgentRun): string {
  if (run.action) return run.action;
  // Fallback: try to parse output JSON
  if (run.output) {
    try {
      const parsed = JSON.parse(run.output.match(/\{[\s\S]*\}/)?.[0] ?? "{}") as {
        action?: string;
      };
      return parsed.action ?? "unknown";
    } catch {
      return "unknown";
    }
  }
  return "unknown";
}

function parseReasoning(run: AgentRun): string | null {
  if (run.reasoning) return run.reasoning;
  if (run.output) {
    try {
      const parsed = JSON.parse(run.output.match(/\{[\s\S]*\}/)?.[0] ?? "{}") as {
        reasoning?: string;
      };
      return parsed.reasoning?.slice(0, 100) ?? null;
    } catch {
      return null;
    }
  }
  return null;
}

function parseTaskTitle(run: AgentRun): string | null {
  if (run.output) {
    try {
      const parsed = JSON.parse(run.output.match(/\{[\s\S]*\}/)?.[0] ?? "{}") as {
        task_title?: string;
      };
      return parsed.task_title ?? null;
    } catch {
      return null;
    }
  }
  return null;
}

function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function ActionIcon({ action }: { action: string }) {
  if (action === "respond") return <MessageSquare size={12} className="shrink-0" />;
  if (action === "create_task") return <PlusSquare size={12} className="shrink-0" />;
  return <MinusCircle size={12} className="shrink-0" />;
}

function RunRow({ run }: { run: AgentRun }) {
  const action = parseAction(run);
  const reasoning = parseReasoning(run);
  const taskTitle = action === "create_task" ? parseTaskTitle(run) : null;

  const t = useT();

  if (action === "no_action") {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 text-muted-foreground/60">
        <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 shrink-0" />
        <span className="text-xs">{t("agentActivity.noAction")}</span>
        <span className="text-xs ml-auto opacity-60">{formatTime(run.createdAt)}</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "px-3 py-2 border-l-2 text-xs space-y-0.5",
        action === "respond" && "border-l-teal-500 bg-teal-500/5",
        action === "create_task" && "border-l-amber-500 bg-amber-500/5",
        action === "unknown" && "border-l-muted bg-muted/10"
      )}
    >
      <div className="flex items-center gap-1.5">
        <span
          className={cn(
            "inline-flex items-center gap-1 font-medium",
            action === "respond" && "text-teal-400",
            action === "create_task" && "text-amber-400",
            action === "unknown" && "text-muted-foreground"
          )}
        >
          <ActionIcon action={action} />
          {action}
        </span>
        {run.juryReflexKind && (
          <span className="text-muted-foreground/70 italic">· {run.juryReflexKind.replace(/_/g, " ")}</span>
        )}
        <span className="ml-auto text-muted-foreground/60">{formatTime(run.createdAt)}</span>
      </div>
      {taskTitle && (
        <p className="text-amber-300/80 truncate pl-0.5">&ldquo;{taskTitle}&rdquo;</p>
      )}
      {reasoning && action !== "create_task" && (
        <p className="text-muted-foreground/70 leading-snug line-clamp-2 pl-0.5">
          {reasoning.slice(0, 100)}
        </p>
      )}
    </div>
  );
}

export default function AgentActivity({ channelId, teamId }: Props) {
  const t = useT();
  const [runs, setRuns] = useState<AgentRun[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRuns = useCallback(async () => {
    try {
      const res = await fetch(`/api/channels/${channelId}/agent-runs`);
      if (!res.ok) return;
      const data = (await res.json()) as { runs: AgentRun[] };
      setRuns(data.runs ?? []);
    } finally {
      setLoading(false);
    }
  }, [channelId]);

  useEffect(() => {
    fetchRuns();
  }, [fetchRuns]);

  // Realtime: live agent_run events on the team stream, filtered to this channel.
  useEffect(() => {
    const es = new EventSource(`/api/teams/${teamId}/sse`);
    es.onmessage = (e) => {
      let parsed: { type?: string; data?: unknown } = {};
      try { parsed = JSON.parse(e.data); } catch { return; }
      if (parsed.type !== "agent_run") return;
      const run = parsed.data as {
        id: string;
        channelId: string;
        action: string | null;
        reasoning: string | null;
        durationMs: number | null;
        juryReflexKind?: string | null;
      };
      if (run.channelId !== channelId) return;
      setRuns((prev) => {
        if (prev.find((r) => r.id === run.id)) return prev;
        return [
          {
            id: run.id,
            action: run.action,
            juryReflexKind: run.juryReflexKind ?? null,
            reasoning: run.reasoning,
            output: null,
            createdAt: new Date().toISOString(),
            durationMs: run.durationMs,
          },
          ...prev,
        ].slice(0, 30);
      });
    };
    return () => es.close();
  }, [teamId, channelId]);

  return (
    <div className="flex flex-col min-h-0">
      <div className="px-3 py-2 border-b border-border">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {t("agentActivity.title")}
        </p>
      </div>
      <div className="flex-1 overflow-y-auto">
        {loading && (
          <p className="px-3 py-3 text-xs text-muted-foreground">{t("agentActivity.loading")}</p>
        )}
        {!loading && runs.length === 0 && (
          <p className="px-3 py-3 text-xs text-muted-foreground">{t("agentActivity.empty")}</p>
        )}
        {runs.map((run) => (
          <RunRow key={run.id} run={run} />
        ))}
      </div>
    </div>
  );
}
