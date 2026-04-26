"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Clock, AlertCircle, BookOpen, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n/client";

interface Task {
  id: string;
  channelId: string | null;
  channelName?: string | null;
  title: string;
  description: string | null;
  assigneeName: string | null;
  status: "open" | "in_progress" | "done" | "blocked" | "cancelled";
  teachMode: boolean;
  deadline: Date | null;
}

interface Props {
  channelId: string;
  teamId: string;
}

type StatusConfig = {
  labelKey: string;
  icon: React.ReactNode;
  className: string;
};

const STATUS_CONFIG: Record<Task["status"], StatusConfig> = {
  open: {
    labelKey: "tasks.status.open",
    icon: <Clock size={12} />,
    className: "bg-muted text-muted-foreground",
  },
  in_progress: {
    labelKey: "tasks.status.inProgress",
    icon: <Clock size={12} />,
    className: "bg-primary/20 text-primary",
  },
  done: {
    labelKey: "tasks.status.done",
    icon: <CheckCircle size={12} />,
    className: "bg-green-500/20 text-green-400",
  },
  blocked: {
    labelKey: "tasks.status.blocked",
    icon: <AlertCircle size={12} />,
    className: "bg-destructive/20 text-destructive",
  },
  cancelled: {
    labelKey: "tasks.status.cancelled",
    icon: <XCircle size={12} />,
    className: "bg-muted text-muted-foreground line-through",
  },
};

export default function TaskPanel({ teamId }: Props) {
  const t = useT();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingDone, setMarkingDone] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch("/api/tasks");
      if (!res.ok) return;
      const data = await res.json();
      setTasks(data.tasks ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Realtime: react to task_created / task_updated on the team SSE stream.
  useEffect(() => {
    const es = new EventSource(`/api/teams/${teamId}/sse`);
    es.onmessage = (e) => {
      let parsed: { type?: string; data?: unknown } = {};
      try { parsed = JSON.parse(e.data); } catch { return; }
      const { type, data } = parsed;
      if (type === "task_created" || type === "task_updated" || type === "task_deleted") {
        // Refetch so the full task object (channelName, assigneeName) is always populated.
        fetchTasks();
      }
    };
    return () => es.close();
  }, [teamId, fetchTasks]);

  async function markDone(taskId: string) {
    setMarkingDone(taskId);
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "done" }),
      });
      if (res.ok) {
        setTasks((prev) =>
          prev.map((task) => (task.id === taskId ? { ...task, status: "done" } : task))
        );
      }
    } finally {
      setMarkingDone(null);
    }
  }

  const activeTasks = tasks.filter(
    (task) => task.status !== "done" && task.status !== "cancelled"
  );
  const doneTasks = tasks.filter((task) => task.status === "done");

  if (loading) {
    return (
      <div className="p-4 text-sm text-muted-foreground">{t("tasks.loading")}</div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="p-4 text-sm text-muted-foreground">{t("tasks.empty")}</div>
    );
  }

  return (
    <Card className="border-0 rounded-none h-full overflow-y-auto">
      <CardHeader className="py-3 px-4 border-b border-border">
        <CardTitle className="text-sm font-medium">
          {t("tasks.title", { count: String(activeTasks.length) })}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {activeTasks.map((task) => (
          <TaskRow
            key={task.id}
            task={task}
            onMarkDone={markDone}
            isMarkingDone={markingDone === task.id}
          />
        ))}

        {doneTasks.length > 0 && (
          <>
            <div className="px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider border-t border-border">
              {t("tasks.doneSection", { count: String(doneTasks.length) })}
            </div>
            {doneTasks.map((task) => (
              <TaskRow key={task.id} task={task} />
            ))}
          </>
        )}
      </CardContent>
    </Card>
  );
}

function TaskRow({
  task,
  onMarkDone,
  isMarkingDone,
}: {
  task: Task;
  onMarkDone?: (id: string) => void;
  isMarkingDone?: boolean;
}) {
  const t = useT();
  const config = STATUS_CONFIG[task.status];
  const canMarkDone = task.status === "open" || task.status === "in_progress";

  return (
    <div className="flex items-start gap-3 px-4 py-3 border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "text-sm font-medium truncate",
            task.status === "done" && "text-muted-foreground line-through",
            task.status === "cancelled" && "text-muted-foreground line-through"
          )}
        >
          {task.title}
        </p>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <span
            className={cn(
              "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium",
              config.className
            )}
          >
            {config.icon}
            {t(config.labelKey)}
          </span>
          {task.channelName && (
            <span className="text-xs text-muted-foreground opacity-60">
              #{task.channelName}
            </span>
          )}
          {task.assigneeName && (
            <span className="text-xs text-muted-foreground">
              → {task.assigneeName}
            </span>
          )}
          {task.teachMode && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium bg-amber-500/20 text-amber-400">
              <BookOpen size={10} />
              {t("tasks.teachMode")}
            </span>
          )}
        </div>
      </div>
      {canMarkDone && onMarkDone && (
        <Button
          size="sm"
          variant="ghost"
          className="shrink-0 h-7 px-2 text-xs"
          onClick={() => onMarkDone(task.id)}
          disabled={isMarkingDone}
        >
          {isMarkingDone ? (
            <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            t("tasks.markDone")
          )}
        </Button>
      )}
    </div>
  );
}
