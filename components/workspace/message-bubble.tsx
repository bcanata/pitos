"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { ArrowUpRight, Bot, Gavel } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";

// Internal sentinel URL — `[msg:ID]` markers in agent text get pre-processed
// into markdown links pointing here, then the custom `a` renderer below
// detects the prefix and swaps in a CitationChip instead of a normal anchor.
const CITE_PREFIX = "/_cite_msg/";

function CitationChip({ messageId }: { messageId: string }) {
  const router = useRouter();
  const [resolving, setResolving] = useState(false);

  return (
    <button
      type="button"
      onClick={async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (resolving) return;
        setResolving(true);
        try {
          const r = await fetch(`/api/messages/${messageId}/locate`);
          if (!r.ok) return;
          const j = (await r.json()) as { channelId?: string };
          if (j.channelId) {
            router.push(`/app/channels/${j.channelId}#msg-${messageId}`);
          }
        } finally {
          setResolving(false);
        }
      }}
      title={`Open cited message ${messageId.slice(0, 8)}…`}
      className={cn(
        "inline-flex items-baseline align-baseline gap-0.5 rounded border border-primary/30 bg-primary/10 px-1 py-0",
        "text-[10px] font-medium text-primary leading-none",
        "hover:bg-primary/20 hover:border-primary/50",
        "transition-colors mx-0.5",
        resolving && "opacity-60",
      )}
    >
      <ArrowUpRight size={9} className="-mb-0.5" />
      ref
    </button>
  );
}

// Pre-process the message text so [msg:ID] tokens render as clickable chips.
// The trick: rewrite them as markdown links pointing at our sentinel URL,
// then intercept them in the `a` renderer.
function inlineCitationsToMarkdown(content: string): string {
  return content.replace(/\[msg:([a-zA-Z0-9-]+)\]/g, (_, id) => {
    return `[msg-cite](${CITE_PREFIX}${id})`;
  });
}

interface Message {
  id: string;
  userId: string | null;
  content: string;
  agentGenerated: boolean;
  agentType: string | null;
  juryReflexKind: string | null;
  senderName?: string | null;
  createdAt: string;
}

const reflexLabels: Record<string, string> = {
  proof_demand: "proof check",
  why_question: "why?",
  teach_redirect: "teach mode",
};

// Cosmetic badge map for FRC-authoritative domains. Mirrors (and is allowed
// to drift from) the web_search allowlist in lib/agents/pitos-mention.ts.
const FRC_DOMAINS: ReadonlyArray<{ host: string; label: string }> = [
  { host: "thebluealliance.com", label: "TBA" },
  { host: "frc-events.firstinspires.org", label: "FRC Events" },
  { host: "firstinspires.org", label: "FIRST" },
  { host: "statbotics.io", label: "Statbotics" },
  { host: "chiefdelphi.com", label: "Chief Delphi" },
  { host: "docs.wpilib.org", label: "WPILib Docs" },
  { host: "wpilib.org", label: "WPILib" },
  { host: "github.com", label: "GitHub" },
  { host: "andymark.com", label: "AndyMark" },
  { host: "revrobotics.com", label: "REV" },
  { host: "ctr-electronics.com", label: "CTRE" },
  { host: "wcproducts.com", label: "WCP" },
  { host: "vexrobotics.com", label: "VEX" },
  { host: "swervedrivespecialties.com", label: "SDS" },
  { host: "playingwithfusion.com", label: "PwF" },
];

function frcLabelForUrl(raw: string): string | null {
  try {
    const u = new URL(raw);
    const host = u.hostname.replace(/^www\./, "");
    for (const d of FRC_DOMAINS) {
      if (host === d.host || host.endsWith("." + d.host)) return d.label;
    }
    return null;
  } catch {
    return null;
  }
}

// Markdown components — minimal styling so it inherits the bubble theme.
// The two key wins are: (1) **bold** + *italic* + lists + code blocks render,
// (2) auto-linked URLs get an FRC domain badge,
// (3) [msg:ID] memory citations render as clickable chips that deeplink
//     into the right channel after a quick locate lookup.
const MD_COMPONENTS: Components = {
  a({ href, children }) {
    const url = typeof href === "string" ? href : "";
    if (url.startsWith(CITE_PREFIX)) {
      const id = url.slice(CITE_PREFIX.length);
      return <CitationChip messageId={id} />;
    }
    const label = url ? frcLabelForUrl(url) : null;
    return (
      <a
        href={url}
        target="_blank"
        rel="noreferrer noopener"
        className="text-primary underline decoration-primary/40 hover:decoration-primary break-all"
      >
        {children}
        {label && (
          <span className="ml-1 inline-flex items-center rounded bg-primary/15 px-1 py-0 text-[10px] font-medium text-primary align-middle">
            {label}
          </span>
        )}
      </a>
    );
  },
  p({ children }) {
    return <p className="leading-relaxed">{children}</p>;
  },
  ul({ children }) {
    return <ul className="list-disc pl-5 space-y-0.5 my-1">{children}</ul>;
  },
  ol({ children }) {
    return <ol className="list-decimal pl-5 space-y-0.5 my-1">{children}</ol>;
  },
  li({ children }) {
    return <li className="leading-relaxed">{children}</li>;
  },
  h1({ children }) {
    return <h3 className="font-semibold text-base mt-1.5 mb-1">{children}</h3>;
  },
  h2({ children }) {
    return <h3 className="font-semibold text-sm mt-1.5 mb-1">{children}</h3>;
  },
  h3({ children }) {
    return <h4 className="font-semibold text-sm mt-1 mb-0.5">{children}</h4>;
  },
  h4({ children }) {
    return <h5 className="font-semibold text-xs mt-1 mb-0.5">{children}</h5>;
  },
  strong({ children }) {
    return <strong className="font-semibold text-foreground">{children}</strong>;
  },
  em({ children }) {
    return <em className="italic">{children}</em>;
  },
  blockquote({ children }) {
    return (
      <blockquote className="border-l-2 border-border pl-3 my-1 text-muted-foreground italic">
        {children}
      </blockquote>
    );
  },
  code({ children, className }) {
    const isBlock = (className ?? "").includes("language-");
    if (isBlock) {
      return (
        <code className="block w-full text-xs font-mono whitespace-pre overflow-x-auto rounded bg-muted/70 p-2 my-1">
          {children}
        </code>
      );
    }
    return (
      <code className="text-xs font-mono rounded bg-muted/70 px-1 py-0.5">
        {children}
      </code>
    );
  },
  pre({ children }) {
    return <pre className="my-1">{children}</pre>;
  },
  hr() {
    return <hr className="my-2 border-border" />;
  },
};

function MessageBody({ content }: { content: string }) {
  const prepared = inlineCitationsToMarkdown(content);
  return (
    <div className="text-sm text-foreground leading-relaxed [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&>p]:my-1">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={MD_COMPONENTS}>
        {prepared}
      </ReactMarkdown>
    </div>
  );
}

interface Props {
  message: Message;
  currentUserId?: string | null;
}

export default function MessageBubble({ message, currentUserId }: Props) {
  const isAgent = message.agentGenerated;
  const isOwn = !!currentUserId && message.userId === currentUserId;
  const time = new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  if (isAgent) {
    return (
      <div
        id={`msg-${message.id}`}
        className="msg-anchor px-3 py-2.5 rounded-lg border-l-[3px] border-primary bg-primary/8 ml-0 scroll-mt-16"
      >
        <div className="flex items-center gap-2 mb-1">
          <Bot size={13} className="text-primary shrink-0" />
          <span className="text-xs font-semibold text-primary">PitOS</span>
          <span className="text-xs text-muted-foreground">{time}</span>
          {message.juryReflexKind && (
            <span className="inline-flex items-center gap-1 text-xs bg-amber-500/15 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded font-medium">
              <Gavel size={10} />
              {reflexLabels[message.juryReflexKind] ?? message.juryReflexKind}
            </span>
          )}
        </div>
        <div className="pl-5">
          <MessageBody content={message.content} />
        </div>
      </div>
    );
  }

  const displayName = isOwn ? "you" : (message.senderName ?? "—");

  return (
    <div
      id={`msg-${message.id}`}
      className={cn(
        "msg-anchor group px-3 py-2 rounded-lg hover:bg-muted/40 scroll-mt-16",
        isOwn && "hover:bg-primary/5",
      )}
    >
      <div className="flex items-baseline gap-2 mb-0.5">
        <span className={cn("text-xs font-semibold", isOwn ? "text-primary/70" : "text-foreground/80")}>
          {displayName}
        </span>
        <span className="text-xs text-muted-foreground">{time}</span>
      </div>
      <MessageBody content={message.content} />
    </div>
  );
}
