"use client";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
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
import { useT } from "@/lib/i18n/client";

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

const navLink = (href: string, pathname: string) =>
  cn(
    "flex items-center gap-2 mx-2 px-2 py-1.5 rounded text-sm",
    pathname === href
      ? "bg-primary/20 text-primary font-medium"
      : "text-muted-foreground hover:bg-muted hover:text-foreground",
  );

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

export default function ChannelSidebar({ team, channels, currentUserId }: Props) {
  const t = useT();
  const router = useRouter();
  const pathname = usePathname();

  // Client-side deltas applied on top of server-rendered props. We reset them
  // in the render phase whenever the props' channelsKey changes (the React
  // pattern for "store information from previous renders").
  const [deltas, setDeltas] = useState<Map<string, ChannelDelta>>(new Map());
  const [teamOverride, setTeamOverride] = useState<Partial<SidebarTeam>>({});
  const [lastChannelsKey, setLastChannelsKey] = useState<string>("");

  const currentChannelId = useMemo(() => {
    const m = pathname.match(/^\/app\/channels\/([^/]+)/);
    return m?.[1] ?? null;
  }, [pathname]);

  // Subscribe to the team-wide SSE stream for cross-channel awareness.
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
            // If user is currently viewing this channel, force the count to 0.
            unreadOverride: isCurrent ? 0 : existing.unreadOverride,
          });
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

  // Reset deltas + teamOverride whenever the channels prop reference changes
  // (i.e. after router.refresh()). Doing this in the render phase avoids the
  // "setState synchronously within an effect" cascading-render anti-pattern.
  const channelsKey = useMemo(() => channels.map((c) => c.id).join(","), [channels]);
  if (channelsKey !== lastChannelsKey) {
    setLastChannelsKey(channelsKey);
    setDeltas(new Map());
    setTeamOverride({});
  }

  const renderTeam: SidebarTeam = { ...team, ...teamOverride };

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

  return (
    <aside className="w-60 bg-card border-r border-border flex flex-col shrink-0">
      <div className="px-4 py-3 border-b border-border">
        <h2 className="font-semibold text-sm truncate">{renderTeam.name}</h2>
        {renderTeam.number && (
          <p className="text-xs text-muted-foreground">
            {t("sidebar.team", { number: String(renderTeam.number) })}
          </p>
        )}
      </div>
      <div className="flex-1 overflow-y-auto py-2">
        <p className="px-4 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {t("sidebar.channels")}
        </p>
        {renderChannels.map((ch) => {
          const href = `/app/channels/${ch.id}`;
          const isActive = pathname === href;
          const unread = ch.unreadCount ?? 0;
          const last = ch.lastMessage;
          return (
            <Link
              key={ch.id}
              href={href}
              className={cn(
                "block mx-2 px-2 py-1.5 rounded text-sm",
                isActive
                  ? "bg-primary/20 text-primary font-medium"
                  : unread > 0
                  ? "text-foreground hover:bg-muted"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <div className="flex items-center gap-2">
                <Hash size={14} className="shrink-0" />
                <span className={cn("truncate flex-1", unread > 0 && !isActive && "font-semibold")}>
                  {ch.name}
                </span>
                {unread > 0 && !isActive && (
                  <span className="shrink-0 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-primary/30 text-primary text-[10px] font-medium">
                    {unread > 99 ? "99+" : unread}
                  </span>
                )}
              </div>
              {last && (
                <p className="mt-0.5 ml-6 text-[11px] text-muted-foreground/80 truncate">
                  <span className="font-medium">{last.senderName ?? "?"}:</span>{" "}
                  {last.contentPreview}
                  <span className="ml-1 opacity-60">· {relativeTime(last.createdAt)}</span>
                </p>
              )}
            </Link>
          );
        })}
      </div>
      <div className="py-2 border-t border-border">
        <Link href="/app/ask" className={navLink("/app/ask", pathname)}>
          <Search size={14} />{t("sidebar.askPitOS")}
        </Link>
        <Link href="/app/tasks" className={navLink("/app/tasks", pathname)}>
          <KanbanSquare size={14} />Tasks
        </Link>
        <Link href="/app/judge-sim" className={navLink("/app/judge-sim", pathname)}>
          <Gavel size={14} />{t("sidebar.judgeSim")}
        </Link>
        <Link href="/app/decisions" className={navLink("/app/decisions", pathname)}>
          <BookMarked size={14} />{t("sidebar.decisions")}
        </Link>
        <Link href="/app/exit-interview" className={navLink("/app/exit-interview", pathname)}>
          <LogOut size={14} />{t("sidebar.exitInterview")}
        </Link>
        <Link href="/app/season-recap" className={navLink("/app/season-recap", pathname)}>
          <FileText size={14} />{t("sidebar.seasonRecap")}
        </Link>
        <Link href="/app/settings" className={navLink("/app/settings", pathname)}>
          <Settings size={14} />{t("sidebar.settings")}
        </Link>
        <form action="/api/auth/logout" method="POST">
          <button
            type="submit"
            className={cn(
              "flex w-full items-center gap-2 mx-2 px-2 py-1.5 rounded text-sm",
              "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <LogOut size={14} />Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
