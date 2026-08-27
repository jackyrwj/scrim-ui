import { getRun, subscribe } from "@/lib/run-store";

/**
 * The run, as it happens — and as it happened.
 *
 * Server-sent events rather than a WebSocket: the traffic is one-way, SSE
 * reconnects on its own, and `EventSource` replays through the same code path
 * on the way back. Decisions travel the other way as ordinary POSTs, which
 * also means they work when the stream is down.
 *
 * **Resume is the point.** Every frame carries `id: <seq>`, so the browser
 * sends `Last-Event-ID` when it reconnects and picks up exactly where it
 * stopped. A client that was closed for the entire run gets the whole log on
 * connect and renders the same UI as one that watched it live — the reducer
 * in lib/events.ts cannot tell the difference, which is what makes "close the
 * laptop while the agent waits for approval" a supported case rather than a
 * bug report.
 *
 * `?from=N` does the same thing for a client that tracks its own position,
 * which `EventSource` does not expose.
 */

/* Node, not Edge: the run store is module-scope state the routes share, and
   on Edge each request may get a fresh isolate. */
export const runtime = "nodejs";
/* Never cached, never buffered by an upstream proxy. */
export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const run = getRun(id);
  if (!run) return Response.json({ error: "No such run." }, { status: 404 });

  const url = new URL(req.url);
  const lastEventId = req.headers.get("last-event-id");
  const fromParam = url.searchParams.get("from") ?? lastEventId ?? "0";
  const from = Number.isFinite(Number(fromParam)) ? Math.max(0, Number(fromParam)) : 0;

  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      let open = true;

      const send = (seq: number, data: unknown) => {
        if (!open) return;
        try {
          controller.enqueue(encoder.encode(`id: ${seq}\ndata: ${JSON.stringify(data)}\n\n`));
        } catch {
          open = false;
        }
      };

      const unsubscribe = subscribe(id, from, ({ seq, event }) => send(seq, event));

      /* A comment frame every 25 seconds. Proxies and platform gateways close
         a connection that has said nothing for 30-60s, and an agent paused on
         an approval says nothing for as long as the person takes to decide —
         which is the exact case this endpoint exists to survive. */
      const keepAlive = setInterval(() => {
        if (!open) return;
        try {
          controller.enqueue(encoder.encode(": keep-alive\n\n"));
        } catch {
          open = false;
        }
      }, 25_000);

      const close = () => {
        if (!open) return;
        open = false;
        clearInterval(keepAlive);
        unsubscribe();
        try {
          controller.close();
        } catch {
          /* already closed by the client going away */
        }
      };

      req.signal.addEventListener("abort", close);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      /* Nginx buffers proxied responses by default, which turns a live stream
         into one large delivery at the end. */
      "X-Accel-Buffering": "no",
    },
  });
}
