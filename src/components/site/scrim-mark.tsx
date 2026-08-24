/**
 * The Scrim UI mark.
 *
 * One square split on the 45° and the halves pulled apart — two planes with
 * a seam of light between them, which is what a scrim does when you light
 * what is behind it.
 *
 * Built to the same rules as the rest of the site's geometry: a single flat
 * fill, no stroke and no gradient, only 0°/90°/45° edges, and every vertex on
 * a 16-unit grid of a 96 box. The rules are not decoration — they are why it
 * still reads at 12px, which is the size it is actually used at.
 *
 * Fills with currentColor, so it inherits from whatever it sits in and needs
 * no dark-mode variant. The favicon files under src/app cannot do that (there
 * is no inherited colour in a browser tab) and carry their own palette.
 */
export const SCRIM_MARK_PATH = "M0 0 H80 L0 80 Z M96 16 V96 H16 Z";

export function ScrimMark({ size = 16, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 96 96"
      fill="currentColor"
      aria-hidden
      className={className}
    >
      <path fillRule="evenodd" d={SCRIM_MARK_PATH} />
    </svg>
  );
}

/**
 * The mark in its badge — the lockup used in the header and the footer.
 * Knocked out of a foreground-coloured tile so it holds its weight next to
 * the wordmark at 24px, and flips with the theme for free.
 */
export function ScrimBadge({ className }: { className?: string }) {
  return (
    <span
      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-(--foreground) text-(--background) ${className ?? ""}`}
    >
      <ScrimMark size={14} />
    </span>
  );
}
