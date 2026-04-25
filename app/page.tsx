import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import {
  ArrowRight,
  Bot,
  Gavel,
  MessageSquare,
} from "lucide-react";

export default async function Home() {
  const { user } = await getSession();
  if (user) redirect("/app");

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-5xl px-6 pt-16 pb-24">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-primary/20 text-primary font-bold text-sm">
              P
            </span>
            <span className="font-semibold">PitOS</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Link href="/auth" className="text-muted-foreground hover:text-foreground">
              Sign in
            </Link>
            <Link
              href="/api/auth/demo"
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 font-medium text-primary-foreground hover:bg-primary/90"
            >
              Try demo <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* Hero */}
        <section className="mt-20 max-w-2xl">
          <p className="text-xs font-medium tracking-widest text-primary uppercase">
            Built for FRC teams
          </p>
          <h1 className="mt-3 text-4xl sm:text-5xl font-semibold tracking-tight leading-[1.1]">
            An AI-native workspace for FIRST Robotics teams.
          </h1>
          <p className="mt-5 text-base sm:text-lg text-muted-foreground leading-relaxed">
            Channels, tasks, decisions, and a permanent rehearsal partner that
            asks the questions a judge would. Built around proof-of-work, not
            chat-bot fluff.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/api/auth/demo"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 font-medium text-primary-foreground hover:bg-primary/90"
            >
              View read-only demo <ArrowRight size={16} />
            </Link>
            <Link
              href="/auth"
              className="inline-flex items-center gap-2 rounded-md border border-border px-5 py-2.5 font-medium text-foreground hover:bg-muted"
            >
              Sign in for your team
            </Link>
          </div>
        </section>

        {/* Feature cards */}
        <section className="mt-24 grid gap-4 sm:grid-cols-3">
          <FeatureCard
            icon={<MessageSquare size={18} />}
            title="Live team chat"
            body="Eighteen channels, realtime SSE, sidebar unread counts, and last-message previews. Slack-shaped, FRC-tuned."
          />
          <FeatureCard
            icon={<Bot size={18} />}
            title="@pitos on-call agent"
            body="One mention away. Creates tasks, logs decisions with rationale, searches FRC sources, and answers from your team's history with citations."
          />
          <FeatureCard
            icon={<Gavel size={18} />}
            title="Judge prep, all season"
            body="Mock judging, decisions log, season recap, and exit interviews — so the proof is captured before the night before."
          />
        </section>

        {/* Footer note */}
        <footer className="mt-24 border-t border-border pt-6 text-xs text-muted-foreground">
          <p>
            Made for FRC Team 8092 G.O.A.T. and any team that wants the same.
            Fork it on{" "}
            <a
              href="https://github.com/bcanata/pitos"
              target="_blank"
              rel="noreferrer noopener"
              className="underline hover:text-foreground"
            >
              GitHub
            </a>
            .
          </p>
        </footer>
      </div>
    </main>
  );
}

function FeatureCard({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary/15 text-primary">
        {icon}
      </div>
      <h3 className="mt-3 font-medium">{title}</h3>
      <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{body}</p>
    </div>
  );
}
