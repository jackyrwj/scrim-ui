"use client";

import * as React from "react";

/**
 * Height cap with a fade and an Expand control, for code too long to show
 * whole.
 *
 * The block it replaces used `max-h-[480px] overflow-auto`, which put a
 * scrollbar inside the page — the reader's wheel would capture on the code and
 * stop scrolling the article. Capping and expanding keeps one scroll context.
 */
export function CodeExpander({
  children,
  lines,
  maxLines,
}: {
  children: React.ReactNode;
  lines: number;
  maxLines: number;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="relative">
      {/* The fade is a mask on the clipped box, not a gradient div laid over
          the code. An overlay would sit on top of the text, and a contrast
          checker that finds an element covering the text it is measuring
          stops being able to resolve the background — axe reported every
          token as failing against white while the block was plainly dark. A
          mask changes only this element's own alpha, so nothing covers
          anything. */}
      <div
        className="overflow-hidden transition-[max-height]"
        style={{
          maxHeight: open ? "none" : `${maxLines * 1.5 + 1.75}rem`,
          maskImage: open
            ? undefined
            : "linear-gradient(to bottom, #000 calc(100% - 5rem), transparent 100%)",
        }}
      >
        {children}
      </div>
      <div className={open ? "px-4 pb-3" : "absolute inset-x-0 bottom-0 px-4 pb-3"}>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="inline-flex h-7 items-center gap-1.5 rounded-md bg-white/10 px-2.5 text-[11px] font-medium text-zinc-100 transition-colors hover:bg-white/20"
        >
          {open ? "Collapse" : `Expand all ${lines} lines`}
        </button>
      </div>
    </div>
  );
}
