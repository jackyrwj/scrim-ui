import { DEFAULT_MODEL, isKnownModel } from "@/lib/models";
import { createRun, listRuns } from "@/lib/run-store";
import { advance } from "@/lib/runner";

/**
 * Start a run, or list the ones already started.
 *
 * The POST returns as soon as the run *exists*, not when it finishes. The
 * client already has the id, subscribes to `/events`, and watches the steps
 * arrive. A route that waited for the agent would hit a platform timeout on
 * any run worth watching — and would take the run down with it.
 */

export async function GET() {
  return Response.json({ runs: listRuns() });
}

export async function POST(req: Request) {
  const body: unknown = await req.json();
  const { goal, model } = (body ?? {}) as { goal?: unknown; model?: unknown };

  if (typeof goal !== "string" || goal.trim().length === 0) {
    return Response.json({ error: "A goal is required." }, { status: 400 });
  }

  /* The model id arrives from a client you do not control. Unchecked, it
     points your gateway key at whatever the caller names. */
  const run = createRun({
    goal: goal.trim().slice(0, 2000),
    model: isKnownModel(model) ? model : DEFAULT_MODEL,
  });

  void advance(run.id);

  return Response.json({ id: run.id }, { status: 201 });
}
