import { cancelRun, getRun } from "@/lib/run-store";

/**
 * Stop, and mean it.
 *
 * `cancelRun` aborts the AbortController the current step was started with,
 * so the provider request is actually torn down. The version of this that
 * only flips a status and hides the output leaves the model generating —
 * billed in full, and with any tool it was midway through still running.
 */
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!getRun(id)) return Response.json({ error: "No such run." }, { status: 404 });
  return Response.json({ cancelled: cancelRun(id) });
}
