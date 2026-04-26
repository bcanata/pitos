"use client";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  BookMarked,
  FileText,
  Gavel,
  KanbanSquare,
  LogOut,
  Plus,
  Search,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n/client";
import { LiveDot } from "./broadcast-atoms";
import { useMobileShell } from "@/lib/mobile-shell-context";

type LastMessage = {
  id: string;
  senderName: string | null;
  agentGenerated: boolean;
  contentPreview: string;
  createdAt: string;
} | null;

interface SidebarChannel {
  id: string;
  name: string;
  description?: string | null;
  unreadCount?: number;
  lastMessage?: LastMessage;
}

interface SidebarTeam {
  id: string;
  name: string;
  number: number | null;
}

interface Props {
  team: SidebarTeam;
  channels: SidebarChannel[];
  currentUserId: string | null;
}

type ChannelDelta = {
  name?: string;
  description?: string | null;
  unreadDelta?: number;
  unreadOverride?: number;
  lastMessage?: LastMessage;
  archived?: true;
};

function relativeTime(iso: string): string {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return "";
  const diffSec = Math.max(0, Math.floor((Date.now() - t) / 1000));
  if (diffSec < 60) return `${diffSec}s`;
  const m = Math.floor(diffSec / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d`;
  return new Date(iso).toLocaleDateString();
}

// Hash glyph — broadcast feel, sharp lines.
function HashGlyph() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
      <path
        d="M5 1v14M11 1v14M1 5h14M1 11h14"
        stroke="currentColor"
        strokeWidth="1.6"
        fill="none"
        strokeLinecap="square"
      />
    </svg>
  );
}

export default function ChannelSidebar({ team, channels, currentUserId }: Props) {
  const t = useT();
  const router = useRouter();
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen } = useMobileShell();

  const [deltas, setDeltas] = useState<Map<string, ChannelDelta>>(new Map());
  const [, setTeamOverride] = useState<Partial<SidebarTeam>>({});
  const [lastChannelsKey, setLastChannelsKey] = useState<string>("");
  // Channels with a recent message — used to flash the live dot for ~6s.
  const [liveChannels, setLiveChannels] = useState<Map<string, number>>(new Map());
  // Channels visited in this client session. Their unread badges should
  // stay at 0 even after the user navigates away, until the server
  // re-renders /api/teams/mine with a fresh unreadCount.
  const [lastVisitedChannel, setLastVisitedChannel] = useState<string | null>(null);

  const currentChannelId = useMemo(() => {
    const m = pathname.match(/^\/app\/channels\/([^/]+)/);
    return m?.[1] ?? null;
  }, [pathname]);

  // When the user enters a channel, write a sticky unreadOverride=0 into
  // its delta. The render path already prefers `unreadOverride` over the
  // server-rendered baseUnread, so the badge stays cleared after they
  // leave. Render-phase setState (not in an effect) so React 19's
  // set-state-in-effect lint stays happy.
  if (currentChannelId && currentChannelId !== lastVisitedChannel) {
    setLastVisitedChannel(currentChannelId);
    setDeltas((prev) => {
      const existing = prev.get(currentChannelId) ?? {};
      if (existing.unreadOverride === 0 && existing.unreadDelta === 0) {
        return prev;
      }
      const next = new Map(prev);
      next.set(currentChannelId, {
        ...existing,
        unreadOverride: 0,
        unreadDelta: 0,
      });
      return next;
    });
  }

  useEffect(() => {
    if (!team.id) return;
    const es = new EventSource(`/api/teams/${team.id}/sse`);
    es.onmessage = (e) => {
      let parsed: { type?: string; data?: unknown } = {};
      try { parsed = JSON.parse(e.data); } catch { return; }
      const { type, data } = parsed;

      if (type === "message") {
        const msg = data as {
          id: string;
          channelId: string;
          userId: string | null;
          content: string;
          agentGenerated: boolean;
          senderName?: string | null;
          createdAt: string | Date;
        };
        const isMine = currentUserId !== null && msg.userId === currentUserId;
        const isCurrent = msg.channelId === currentChannelId;
        const createdAtIso =
          typeof msg.createdAt === "string"
            ? msg.createdAt
            : new Date(msg.createdAt).toISOString();
        setDeltas((prev) => {
          const next = new Map(prev);
          const existing = next.get(msg.channelId) ?? {};
          next.set(msg.channelId, {
            ...existing,
            lastMessage: {
              id: msg.id,
              senderName: msg.agentGenerated ? "PitOS" : msg.senderName ?? null,
              agentGenerated: msg.agentGenerated,
              contentPreview: msg.content.slice(0, 80),
              createdAt: createdAtIso,
            },
            unreadDelta: (existing.unreadDelta ?? 0) + (isMine || isCurrent ? 0 : 1),
            unreadOverride: isCurrent ? 0 : existing.unreadOverride,
          });
          return next;
        });
        // Light up the live dot.
        setLiveChannels((prev) => {
          const next = new Map(prev);
          next.set(msg.channelId, Date.now());
          return next;
        });
      } else if (type === "channels_updated") {
        const evt = data as { action: "created" | "archived"; id?: string; name: string };
        if (evt.action === "created") {
          router.refresh();
        } else if (evt.action === "archived" && evt.id) {
          setDeltas((prev) => {
            const next = new Map(prev);
            const existing = next.get(evt.id!) ?? {};
            next.set(evt.id!, { ...existing, archived: true });
            return next;
          });
        }
      } else if (type === "channel_updated") {
        const evt = data as { id: string; name?: string; description?: string };
        setDeltas((prev) => {
          const next = new Map(prev);
          const existing = next.get(evt.id) ?? {};
          next.set(evt.id, {
            ...existing,
            ...(evt.name ? { name: evt.name } : {}),
            ...(evt.description ? { description: evt.description } : {}),
          });
          return next;
        });
      } else if (type === "team_updated") {
        const evt = data as { id: string; name?: string; number?: number };
        setTeamOverride((prev) => ({
          ...prev,
          ...(evt.name ? { name: evt.name } : {}),
          ...(evt.number ? { number: evt.number } : {}),
        }));
      }
    };
    return () => es.close();
  }, [team.id, currentChannelId, currentUserId, router]);

  // Decay live indicators after 6s.
  useEffect(() => {
    if (liveChannels.size === 0) return;
    const tm = setTimeout(() => {
      const cutoff = Date.now() - 6000;
      setLiveChannels((prev) => {
        let changed = false;
        const next = new Map(prev);
        for (const [id, t] of prev) {
          if (t < cutoff) {
            next.delete(id);
            changed = true;
          }
        }
        return changed ? next : prev;
      });
    }, 6500);
    return () => clearTimeout(tm);
  }, [liveChannels]);

  const channelsKey = useMemo(() => channels.map((c) => c.id).join(","), [channels]);
  if (channelsKey !== lastChannelsKey) {
    setLastChannelsKey(channelsKey);
    setDeltas(new Map());
    setTeamOverride({});
  }

  const renderChannels = channels
    .map((ch) => {
      const d = deltas.get(ch.id) ?? {};
      const baseUnread = ch.unreadCount ?? 0;
      const unread =
        d.unreadOverride !== undefined
          ? d.unreadOverride
          : baseUnread + (d.unreadDelta ?? 0);
      const last = d.lastMessage ?? ch.lastMessage ?? null;
      return {
        ...ch,
        name: d.name ?? ch.name,
        description: d.description ?? ch.description,
        unreadCount: ch.id === currentChannelId ? 0 : unread,
        lastMessage: last,
        archived: d.archived,
      };
    })
    .filter((ch) => !ch.archived);

  const NAV: Array<{ href: string; icon: React.ReactNode; label: string }> = [
    { href: "/app/ask",            icon: <Search size={14} />,        label: t("sidebar.askPitOS") },
    { href: "/app/tasks",          icon: <KanbanSquare size={14} />,  label: "Tasks" },
    { href: "/app/judge-sim",      icon: <Gavel size={14} />,         label: t("sidebar.judgeSim") },
    { href: "/app/decisions",      icon: <BookMarked size={14} />,    label: t("sidebar.decisions") },
    { href: "/app/exit-interview", icon: <LogOut size={14} />,        label: t("sidebar.exitInterview") },
    { href: "/app/season-recap",   icon: <FileText size={14} />,      label: t("sidebar.seasonRecap") },
    { href: "/app/settings",       icon: <Settings size={14} />,      label: t("sidebar.settings") },
  ];

  return (
    <>
      {sidebarOpen && (
        <div
          className="pit-sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
      <aside className={cn("pit-sidebar pit-scroll", sidebarOpen && "is-mobile-open")}>
      <div className="pit-side-header">
        <div className="pit-eyebrow">CHANNEL</div>
        <div className="pit-side-channels-head">
          <span className="pit-display" style={{ fontSize: 12 }}>BROADCAST</span>
          <button className="pit-side-add" aria-label="New channel" type="button">
            <Plus size={12} />
          </button>
        </div>
      </div>

      <div className="pit-side-channels pit-scroll">
        {renderChannels.map((ch) => {
          const href = `/app/channels/${ch.id}`;
          const isActive = pathname === href;
          const unread = ch.unreadCount ?? 0;
          const last = ch.lastMessage;
          const isLive = liveChannels.has(ch.id);
          return (
            <Link
              key={ch.id}
              href={href}
              className={cn(
                "pit-side-ch",
                isActive && "is-active",
                unread > 0 && "has-unread",
              )}
            >
              <span className="pit-side-ch-bullet">
                {isLive ? <LiveDot /> : <HashGlyph />}
              </span>
              <div className="pit-side-ch-body">
                <div className="pit-side-ch-row">
                  <span className="pit-side-ch-name">{ch.name}</span>
                  {unread > 0 && !isActive && (
                    <span className="pit-side-ch-unread">
                      {unread > 99 ? "99+" : unread}
                    </span>
                  )}
                </div>
                {last && !unread && (
                  <span className="pit-side-ch-preview" aria-hidden="true">
                    {last.senderName ?? "?"}: {last.contentPreview}
                    <span style={{ opacity: 0.6 }}> · {relativeTime(last.createdAt)}</span>
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      <div className="pit-side-nav">
        <div className="pit-eyebrow" style={{ padding: "10px 14px 4px" }}>
          STATIONS
        </div>
        {NAV.map((n) => {
          const isActive = pathname === n.href || pathname.startsWith(n.href + "/");
          return (
            <Link
              key={n.href}
              href={n.href}
              className={cn("pit-side-nav-item", isActive && "is-active")}
            >
              {n.icon}
              <span>{n.label}</span>
            </Link>
          );
        })}
        <form action="/api/auth/logout" method="POST">
          <button type="submit" className="pit-side-nav-item">
            <LogOut size={14} />
            <span>Sign out</span>
          </button>
        </form>
      </div>
      </aside>
    </>
  );
}
