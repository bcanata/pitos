'use client';

import { useEffect, useState } from 'react';
import { isStandalone } from '@/lib/pwa/standalone';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISSED_KEY = 'pwa-install-dismissed';
const COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;

function wasDismissedRecently(): boolean {
  try {
    const ts = localStorage.getItem(DISMISSED_KEY);
    return !!ts && Date.now() - Number(ts) < COOLDOWN_MS;
  } catch {
    return false;
  }
}

function dismiss() {
  try {
    localStorage.setItem(DISMISSED_KEY, String(Date.now()));
  } catch {}
}

export default function InstallPrompt() {
  const [mode, setMode] = useState<'android' | 'ios' | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (isStandalone() || wasDismissedRecently()) return;

    const ua = navigator.userAgent;
    if (/FBAN|FBAV|Instagram|Twitter|Line|WhatsApp/.test(ua)) return;

    const isIOS =
      /iPad|iPhone|iPod/.test(ua) && !('MSStream' in window);

    if (isIOS) {
      const timer = setTimeout(() => setMode('ios'), 2500);
      return () => clearTimeout(timer);
    }

    function onBeforeInstall(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setMode('android');
    }
    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstall);
  }, []);

  function close() {
    dismiss();
    setMode(null);
  }

  async function install() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    close();
  }

  if (!mode) return null;

  if (mode === 'ios') {
    return (
      <div className="fixed bottom-0 inset-x-0 z-50 p-4" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
        <div className="bg-card border border-border rounded-xl p-4 shadow-lg">
          <div className="flex items-start justify-between gap-2 mb-2">
            <p className="text-sm font-medium">Install PitOS</p>
            <button onClick={close} className="text-xs text-muted-foreground shrink-0">
              Dismiss
            </button>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Tap{' '}
            <svg
              className="inline h-4 w-4 align-text-bottom"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden
            >
              <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
              <polyline points="16 6 12 2 8 6" />
              <line x1="12" y1="2" x2="12" y2="15" />
            </svg>{' '}
            <span className="font-medium text-foreground">Share</span>, then{' '}
            <span className="font-medium text-foreground">Add to Home Screen</span>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed bottom-0 inset-x-0 z-50 flex items-center justify-between gap-3 bg-primary text-primary-foreground px-4"
      style={{ paddingTop: '0.75rem', paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
    >
      <span className="text-sm font-medium">Install PitOS for quick access</span>
      <div className="flex items-center gap-3 shrink-0">
        <button onClick={close} className="text-xs text-primary-foreground/70">
          Not now
        </button>
        <button
          onClick={install}
          className="text-xs font-semibold bg-white text-primary rounded-md px-3 py-1.5"
        >
          Install
        </button>
      </div>
    </div>
  );
}
