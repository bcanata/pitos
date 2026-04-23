"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Hash, Send } from "lucide-react";
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
  const bottomRef = useRef<HTMLDivElement>(null);

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

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4">
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
