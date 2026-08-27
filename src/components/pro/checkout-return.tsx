"use client";

import * as React from "react";
import Link from "next/link";
import { setLicense } from "@/lib/pro-access";
import { trackEvent } from "@/lib/analytics";

/**
 * What a customer sees the moment Stripe sends them back.
 *
 * The key arrives here rather than only by email, because email is the
 * slowest and least reliable link in the chain — greylisting, spam folders,
 * corporate filters — and a customer staring at "check your inbox" thirty
 * seconds after paying is a customer writing to support. The webhook has
 * usually landed before the redirect completes; when it has not, this polls.
 *
 * It also stores the key straight away, so the reader is already unlocked
 * when they click back to the template they were looking at.
 */

type State =
  | { phase: "waiting" }
  | { phase: "ready"; key: string }
  | { phase: "slow" };

/* Stripe's redirect and Stripe's webhook are independent deliveries and
   neither waits for the other, so a second or two of "pending" is normal
   rather than a fault. Twenty attempts at 1.5s covers the pathological case
   before admitting the email is the better bet. */
const ATTEMPTS = 20;
const INTERVAL_MS = 1500;

export function CheckoutReturn({ sessionId }: { sessionId: string | null }) {
  /* Derived at render rather than set from the effect: with no session id
     there is nothing to poll for, and that is knowable before the first
     paint. Deciding it in an effect would mean a setState on mount, which is
     both a cascading render and the thing react-hooks/set-state-in-effect
     exists to catch. */
  const [state, setState] = React.useState<State>(
    sessionId ? { phase: "waiting" } : { phase: "slow" },
  );
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    if (!sessionId) return;
    let cancelled = false;
    let attempts = 0;

    async function poll() {
      if (cancelled) return;
      attempts += 1;
      try {
        const response = await fetch(
          `/api/license/by-session?session_id=${encodeURIComponent(sessionId ?? "")}`,
        );
        const data: unknown = await response.json().catch(() => null);
        const parsed = data as { status?: string; key?: string } | null;
        if (cancelled) return;
        if (parsed?.status === "ready" && parsed.key) {
          /* Unlocks every Pro surface in this browser immediately. */
          setLicense(parsed.key);
          trackEvent("pro_purchased", { item: "/pro/success" });
          setState({ phase: "ready", key: parsed.key });
          return;
        }
      } catch {
        /* Network blip mid-poll is not worth surfacing; the retry covers it. */
      }
      if (attempts >= ATTEMPTS) setState({ phase: "slow" });
      else setTimeout(poll, INTERVAL_MS);
    }

    void poll();
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  if (state.phase === "ready") {
    return (
      <div className="mt-8 rounded-2xl border border-(--border) bg-(--card) p-6 text-center" style={{ boxShadow: "var(--shadow-md)" }}>
        <p className="text-sm text-(--muted-foreground)">Your licence key</p>
        <p className="mt-3 rounded-xl border border-(--border) bg-(--muted)/50 px-4 py-3 font-mono text-lg tracking-wide">
          {state.key}
        </p>
        <button
          type="button"
          onClick={() => {
            void navigator.clipboard.writeText(state.key).then(() => {
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            });
          }}
          className="mt-4 h-10 rounded-xl bg-(--accent) px-5 text-sm font-semibold text-(--accent-foreground) transition-opacity hover:opacity-90"
        >
          {copied ? "Copied" : "Copy key"}
        </button>
        <p className="mt-4 text-sm text-(--muted-foreground)">
          Already saved in this browser — everything Pro is unlocked. A copy is on its way to your
          email as well.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/templates" className="text-sm font-medium underline">
            Go to the templates
          </Link>
          <Link href="/components" className="text-sm font-medium text-(--muted-foreground) underline">
            Browse components
          </Link>
        </div>
      </div>
    );
  }

  if (state.phase === "slow") {
    return (
      <div className="mt-8 rounded-2xl border border-(--border) p-6 text-center">
        <p className="text-sm">Your key is on its way by email.</p>
        <p className="mx-auto mt-2 max-w-md text-sm text-(--muted-foreground)">
          The payment went through — this page just could not read the key back in time. Check the
          address you paid with, then paste the key on{" "}
          <Link href="/pro" className="underline">
            the Pro page
          </Link>
          . Nothing is lost; you can also have it sent again from there.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8 flex items-center justify-center gap-3 rounded-2xl border border-(--border) p-8 text-sm text-(--muted-foreground)">
      <span className="size-2 animate-pulse rounded-full bg-(--muted-foreground)" aria-hidden />
      Issuing your licence key...
    </div>
  );
}
