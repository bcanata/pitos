"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookMarked, FileText, Gavel, Hash, LogOut, Search, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  team: { id: string; name: string; number: number | null };
  channels: { id: string; name: string }[];
}

const navLink = (href: string, pathname: string) =>
  cn(
    "flex items-center gap-2 mx-2 px-2 py-1.5 rounded text-sm",
    pathname === href
      ? "bg-primary/20 text-primary font-medium"
      : "text-muted-foreground hover:bg-muted hover:text-foreground"
  );

export default function ChannelSidebar({ team, channels }: Props) {
  const pathname = usePathname();
  return (
    <aside className="w-60 bg-card border-r border-border flex flex-col shrink-0">
      <div className="px-4 py-3 border-b border-border">
        <h2 className="font-semibold text-sm truncate">{team.name}</h2>
        {team.number && <p className="text-xs text-muted-foreground">Team {team.number}</p>}
      </div>
      <div className="flex-1 overflow-y-auto py-2">
        <p className="px-4 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">Channels</p>
        {channels.map(ch => (
          <Link key={ch.id} href={`/app/channels/${ch.id}`} className={navLink(`/app/channels/${ch.id}`, pathname)}>
            <Hash size={14} />
            {ch.name}
          </Link>
        ))}
      </div>
      <div className="py-2 border-t border-border">
        <Link href="/app/ask" className={navLink("/app/ask", pathname)}>
          <Search size={14} />Ask PitOS
        </Link>
        <Link href="/app/judge-sim" className={navLink("/app/judge-sim", pathname)}>
          <Gavel size={14} />Judge Sim
        </Link>
        <Link href="/app/decisions" className={navLink("/app/decisions", pathname)}>
          <BookMarked size={14} />Decisions
        </Link>
        <Link href="/app/exit-interview" className={navLink("/app/exit-interview", pathname)}>
          <LogOut size={14} />Exit Interview
        </Link>
        <Link href="/app/season-recap" className={navLink("/app/season-recap", pathname)}>
          <FileText size={14} />Season Recap
        </Link>
        <Link href="/app/settings" className={navLink("/app/settings", pathname)}>
          <Settings size={14} />Settings
        </Link>
      </div>
    </aside>
  );
}
