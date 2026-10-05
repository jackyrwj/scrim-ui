"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import * as React from "react";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

/**
 * `unsupported` is not an error state. A generative UI stream carries the
 * name of a widget the server decided to render, and a client is always one
 * deploy behind some of those names — a tool added this week, a lazy chunk
 * that failed, an older mobile build. The model still returned usable
 * content; the only thing missing is the renderer. Treating that as a failure
 * throws away an answer the user could have read.
 */
export type GenerativeState = "streaming" | "ready" | "unsupported";

export type GenerativeUiProps = {
  /** Tool the widget was rendered from. Shown as attribution. */
  tool: string;
  state?: GenerativeState;
  /** The widget. Rendered only once the tool result is complete. */
  children?: React.ReactNode;
  /**
   * Placeholder for `streaming`. Pass the widget's own shape rather than a
   * spinner — the layout is known before the data is, so there is no reason
   * to make the reader watch the card resize when it arrives.
   */
  skeleton?: React.ReactNode;
  /** Readable stand-in for `unsupported`. Prose, not an error code. */
  fallback?: React.ReactNode;
  /** Raw tool result behind the Data toggle. Omit to hide the toggle. */
  data?: string;
  defaultDataOpen?: boolean;
  className?: string;
};

/* ------------------------------------------------------------------ */
/* Icons                                                               */
/* ------------------------------------------------------------------ */

function SparkIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12" {...props}>
      <path d="M12 2.5 13.7 8 19 9.7 13.7 11.4 12 16.9 10.3 11.4 5 9.7 10.3 8ZM18.5 15l.8 2.4 2.4.8-2.4.8-.8 2.4-.8-2.4-2.4-.8 2.4-.8Z" />
    </svg>
  );
}

function ChevronIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="12" height="12" {...props}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function TextIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="14" height="14" {...props}>
      <path d="M4 6h16M4 12h16M4 18h10" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Default skeleton                                                    */
/* ------------------------------------------------------------------ */

/**
 * Only a fallback for the `skeleton` prop. Generic bars are the thing this
 * component exists to avoid, so a real integration should pass the widget's
 * own outline instead.
 */
function DefaultSkeleton() {
  return (
    <div className="animate-pulse space-y-2.5">
      <div className="h-3 w-1/3 rounded-full bg-muted" />
      <div className="h-8 w-2/3 rounded-lg bg-muted" />
      <div className="h-3 w-1/2 rounded-full bg-muted" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* GenerativeUi                                                        */
/* ------------------------------------------------------------------ */

export function GenerativeUi({
  tool,
  state = "ready",
  children,
  skeleton,
  fallback,
  data,
  defaultDataOpen = false,
  className = "",
}: GenerativeUiProps) {
  const [dataOpen, setDataOpen] = React.useState(defaultDataOpen);
  const hasData = (data?.length ?? 0) > 0;

  return (
    <Card
      className={`gap-0 py-0 overflow-hidden rounded-xl border bg-card transition-colors ${
        state === "unsupported"
          ? "border-amber-200 dark:border-amber-900/60"
          : "border-border"
      } ${className}`}
    >
      {/* The widget leads. A tool call is a process the reader is waiting on,
          so that component puts its status bar on top; this one is a result
          they are reading, and pushing it below a status bar would make the
          chrome look like the content. */}
      <div className="px-3.5 py-3">
        {state === "streaming" && (
          /* aria-busy rather than a live region: the skeleton is decorative,
             and announcing every bar as it settles is noise. The completed
             widget is what should be read out, and it announces itself. */
          <div aria-busy="true">{skeleton ?? <DefaultSkeleton />}</div>
        )}

        {state === "ready" && children}

        {state === "unsupported" && (
          <div className="flex gap-2.5">
            <span className="mt-px shrink-0 text-amber-600 dark:text-amber-500">
              <TextIcon />
            </span>
            <div className="min-w-0 text-sm leading-6 text-foreground">
              {fallback ?? `This app cannot display the ${tool} result yet.`}
            </div>
          </div>
        )}
      </div>

      {/* Attribution.

          Generative UI puts model output in the same visual language as the
          app's own interface, which is exactly what makes it worth building
          and exactly what makes it worth labelling. The footer is the answer
          to "did a person build this card or did a model fill it in?" */}
      <div className="flex items-center gap-2 border-t border-border bg-muted/60 px-3.5 py-2">
        <span className="shrink-0 text-muted-foreground">
          <SparkIcon />
        </span>
        <span className="min-w-0 truncate font-mono text-xs text-muted-foreground">
          {tool}
        </span>
        {state === "streaming" && (
          <span className="shrink-0 text-xs text-muted-foreground">generating…</span>
        )}
        {state === "unsupported" && (
          <span className="shrink-0 text-xs text-amber-600 dark:text-amber-500">
            no renderer
          </span>
        )}
        {hasData && (
          <Button variant="ghost" size="sm"
            type="button"
            onClick={() => setDataOpen((v) => !v)}
            aria-expanded={dataOpen}
            /* min-h-6 keeps the tap target at the 24px minimum; at this text
               size the padding alone lands around 20px. */
            className="ml-auto inline-flex min-h-8 shrink-0 items-center gap-1 rounded-md px-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
          >
            Data
            <ChevronIcon className={dataOpen ? "rotate-180" : ""} />
          </Button>
        )}
      </div>

      {hasData && dataOpen && (
        <pre className="max-h-56 overflow-auto border-t border-border bg-muted p-3 font-mono text-xs leading-5 text-foreground">
          {data}
        </pre>
      )}
    </Card>
  );
}
