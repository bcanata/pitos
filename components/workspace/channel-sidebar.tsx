"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Hash } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  team: { id: string; name: string; number: number | null };
  channels: { id: string; name: string }[];
}

export default function ChannelSidebar({ team, channels }: Props) {
  const pathname = usePathname();
  return (
    <aside className="w-60 bg-card border-r border-border flex flex-col shrink-0">
      {/* Team name header */}
      <div className="px-4 py-3 border-b border-border">
        <h2 className="font-semibold text-sm truncate">{team.name}</h2>
        {team.number && <p className="text-xs text-muted-foreground">Team {team.number}</p>}
      </div>
      {/* Channels */}
      <div className="flex-1 overflow-y-auto py-2">
        <p className="px-4 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">Channels</p>
        {channels.map(ch => (
          <Link
            key={ch.id}
            href={`/app/channels/${ch.id}`}
            className={cn(
              "flex items-center gap-2 mx-2 px-2 py-1.5 rounded text-sm",
              pathname === `/app/channels/${ch.id}`
                ? "bg-primary/20 text-primary font-medium"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Hash size={14} />
            {ch.name}
          </Link>
        ))}
      </div>
    </aside>
  );
}
