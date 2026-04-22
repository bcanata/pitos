import { cn } from "@/lib/utils";
import { Bot, Gavel } from "lucide-react";

interface Message {
  id: string;
  userId: string | null;
  content: string;
  agentGenerated: boolean;
  agentType: string | null;
  juryReflexKind: string | null;
  createdAt: string;
}

const reflexLabels: Record<string, string> = {
  proof_demand: "proof check",
  why_question: "why?",
  teach_redirect: "teach mode",
};

export default function MessageBubble({ message }: { message: Message }) {
  const isAgent = message.agentGenerated;
  const time = new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div className={cn(
      "group px-3 py-2 rounded-lg",
      isAgent
        ? "border-l-2 border-primary bg-primary/5 ml-0"
        : "hover:bg-muted/40"
    )}>
      <div className="flex items-baseline gap-2 mb-0.5">
        {isAgent ? (
          <>
            <Bot size={14} className="text-primary shrink-0 mt-0.5" />
            <span className="text-xs font-semibold text-primary">PitOS</span>
          </>
        ) : (
          <span className="text-xs font-semibold text-foreground">you</span>
        )}
        <span className="text-xs text-muted-foreground">{time}</span>
        {message.juryReflexKind && (
          <span className="flex items-center gap-1 text-xs bg-amber-500/15 text-amber-400 px-1.5 py-0.5 rounded">
            <Gavel size={10} />
            {reflexLabels[message.juryReflexKind] ?? message.juryReflexKind}
          </span>
        )}
      </div>
      <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap pl-5">{message.content}</p>
    </div>
  );
}
