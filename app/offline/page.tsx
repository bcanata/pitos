'use client';

export default function OfflinePage() {
  return (
    <main className="flex min-h-dvh items-center justify-center">
      <div className="text-center px-6">
        <h1 className="text-2xl font-semibold mb-2">You&apos;re offline</h1>
        <p className="text-muted-foreground mb-6">
          Reconnect to continue using PitOS.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Retry
        </button>
      </div>
    </main>
  );
}
