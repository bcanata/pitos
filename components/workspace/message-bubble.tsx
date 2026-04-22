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

  if (isAgent) {
    return (
      <div className="px-3 py-2.5 rounded-lg border-l-[3px] border-primary bg-primary/8 ml-0">
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
        <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap pl-5">{message.content}</p>
      </div>
    );
  }

  return (
    <div className="group px-3 py-2 rounded-lg hover:bg-muted/40">
      <div className="flex items-baseline gap-2 mb-0.5">
        <span className="text-xs font-semibold text-foreground/80">you</span>
        <span className="text-xs text-muted-foreground">{time}</span>
      </div>
      <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap pl-0">{message.content}</p>
    </div>
  );
}
