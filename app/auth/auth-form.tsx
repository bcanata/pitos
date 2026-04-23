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
import { I18nProvider, useT } from "@/lib/i18n/client";
import type { Bundle } from "@/lib/i18n/index";

type Status = "idle" | "loading" | "sent";

interface Props {
  error?: string;
  bundle: Bundle;
}

function AuthFormInner({ error }: { error?: string }) {
  const t = useT();
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

  const ERROR_MESSAGES: Record<string, string> = {
    invalid: t("auth.error.invalid"),
    session: t("auth.error.session"),
  };

  const errorMessage = error
    ? (ERROR_MESSAGES[error] ?? t("auth.error.generic"))
    : null;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-4 bg-background">
      {/* Wordmark */}
      <div className="text-center">
        <p className="text-4xl font-bold tracking-tight text-primary">PitOS</p>
        <p className="text-sm text-muted-foreground mt-1">{t("auth.tagline")}</p>
      </div>

      {/* Card */}
      <Card className="w-full max-w-sm">
        <CardHeader className="pb-4">
          <CardTitle>{t("auth.signIn")}</CardTitle>
          <CardDescription>{t("auth.cardDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {errorMessage && (
            <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md border border-destructive/20">
              {errorMessage}
            </p>
          )}
          {status === "sent" ? (
            <p className="text-sm text-center text-muted-foreground py-2">
              {t("auth.checkEmail")}
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <Input
                type="email"
                placeholder={t("auth.emailPlaceholder")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={status === "loading"}
              />
              <Button type="submit" disabled={status === "loading"}>
                {status === "loading" ? t("auth.sending") : t("auth.sendMagicLink")}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </main>
  );
}

export default function AuthForm({ error, bundle }: Props) {
  return (
    <I18nProvider bundle={bundle}>
      <AuthFormInner error={error} />
    </I18nProvider>
  );
}
