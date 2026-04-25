"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, Hash, Send } from "lucide-react";
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

export default function ChannelView({ channel, initialMessages, currentUserId }: Props) {
  const t = useT();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [showScrollDown, setShowScrollDown] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // SSE subscription
  useEffect(() => {
    const es = new EventSource(`/api/channels/${channel.id}/sse`);
    es.onmessage = (e) => {
      const { type, data } = JSON.parse(e.data);
      if (type === "message") {
        setMessages(prev => {
          if (prev.find(m => m.id === data.id)) return prev;
          return [...prev, data];
        });
      } else if (type === "channels_updated") {
        router.refresh();
      }
    };
    return () => es.close();
  }, [channel.id, router]);

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
