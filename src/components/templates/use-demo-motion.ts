"use client";

import * as React from "react";

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

/**
 * Reduced motion, read during render rather than copied into state by an
 * effect. The effect version needs a second effect to act on it, and a
 * setState in an effect body is a cascading render — the same reason
 * lib/pro-access.ts subscribes instead of syncing.
 *
 * The server snapshot is `false` so the markup matches the pre-hydration
 * HTML; a reader who wants no motion gets the still frame on the first client
 * pass. Every template demo pairs it with the same rule: reduced motion shows
 * the single most informative frame of the script, never a frozen empty one.
 */
export function useReducedMotion(): boolean {
  return React.useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(REDUCED_MOTION);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => false,
  );
}

/**
 * Whether the frame is on screen. An animation nobody is looking at is a
 * timer nobody asked for — the same rule the component cards follow.
 */
export function useInView(ref: React.RefObject<HTMLElement | null>): boolean {
  const [inView, setInView] = React.useState(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      rootMargin: "0px 0px -10% 0px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, [ref]);

  return inView;
}

/** Reveal on word boundaries. Cutting mid-word makes text look corrupted
 *  rather than in-flight, which is the opposite of the impression wanted. */
export function sliceTo(text: string, ratio: number): string {
  if (ratio >= 1) return text;
  const cut = Math.floor(text.length * ratio);
  const space = text.lastIndexOf(" ", cut);
  return text.slice(0, space > 0 ? space : cut);
}
