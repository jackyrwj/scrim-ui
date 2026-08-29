/**
 * The Pro mark, on cards and beside page titles.
 *
 * Deliberately quiet: the badge's job is to set an expectation before a click,
 * not to sell. The selling happens in the dialog, once the reader has already
 * decided they want this particular component.
 */
export function ProBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded-full bg-(--primary-muted) px-2 py-0.5 text-[11px] font-medium text-(--primary-muted-foreground) ${className}`}
    >
      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <rect width="18" height="11" x="3" y="11" rx="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
      Pro
    </span>
  );
}

/**
 * The corner-ribbon form of the Pro mark, for card surfaces (/components,
 * /templates). The pill is easy to miss inside a row of text; the ribbon sits
 * on the preview itself, where the eye already is.
 *
 * The parent card must be `relative overflow-hidden` — the strip is oversized
 * and relies on the card's rounded corner to clip it. Pointer events are off
 * so it never intercepts a click meant for the card beneath.
 */
export function ProRibbon() {
  return (
    <span
      className="pointer-events-none absolute -right-9 top-4 z-10 w-32 rotate-45 bg-(--primary) py-1 text-center text-[10px] font-bold uppercase tracking-[0.14em] text-(--primary-foreground)"
      style={{ boxShadow: "var(--shadow-md)" }}
    >
      Pro
    </span>
  );
}
