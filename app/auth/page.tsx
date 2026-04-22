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

export default function AuthPage() {
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

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Sign in to PitOS</CardTitle>
          <CardDescription>
            Enter your email and we&apos;ll send you a magic link.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {status === "sent" ? (
            <p className="text-sm text-center text-muted-foreground">
              Check your email — or your server console in dev mode.
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
