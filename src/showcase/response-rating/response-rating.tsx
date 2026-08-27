"use client";

import * as React from "react";

/**
 * Thumbs up, thumbs down, and the one follow-up question worth asking.
 *
 * The naive version is a toggle: click the thumb, it fills in, nothing else
 * happens. Three things go wrong with that, and all three are about what a
 * rating *is*.
 *
 * **A rating is a submission, not a toggle.** It leaves the browser. Undo has
 * to actually delete it on the server, or the affordance is a lie — so
 * `rating` is what the server has, and clicking the active thumb clears it
 * rather than doing nothing.
 *
 * **A thumbs-down with no reason is unactionable**, and a modal asking for
 * one is worse than no reason at all: it blocks the conversation to collect
 * data for someone who is not in the room. So the vote is recorded
 * immediately and the reasons open *inline* underneath, optional, dismissible.
 * Whoever answers has helped; whoever ignores it has still voted.
 *
 * **The reasons are the whole value.** "Wrong" and "unhelpful" are the same
 * label with different tempers. Offer categories a reader can pick without
 * thinking and one free-text box for the case the categories missed — and
 * keep the list short enough to read in one glance, because a fourteen-item
 * taxonomy is a form, and nobody fills in a form to be helpful.
 */

export type Rating = "up" | "down";

export type ResponseRatingProps = {
  /** What the server has recorded. Undefined means unrated. */
  rating?: Rating;
  /**
   * Reason chips offered after a thumbs-down. Keep it to four or five —
   * this is a glance, not a taxonomy.
   */
  reasons?: string[];
  /** True once the detail has been sent. The panel collapses to a receipt. */
  submitted?: boolean;
  /** Clicking the active thumb passes `undefined` — that is a delete. */
  onRate?: (rating: Rating | undefined) => void;
  onSubmitDetail?: (reasons: string[], comment: string) => void;
  /** Hide the labels and keep only the icons, for a row of message actions. */
  compact?: boolean;
  className?: string;
};

/* ------------------------------------------------------------------ */
/* Icons                                                               */
/* ------------------------------------------------------------------ */

function ThumbUpIcon({ filled, ...props }: { filled?: boolean } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14" {...props}>
      <path d="M7 10v11H4a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1z" />
      <path d="M7 10l4.2-7.4a1.6 1.6 0 0 1 3 .8V9h4.6a2 2 0 0 1 2 2.4l-1.4 7A2 2 0 0 1 17.4 20H7z" />
    </svg>
  );
}

function ThumbDownIcon({ filled, ...props }: { filled?: boolean } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14" {...props}>
      <path d="M17 14V3h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1z" />
      <path d="M17 14l-4.2 7.4a1.6 1.6 0 0 1-3-.8V15H5.2a2 2 0 0 1-2-2.4l1.4-7A2 2 0 0 1 6.6 4H17z" />
    </svg>
  );
}

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="12" height="12" {...props}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* ResponseRating                                                      */
/* ------------------------------------------------------------------ */

export function ResponseRating({
  rating,
  reasons = ["Incorrect", "Missed the question", "Too long", "Unsafe"],
  submitted = false,
  onRate,
  onSubmitDetail,
  compact = false,
  className = "",
}: ResponseRatingProps) {
  const [picked, setPicked] = React.useState<string[]>([]);
  const [comment, setComment] = React.useState("");
  const [dismissed, setDismissed] = React.useState(false);

  /* The panel follows the rating rather than a second piece of state: it is
     open when there is a down-vote, no detail has been sent, and the reader
     has not waved it away. Storing "open" separately is how it ends up open
     under a thumbs-up. */
  const detailOpen = rating === "down" && !submitted && !dismissed;

  function rate(next: Rating) {
    const cleared = rating === next;
    if (!cleared) setDismissed(false);
    onRate?.(cleared ? undefined : next);
  }

  return (
    <div className={className}>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => rate("up")}
          aria-pressed={rating === "up"}
          aria-label="Good response"
          className={`inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium transition-colors ${
            rating === "up"
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
              : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
          }`}
        >
          <ThumbUpIcon filled={rating === "up"} />
          {!compact && "Good"}
        </button>
        <button
          type="button"
          onClick={() => rate("down")}
          aria-pressed={rating === "down"}
          aria-label="Bad response"
          className={`inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium transition-colors ${
            rating === "down"
              ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400"
              : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
          }`}
        >
          <ThumbDownIcon filled={rating === "down"} />
          {!compact && "Bad"}
        </button>

        {/* The vote is already in. Saying so is what makes the reason panel
            optional rather than a toll gate. */}
        {rating !== undefined && !detailOpen && (
          <span className="ml-1.5 inline-flex items-center gap-1 text-[11px] text-zinc-400 dark:text-zinc-500">
            <CheckIcon width="10" height="10" />
            {submitted ? "Thanks — sent" : "Recorded"}
          </span>
        )}
      </div>

      {detailOpen && (
        <div className="mt-2 rounded-xl border border-zinc-200 bg-zinc-50/60 p-3 dark:border-zinc-800 dark:bg-zinc-800/30">
          <div className="flex items-start justify-between gap-3">
            <p className="text-xs font-medium text-zinc-700 dark:text-zinc-200">
              Already recorded. What went wrong?
            </p>
            <button
              type="button"
              onClick={() => setDismissed(true)}
              className="-mr-1 -mt-0.5 shrink-0 rounded-md px-1.5 py-0.5 text-[11px] text-zinc-400 transition-colors hover:bg-zinc-200/60 hover:text-zinc-600 dark:hover:bg-zinc-700/60 dark:hover:text-zinc-300"
            >
              Skip
            </button>
          </div>

          <div className="mt-2 flex flex-wrap gap-1.5">
            {reasons.map((reason) => {
              const on = picked.includes(reason);
              return (
                <button
                  key={reason}
                  type="button"
                  aria-pressed={on}
                  onClick={() =>
                    setPicked((prev) => (on ? prev.filter((r) => r !== reason) : [...prev, reason]))
                  }
                  className={`inline-flex h-7 items-center rounded-lg border px-2.5 text-[11px] font-medium transition-colors ${
                    on
                      ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                      : "border-zinc-200 text-zinc-600 hover:bg-white dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  }`}
                >
                  {reason}
                </button>
              );
            })}
          </div>

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={2}
            placeholder="Anything the chips missed (optional)"
            className="mt-2 w-full resize-none rounded-lg border border-zinc-200 bg-white px-2.5 py-2 text-[13px] text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-zinc-500"
          />

          <button
            type="button"
            onClick={() => onSubmitDetail?.(picked, comment)}
            /* Enabled with nothing selected on purpose. The reader may have
               nothing to add beyond the vote, and a disabled button reads as
               "your feedback is not good enough yet". */
            className="mt-2 inline-flex h-8 items-center rounded-lg bg-zinc-900 px-3.5 text-xs font-medium text-white transition-opacity hover:opacity-90 dark:bg-zinc-100 dark:text-zinc-900"
          >
            Send detail
          </button>
        </div>
      )}
    </div>
  );
}
