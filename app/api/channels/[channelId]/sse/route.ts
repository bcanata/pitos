import { subscribe } from "@/lib/sse";

export const runtime = "nodejs"; // SSE needs Node.js runtime

export async function GET(_req: Request, { params }: { params: Promise<{ channelId: string }> }) {
  const { channelId } = await params;

  const stream = new ReadableStream({
    start(controller) {
      const enc = new TextEncoder();
      // Send initial heartbeat
      controller.enqueue(enc.encode(": heartbeat\n\n"));

      const unsub = subscribe(channelId, (event) => {
        try { controller.enqueue(enc.encode(event)); } catch {}
      });

      // Heartbeat every 25s to keep connection alive
      const hb = setInterval(() => {
        try { controller.enqueue(enc.encode(": heartbeat\n\n")); } catch { clearInterval(hb); }
      }, 25000);

      // Clean up on disconnect
      _req.signal.addEventListener("abort", () => {
        unsub();
        clearInterval(hb);
        try { controller.close(); } catch {}
      });
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}
