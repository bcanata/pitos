"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Status = "idle" | "loading" | "sent";

const ERROR_MESSAGES: Record<string, string> = {
  invalid: "This link has expired or already been used.",
  session: "Something went wrong. Please try again.",
};

interface Props {
  error?: string;
}

export default function AuthForm({ error }: Props) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      await fetch("/api/auth/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setStatus("sent");
    } catch {
      setStatus("idle");
    }
  }

  const errorMessage = error ? (ERROR_MESSAGES[error] ?? "An error occurred. Please try again.") : null;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-4 bg-background">
      {/* Wordmark */}
      <div className="text-center">
        <p className="text-4xl font-bold tracking-tight text-primary">PitOS</p>
        <p className="text-sm text-muted-foreground mt-1">Jury rehearsal partner for FRC teams</p>
      </div>

      {/* Card */}
      <Card className="w-full max-w-sm">
        <CardHeader className="pb-4">
          <CardTitle>Sign in</CardTitle>
          <CardDescription>
            Enter your email and we&apos;ll send you a magic link.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {errorMessage && (
            <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md border border-destructive/20">
              {errorMessage}
            </p>
          )}
          {status === "sent" ? (
            <p className="text-sm text-center text-muted-foreground py-2">
              Check your email &mdash; or your server console in dev mode.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={status === "loading"}
              />
              <Button type="submit" disabled={status === "loading"}>
                {status === "loading" ? "Sending…" : "Send magic link"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
