"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import * as React from "react";

/**
 * One agent handing work to another.
 *
 * Every multi-agent demo shows the arrow. The arrow is not the problem.
 *
 * **The failure mode of multi-agent systems is context loss**, and it is
 * silent. The receiving agent gets a task description and none of the six
 * things the first agent learned on the way to writing it, then confidently
 * redoes work, or answers a question that was already settled, or asks the
 * user something it was told two turns ago. Nothing errors. The output is
 * merely worse than it should be, in a way that is almost impossible to
 * attribute afterwards.
 *
 * So this component's argument is that **what was NOT carried across is the
 * part worth rendering.** `carried` is reassuring and mostly ignorable;
 * `withheld` is where the next bug comes from, and putting it on screen is
 * how a reader catches it while the run is still cheap to fix.
 *
 * **A handoff is a return trip.** Rendering it as a one-way arrow loses the
 * question of what came back and whether the caller is still waiting. Hence
 * `returned`, with the result, rather than two unrelated cards.
 *
 * A handoff is also a good place to be honest about cost: it is one of the
 * few architectural decisions that silently multiplies token spend, since the
 * receiving agent re-reads whatever context it was given.
 */

export type HandoffState = "handing-off" | "accepted" | "returned" | "failed";

export type AgentHandoffProps = {
  from: string;
  to: string;
  /** Why this agent and not the one already running. One line. */
  reason?: string;
  /** The task as the receiving agent will see it. */
  task: string;
  /** Context carried across. */
  carried?: string[];
  /**
   * Context deliberately or accidentally left behind. The interesting half:
   * this is where the next silent failure comes from.
   */
  withheld?: string[];
  state?: HandoffState;
  /** What came back, once it did. */
  result?: string;
  className?: string;
};

/* ------------------------------------------------------------------ */
/* Icons                                                               */
/* ------------------------------------------------------------------ */

function ArrowIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="14" height="14" {...props}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function ReturnIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="14" height="14" {...props}>
      <path d="M19 12H5M11 6l-6 6 6 6" />
    </svg>
  );
}

const STATE_LABEL: Record<HandoffState, string> = {
  "handing-off": "handing off",
  accepted: "working",
  returned: "returned",
  failed: "failed",
};

/* ------------------------------------------------------------------ */
/* AgentHandoff                                                        */
/* ------------------------------------------------------------------ */

export function AgentHandoff({
  from,
  to,
  reason,
  task,
  carried = [],
  withheld = [],
  state = "accepted",
  result,
  className = "",
}: AgentHandoffProps) {
  const [openWithheld, setOpenWithheld] = React.useState(false);

  return (
    <Card
      className={`gap-0 py-0 rounded-xl border bg-card ${
        state === "failed"
          ? "border-red-200 dark:border-red-900/60"
          : "border-border"
      } ${className}`}
    >
      <div className="flex flex-wrap items-center gap-2 border-b border-border px-3.5 py-2.5">
        <span className="font-mono text-xs text-muted-foreground">{from}</span>
        <span className={`shrink-0 ${state === "returned" ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"}`}>
          {state === "returned" ? <ReturnIcon /> : <ArrowIcon />}
        </span>
        <span className="font-mono text-xs font-medium text-foreground">{to}</span>
        <Badge variant="secondary"
          className={`ml-auto inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${
            state === "returned"
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
              : state === "failed"
                ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400"
                : "bg-muted text-muted-foreground"
          }`}
        >
          {state === "accepted" && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />}
          {STATE_LABEL[state]}
        </Badge>
      </div>

      <div className="px-3.5 py-3">
        {reason && (
          <p className="mb-2 text-xs text-muted-foreground">{reason}</p>
        )}

        <p className="rounded-lg bg-muted px-2.5 py-2 text-sm leading-5 text-foreground">
          {task}
        </p>

        {carried.length > 0 && (
          <div className="mt-2.5">
            <p className="text-xs font-medium text-muted-foreground">
              Carried across
            </p>
            <ul className="mt-1 space-y-0.5">
              {carried.map((item) => (
                <li key={item} className="flex gap-1.5 text-xs leading-5 text-muted-foreground">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-muted" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {withheld.length > 0 && (
          <div className="mt-2.5">
            <Button variant="ghost" size="sm"
              type="button"
              onClick={() => setOpenWithheld((v) => !v)}
              aria-expanded={openWithheld}
              className="inline-flex items-center gap-1.5 rounded-md text-xs font-medium text-amber-600 transition-colors hover:text-amber-700 dark:text-amber-500 dark:hover:text-amber-400"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="10" height="10" className={openWithheld ? "rotate-180" : ""}>
                <path d="m6 9 6 6 6-6" />
              </svg>
              Not carried across ({withheld.length})
            </Button>
            {openWithheld && (
              <ul className="mt-1 space-y-0.5">
                {withheld.map((item) => (
                  <li key={item} className="flex gap-1.5 text-xs leading-5 text-muted-foreground">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-amber-400" />
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {result && (
          <div className="mt-3 border-t border-border pt-2.5">
            <p className="text-xs font-medium text-muted-foreground">
              Returned to {from}
            </p>
            <p className="mt-1 text-sm leading-5 text-foreground">{result}</p>
          </div>
        )}
      </div>
    </Card>
  );
}
