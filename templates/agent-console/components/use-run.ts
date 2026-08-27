"use client";

import * as React from "react";
import { EMPTY_RUN, reduceRun, type RunEvent, type RunView } from "@/lib/events";

/**
 * One run, watched.
 *
 * All of the state is derived by folding the server's event log with the
 * reducer in lib/events.ts. Nothing about a step is computed here, which is
 * the property worth protecting: a reload replays the same events through the
 * same reducer and lands on the same screen, so "resumable" is not a feature
 * with its own code path — it is what happens when the client keeps no
 * authority of its own.
 *
 * `EventSource` rather than `fetch` + a reader, because it reconnects by
 * itself and sends `Last-Event-ID` when it does. That header is the entire
 * resume protocol; see app/api/runs/[id]/events/route.ts.
 */

export type RunActions = {
  approve: (approvalId: string, approved: boolean, reason?: string) => Promise<void>;
  cancel: () => Promise<void>;
  retry: () => Promise<void>;
  rerunStep: (step: number) => Promise<void>;
};

export type UseRun = RunView & {
  /** False until the first frame arrives — the log may be long. */
  connected: boolean;
  actions: RunActions;
};

export function useRun(runId: string | null): UseRun {
  /* Run id, projection and connection state in ONE state object, because
     they change together: a new id means the old projection is meaningless.
     Split into three useStates, the reset below would be three render-phase
     updates that can be observed halfway. */
  const [state, setState] = React.useState<{ runId: string | null; run: RunView; connected: boolean }>({
    runId,
    run: EMPTY_RUN,
    connected: false,
  });

  /* Reset during render, not in an effect. Adjusting state when a prop
     changes is React's own recommendation for exactly this case — the effect
     version paints one frame of the previous run's steps under the new run's
     id, and trips react-hooks/set-state-in-effect on the way. */
  if (state.runId !== runId) {
    setState({ runId, run: EMPTY_RUN, connected: false });
  }

  React.useEffect(() => {
    if (!runId) return;

    const source = new EventSource(`/api/runs/${runId}/events`);

    source.onopen = () => {
      setState((current) => (current.runId === runId ? { ...current, connected: true } : current));
    };

    source.onmessage = (message) => {
      try {
        const event: RunEvent = JSON.parse(message.data);
        setState((current) =>
          /* The id guard matters: a stale connection's last frame can land
             after the user has switched runs, and folding it in would show
             one run's step inside another's timeline. */
          current.runId === runId
            ? { ...current, connected: true, run: reduceRun(current.run, event) }
            : current,
        );
      } catch {
        /* A frame we cannot parse is a frame from a newer server than this
           bundle. Skipping it degrades the view; throwing would blank it. */
      }
    };

    source.onerror = () => {
      /* EventSource retries on its own, with Last-Event-ID. Marking the UI
         disconnected is all there is to do — closing the connection here
         would turn a five-second network blip into a dead page. */
      setState((current) => (current.runId === runId ? { ...current, connected: false } : current));
    };

    return () => source.close();
  }, [runId]);

  const actions = React.useMemo<RunActions>(() => {
    const post = async (path: string, body?: unknown) => {
      if (!runId) return;
      await fetch(`/api/runs/${runId}/${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body ?? {}),
      });
      /* No state update here on purpose. Every one of these actions produces
         events, and those events are how the UI learns what happened — in
         this tab and in any other one that has the run open. Optimistically
         flipping a button here is how two tabs end up disagreeing about
         whether something was approved. */
    };

    return {
      approve: (approvalId, approved, reason) => post("approvals", { approvalId, approved, reason }),
      cancel: () => post("cancel"),
      retry: () => post("retry"),
      rerunStep: (step) => post("retry", { step }),
    };
  }, [runId]);

  return { ...state.run, connected: state.connected, actions };
}

/** The run ids this browser has started, newest first. */
export function useRunList(): { runs: { id: string; goal: string }[]; refresh: () => void } {
  const [runs, setRuns] = React.useState<{ id: string; goal: string }[]>([]);

  const refresh = React.useCallback(() => {
    fetch("/api/runs")
      .then((r) => r.json())
      .then((data: { runs?: { id: string; goal: string }[] }) => setRuns(data.runs ?? []))
      .catch(() => {
        /* The list is a convenience; a failed fetch should not blank it. */
      });
  }, []);

  React.useEffect(refresh, [refresh]);

  return { runs, refresh };
}
