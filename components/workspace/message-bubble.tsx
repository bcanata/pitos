"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { ArrowUpRight, Gavel, Trash2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";
import { Avatar } from "./broadcast-atoms";
import { canDeleteMessage, type ActiveRole } from "@/lib/auth/rank";

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
        "pit-cite-chip",
        resolving && "opacity-60",
      )}
      style={{ padding: "0 5px" }}
    >
      <ArrowUpRight size={9} />
      ref
    </button>
  );
}

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
  authorRole?: ActiveRole | null;
  deletedAt?: string | null;
  deletedByUserId?: string | null;
  deletedByName?: string | null;
}

const reflexLabels: Record<string, string> = {
  proof_demand: "proof check",
  why_question: "why?",
  teach_redirect: "teach mode",
};

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
  // Viewer's role — drives whether the trash icon appears on hover. Pass
  // through from ChannelView (which gets it from the workspace layout).
  viewerRole?: ActiveRole;
  // Click handler from ChannelView. Optimistically tombstones the bubble,
  // then fires DELETE /api/channels/.../messages/:id and reconciles via SSE.
  onDelete?: (messageId: string) => void;
}

// Format timestamp using 24h locale-independent HH:MM — broadcast feel.
function formatTime(iso: string): string {
  const d = new Date(iso);
  const h = d.getHours().toString().padStart(2, "0");
  const m = d.getMinutes().toString().padStart(2, "0");
  return `${h}:${m}`;
}

export default function MessageBubble({ message, currentUserId, viewerRole, onDelete }: Props) {
  const isAgent = message.agentGenerated;
  const isOwn = !!currentUserId && message.userId === currentUserId;
  const time = formatTime(message.createdAt);
  const isDeleted = !!message.deletedAt;

  // Tombstone — render in place of the body when soft-deleted. Keeps the
  // row in the DOM so [msg:ID] anchors still resolve and the deeplink
  // highlight from /api/messages/:id/locate still finds the right element.
  if (isDeleted) {
    return (
      <div
        id={`msg-${message.id}`}
        className="msg-anchor pit-msg pit-msg-tombstone"
      >
        <em>
          [message deleted{message.deletedByName ? ` by ${message.deletedByName}` : ""}]
        </em>
      </div>
    );
  }

  // Decide whether the viewer can delete this message. Server still
  // enforces — this is just to hide the affordance for callers who can't.
  const canDelete =
    !!viewerRole &&
    !!onDelete &&
    canDeleteMessage(viewerRole, message.agentGenerated ? null : message.authorRole ?? null);

  function handleDeleteClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!onDelete) return;
    if (!confirm("Delete this message?")) return;
    onDelete(message.id);
  }

  if (isAgent) {
    return (
      <div id={`msg-${message.id}`} className="msg-anchor pit-msg pit-msg-agent group">
        <div className="pit-msg-head">
          <span className="pit-display pit-msg-author">PITOS</span>
          <span className="pit-msg-time pit-mono">{time}</span>
          {message.juryReflexKind && (
            <span className="pit-chip pit-chip-amber">
              <Gavel size={10} />
              {reflexLabels[message.juryReflexKind] ?? message.juryReflexKind}
            </span>
          )}
          {canDelete && (
            <button
              type="button"
              onClick={handleDeleteClick}
              className="pit-msg-trash opacity-0 group-hover:opacity-100"
              aria-label="Delete message"
              title="Delete message"
            >
              <Trash2 size={11} />
            </button>
          )}
        </div>
        <div className="pit-msg-body" style={{ paddingLeft: 0 }}>
          <MessageBody content={message.content} />
        </div>
      </div>
    );
  }

  const displayName = isOwn ? "you" : (message.senderName ?? "—");

  return (
    <div
      id={`msg-${message.id}`}
      className={cn("msg-anchor pit-msg group", isOwn && "pit-msg-rail-blue")}
    >
      <div className="pit-msg-head">
        <Avatar name={displayName} />
        <span className="pit-msg-author">{displayName}</span>
        <span className="pit-msg-time pit-mono">{time}</span>
        {canDelete && (
          <button
            type="button"
            onClick={handleDeleteClick}
            className="pit-msg-trash opacity-0 group-hover:opacity-100"
            aria-label="Delete message"
            title="Delete message"
          >
            <Trash2 size={11} />
          </button>
        )}
      </div>
      <MessageBody content={message.content} />
    </div>
  );
}
