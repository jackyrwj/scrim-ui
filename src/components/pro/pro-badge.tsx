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
