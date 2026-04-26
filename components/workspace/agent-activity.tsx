"use client";

import { useEffect, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  ArrowRight,
  Circle,
  Hourglass,
  Loader2,
  ListPlus,
  RotateCw,
} from "lucide-react";
import { useT } from "@/lib/i18n/client";

type RunStatus = "queued" | "running" | "completed" | "failed";

interface AgentRun {
  id: string;
  status?: RunStatus | null;
  action: string | null;
  juryReflexKind: string | null;
  reasoning: string | null;
  output: string | null;
  createdAt: string;
  durationMs: number | null;
  attempts?: number | null;
  nextAttemptAt?: string | null;
}

interface Props {
  channelId: string;
  teamId: string;
}

function parseAction(run: AgentRun): string {
  if (run.action) return run.action;
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
  const h = d.getHours().toString().padStart(2, "0");
  const m = d.getMinutes().toString().padStart(2, "0");
  return `${h}:${m}`;
}

function ActionIcon({ action }: { action: string }) {
  if (action === "respond") return <ArrowRight size={11} />;
  if (action === "create_task") return <ListPlus size={11} />;
  return <Circle size={9} />;
}

function RunRow({ run }: { run: AgentRun }) {
  const action = parseAction(run);
  const reasoning = parseReasoning(run);
  const taskTitle = action === "create_task" ? parseTaskTitle(run) : null;
  const status: RunStatus = (run.status as RunStatus | null) ?? "completed";
  const attempts = run.attempts ?? null;

  const t = useT();

  // Job-state rows surface the queue lifecycle: queued / running / failed.
  // Once the agent completes, the row falls back to the action-based render.
  if (status === "queued") {
    return (
      <div className="pit-feed-row">
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span className="pit-feed-action no_action">
            <Hourglass size={10} /> queued
          </span>
          <span className="pit-feed-time">{formatTime(run.createdAt)}</span>
        </div>
      </div>
    );
  }

  if (status === "running") {
    return (
      <div className="pit-feed-row">
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          <span className="pit-feed-action respond">
            <Loader2 size={10} className="animate-spin" /> running…
          </span>
          {attempts && attempts > 1 && (
            <span className="pit-chip pit-chip-amber" style={{ padding: "0 4px" }}>
              attempt {attempts}
            </span>
          )}
          <span className="pit-feed-time">{formatTime(run.createdAt)}</span>
        </div>
      </div>
    );
  }

  if (status === "failed") {
    const isRetrying =
      action === "retrying" ||
      (run.nextAttemptAt && new Date(run.nextAttemptAt) > new Date());
    return (
      <div className="pit-feed-row">
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          <span className="pit-feed-action" style={{ color: "var(--pit-red)" }}>
            {isRetrying ? <RotateCw size={10} /> : <AlertCircle size={10} />}
            {isRetrying ? "retrying" : "failed"}
          </span>
          {attempts && (
            <span className="pit-chip pit-chip-red" style={{ padding: "0 4px" }}>
              attempt {attempts}
            </span>
          )}
          <span className="pit-feed-time">{formatTime(run.createdAt)}</span>
        </div>
        {reasoning && (
          <div className="pit-feed-reasoning" style={{ color: "var(--pit-red)" }}>
            {reasoning.slice(0, 140)}
          </div>
        )}
      </div>
    );
  }

  // status === "completed" — original action-based render
  if (action === "no_action") {
    return (
      <div className="pit-feed-row">
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span className="pit-feed-action no_action">
            <Circle size={9} />
            {t("agentActivity.noAction")}
          </span>
          <span className="pit-feed-time">{formatTime(run.createdAt)}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="pit-feed-row">
      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
        <span className={cn("pit-feed-action", action)}>
          <ActionIcon action={action} />
          {action.replace("_", " ")}
        </span>
        {run.juryReflexKind && (
          <span className="pit-chip pit-chip-amber" style={{ padding: "0 4px" }}>
            {run.juryReflexKind.replace(/_/g, " ")}
          </span>
        )}
        <span className="pit-feed-time">
          {formatTime(run.createdAt)}
          {run.durationMs !== null && ` · ${run.durationMs}ms`}
        </span>
      </div>
      {taskTitle && (
        <div
          style={{
            color: "var(--pit-amber)",
            fontSize: 11,
            marginTop: 4,
            fontStyle: "italic",
          }}
        >
          &ldquo;{taskTitle}&rdquo;
        </div>
      )}
      {reasoning && action !== "create_task" && (
        <div className="pit-feed-reasoning">{reasoning.slice(0, 100)}</div>
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

  useEffect(() => {
    const es = new EventSource(`/api/teams/${teamId}/sse`);
    es.onmessage = (e) => {
      let parsed: { type?: string; data?: unknown } = {};
      try {
        parsed = JSON.parse(e.data);
      } catch {
        return;
      }
      if (parsed.type !== "agent_run") return;
      const run = parsed.data as {
        id: string;
        channelId: string;
        status?: RunStatus | null;
        action: string | null;
        reasoning: string | null;
        durationMs: number | null;
        juryReflexKind?: string | null;
        attempts?: number | null;
        nextAttemptAt?: string | null;
      };
      if (run.channelId !== channelId) return;
      setRuns((prev) => {
        const existingIdx = prev.findIndex((r) => r.id === run.id);
        const next: AgentRun = {
          id: run.id,
          status: run.status ?? null,
          action: run.action,
          juryReflexKind: run.juryReflexKind ?? null,
          reasoning: run.reasoning,
          output: null,
          createdAt:
            existingIdx >= 0
              ? prev[existingIdx].createdAt
              : new Date().toISOString(),
          durationMs: run.durationMs,
          attempts: run.attempts ?? null,
          nextAttemptAt: run.nextAttemptAt ?? null,
        };
        if (existingIdx >= 0) {
          const copy = prev.slice();
          copy[existingIdx] = { ...prev[existingIdx], ...next };
          return copy;
        }
        return [next, ...prev].slice(0, 30);
      });
    };
    return () => es.close();
  }, [teamId, channelId]);

  return (
    <div className="flex flex-col min-h-0 h-full">
      <div className="pit-right-head">
        <div>
          <div className="pit-eyebrow">CONTROL ROOM</div>
          <div className="pit-display" style={{ fontSize: 13, marginTop: 2 }}>
            {t("agentActivity.title")}
          </div>
        </div>
        <span className="pit-onair">
          <span className="pit-livedot" /> LIVE
        </span>
      </div>
      <div className="pit-right-body pit-scroll">
        {loading && (
          <p className="pit-eyebrow" style={{ fontSize: 10 }}>
            {t("agentActivity.loading")}
          </p>
        )}
        {!loading && runs.length === 0 && (
          <p className="pit-eyebrow" style={{ fontSize: 10 }}>
            {t("agentActivity.empty")}
          </p>
        )}
        {runs.map((run) => (
          <RunRow key={run.id} run={run} />
        ))}
      </div>
    </div>
  );
}
