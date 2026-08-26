"use client";

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
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="12" height="12" {...props}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function TextIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14" {...props}>
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
      <div className="h-3 w-1/3 rounded-full bg-zinc-200 dark:bg-zinc-800" />
      <div className="h-8 w-2/3 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
      <div className="h-3 w-1/2 rounded-full bg-zinc-200 dark:bg-zinc-800" />
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
    <div
      className={`overflow-hidden rounded-xl border bg-white transition-colors dark:bg-zinc-900 ${
        state === "unsupported"
          ? "border-amber-200 dark:border-amber-900/60"
          : "border-zinc-200 dark:border-zinc-800"
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
            <div className="min-w-0 text-sm leading-6 text-zinc-700 dark:text-zinc-300">
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
      <div className="flex items-center gap-2 border-t border-zinc-100 bg-zinc-50/60 px-3.5 py-2 dark:border-zinc-800 dark:bg-zinc-800/30">
        <span className="shrink-0 text-zinc-400 dark:text-zinc-500">
          <SparkIcon />
        </span>
        <span className="min-w-0 truncate font-mono text-[11px] text-zinc-500 dark:text-zinc-400">
          {tool}
        </span>
        {state === "streaming" && (
          <span className="shrink-0 text-[11px] text-zinc-400 dark:text-zinc-500">generating…</span>
        )}
        {state === "unsupported" && (
          <span className="shrink-0 text-[11px] text-amber-600 dark:text-amber-500">
            no renderer
          </span>
        )}
        {hasData && (
          <button
            type="button"
            onClick={() => setDataOpen((v) => !v)}
            aria-expanded={dataOpen}
            /* min-h-6 keeps the tap target at the 24px minimum; at this text
               size the padding alone lands around 20px. */
            className="ml-auto inline-flex min-h-6 shrink-0 items-center gap-1 rounded-md px-1.5 text-[11px] text-zinc-500 transition-colors hover:bg-zinc-200/60 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-700/60 dark:hover:text-zinc-200"
          >
            Data
            <ChevronIcon className={dataOpen ? "rotate-180" : ""} />
          </button>
        )}
      </div>

      {hasData && dataOpen && (
        <pre className="max-h-56 overflow-auto border-t border-zinc-100 bg-zinc-50 p-3 font-mono text-xs leading-5 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-800/60 dark:text-zinc-300">
          {data}
        </pre>
      )}
    </div>
  );
}
