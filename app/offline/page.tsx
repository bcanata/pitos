export default function OfflinePage() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-semibold mb-2">You&apos;re offline</h1>
        <p className="text-muted-foreground">
          Reconnect to continue using PitOS.
        </p>
      </div>
    </main>
  );
}
