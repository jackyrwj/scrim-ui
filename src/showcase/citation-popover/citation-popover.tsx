"use client";

import * as React from "react";

/**
 * A citation marker, and the passage behind it.
 *
 * Small component, four problems in it, and only the first is the one people
 * expect.
 *
 * **Positioning.** The popover cannot live inside the answer's flow: the
 * answer scrolls, and an absolutely-positioned panel inside a scroll
 * container gets clipped by it. So the panel is `position: fixed`, measured
 * from the chip's rect when it opens, and clamped to the viewport — flipping
 * above the chip when there is no room below, and sliding sideways rather
 * than hanging off the edge. Measured on open rather than tracked
 * continuously; a citation popover that follows the text as it scrolls is
 * doing work nobody asked for.
 *
 * **Touch.** Hover does not exist on a phone, and a hover-only affordance is
 * one the reader will never find. So the chip is a real `<button>` that
 * toggles on tap, and hover is an addition for pointers that have it — not
 * the mechanism. `onPointerEnter` rather than `onMouseEnter`, because the
 * synthetic mouse events a tap produces would otherwise open the panel and
 * the tap would immediately close it again.
 *
 * **Keyboard.** Focus opens it, Escape closes it, and Enter jumps to the
 * passage in the document — the same thing a click does. A citation only a
 * mouse can reach is a footnote you have hidden.
 *
 * **The number the model invented.** `passage` is optional because a model
 * asked to cite only what it was given will still, sometimes, write `[7]`
 * when it was given six passages. That case is the reason this component
 * takes a passage rather than a passage id: an unresolved marker renders as
 * struck-through plain text, so the claim survives and the promise of a
 * source does not. Rendering an empty popover instead is how a hallucinated
 * citation gets laundered into a real-looking one.
 *
 * The chip renders the same characters the model wrote. Not a superscript,
 * not an icon: the number is what the reader matches against the passage
 * list, and replacing it with a symbol breaks that match for the sake of
 * looking tidier.
 */

export type CitationPopoverProps = {
  /** The number the model wrote — and the passage's own number. */
  n: number;
  /**
   * The passage text. Slice it out of the document by the offsets you carried
   * through retrieval; do not send it alongside them and hope the two agree.
   * Undefined means "no passage with that number", which is a state, not a
   * missing prop.
   */
  passage?: string;
  /** Where the passage came from — file name, page, section. */
  source?: string;
  /** Cosine similarity, if you want it shown. Useful while tuning the floor. */
  score?: number;
  /** Jump to it in the document. Undefined leaves the chip a preview-only
   *  affordance, which is the right behaviour when there is no document pane
   *  to jump into. */
  onJump?: () => void;
};

export function CitationPopover({ n, passage, source, score, onJump }: CitationPopoverProps) {
  const [open, setOpen] = React.useState(false);
  const [position, setPosition] = React.useState<{ left: number; top: number; above: boolean }>();
  const chipRef = React.useRef<HTMLButtonElement>(null);

  const resolved = passage !== undefined;

  const place = React.useCallback(() => {
    const el = chipRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const width = Math.min(340, window.innerWidth - 24);
    /* Guessing the height before it renders would flip wrongly on a long
       passage; 240 is measured against the panel's own cap below, so the flip
       decision is made against the worst case rather than the average. */
    const below = window.innerHeight - rect.bottom;
    const above = below < 240 && rect.top > below;
    setPosition({
      left: clamp(rect.left + rect.width / 2 - width / 2, 12, window.innerWidth - width - 12),
      top: above ? rect.top - 8 : rect.bottom + 8,
      above,
    });
  }, []);

  const show = React.useCallback(() => {
    if (!resolved) return;
    place();
    setOpen(true);
  }, [place, resolved]);

  /* Closing on scroll rather than repositioning: the panel was opened from a
     rect that is no longer where it was, and following it around a scrolling
     answer is motion the reader did not ask for. Capture phase, because the
     scroll that moved the chip is usually an ancestor's, not the window's. */
  React.useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [open]);

  if (!resolved) {
    return (
      <span
        className="mx-0.5 align-baseline text-[0.85em] text-zinc-400 line-through dark:text-zinc-600"
        title={`The answer cited [${n}], but no passage with that number was retrieved.`}
      >
        [{n}]
      </span>
    );
  }

  return (
    <>
      <button
        ref={chipRef}
        type="button"
        onClick={() => (onJump ? onJump() : setOpen((v) => !v))}
        onPointerEnter={(e) => e.pointerType === "mouse" && show()}
        onPointerLeave={(e) => e.pointerType === "mouse" && setOpen(false)}
        onFocus={show}
        onBlur={() => setOpen(false)}
        onKeyDown={(e) => {
          if (e.key === "Escape" && open) {
            /* stopPropagation so a dialog or drawer wrapping the answer does
               not also close on the same key. Dismissing the popover is what
               the reader meant; closing the thing they were reading is not. */
            e.stopPropagation();
            setOpen(false);
          }
        }}
        aria-expanded={open}
        aria-label={`Source ${n}${onJump ? " — jump to it in the document" : ""}`}
        className="mx-0.5 inline-flex h-[1.35em] min-w-[1.35em] items-center justify-center rounded-[0.3em] bg-amber-100 px-[0.3em] align-[-0.1em] text-[0.75em] font-medium text-amber-900 tabular-nums transition-colors hover:bg-amber-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-amber-500 dark:bg-amber-400/20 dark:text-amber-200 dark:hover:bg-amber-400/30"
      >
        {n}
      </button>

      {open && position && (
        <span
          role="tooltip"
          /* pointer-events-none: the panel is a preview, and a preview the
             pointer can enter is a preview that has to solve the gap between
             the chip and itself. It cannot be hovered, so there is no gap. */
          className="pointer-events-none fixed z-50 block rounded-lg border border-zinc-200 bg-white p-3 shadow-lg dark:border-zinc-700 dark:bg-zinc-900"
          style={{
            left: position.left,
            top: position.top,
            width: "min(340px, calc(100vw - 24px))",
            transform: position.above ? "translateY(-100%)" : undefined,
          }}
        >
          <span className="mb-1.5 flex items-center justify-between gap-3 text-[10px] font-medium uppercase tracking-wide text-zinc-400">
            <span className="min-w-0 truncate">{source ?? `Source ${n}`}</span>
            {score !== undefined && <span className="shrink-0 tabular-nums">{score.toFixed(3)}</span>}
          </span>
          {/* Capped, and scrolling is not an option on a pointer-events:none
              panel — a passage longer than this is a sign the chunk size is
              too big, which is a retrieval problem rather than a UI one. */}
          <span className="block max-h-[180px] overflow-hidden text-[12px] leading-5 text-zinc-600 dark:text-zinc-300">
            {passage}
          </span>
          {onJump && (
            <span className="mt-2 block text-[10px] text-zinc-400">
              Click to jump to it in the document
            </span>
          )}
        </span>
      )}
    </>
  );
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), Math.max(min, max));
}
