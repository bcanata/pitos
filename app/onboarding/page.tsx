"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const INITIAL_MESSAGE: Message = {
  role: "assistant",
  content:
    "Welcome to PitOS! I'm going to help you set up your team. What's your FRC team number?",
};

export default function OnboardingPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // On mount, check if user already has a team
  useEffect(() => {
    fetch("/api/onboarding")
      .then((r) => r.json())
      .then((data: { hasTeam?: boolean }) => {
        if (data.hasTeam) {
          router.replace("/app");
        }
      })
      .catch(() => {});
  }, [router]);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading || done) return;

    const userMsg: Message = { role: "user", content: text };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });

      const data: { reply?: string; done?: boolean; error?: string } =
        await res.json();

      const assistantMsg: Message = {
        role: "assistant",
        content:
          data.reply ??
          (data.done
            ? "Setup complete! Taking you to your workspace..."
            : "Something went wrong. Please try again."),
      };

      setMessages((prev) => [...prev, assistantMsg]);

      if (data.done) {
        setDone(true);
        setTimeout(() => {
          router.replace("/app");
        }, 1500);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Something went wrong. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <main className="flex min-h-dvh flex-col items-center bg-gray-950 text-gray-100">
      {/* Header */}
      <div className="w-full max-w-2xl px-4 pt-10 pb-4">
        <div className="flex items-center gap-3">
          <span className="text-teal-400 text-2xl font-bold tracking-tight">
            PitOS
          </span>
          <span className="text-gray-500 text-sm">Team Setup</span>
        </div>
      </div>

      {/* Chat messages */}
      <div className="flex-1 w-full max-w-2xl px-4 overflow-y-auto space-y-4 pb-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-teal-600 text-white rounded-br-sm"
                  : "bg-gray-800 text-gray-100 rounded-bl-sm"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-800 rounded-2xl rounded-bl-sm px-4 py-3 text-sm text-gray-400">
              <span className="animate-pulse">Thinking...</span>
            </div>
          </div>
        )}

        {done && (
          <div className="flex justify-center">
            <div className="bg-teal-900 border border-teal-700 text-teal-300 rounded-xl px-4 py-3 text-sm">
              Setup complete! Taking you to your workspace...
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="w-full max-w-2xl px-4 pb-8 pt-2">
        <div className="flex items-center gap-2 bg-gray-900 border border-gray-700 rounded-2xl px-4 py-3 focus-within:border-teal-500 transition-colors">
          <input
            type="text"
            className="flex-1 bg-transparent text-sm text-gray-100 placeholder:text-gray-500 outline-none"
            placeholder={done ? "Setup complete" : "Type a message..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading || done}
            autoFocus
          />
          <button
            onClick={sendMessage}
            disabled={loading || done || !input.trim()}
            className="text-teal-400 hover:text-teal-300 disabled:text-gray-600 transition-colors text-sm font-medium px-1"
          >
            Send
          </button>
        </div>
        <p className="text-center text-gray-600 text-xs mt-2">
          Press Enter to send
        </p>
      </div>
    </main>
  );
}
