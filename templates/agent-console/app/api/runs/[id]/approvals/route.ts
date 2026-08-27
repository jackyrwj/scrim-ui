import { getRun } from "@/lib/run-store";
import { respondToApproval } from "@/lib/runner";

/**
 * A person says yes or no.
 *
 * A plain POST, not a message on the stream, and that is the design: the
 * decision has to arrive even when the stream is dead. Someone whose
 * connection dropped while the agent was waiting can still approve — the page
 * re-reads the log afterwards and catches up.
 *
 * Answering an approval that is already answered is a **200, not a 409**.
 * Two tabs, a double-click, a back button, and a retried request all produce
 * exactly that, and none of them is a user doing something wrong. The
 * response says whether this call was the one that recorded the decision, so
 * a UI can tell "you approved it" from "it was already approved" without
 * either being an error.
 */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const run = getRun(id);
  if (!run) return Response.json({ error: "No such run." }, { status: 404 });

  const body: unknown = await req.json();
  const { approvalId, approved, reason } = (body ?? {}) as {
    approvalId?: unknown;
    approved?: unknown;
    reason?: unknown;
  };

  if (typeof approvalId !== "string" || typeof approved !== "boolean") {
    return Response.json({ error: "Expected { approvalId: string, approved: boolean }." }, { status: 400 });
  }

  const recorded = respondToApproval(
    id,
    approvalId,
    approved,
    typeof reason === "string" ? reason.slice(0, 500) : undefined,
  );

  return Response.json({ recorded });
}
