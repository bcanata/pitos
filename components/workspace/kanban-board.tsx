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
  User,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, SectionHead, SubteamTag, Telemetry } from "./broadcast-atoms";

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

const COLUMNS: Array<{ status: Status; label: string; icon: React.ReactNode; cls: string }> = [
  { status: "open",        label: "OPEN",        icon: <Clock size={11} />,        cls: "col-open" },
  { status: "in_progress", label: "IN PROGRESS", icon: <Clock size={11} />,        cls: "col-progress" },
  { status: "blocked",     label: "BLOCKED",     icon: <AlertCircle size={11} />,  cls: "col-blocked" },
  { status: "done",        label: "DONE",        icon: <CheckCircle2 size={11} />, cls: "col-done" },
  { status: "cancelled",   label: "CANCELLED",   icon: <XCircle size={11} />,      cls: "col-cancel" },
];

const SUBTEAMS: Subteam[] = ["build", "programming", "outreach", "business"];

function computeCounts(tasks: Task[]): { open: number; inProg: number; blocked: number; overdue: number } {
  const now = Date.now();
  let open = 0, inProg = 0, blocked = 0, overdue = 0;
  for (const t of tasks) {
    if (t.status === "open") open++;
    else if (t.status === "in_progress") inProg++;
    else if (t.status === "blocked") blocked++;
    if (t.deadline && t.status !== "done" && t.status !== "cancelled") {
      const ts = new Date(t.deadline).getTime();
      if (!Number.isNaN(ts) && ts < now) overdue++;
    }
  }
  return { open, inProg, blocked, overdue };
}

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

  const counts = useMemo(() => computeCounts(tasks), [tasks]);

  return (
    <div className="pit-page">
      <SectionHead
        kicker="STATIONS / TASKS"
        title="TASK BOARD"
        right={
          <>
            <Telemetry
              items={[
                { label: "OPEN", value: counts.open },
                { label: "IN-PROG", value: counts.inProg },
                { label: "BLOCKED", value: counts.blocked },
                { label: "OVERDUE", value: counts.overdue },
              ]}
            />
            <button
              onClick={() => setShowNew(true)}
              className="pit-btn pit-btn-primary"
            >
              <Plus size={12} /> New task
            </button>
          </>
        }
      />

      <div className="pit-kanban-toolbar">
        <span className="pit-eyebrow">FILTER</span>
        <button
          type="button"
          onClick={() => setFilterSubteam("all")}
          className="pit-chip"
          style={{ borderColor: filterSubteam === "all" ? "var(--pit-line-strong)" : undefined }}
        >
          All teams
        </button>
        {SUBTEAMS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setFilterSubteam(s)}
            className="pit-chip"
            style={{
              borderColor: filterSubteam === s ? "var(--pit-line-strong)" : undefined,
              color: filterSubteam === s ? "var(--pit-text)" : undefined,
            }}
          >
            <span className={cn("pit-subteam-dot", `pit-subteam-${s === "programming" ? "prog" : s === "outreach" ? "out" : s === "business" ? "biz" : "build"}`)} />
            {s}
          </button>
        ))}
        <select
          value={filterAssignee}
          onChange={(e) => setFilterAssignee(e.target.value)}
          className="pit-input"
          style={{ width: "auto", maxWidth: 220 }}
        >
          <option value="all">All assignees</option>
          {members.map((m) => (
            <option key={m.userId} value={m.userId}>{m.name ?? "—"}</option>
          ))}
        </select>
        <span style={{ marginLeft: "auto" }} className="pit-eyebrow pit-mono">
          VIEW · BOARD
        </span>
      </div>

      <div className="pit-kanban-board pit-scroll">
        {COLUMNS.map((col) => {
          const colTasks = filteredTasks.filter((t) => t.status === col.status);
          const isOver = overColumn === col.status;
          return (
            <div
              key={col.status}
              onDragOver={(e) => onColumnDragOver(e, col.status)}
              onDragLeave={() => setOverColumn((c) => (c === col.status ? null : c))}
              onDrop={(e) => onColumnDrop(e, col.status)}
              className={cn("pit-kanban-col", col.cls, isOver && "is-over")}
            >
              <div className="pit-kanban-col-head">
                <span className="pit-kanban-col-title">
                  {col.icon}
                  {col.label}
                </span>
                <span className="pit-kanban-col-count pit-tnum">{colTasks.length}</span>
              </div>
              <div className="pit-kanban-col-list pit-scroll">
                {loading && (
                  <p className="pit-eyebrow" style={{ fontSize: 10, padding: 8 }}>Loading…</p>
                )}
                {!loading && colTasks.length === 0 && (
                  <p className="pit-eyebrow" style={{ fontSize: 10, padding: 8, fontStyle: "italic" }}>
                    No tasks
                  </p>
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

  // Pick a left-rail tone based on status / subteam.
  const railCls =
    task.status === "blocked"   ? "pit-task-card-rail-amber"
  : task.status === "done"      ? "pit-task-card-rail-green"
  : task.assignedToSubteam === "build" ? "pit-task-card-rail-red"
  : task.assignedToSubteam === "programming" ? "pit-task-card-rail-blue"
  : "pit-task-card-rail-neutral";

  const isDone = task.status === "done" || task.status === "cancelled";
  const dlCls =
    dl?.tone === "text-rose-400" ? "pit-task-deadline is-overdue"
  : dl?.tone === "text-amber-400" ? "pit-task-deadline is-soon"
  : "pit-task-deadline";

  // Short ID — just enough to look like a real ticket.
  const shortId = task.id.slice(0, 8).toUpperCase();

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onClick}
      className={cn("pit-task-card", railCls, isDragging && "is-dragging")}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span className="pit-task-id pit-mono">T-{shortId}</span>
        {channelName && (
          <span className="pit-task-from-channel">
            <Hash size={9} /> {channelName}
          </span>
        )}
      </div>

      <div className={cn("pit-task-title", isDone && "is-done")}>{task.title}</div>

      <div className="pit-task-meta">
        <SubteamTag team={task.assignedToSubteam ?? undefined} />
        {assigneeName && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
            <Avatar name={assigneeName} />
            <span>{assigneeName}</span>
          </span>
        )}
        {task.teachMode && <span className="pit-task-teach">Teach</span>}
        {dl && (
          <span className={dlCls}>
            <Calendar size={10} /> {dl.label}
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
