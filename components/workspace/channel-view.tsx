"use client";
import { useState, useEffect, useLayoutEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, Loader2, PanelRight, Send } from "lucide-react";
import MessageBubble from "./message-bubble";
import { useT } from "@/lib/i18n/client";
import { LiveDot, Telemetry } from "./broadcast-atoms";
import { useMobileShell } from "@/lib/mobile-shell-context";
import type { ActiveRole } from "@/lib/auth/rank";

interface Message {
  id: string;
  channelId: string;
  userId: string | null;
  content: string;
  agentGenerated: boolean;
  agentType: string | null;
  juryReflexKind: string | null;
  senderName?: string | null;
  createdAt: string;
  // Author's role inside the team — null for agent messages or orphan
  // authors. Drives whether the trash icon shows for the viewer.
  authorRole?: ActiveRole | null;
  deletedAt?: string | null;
  deletedByUserId?: string | null;
  deletedByName?: string | null;
}

interface Props {
  channel: { id: string; name: string; description: string | null };
  initialMessages: Message[];
  initialHasMore: boolean;
  currentUserId: string | null;
  // Viewer info — used by MessageBubble to gate the delete affordance.
  viewerRole: ActiveRole;
}

// Pattern that matches "@pitos" in the user's outgoing message — same as
// MENTION_PATTERN in lib/agents/pitos-mention.ts.
const PITOS_MENTION = /(?:^|[^a-z0-9])@pitos\b/i;

export default function ChannelView({
  channel,
  initialMessages,
  initialHasMore,
  currentUserId,
  viewerRole,
}: Props) {
  const t = useT();
  const router = useRouter();
  const { toggleRight } = useMobileShell();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [showScrollDown, setShowScrollDown] = useState(false);
  const [hasMore, setHasMore] = useState<boolean>(initialHasMore);
  const [loadingOlder, setLoadingOlder] = useState(false);
  // Track when the user has just mentioned @pitos and we're awaiting a reply.
  // Cleared when an agent-generated message arrives, or after a 30s safety timeout.
  const [pitosThinkingSince, setPitosThinkingSince] = useState<number | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  // Scroll-position preservation across older-message prepends.
  const prependCounter = useRef(0);
  const lastSeenPrepend = useRef(0);
  const heightBeforePrepend = useRef(0);
  // Guards re-running the initial bottom-jump after the first paint.
  const initialJumped = useRef(false);

  // SSE subscription
  useEffect(() => {
    const es = new EventSource(`/api/channels/${channel.id}/sse`);
    es.onmessage = (e) => {
      const { type, data } = JSON.parse(e.data);
      if (type === "message") {
        setMessages(prev => {
          // Dedup by id — covers both fresh messages and the final-complete
          // event for a stream we already built up via message_chunk.
          const existing = prev.find(m => m.id === data.id);
          if (existing) {
            // Replace the placeholder/streamed version with the final
            // server-truth (same content but with metadata + canonical fields).
            return prev.map(m => (m.id === data.id ? { ...data, content: m.content && m.content.length > data.content.length ? m.content : data.content } : m));
          }
          return [...prev, data];
        });
        // Clear the "PitOS is thinking" indicator the moment any agent message
        // for this channel arrives — channel-agent reflexes count too.
        if (data.agentGenerated) {
          setPitosThinkingSince(null);
        }
      } else if (type === "message_chunk") {
        // Streaming @pitos reply. Build a placeholder on the first delta and
        // append subsequent deltas as they arrive. Client dedupes by id so
        // the final `message` event with the same id is idempotent.
        const { id, delta, channelId: chId, senderName, first } = data as {
          id: string;
          channelId: string;
          delta: string;
          senderName?: string | null;
          first?: boolean;
        };
        if (chId !== channel.id) return;
        setMessages(prev => {
          const existing = prev.find(m => m.id === id);
          if (existing) {
            return prev.map(m => (m.id === id ? { ...m, content: m.content + delta } : m));
          }
          return [
            ...prev,
            {
              id,
              channelId: chId,
              userId: null,
              content: delta,
              agentGenerated: true,
              agentType: "pitos-mention",
              juryReflexKind: null,
              senderName: senderName ?? "PitOS",
              createdAt: new Date().toISOString(),
            },
          ];
        });
        if (first) setPitosThinkingSince(null);
      } else if (type === "message_deleted") {
        // Soft delete — patch the existing row with deletedAt + deletedByName
        // so MessageBubble flips to the tombstone branch.
        const d = data as {
          id: string;
          deletedAt: string | null;
          deletedByUserId: string | null;
          deletedByName: string | null;
        };
        setMessages(prev =>
          prev.map(m =>
            m.id === d.id
              ? {
                  ...m,
                  deletedAt: d.deletedAt,
                  deletedByUserId: d.deletedByUserId,
                  deletedByName: d.deletedByName,
                }
              : m,
          ),
        );
      } else if (type === "channels_updated") {
        router.refresh();
      }
    };
    return () => es.close();
  }, [channel.id, router]);

  // Optimistic delete — flip the bubble to a tombstone right away, then
  // call the API. The server's SSE event will reconcile the deletedByName.
  async function handleDelete(id: string) {
    const nowIso = new Date().toISOString();
    setMessages(prev =>
      prev.map(m =>
        m.id === id
          ? { ...m, deletedAt: nowIso, deletedByUserId: currentUserId, deletedByName: m.deletedByName ?? "you" }
          : m,
      ),
    );
    const res = await fetch(`/api/channels/${channel.id}/messages/${id}`, { method: "DELETE" });
    if (!res.ok) {
      // Roll back on failure.
      setMessages(prev =>
        prev.map(m => (m.id === id ? { ...m, deletedAt: null, deletedByUserId: null, deletedByName: null } : m)),
      );
      const j = await res.json().catch(() => ({}) as { error?: string });
      alert(j.error ?? "Failed to delete message");
    }
  }

  // Safety: never let the thinking indicator linger more than 30s.
  useEffect(() => {
    if (pitosThinkingSince === null) return;
    const t = setTimeout(() => setPitosThinkingSince(null), 30_000);
    return () => clearTimeout(t);
  }, [pitosThinkingSince]);

  // Mark this channel read on mount + when the tab becomes visible.
  useEffect(() => {
    const markRead = () => {
      fetch(`/api/channels/${channel.id}/read`, { method: "POST" }).catch(() => {});
    };
    markRead();
    const onVisibility = () => {
      if (document.visibilityState === "visible") markRead();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [channel.id]);

  // Bump read each time we receive a fresh message while viewing the channel.
  useEffect(() => {
    if (messages.length === 0) return;
    if (document.visibilityState !== "visible") return;
    const t = setTimeout(() => {
      fetch(`/api/channels/${channel.id}/read`, { method: "POST" }).catch(() => {});
    }, 250);
    return () => clearTimeout(t);
  }, [messages.length, channel.id]);

  // Initial mount: jump straight to the bottom synchronously, before paint.
  // useLayoutEffect runs before the browser paints, so the user never sees the
  // top of the channel flash by.
  useLayoutEffect(() => {
    if (initialJumped.current) return;
    const sc = scrollRef.current;
    if (!sc) return;
    sc.scrollTop = sc.scrollHeight;
    initialJumped.current = true;
  }, []);

  // After an older-history prepend, restore the prior viewport so the message
  // the user was reading stays put. Runs synchronously before paint.
  useLayoutEffect(() => {
    if (prependCounter.current === lastSeenPrepend.current) return;
    lastSeenPrepend.current = prependCounter.current;
    const sc = scrollRef.current;
    if (!sc) return;
    const diff = sc.scrollHeight - heightBeforePrepend.current;
    sc.scrollTop = sc.scrollTop + diff;
  }, [messages]);

  // Scroll to bottom on new messages — but only if the user was already near
  // the bottom. If they've scrolled up to read history, don't yank them back.
  useEffect(() => {
    const sc = scrollRef.current;
    if (!sc) return;
    const distance = sc.scrollHeight - sc.scrollTop - sc.clientHeight;
    if (distance < 200) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Track scroll position for the floating "scroll-to-bottom" button + lazy-load
  // older messages when the user nears the top of the scroll container. Uses a
  // ref to read the latest loadOlder closure without re-binding the listener
  // on every render.
  const loadOlderRef = useRef<() => void>(() => {});
  useEffect(() => {
    const sc = scrollRef.current;
    if (!sc) return;
    const onScroll = () => {
      const distance = sc.scrollHeight - sc.scrollTop - sc.clientHeight;
      setShowScrollDown(distance > 200);
      if (sc.scrollTop < 200) loadOlderRef.current();
    };
    onScroll();
    sc.addEventListener("scroll", onScroll, { passive: true });
    return () => sc.removeEventListener("scroll", onScroll);
  }, [messages.length]);

  // Hash-based deeplink: /app/channels/{id}#msg-{messageId} from Ask & Decisions.
  // Re-runs after messages render so the target node exists.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash;
    const match = hash.match(/^#msg-([\w-]+)$/);
    if (!match) return;
    const id = match[1];
    if (!messages.some((m) => m.id === id)) return;
    const el = document.getElementById(`msg-${id}`);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    el.classList.add("ring-2", "ring-amber-400/80", "ring-offset-2", "ring-offset-background");
    const tm = setTimeout(() => {
      el.classList.remove("ring-2", "ring-amber-400/80", "ring-offset-2", "ring-offset-background");
    }, 1800);
    return () => clearTimeout(tm);
  }, [messages.length, channel.id]);

  function scrollToBottom() {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    fetch(`/api/channels/${channel.id}/read`, { method: "POST" }).catch(() => {});
  }

  async function loadOlder() {
    if (!hasMore || loadingOlder) return;
    const sc = scrollRef.current;
    if (!sc) return;
    const oldest = messages[0];
    if (!oldest) return;

    setLoadingOlder(true);
    try {
      const cursor = encodeURIComponent(new Date(oldest.createdAt).toISOString());
      const res = await fetch(`/api/channels/${channel.id}/messages?before=${cursor}`);
      if (!res.ok) return;
      const { messages: older, hasMore: nextHasMore } = (await res.json()) as {
        messages: Message[];
        hasMore: boolean;
      };
      if (older.length === 0) {
        setHasMore(false);
        return;
      }
      heightBeforePrepend.current = sc.scrollHeight;
      prependCounter.current += 1;
      setMessages(prev => {
        const seen = new Set(prev.map(m => m.id));
        const dedup = older.filter(m => !seen.has(m.id));
        return [...dedup, ...prev];
      });
      setHasMore(nextHasMore);
    } finally {
      setLoadingOlder(false);
    }
  }
  // Keep the ref pointing at the latest closure so the scroll listener
  // (bound once per messages.length change) always invokes the current state.
  useEffect(() => {
    loadOlderRef.current = loadOlder;
  });

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    const content = input.trim();
    if (!content || sending) return;
    const mentionsPitos = PITOS_MENTION.test(content);
    setSending(true);
    setInput("");
    try {
      const res = await fetch(`/api/channels/${channel.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (res.ok) {
        const { message } = await res.json();
        // Optimistically add — SSE deduplicates via id check
        setMessages(prev => {
          if (prev.find(m => m.id === message.id)) return prev;
          return [...prev, { ...message, createdAt: new Date(message.createdAt).toISOString() }];
        });
        if (mentionsPitos) setPitosThinkingSince(Date.now());
      } else if (res.status === 429) {
        const body = await res.json().catch(() => null);
        setInput(content); // restore so user doesn't lose what they typed
        alert(body?.message ?? "Demo limiti doldu.");
      }
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(e as unknown as React.FormEvent);
    }
  }

  // Counts for the broadcast telemetry strip.
  const totalCount = messages.length;
  const todayCount = messages.filter((m) => {
    const d = new Date(m.createdAt);
    const now = new Date();
    return (
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate()
    );
  }).length;
  const agentCount = messages.filter((m) => m.agentGenerated).length;

  return (
    <div className="pit-channel">
      {/* Header — broadcast headline */}
      <div className="pit-channel-head">
        <div className="pit-channel-head-left">
          <span style={{ color: "var(--pit-red)" }}>
            <LiveDot />
          </span>
          <h1 className="pit-display pit-channel-name"># {channel.name}</h1>
          {channel.description && (
            <span className="pit-channel-purpose">{channel.description}</span>
          )}
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <Telemetry
            items={[
              { label: "MSGS", value: totalCount },
              { label: "TODAY", value: todayCount },
              { label: "AGENT", value: agentCount },
            ]}
          />
          <button
            type="button"
            onClick={toggleRight}
            className="pit-icon-btn pit-mobile-rightpanel-toggle"
            aria-label="Open agent activity"
          >
            <PanelRight size={14} />
          </button>
        </div>
      </div>

      {/* Stream */}
      <div ref={scrollRef} className="pit-channel-stream pit-scroll relative">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="pit-eyebrow" style={{ fontSize: 11 }}>
              {t("channel.empty")}
            </p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              {t("channel.emptyHint")}
            </p>
          </div>
        )}
        {messages.length > 0 && (
          <div className="flex justify-center py-2 text-xs text-muted-foreground/70">
            {loadingOlder ? (
              <span className="inline-flex items-center gap-1.5">
                <Loader2 size={12} className="animate-spin" /> Loading older messages…
              </span>
            ) : hasMore ? null : (
              <span className="pit-eyebrow" style={{ fontSize: 9 }}>
                · BEGINNING OF CHANNEL ·
              </span>
            )}
          </div>
        )}
        <div className="space-y-1.5">
          {messages.map((m) => (
            <MessageBubble
              key={m.id}
              message={m}
              currentUserId={currentUserId}
              viewerRole={viewerRole}
              onDelete={handleDelete}
            />
          ))}
          {pitosThinkingSince !== null && (
            <div className="pit-msg pit-msg-agent pit-msg-thinking">
              <div className="pit-msg-head">
                <span className="pit-display pit-msg-author">PITOS</span>
                <span className="pit-eyebrow pit-msg-time">PROCESSING</span>
                <span className="pit-thinking">
                  <i />
                  <i />
                  <i />
                </span>
              </div>
            </div>
          )}
        </div>
        <div ref={bottomRef} />
        {showScrollDown && (
          <button
            type="button"
            onClick={scrollToBottom}
            aria-label="Scroll to latest"
            className="sticky bottom-4 float-right mr-1 inline-flex items-center justify-center rounded-full transition w-9 h-9"
            style={{
              background: "var(--pit-red)",
              color: "white",
              boxShadow: "0 8px 20px rgba(0,0,0,0.35)",
            }}
          >
            <ArrowDown size={16} />
          </button>
        )}
      </div>

      {/* Compose */}
      <form onSubmit={sendMessage} className="pit-channel-compose">
        <div className="pit-compose-row">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t("channel.messagePlaceholder", { name: channel.name })}
            rows={1}
            className="pit-compose-input"
            disabled={sending}
          />
          <button
            type="submit"
            className="pit-btn pit-btn-primary"
            disabled={sending || !input.trim()}
          >
            <Send size={13} /> Send
          </button>
        </div>
        <div className="pit-compose-hints">
          <span>
            <kbd>⏎</kbd> send · <kbd>⇧⏎</kbd> newline
          </span>
          <span style={{ marginLeft: "auto" }}>@pitos to summon</span>
        </div>
      </form>
    </div>
  );
}
