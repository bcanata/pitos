"use client";
import { cn } from "@/lib/utils";
import { Bot, Gavel } from "lucide-react";

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

// Base domains that get a small badge in the rendered link. Mirrors (and is
// allowed to drift from) the web_search allowlist in lib/agents/pitos-mention.ts —
// this list is purely cosmetic.
const FRC_DOMAINS: ReadonlyArray<{ host: string; label: string }> = [
  { host: "thebluealliance.com", label: "TBA" },
  { host: "firstinspires.org", label: "FIRST" },
  { host: "frc-events.firstinspires.org", label: "FRC Events" },
  { host: "statbotics.io", label: "Statbotics" },
  { host: "chiefdelphi.com", label: "Chief Delphi" },
  { host: "wpilib.org", label: "WPILib" },
  { host: "docs.wpilib.org", label: "WPILib Docs" },
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

const URL_RE = /(https?:\/\/[^\s<>"']+)/g;
const TRAILING_PUNCT_RE = /[.,;:!?)\]>"'—]+$/;

type Seg = { type: "text"; text: string } | { type: "link"; href: string; label: string | null };

function linkify(content: string): Seg[] {
  const out: Seg[] = [];
  let lastIndex = 0;
  for (const m of content.matchAll(URL_RE)) {
    const raw = m[0];
    const start = m.index ?? 0;
    if (start > lastIndex) {
      out.push({ type: "text", text: content.slice(lastIndex, start) });
    }
    // Strip trailing punctuation from the URL match so sentence-ending dots
    // don't get pulled into the href.
    const trail = raw.match(TRAILING_PUNCT_RE)?.[0] ?? "";
    const href = trail ? raw.slice(0, -trail.length) : raw;
    out.push({ type: "link", href, label: frcLabelForUrl(href) });
    if (trail) out.push({ type: "text", text: trail });
    lastIndex = start + raw.length;
  }
  if (lastIndex < content.length) {
    out.push({ type: "text", text: content.slice(lastIndex) });
  }
  return out;
}

function MessageBody({ content }: { content: string }) {
  const segs = linkify(content);
  if (segs.length === 1 && segs[0].type === "text") {
    return <span className="whitespace-pre-wrap">{segs[0].text}</span>;
  }
  return (
    <span className="whitespace-pre-wrap">
      {segs.map((seg, i) =>
        seg.type === "text" ? (
          <span key={i}>{seg.text}</span>
        ) : (
          <a
            key={i}
            href={seg.href}
            target="_blank"
            rel="noreferrer noopener"
            className="text-primary underline decoration-primary/40 hover:decoration-primary break-all"
          >
            {seg.href}
            {seg.label && (
              <span className="ml-1 inline-flex items-center rounded bg-primary/15 px-1 py-0 text-[10px] font-medium text-primary align-middle">
                {seg.label}
              </span>
            )}
          </a>
        ),
      )}
    </span>
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
        <p className="text-sm text-foreground leading-relaxed pl-5">
          <MessageBody content={message.content} />
        </p>
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
      <p className="text-sm text-foreground leading-relaxed">
        <MessageBody content={message.content} />
      </p>
    </div>
  );
}
