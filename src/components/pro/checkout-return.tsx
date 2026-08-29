"use client";

import * as React from "react";
import Link from "next/link";
import { refreshAccountAccess } from "@/lib/pro-access";
import { trackEvent } from "@/lib/analytics";

/**
 * What a customer sees the moment Stripe sends them back.
 *
 * The webhook has usually landed before the redirect completes; when it has
 * not, this polls the account entitlement until the purchase shows up. Access
 * is attached to the account, so there is nothing to copy or save here — the
 * dashboard is the record.
 */

type State = { phase: "waiting" } | { phase: "ready" } | { phase: "slow" };

/* Stripe's redirect and Stripe's webhook are independent deliveries and
   neither waits for the other, so a second or two of "pending" is normal
   rather than a fault. Twenty attempts at 1.5s covers the pathological case
   before pointing at the dashboard instead. */
const ATTEMPTS = 20;
const INTERVAL_MS = 1500;

export function CheckoutReturn({ sessionId }: { sessionId: string | null }) {
  /* Derived at render rather than set from the effect: with no session id
     there is nothing to poll for, and that is knowable before the first
     paint. */
  const [state, setState] = React.useState<State>(
    sessionId ? { phase: "waiting" } : { phase: "slow" },
  );

  React.useEffect(() => {
    if (!sessionId) return;
    let cancelled = false;
    let attempts = 0;

    async function poll() {
      if (cancelled) return;
      attempts += 1;
      try {
        const response = await fetch("/api/account/entitlement", { cache: "no-store" });
        const data: unknown = await response.json().catch(() => null);
        if (cancelled) return;
        if ((data as { hasPro?: boolean } | null)?.hasPro) {
          trackEvent("pro_purchased", { item: "/pro/success" });
          /* Lets every locked surface on the site see the new entitlement
             without waiting for its own next mount. */
          void refreshAccountAccess();
          setState({ phase: "ready" });
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
        <p className="text-sm font-medium">Pro is active on your account.</p>
        <p className="mt-2 text-sm text-(--muted-foreground)">
          Everything Pro is unlocked whenever you are signed in — this machine and every other one. A
          confirmation is on its way to your email as well.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/dashboard"
            className="inline-flex h-10 items-center rounded-xl bg-(--accent) px-5 text-sm font-semibold text-(--accent-foreground) transition-opacity hover:opacity-90"
          >
            Open your dashboard
          </Link>
          <Link href="/templates" className="inline-flex h-10 items-center text-sm font-medium underline">
            Go to the templates
          </Link>
          <Link href="/components" className="inline-flex h-10 items-center text-sm font-medium text-(--muted-foreground) underline">
            Browse components
          </Link>
        </div>
      </div>
    );
  }

  if (state.phase === "slow") {
    return (
      <div className="mt-8 rounded-2xl border border-(--border) p-6 text-center">
        <p className="text-sm">Your payment went through.</p>
        <p className="mx-auto mt-2 max-w-md text-sm text-(--muted-foreground)">
          Your account is taking longer than usual to update — nothing is lost. Check your{" "}
          <Link href="/dashboard" className="underline">
            dashboard
          </Link>{" "}
          in a moment; your Pro access and invoice appear there.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8 flex items-center justify-center gap-3 rounded-2xl border border-(--border) p-8 text-sm text-(--muted-foreground)">
      <span className="size-2 animate-pulse rounded-full bg-(--muted-foreground)" aria-hidden />
      Confirming your purchase...
    </div>
  );
}
