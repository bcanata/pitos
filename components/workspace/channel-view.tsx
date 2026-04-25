"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, Bot, Hash, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import MessageBubble from "./message-bubble";
import { useT } from "@/lib/i18n/client";

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
}

interface Props {
  channel: { id: string; name: string; description: string | null };
  initialMessages: Message[];
  currentUserId: string | null;
}

// Pattern that matches "@pitos" in the user's outgoing message — same as
// MENTION_PATTERN in lib/agents/pitos-mention.ts.
const PITOS_MENTION = /(?:^|[^a-z0-9])@pitos\b/i;

export default function ChannelView({ channel, initialMessages, currentUserId }: Props) {
  const t = useT();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [showScrollDown, setShowScrollDown] = useState(false);
  // Track when the user has just mentioned @pitos and we're awaiting a reply.
  // Cleared when an agent-generated message arrives, or after a 30s safety timeout.
  const [pitosThinkingSince, setPitosThinkingSince] = useState<number | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

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
      } else if (type === "channels_updated") {
        router.refresh();
      }
    };
    return () => es.close();
  }, [channel.id, router]);

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

  // Track scroll position for the floating "scroll-to-bottom" button.
  useEffect(() => {
    const sc = scrollRef.current;
    if (!sc) return;
    const onScroll = () => {
      const distance = sc.scrollHeight - sc.scrollTop - sc.clientHeight;
      setShowScrollDown(distance > 200);
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

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border shrink-0">
        <Hash size={18} className="text-muted-foreground" />
        <h1 className="font-semibold">{channel.name}</h1>
        {channel.description && (
          <span className="text-sm text-muted-foreground border-l border-border pl-3">{channel.description}</span>
        )}
      </div>

      {/* Messages — plain div so overflow-y-auto works reliably in flex column */}
      <div ref={scrollRef} className="relative flex-1 min-h-0 overflow-y-auto px-4 py-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-sm font-medium text-muted-foreground">{t("channel.empty")}</p>
            <p className="text-xs text-muted-foreground/60 mt-1">{t("channel.emptyHint")}</p>
          </div>
        )}
        <div className="space-y-1.5">
          {messages.map(m => (
            <MessageBubble key={m.id} message={m} currentUserId={currentUserId} />
          ))}
          {pitosThinkingSince !== null && (
            <div className="px-3 py-2.5 rounded-lg border-l-[3px] border-primary/60 bg-primary/5 ml-0 animate-pulse">
              <div className="flex items-center gap-2">
                <Bot size={13} className="text-primary shrink-0" />
                <span className="text-xs font-semibold text-primary">PitOS</span>
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary/70 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary/70 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary/70 animate-bounce" style={{ animationDelay: "300ms" }} />
                </span>
                <span className="text-xs text-muted-foreground italic">thinking…</span>
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
            className="sticky bottom-4 float-right mr-1 inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition w-9 h-9"
          >
            <ArrowDown size={16} />
          </button>
        )}
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="px-4 py-3 border-t border-border shrink-0">
        <div className="flex gap-2 items-end">
          <Textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t("channel.messagePlaceholder", { name: channel.name })}
            rows={1}
            className="flex-1 min-h-[40px] max-h-[120px] resize-none"
            disabled={sending}
          />
          <Button type="submit" size="icon" disabled={sending || !input.trim()}>
            <Send size={16} />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-1">{t("channel.sendHint")}</p>
      </form>
    </div>
  );
}
