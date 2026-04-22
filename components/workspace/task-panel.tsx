"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Clock, AlertCircle, BookOpen, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Task {
  id: string;
  channelId: string | null;
  title: string;
  description: string | null;
  assigneeName: string | null;
  status: "open" | "in_progress" | "done" | "blocked" | "cancelled";
  teachMode: boolean;
  deadline: Date | null;
}

interface Props {
  channelId: string;
}

const STATUS_CONFIG: Record<
  Task["status"],
  { label: string; icon: React.ReactNode; className: string }
> = {
  open: {
    label: "Open",
    icon: <Clock size={12} />,
    className: "bg-muted text-muted-foreground",
  },
  in_progress: {
    label: "In Progress",
    icon: <Clock size={12} />,
    className: "bg-primary/20 text-primary",
  },
  done: {
    label: "Done",
    icon: <CheckCircle size={12} />,
    className: "bg-green-500/20 text-green-400",
  },
  blocked: {
    label: "Blocked",
    icon: <AlertCircle size={12} />,
    className: "bg-destructive/20 text-destructive",
  },
  cancelled: {
    label: "Cancelled",
    icon: <XCircle size={12} />,
    className: "bg-muted text-muted-foreground line-through",
  },
};

export default function TaskPanel({ channelId }: Props) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingDone, setMarkingDone] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch("/api/tasks");
      if (!res.ok) return;
      const data = await res.json();
      // Filter to channel-level tasks (or show all team tasks if no channelId match)
      const all: Task[] = data.tasks ?? [];
      const channelTasks = all.filter(
        (t) => t.channelId === channelId || t.channelId === null
      );
      setTasks(channelTasks.length > 0 ? channelTasks : all);
    } finally {
      setLoading(false);
    }
  }, [channelId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

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
          prev.map((t) => (t.id === taskId ? { ...t, status: "done" } : t))
        );
      }
    } finally {
      setMarkingDone(null);
    }
  }

  const activeTasks = tasks.filter(
    (t) => t.status !== "done" && t.status !== "cancelled"
  );
  const doneTasks = tasks.filter((t) => t.status === "done");

  if (loading) {
    return (
      <div className="p-4 text-sm text-muted-foreground">Loading tasks…</div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="p-4 text-sm text-muted-foreground">No tasks yet.</div>
    );
  }

  return (
    <Card className="border-0 rounded-none h-full overflow-y-auto">
      <CardHeader className="py-3 px-4 border-b border-border">
        <CardTitle className="text-sm font-medium">
          Tasks ({activeTasks.length} active)
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {/* Active tasks */}
        {activeTasks.map((task) => (
          <TaskRow
            key={task.id}
            task={task}
            onMarkDone={markDone}
            isMarkingDone={markingDone === task.id}
          />
        ))}

        {/* Done tasks (collapsed-ish) */}
        {doneTasks.length > 0 && (
          <>
            <div className="px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider border-t border-border">
              Completed ({doneTasks.length})
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
          {/* Status badge */}
          <span
            className={cn(
              "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium",
              config.className
            )}
          >
            {config.icon}
            {config.label}
          </span>
          {/* Assignee */}
          {task.assigneeName && (
            <span className="text-xs text-muted-foreground">
              → {task.assigneeName}
            </span>
          )}
          {/* Teach mode indicator */}
          {task.teachMode && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium bg-amber-500/20 text-amber-400">
              <BookOpen size={10} />
              Teach
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
            "Done"
          )}
        </Button>
      )}
    </div>
  );
}
