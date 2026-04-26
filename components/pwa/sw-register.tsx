'use client';

import { useEffect, useRef } from 'react';

export default function SwRegister() {
  const bannerRef = useRef<HTMLDivElement>(null);
  const pendingWorkerRef = useRef<ServiceWorker | null>(null);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return;
    if (!('serviceWorker' in navigator)) return;

    navigator.serviceWorker.register('/sw.js', { scope: '/' }).then((reg) => {
      reg.addEventListener('updatefound', () => {
        const next = reg.installing;
        if (!next) return;
        next.addEventListener('statechange', () => {
          if (next.state === 'installed' && navigator.serviceWorker.controller) {
            pendingWorkerRef.current = next;
            if (bannerRef.current) bannerRef.current.style.display = 'flex';
          }
        });
      });
    });

    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload();
    });
  }, []);

  function applyUpdate() {
    pendingWorkerRef.current?.postMessage({ type: 'SKIP_WAITING' });
  }

  return (
    <div
      ref={bannerRef}
      style={{ display: 'none' }}
      className="fixed top-0 inset-x-0 z-50 flex items-center justify-between gap-3 bg-primary text-primary-foreground px-4 py-3 text-sm"
    >
      <span>Update available</span>
      <button onClick={applyUpdate} className="font-semibold underline underline-offset-2">
        Reload
      </button>
    </div>
  );
}
