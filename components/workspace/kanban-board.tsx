"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  Hash,
  Plus,
  Trash2,
  XCircle,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Status = "open" | "in_progress" | "done" | "blocked" | "cancelled";
type Subteam = "build" | "programming" | "outreach" | "business";

interface Task {
  id: string;
  teamId: string;
  channelId: string | null;
  title: string;
  description: string | null;
  assignedToUserId: string | null;
  assignedToSubteam: Subteam | null;
  assignedByUserId: string | null;
  status: Status;
  teachMode: boolean;
  deadline: string | number | Date | null;
  completedAt: string | number | Date | null;
  createdAt: string | number | Date;
  channelName?: string | null;
  assigneeName?: string | null;
  assignerName?: string | null;
}

interface Channel { id: string; name: string }
interface Member { userId: string; name: string | null; subteam: Subteam | null }

interface Props {
  teamId: string;
  channels: Channel[];
  members: Member[];
}

const COLUMNS: Array<{ status: Status; label: string; icon: React.ReactNode; tone: string }> = [
  { status: "open",        label: "Open",        icon: <Clock size={13} />,        tone: "border-muted text-muted-foreground" },
  { status: "in_progress", label: "In progress", icon: <Clock size={13} />,        tone: "border-primary/40 text-primary" },
  { status: "blocked",     label: "Blocked",     icon: <AlertCircle size={13} />,  tone: "border-destructive/40 text-destructive" },
  { status: "done",        label: "Done",        icon: <CheckCircle2 size={13} />, tone: "border-emerald-500/40 text-emerald-400" },
  { status: "cancelled",   label: "Cancelled",   icon: <XCircle size={13} />,      tone: "border-muted text-muted-foreground/70" },
];

const SUBTEAM_TONE: Record<Subteam, string> = {
  build:       "bg-orange-500/20 text-orange-300 border-orange-500/30",
  programming: "bg-teal-500/20 text-teal-300 border-teal-500/30",
  outreach:    "bg-purple-500/20 text-purple-300 border-purple-500/30",
  business:    "bg-amber-500/20 text-amber-300 border-amber-500/30",
};

const SUBTEAMS: Subteam[] = ["build", "programming", "outreach", "business"];

function relativeDeadline(d: string | number | Date | null): { label: string; tone: string } | null {
  if (!d) return null;
  const t = new Date(d).getTime();
  if (Number.isNaN(t)) return null;
  const now = Date.now();
  const diff = t - now;
  const days = Math.round(diff / (1000 * 60 * 60 * 24));
  const past = diff < 0;
  let label: string;
  if (past) {
    const overdueDays = Math.abs(days);
    label = overdueDays === 0 ? "due today" : `${overdueDays}d overdue`;
  } else if (days === 0) {
    label = "due today";
  } else if (days === 1) {
    label = "due tomorrow";
  } else if (days <= 7) {
    label = `due in ${days}d`;
  } else {
    label = `due ${new Date(t).toLocaleDateString(undefined, { month: "short", day: "numeric" })}`;
  }
  const tone = past ? "text-rose-400" : days <= 2 ? "text-amber-400" : "text-muted-foreground";
  return { label, tone };
}

function initials(name: string | null): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("");
}

export default function KanbanBoard({ teamId, channels, members }: Props) {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overColumn, setOverColumn] = useState<Status | null>(null);
  const [editing, setEditing] = useState<Task | null>(null);
  const [filterSubteam, setFilterSubteam] = useState<"all" | Subteam>("all");
  const [filterAssignee, setFilterAssignee] = useState<"all" | string>("all");
  const [showNew, setShowNew] = useState(false);
  const initialFetchRan = useRef(false);

  // Initial fetch
  useEffect(() => {
    if (initialFetchRan.current) return;
    initialFetchRan.current = true;
    fetch("/api/tasks")
      .then((r) => r.json())
      .then((j) => setTasks(j.tasks ?? []))
      .finally(() => setLoading(false));
  }, []);

  // Live SSE: task_created / task_updated / task_deleted (team-wide stream).
  useEffect(() => {
    const es = new EventSource(`/api/teams/${teamId}/sse`);
    es.onmessage = (e) => {
      let parsed: { type?: string; data?: unknown } = {};
      try { parsed = JSON.parse(e.data); } catch { return; }
      const { type, data } = parsed;
      if (type === "task_created") {
        const t = data as Task;
        setTasks((prev) => (prev.find((x) => x.id === t.id) ? prev : [t, ...prev]));
      } else if (type === "task_updated") {
        const t = data as Task;
        setTasks((prev) => prev.map((x) => (x.id === t.id ? { ...x, ...t } : x)));
      } else if (type === "task_deleted") {
        const { id } = data as { id: string };
        setTasks((prev) => prev.filter((x) => x.id !== id));
      }
    };
    return () => es.close();
  }, [teamId]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (filterSubteam !== "all" && t.assignedToSubteam !== filterSubteam) return false;
      if (filterAssignee !== "all" && t.assignedToUserId !== filterAssignee) return false;
      return true;
    });
  }, [tasks, filterSubteam, filterAssignee]);

  const memberMap = useMemo(() => new Map(members.map((m) => [m.userId, m])), [members]);
  const channelMap = useMemo(() => new Map(channels.map((c) => [c.id, c.name])), [channels]);

  async function patch(id: string, body: Record<string, unknown>) {
    // Optimistic update
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...body } : t)));
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        // Revert on error by refetching
        const j = await fetch("/api/tasks").then((r) => r.json());
        setTasks(j.tasks ?? []);
      } else {
        const { task } = (await res.json()) as { task: Task };
        setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...task } : t)));
      }
    } catch {
      const j = await fetch("/api/tasks").then((r) => r.json());
      setTasks(j.tasks ?? []);
    }
  }

  async function deleteTask(id: string) {
    if (!confirm("Delete this task?")) return;
    setTasks((prev) => prev.filter((t) => t.id !== id));
    setEditing(null);
    await fetch(`/api/tasks/${id}`, { method: "DELETE" });
  }

  function onDragStart(e: React.DragEvent, id: string) {
    setDraggingId(id);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", id);
  }
  function onDragEnd() {
    setDraggingId(null);
    setOverColumn(null);
  }
  function onColumnDragOver(e: React.DragEvent, status: Status) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setOverColumn(status);
  }
  function onColumnDrop(e: React.DragEvent, status: Status) {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain") || draggingId;
    setOverColumn(null);
    setDraggingId(null);
    if (!id) return;
    const t = tasks.find((x) => x.id === id);
    if (!t || t.status === status) return;
    void patch(id, { status });
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="border-b border-border px-6 py-4 shrink-0">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-lg font-semibold">Tasks</h1>
            <p className="text-sm text-muted-foreground">
              Kanban across all channels. Drag a card between columns to change status, or click a card to reassign.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <select
              value={filterSubteam}
              onChange={(e) => setFilterSubteam(e.target.value as "all" | Subteam)}
              className="bg-background border border-border rounded px-2 py-1.5 text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="all">All subteams</option>
              {SUBTEAMS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <select
              value={filterAssignee}
              onChange={(e) => setFilterAssignee(e.target.value)}
              className="bg-background border border-border rounded px-2 py-1.5 text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="all">All assignees</option>
              {members.map((m) => (
                <option key={m.userId} value={m.userId}>{m.name ?? "—"}</option>
              ))}
            </select>
            <button
              onClick={() => setShowNew(true)}
              className="inline-flex items-center gap-1.5 rounded bg-primary px-3 py-1.5 font-medium text-primary-foreground hover:bg-primary/90"
            >
              <Plus size={13} /> New task
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-x-auto overflow-y-hidden p-4">
        <div className="grid grid-flow-col auto-cols-[280px] gap-4 h-full">
          {COLUMNS.map((col) => {
            const colTasks = filteredTasks.filter((t) => t.status === col.status);
            const isOver = overColumn === col.status;
            return (
              <div
                key={col.status}
                onDragOver={(e) => onColumnDragOver(e, col.status)}
                onDragLeave={() => setOverColumn((c) => (c === col.status ? null : c))}
                onDrop={(e) => onColumnDrop(e, col.status)}
                className={cn(
                  "flex flex-col rounded-lg border border-border bg-card/40 transition-colors",
                  isOver && "border-primary bg-primary/5",
                )}
              >
                <div className="px-3 py-2 border-b border-border flex items-center gap-2">
                  <span className={cn("inline-flex items-center gap-1 text-xs font-medium uppercase tracking-wider", col.tone.split(" ").slice(1).join(" "))}>
                    {col.icon}
                    {col.label}
                  </span>
                  <span className="ml-auto text-xs text-muted-foreground tabular-nums">{colTasks.length}</span>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                  {loading && (
                    <p className="text-xs text-muted-foreground p-2">Loading…</p>
                  )}
                  {!loading && colTasks.length === 0 && (
                    <p className="text-xs text-muted-foreground/60 p-2 italic">No tasks</p>
                  )}
                  {colTasks.map((t) => (
                    <TaskCard
                      key={t.id}
                      task={t}
                      memberMap={memberMap}
                      channelMap={channelMap}
                      onClick={() => setEditing(t)}
                      onDragStart={(e) => onDragStart(e, t.id)}
                      onDragEnd={onDragEnd}
                      isDragging={draggingId === t.id}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {editing && (
        <EditPanel
          task={editing}
          channels={channels}
          members={members}
          onClose={() => setEditing(null)}
          onSave={(patchBody) => {
            void patch(editing.id, patchBody);
            setEditing(null);
          }}
          onDelete={() => deleteTask(editing.id)}
          onJumpToChannel={() => {
            if (editing.channelId) {
              router.push(`/app/channels/${editing.channelId}`);
            }
          }}
        />
      )}

      {showNew && (
        <NewPanel
          channels={channels}
          members={members}
          onClose={() => setShowNew(false)}
          onCreate={async (body) => {
            const res = await fetch("/api/tasks", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(body),
            });
            if (res.ok) {
              const { task } = (await res.json()) as { task: Task };
              setTasks((prev) => [task, ...prev]);
            }
            setShowNew(false);
          }}
        />
      )}
    </div>
  );
}

function TaskCard({
  task,
  memberMap,
  channelMap,
  onClick,
  onDragStart,
  onDragEnd,
  isDragging,
}: {
  task: Task;
  memberMap: Map<string, Member>;
  channelMap: Map<string, string>;
  onClick: () => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: () => void;
  isDragging: boolean;
}) {
  const dl = relativeDeadline(task.deadline);
  const channelName = task.channelName ?? (task.channelId ? channelMap.get(task.channelId) : null);
  const assignee = task.assignedToUserId ? memberMap.get(task.assignedToUserId) : null;
  const assigneeName = assignee?.name ?? task.assigneeName ?? null;

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onClick}
      className={cn(
        "rounded-md border border-border bg-card p-2.5 cursor-grab active:cursor-grabbing hover:border-primary/50 transition-colors",
        isDragging && "opacity-40 scale-95",
      )}
    >
      <p className={cn(
        "text-sm leading-snug",
        (task.status === "done" || task.status === "cancelled") && "line-through text-muted-foreground",
      )}>
        {task.title}
      </p>

      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        {task.assignedToSubteam && (
          <span className={cn(
            "inline-flex items-center text-[10px] font-medium px-1.5 py-0.5 rounded border",
            SUBTEAM_TONE[task.assignedToSubteam],
          )}>
            {task.assignedToSubteam}
          </span>
        )}

        {assigneeName && (
          <span className="inline-flex items-center gap-1 text-[10px] text-foreground/80">
            <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-primary/30 text-[9px] font-semibold text-primary">
              {initials(assigneeName)}
            </span>
            {assigneeName}
          </span>
        )}

        {dl && (
          <span className={cn("inline-flex items-center gap-1 text-[10px]", dl.tone)}>
            <Calendar size={10} />
            {dl.label}
          </span>
        )}

        {channelName && (
          <span className="ml-auto inline-flex items-center gap-0.5 text-[10px] text-muted-foreground">
            <Hash size={10} />
            {channelName}
          </span>
        )}
      </div>
    </div>
  );
}

function EditPanel({
  task,
  channels,
  members,
  onClose,
  onSave,
  onDelete,
  onJumpToChannel,
}: {
  task: Task;
  channels: Channel[];
  members: Member[];
  onClose: () => void;
  onSave: (patch: Partial<Task>) => void;
  onDelete: () => void;
  onJumpToChannel: () => void;
}) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? "");
  const [assignedToUserId, setAssignedToUserId] = useState<string>(task.assignedToUserId ?? "");
  const [assignedToSubteam, setAssignedToSubteam] = useState<string>(task.assignedToSubteam ?? "");
  const [deadline, setDeadline] = useState<string>(
    task.deadline ? new Date(task.deadline).toISOString().slice(0, 10) : "",
  );

  return (
    <Modal onClose={onClose} title="Task">
      <div className="space-y-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded border border-border bg-background px-3 py-2 text-sm"
          placeholder="Title"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full rounded border border-border bg-background px-3 py-2 text-sm resize-none"
          placeholder="Description (optional)"
        />

        <div className="grid grid-cols-2 gap-2">
          <label className="text-xs space-y-1">
            <span className="text-muted-foreground">Assignee</span>
            <select
              value={assignedToUserId}
              onChange={(e) => setAssignedToUserId(e.target.value)}
              className="w-full rounded border border-border bg-background px-2 py-1.5 text-sm"
            >
              <option value="">— unassigned —</option>
              {members.map((m) => (
                <option key={m.userId} value={m.userId}>{m.name ?? "—"}</option>
              ))}
            </select>
          </label>

          <label className="text-xs space-y-1">
            <span className="text-muted-foreground">Subteam</span>
            <select
              value={assignedToSubteam}
              onChange={(e) => setAssignedToSubteam(e.target.value)}
              className="w-full rounded border border-border bg-background px-2 py-1.5 text-sm"
            >
              <option value="">— none —</option>
              {SUBTEAMS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </label>
        </div>

        <label className="text-xs space-y-1 block">
          <span className="text-muted-foreground">Deadline</span>
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="w-full rounded border border-border bg-background px-2 py-1.5 text-sm"
          />
        </label>

        {task.channelId && (
          <button
            onClick={onJumpToChannel}
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
          >
            <Hash size={12} /> Open source channel
          </button>
        )}

        <div className="flex items-center gap-2 pt-2 border-t border-border">
          <button
            onClick={() =>
              onSave({
                title: title.trim() || task.title,
                description: description.trim() || null,
                assignedToUserId: assignedToUserId || null,
                assignedToSubteam: (assignedToSubteam || null) as Subteam | null,
                deadline: deadline ? new Date(deadline).toISOString() : null,
              })
            }
            className="rounded bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Save
          </button>
          <button
            onClick={onClose}
            className="rounded border border-border bg-background px-3 py-1.5 text-sm text-foreground hover:bg-muted"
          >
            Cancel
          </button>
          <button
            onClick={onDelete}
            className="ml-auto inline-flex items-center gap-1 rounded border border-destructive/40 bg-destructive/10 px-3 py-1.5 text-sm text-destructive hover:bg-destructive/20"
          >
            <Trash2 size={13} /> Delete
          </button>
        </div>
      </div>
    </Modal>
  );
}

function NewPanel({
  channels,
  members,
  onClose,
  onCreate,
}: {
  channels: Channel[];
  members: Member[];
  onClose: () => void;
  onCreate: (body: {
    title: string;
    description?: string;
    channelId?: string;
    assignedToUserId?: string;
    assignedToSubteam?: Subteam;
    deadline?: string;
  }) => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [channelId, setChannelId] = useState<string>("");
  const [assignedToUserId, setAssignedToUserId] = useState<string>("");
  const [assignedToSubteam, setAssignedToSubteam] = useState<string>("");
  const [deadline, setDeadline] = useState<string>("");

  return (
    <Modal onClose={onClose} title="New task">
      <div className="space-y-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
          className="w-full rounded border border-border bg-background px-3 py-2 text-sm"
          placeholder="What needs to happen?"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="w-full rounded border border-border bg-background px-3 py-2 text-sm resize-none"
          placeholder="Description (optional)"
        />

        <div className="grid grid-cols-2 gap-2">
          <label className="text-xs space-y-1">
            <span className="text-muted-foreground">Assignee</span>
            <select
              value={assignedToUserId}
              onChange={(e) => setAssignedToUserId(e.target.value)}
              className="w-full rounded border border-border bg-background px-2 py-1.5 text-sm"
            >
              <option value="">— unassigned —</option>
              {members.map((m) => (
                <option key={m.userId} value={m.userId}>{m.name ?? "—"}</option>
              ))}
            </select>
          </label>

          <label className="text-xs space-y-1">
            <span className="text-muted-foreground">Subteam</span>
            <select
              value={assignedToSubteam}
              onChange={(e) => setAssignedToSubteam(e.target.value)}
              className="w-full rounded border border-border bg-background px-2 py-1.5 text-sm"
            >
              <option value="">— none —</option>
              {SUBTEAMS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <label className="text-xs space-y-1">
            <span className="text-muted-foreground">Channel</span>
            <select
              value={channelId}
              onChange={(e) => setChannelId(e.target.value)}
              className="w-full rounded border border-border bg-background px-2 py-1.5 text-sm"
            >
              <option value="">— team-wide —</option>
              {channels.map((c) => (
                <option key={c.id} value={c.id}>#{c.name}</option>
              ))}
            </select>
          </label>

          <label className="text-xs space-y-1">
            <span className="text-muted-foreground">Deadline</span>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full rounded border border-border bg-background px-2 py-1.5 text-sm"
            />
          </label>
        </div>

        <div className="flex items-center gap-2 pt-2 border-t border-border">
          <button
            onClick={() => {
              if (!title.trim()) return;
              onCreate({
                title: title.trim(),
                description: description.trim() || undefined,
                channelId: channelId || undefined,
                assignedToUserId: assignedToUserId || undefined,
                assignedToSubteam: (assignedToSubteam || undefined) as Subteam | undefined,
                deadline: deadline ? new Date(deadline).toISOString() : undefined,
              });
            }}
            disabled={!title.trim()}
            className="rounded bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            Create task
          </button>
          <button
            onClick={onClose}
            className="rounded border border-border bg-background px-3 py-1.5 text-sm text-foreground hover:bg-muted"
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
}

function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh] px-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg rounded-xl border border-border bg-popover text-popover-foreground shadow-2xl ring-1 ring-foreground/10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <User size={14} /> {title}
          </h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-xs">esc</button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}
