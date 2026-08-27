import { getRun, rewindTo, setStatus } from "@/lib/run-store";
import { advance, isActive } from "@/lib/runner";

/**
 * Try that again.
 *
 * Two things wear the same button in most agent UIs and should not:
 *
 *  - **Retry** (no body). The run failed — a rate limit, a provider blip, a
 *    tool that threw. The conversation is intact; take another step from
 *    where it stopped.
 *  - **Re-run step N** (`{ step: N }`). The step *worked* and was wrong. The
 *    conversation has to be truncated to where that step began, or the model
 *    reads its own bad answer and repeats it. See `rewindTo` in
 *    lib/run-store.ts for why that truncates messages but appends to the
 *    event log rather than rewriting it.
 *
 * A run that is still going is refused rather than rewound: aborting the live
 * step first would work, but "your click did two things" is a worse default
 * than "stop it first".
 */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const run = getRun(id);
  if (!run) return Response.json({ error: "No such run." }, { status: 404 });

  if (isActive(id)) {
    return Response.json({ error: "The run is still going. Stop it first." }, { status: 409 });
  }

  const body: unknown = await req.json().catch(() => ({}));
  const { step } = (body ?? {}) as { step?: unknown };

  if (typeof step === "number") {
    if (!Number.isInteger(step) || step < 0) {
      return Response.json({ error: "step must be a non-negative integer." }, { status: 400 });
    }
    if (!rewindTo(id, step)) {
      return Response.json({ error: `Step ${step} is not a boundary in this run.` }, { status: 400 });
    }
  } else {
    /* Plain retry. Clear the failure so the timeline stops showing it, and
       leave the conversation exactly as it is. */
    setStatus(id, "running");
  }

  void advance(id);
  return Response.json({ ok: true });
}
