"use client";

import * as React from "react";

/**
 * Fix the answer where it is wrong, in place.
 *
 * A thumbs-down says something is wrong. A correction says *what the right
 * answer was*, which is worth roughly an order of magnitude more and is
 * almost never collected, because the obvious implementation destroys the
 * thing it was trying to capture.
 *
 * **Never overwrite the original.** The value in a correction is the *pair* —
 * what the model said and what a human replaced it with. An editor that swaps
 * the text in place has collected half a training example and thrown away the
 * half that identifies the failure. So `text` stays, `correction` is a second
 * field, and the reader can flip between them after saving.
 *
 * **The edit is not the message.** Correcting an answer must not send a new
 * turn — that is a different act with a different meaning, and conflating
 * them means every correction also drags the conversation forward. This
 * component emits a correction and nothing else; what the conversation does
 * next is the caller's decision.
 *
 * **Escape must not lose the work.** A textarea that discards on Escape is a
 * textarea people learn not to use. Escape asks; only an empty draft closes
 * silently.
 *
 * What is deliberately not here: rich text. A correction is a claim about
 * facts, and a formatting toolbar invites edits that are about taste, which
 * is noise in the very dataset this exists to build.
 */

export type InlineCorrectionProps = {
  /** What the model said. Never mutated. */
  text: string;
  /** The accepted correction, once there is one. */
  correction?: string;
  /** Who corrected it, for a shared thread. */
  correctedBy?: string;
  onSubmit?: (corrected: string) => void;
  /** Withdraw a correction. Should delete it server-side, not hide it. */
  onRevert?: () => void;
  className?: string;
};

/* ------------------------------------------------------------------ */
/* Icons                                                               */
/* ------------------------------------------------------------------ */

function PencilIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="12" height="12" {...props}>
      <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5z" />
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
/* InlineCorrection                                                    */
/* ------------------------------------------------------------------ */

export function InlineCorrection({
  text,
  correction,
  correctedBy,
  onSubmit,
  onRevert,
  className = "",
}: InlineCorrectionProps) {
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(correction ?? text);
  const [showOriginal, setShowOriginal] = React.useState(false);
  const areaRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    if (!editing) return;
    const el = areaRef.current;
    if (!el) return;
    el.focus();
    /* Caret at the end rather than selecting everything: a correction is
       usually a small edit to a long paragraph, and select-all means the
       first keystroke deletes the answer they were trying to fix. */
    el.setSelectionRange(el.value.length, el.value.length);
  }, [editing]);

  function open() {
    setDraft(correction ?? text);
    setEditing(true);
  }

  function save() {
    const next = draft.trim();
    if (next === "" || next === (correction ?? text)) {
      setEditing(false);
      return;
    }
    onSubmit?.(next);
    setEditing(false);
  }

  const shown = correction !== undefined && !showOriginal ? correction : text;

  if (editing) {
    return (
      <div className={className}>
        <textarea
          ref={areaRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              save();
            }
            if (e.key === "Escape") {
              e.preventDefault();
              /* Only a draft that has not moved closes silently. Anything
                 else asks — a textarea that discards on Escape is one people
                 learn not to trust with anything long. */
              if (draft === (correction ?? text)) setEditing(false);
              else if (confirm("Discard this correction?")) setEditing(false);
            }
          }}
          rows={Math.min(12, Math.max(3, draft.split("\n").length + 1))}
          className="w-full resize-y rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-[15px] leading-7 text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-zinc-400"
        />
        <div className="mt-2 flex items-center gap-2">
          <button
            type="button"
            onClick={save}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-zinc-900 px-3.5 text-xs font-medium text-white transition-opacity hover:opacity-90 dark:bg-zinc-100 dark:text-zinc-900"
          >
            <CheckIcon />
            Save correction
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="inline-flex h-8 items-center rounded-lg px-3 text-xs font-medium text-zinc-500 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
          >
            Cancel
          </button>
          <span className="ml-auto text-[11px] text-zinc-400 dark:text-zinc-500">
            This does not send a message
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`group ${className}`}>
      <p
        className={`whitespace-pre-wrap text-[15px] leading-7 ${
          correction !== undefined && showOriginal
            ? "text-zinc-400 line-through decoration-zinc-300 dark:text-zinc-500 dark:decoration-zinc-600"
            : "text-zinc-700 dark:text-zinc-200"
        }`}
      >
        {shown}
      </p>

      <div className="mt-1.5 flex flex-wrap items-center gap-2">
        {correction === undefined ? (
          <button
            type="button"
            onClick={open}
            /* Visible on focus as well as hover: a hover-only edit affordance
               is unreachable by keyboard and invisible on touch. */
            className="inline-flex h-7 items-center gap-1.5 rounded-lg px-2 text-[11px] font-medium text-zinc-400 opacity-0 transition-opacity hover:bg-zinc-100 hover:text-zinc-700 focus-visible:opacity-100 group-hover:opacity-100 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
          >
            <PencilIcon />
            Fix this
          </button>
        ) : (
          <>
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-100 px-2 py-1 text-[11px] font-medium text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
              <PencilIcon />
              Corrected{correctedBy ? ` by ${correctedBy}` : ""}
            </span>
            <button
              type="button"
              onClick={() => setShowOriginal((v) => !v)}
              className="inline-flex h-7 items-center rounded-lg px-2 text-[11px] text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
            >
              {showOriginal ? "Show correction" : "Show what the model said"}
            </button>
            <button
              type="button"
              onClick={open}
              className="inline-flex h-7 items-center rounded-lg px-2 text-[11px] text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
            >
              Edit again
            </button>
            {onRevert && (
              <button
                type="button"
                onClick={onRevert}
                className="inline-flex h-7 items-center rounded-lg px-2 text-[11px] text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
              >
                Withdraw
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
