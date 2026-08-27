"use client";

import * as React from "react";
import Link from "next/link";
import { trackEvent } from "@/lib/analytics";
import { CHECKOUT_URL, PRO_PLAN, PRO_PRICE } from "@/lib/pro";
import { setLicense, verifyLicense } from "@/lib/pro-access";

/**
 * What a locked surface opens: what Pro includes, what it costs, and a place
 * to paste a key you already own.
 *
 * The key field is on the same panel as the price rather than behind a
 * separate /unlock page, because the reader who already paid and the reader
 * deciding whether to arrive at the same lock, and sending the first one on a
 * hunt for a login is how a customer ends up emailing support instead.
 */
export function UnlockDialog({
  open,
  onClose,
  onUnlocked,
  item,
}: {
  open: boolean;
  onClose: () => void;
  onUnlocked: () => void;
  /** Path of the thing that was locked — the conversion signal in GA4. */
  item: string;
}) {
  const [key, setKey] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [pending, setPending] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    /* Without this the page behind keeps scrolling under the overlay. */
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  React.useEffect(() => {
    if (open) trackEvent("pro_dialog_open", { item });
  }, [open, item]);

  if (!open) return null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const result = await verifyLicense(key);
    setPending(false);
    if (result.valid) {
      trackEvent("pro_unlocked", { item });
      onUnlocked();
      onClose();
    } else {
      setLicense(null);
      setError(result.error);
      inputRef.current?.focus();
    }
  }

  return (
    <div className="fixed inset-0 z-[100]">
      <div className="absolute inset-0 bg-(--background)/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative mx-auto mt-[min(10vh,72px)] w-full max-w-md px-4">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="unlock-pro-title"
          className="max-h-[80vh] overflow-y-auto rounded-2xl border border-(--border) bg-(--card) p-6"
          style={{ boxShadow: "var(--shadow-lg)" }}
        >
          <div className="flex items-start justify-between gap-4">
            <h2 id="unlock-pro-title" className="text-2xl font-bold tracking-tight">
              Unlock Pro
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="-mr-1 -mt-1 rounded-md p-1 text-(--muted-foreground) transition-colors hover:text-(--foreground)"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
          {/* Kept in step with PRO_PLAN.features below, which claims no
              blocks — see lib/pro.ts. A summary line promising more than the
              list under it is the version a reader catches first, because
              they are read in that order. */}
          <p className="mt-2 text-sm leading-6 text-(--muted-foreground)">
            Lifetime access to every Pro component and template, and everything added to Pro later —
            unlimited projects, one payment.
          </p>

          <div className="mt-5 rounded-xl bg-(--muted)/50 p-4">
            <h3 className="text-sm font-semibold">Pro includes:</h3>
            <ul className="mt-3 space-y-2">
              {PRO_PLAN.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2.5 text-[13px] text-(--muted-foreground)">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0 text-(--primary)" aria-hidden>
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-5 border-t border-(--border) pt-5">
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-semibold">{PRO_PLAN.name}</span>
              <span className="text-xs text-(--muted-foreground)">{PRO_PLAN.billing}</span>
            </div>
            <div className="mt-1 text-3xl font-bold tracking-tight">{PRO_PRICE}</div>
          </div>

          {/* Until a checkout exists this points at /pro, which says so
              plainly. A button that opens nothing is worse than one that
              explains itself. */}
          {CHECKOUT_URL ? (
            <a
              href={CHECKOUT_URL}
              onClick={() => trackEvent("pro_checkout_click", { item })}
              className="mt-5 flex h-11 w-full items-center justify-center rounded-xl bg-(--accent) text-sm font-semibold text-(--accent-foreground) transition-opacity hover:opacity-90"
            >
              Get Pro
            </a>
          ) : (
            <Link
              href="/pro"
              onClick={() => trackEvent("pro_checkout_click", { item })}
              className="mt-5 flex h-11 w-full items-center justify-center rounded-xl bg-(--accent) text-sm font-semibold text-(--accent-foreground) transition-opacity hover:opacity-90"
            >
              Get Pro
            </Link>
          )}

          <form onSubmit={submit} className="mt-5 border-t border-(--border) pt-5">
            <label htmlFor="license-key" className="text-xs font-medium text-(--muted-foreground)">
              Already bought Pro? Paste your licence key.
            </label>
            <div className="mt-2 flex gap-2">
              <input
                id="license-key"
                ref={inputRef}
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="SCRIM-XXXX-XXXX-XXXX"
                autoComplete="off"
                spellCheck={false}
                className="h-10 min-w-0 flex-1 rounded-lg border border-(--border) bg-(--background) px-3 font-mono text-[13px] outline-none placeholder:text-(--muted-foreground) focus:border-(--primary)"
              />
              <button
                type="submit"
                disabled={pending}
                className="h-10 shrink-0 rounded-lg border border-(--border) px-4 text-sm font-medium transition-colors hover:bg-(--muted) disabled:opacity-50"
              >
                {pending ? "Checking..." : "Unlock"}
              </button>
            </div>
            {error && (
              <p role="alert" className="mt-2 text-xs text-red-500">
                {error}
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
