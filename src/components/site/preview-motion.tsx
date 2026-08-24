"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

/**
 * Pauses preview animations that are off screen.
 *
 * The homepage already had a gate: the previews sit inside AnimateOnScroll,
 * and the CSS holds them until the wrapper is revealed. /components and
 * /patterns have no such wrapper, so every card on those pages — twenty-nine
 * of them on /components — kept animating whether or not anyone could see it.
 *
 * This adds the class, rather than requiring one to run: with JS off nothing
 * is marked idle and every preview animates exactly as it does today. The
 * previews are markup and CSS, and they should not become JS-dependent to
 * stay still.
 *
 * Frames arrive after mount too — the resources browser filters client-side —
 * so a MutationObserver re-scans, coalesced into one frame so a burst of DOM
 * changes costs one pass.
 */
const FRAMES = ".cp, .pp, .tp, .rp";

export function PreviewMotion() {
  const pathname = usePathname();

  React.useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          entry.target.classList.toggle("preview-idle", !entry.isIntersecting);
        }
      },
      /* A margin, so a preview is already playing by the time it is on
         screen rather than starting from frame zero under the reader. */
      { rootMargin: "200px 0px" },
    );

    /* observe() on an element already being observed is a no-op, so the
       rescan does not need to track what it has seen. */
    const scan = () => document.querySelectorAll(FRAMES).forEach((el) => io.observe(el));
    scan();

    let queued = 0;
    const mo = new MutationObserver(() => {
      if (queued) return;
      queued = requestAnimationFrame(() => {
        queued = 0;
        scan();
      });
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      if (queued) cancelAnimationFrame(queued);
      mo.disconnect();
      io.disconnect();
    };
  }, [pathname]);

  return null;
}
