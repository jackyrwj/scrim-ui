"use client";

import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
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
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="12" height="12" {...props}>
      <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5z" />
    </svg>
  );
}

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="12" height="12" {...props}>
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
        <Textarea
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
          className="border-0 rounded-none shadow-none focus-visible:ring-0 field-sizing-fixed dark:bg-transparent w-full resize-y rounded-xl border border-border bg-card px-3 py-2.5 text-base sm:text-sm leading-7 text-foreground outline-none focus:border-border"
        />
        <div className="mt-2 flex items-center gap-2">
          <Button variant="default" size="sm"
            type="button"
            onClick={save}
            className="inline-flex h-8 items-center gap-1.5 rounded-md bg-primary px-3.5 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            <CheckIcon />
            Save correction
          </Button>
          <Button variant="ghost" size="sm"
            type="button"
            onClick={() => setEditing(false)}
            className="inline-flex h-8 items-center rounded-md px-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted"
          >
            Cancel
          </Button>
          <span className="ml-auto text-xs text-muted-foreground">
            This does not send a message
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`group ${className}`}>
      <p
        className={`whitespace-pre-wrap text-sm leading-7 ${
          correction !== undefined && showOriginal
            ? "text-muted-foreground line-through decoration-border"
            : "text-foreground"
        }`}
      >
        {shown}
      </p>

      <div className="mt-1.5 flex flex-wrap items-center gap-2">
        {correction === undefined ? (
          <Button variant="ghost" size="sm"
            type="button"
            onClick={open}
            /* Visible on focus as well as hover: a hover-only edit affordance
               is unreachable by keyboard and invisible on touch. */
            className="inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-xs font-medium text-muted-foreground opacity-100 transition-opacity hover:bg-muted hover:text-foreground focus-visible:opacity-100 group-hover:opacity-100"
          >
            <PencilIcon />
            Fix this
          </Button>
        ) : (
          <>
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-100 px-2 py-1 text-xs font-medium text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
              <PencilIcon />
              Corrected{correctedBy ? ` by ${correctedBy}` : ""}
            </span>
            <Button variant="ghost" size="sm"
              type="button"
              onClick={() => setShowOriginal((v) => !v)}
              className="inline-flex h-8 items-center rounded-md px-2 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {showOriginal ? "Show correction" : "Show what the model said"}
            </Button>
            <Button variant="ghost" size="sm"
              type="button"
              onClick={open}
              className="inline-flex h-8 items-center rounded-md px-2 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              Edit again
            </Button>
            {onRevert && (
              <Button variant="ghost" size="sm"
                type="button"
                onClick={onRevert}
                className="inline-flex h-8 items-center rounded-md px-2 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                Withdraw
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
