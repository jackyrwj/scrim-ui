import { getRun } from "@/lib/run-store";

/**
 * A run's whole log, in one request.
 *
 * The SSE endpoint can do this too — connect with `Last-Event-ID: 0` and the
 * backlog replays — so this exists for the cases where a stream is the wrong
 * shape: a server-rendered first paint, a test, or a client that just wants
 * to know whether the run is still going before opening a connection.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const run = getRun(id);
  if (!run) return Response.json({ error: "No such run." }, { status: 404 });

  return Response.json({
    id: run.id,
    status: run.status,
    /* Numbered here, not stored numbered: `seq` is the array index + 1, and
       deriving it means the two can never disagree. */
    events: run.events.map((event, i) => ({ seq: i + 1, event })),
  });
}
