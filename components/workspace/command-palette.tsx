"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BookMarked,
  FileText,
  Gavel,
  Hash,
  KanbanSquare,
  LogOut,
  Search,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Channel = { id: string; name: string };
type Result =
  | { kind: "channel"; id: string; name: string }
  | { kind: "command"; key: string; label: string; href: string; icon: React.ReactNode };

const COMMANDS: Array<{ key: string; label: string; href: string; icon: React.ReactNode }> = [
  { key: "ask", label: "Ask PitOS", href: "/app/ask", icon: <Search size={14} /> },
  { key: "tasks", label: "Tasks (Kanban)", href: "/app/tasks", icon: <KanbanSquare size={14} /> },
  { key: "decisions", label: "Decisions log", href: "/app/decisions", icon: <BookMarked size={14} /> },
  { key: "judge-sim", label: "Judge Simulator", href: "/app/judge-sim", icon: <Gavel size={14} /> },
  { key: "exit-interview", label: "Exit interview", href: "/app/exit-interview", icon: <LogOut size={14} /> },
  { key: "season-recap", label: "Season recap", href: "/app/season-recap", icon: <FileText size={14} /> },
  { key: "settings", label: "Settings", href: "/app/settings", icon: <Settings size={14} /> },
];

interface Props {
  channels: Channel[];
}

export default function CommandPalette({ channels }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  function openPalette() {
    setQuery("");
    setActive(0);
    setOpen(true);
  }

  function closePalette() {
    setOpen(false);
  }

  // Keyboard shortcut: Cmd+K (mac) / Ctrl+K (others).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const match = e.key === "k" && (e.metaKey || e.ctrlKey);
      if (!match) return;
      e.preventDefault();
      setOpen((v) => {
        if (v) return false;
        // Reset state synchronously alongside the open transition.
        setQuery("");
        setActive(0);
        return true;
      });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Focus the input shortly after open. setState-free side effect.
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => inputRef.current?.focus(), 0);
    return () => clearTimeout(t);
  }, [open]);

  const results = useMemo<Result[]>(() => {
    const q = query.trim().toLowerCase();
    const channelResults: Result[] = channels
      .filter((c) => (q ? c.name.toLowerCase().includes(q) : true))
      .slice(0, 12)
      .map((c) => ({ kind: "channel", id: c.id, name: c.name }));
    const commandResults: Result[] = COMMANDS.filter((c) =>
      q ? c.label.toLowerCase().includes(q) || c.key.includes(q) : true,
    ).map((c) => ({ kind: "command", key: c.key, label: c.label, href: c.href, icon: c.icon }));
    return [...channelResults, ...commandResults];
  }, [channels, query]);

  // Clamp active in render. Avoids "setState within effect" cascade.
  const safeActive = results.length === 0 ? 0 : Math.min(active, results.length - 1);

  function go(r: Result) {
    if (r.kind === "channel") router.push(`/app/channels/${r.id}`);
    else router.push(r.href);
    closePalette();
  }

  function onModalKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      e.preventDefault();
      closePalette();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive(Math.min(results.length - 1, safeActive + 1));
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive(Math.max(0, safeActive - 1));
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      const r = results[safeActive];
      if (r) go(r);
    }
  }

  if (!open) return null;

  // Split for visual grouping
  const firstCommandIndex = results.findIndex((r) => r.kind === "command");

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4"
      onClick={closePalette}
      onKeyDown={onModalKeyDown}
      role="dialog"
      aria-modal="true"
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg rounded-xl border border-border bg-popover text-popover-foreground shadow-2xl ring-1 ring-foreground/10 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border">
          <Search size={14} className="text-muted-foreground" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            placeholder="Jump to a channel, ask, decisions…"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <kbd className="text-[10px] text-muted-foreground border border-border rounded px-1.5 py-0.5">esc</kbd>
        </div>

        <div className="max-h-[50vh] overflow-y-auto py-1">
          {results.length === 0 && (
            <p className="px-3 py-4 text-sm text-muted-foreground">No matches.</p>
          )}

          {results.map((r, i) => {
            const isActive = i === safeActive;
            const showHeader =
              i === 0
                ? r.kind === "channel"
                  ? "Channels"
                  : "Commands"
                : i === firstCommandIndex && r.kind === "command"
                ? "Commands"
                : null;

            return (
              <div key={r.kind === "channel" ? r.id : r.key}>
                {showHeader && (
                  <div className="px-3 pt-2 pb-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    {showHeader}
                  </div>
                )}
                <button
                  type="button"
                  onMouseEnter={() => setActive(i)}
                  onClick={() => go(r)}
                  className={cn(
                    "flex w-full items-center gap-2 px-3 py-2 text-left text-sm",
                    isActive ? "bg-primary/15 text-primary" : "hover:bg-muted",
                  )}
                >
                  {r.kind === "channel" ? (
                    <>
                      <Hash size={14} className="shrink-0 opacity-70" />
                      <span className="truncate">{r.name}</span>
                    </>
                  ) : (
                    <>
                      <span className="shrink-0 opacity-70">{r.icon}</span>
                      <span className="truncate">{r.label}</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between gap-3 px-3 py-2 border-t border-border text-[11px] text-muted-foreground">
          <div className="flex items-center gap-3">
            <span><kbd className="border border-border rounded px-1">↑</kbd>{" "}<kbd className="border border-border rounded px-1">↓</kbd> nav</span>
            <span><kbd className="border border-border rounded px-1">↵</kbd> open</span>
          </div>
          <span><kbd className="border border-border rounded px-1">⌘K</kbd> toggle</span>
        </div>
      </div>
    </div>
  );
}
