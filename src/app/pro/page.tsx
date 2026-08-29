import type { Metadata } from "next";
import Link from "next/link";
import { components } from "@/lib/registry";
import { publishedTemplates } from "@/lib/templates";
import { FREE_PLAN, FREE_PRICE, PRO_PLAN, PRO_PRICE } from "@/lib/pro";
import { hasActiveEntitlement } from "@/lib/account-store.server";
import { clerkConfigured, getViewer } from "@/lib/auth.server";
import { databaseConfigured } from "@/lib/db.server";
import { stripeApiConfigured } from "@/lib/stripe-client.server";
import { ProBadge } from "@/components/pro/pro-badge";

export const metadata: Metadata = {
  title: "Pricing — Free UI Components and Pro Workflows",
  description:
    "Free gives you reusable AI interface components. Pro gives you complete application templates and production workflows with one payment and lifetime updates.",
};

/* Counted here rather than written into lib/pro.ts on purpose: the tier
   feature lists describe what the licence COVERS, which does not change, and
   this describes what is in the box TODAY, which does. Deriving it means the
   page cannot promise a component that has not shipped, and cannot forget to
   mention one that has. */
const proComponents = components.filter((c) => c.status === "published" && c.tier === "pro");

function CheckIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mt-1 shrink-0 text-(--primary)" aria-hidden>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export default async function ProPage() {
  const authReady = clerkConfigured();
  const viewer = authReady ? await getViewer() : null;
  const checkoutReady = authReady && databaseConfigured() && stripeApiConfigured();
  let hasPro = false;
  if (viewer && databaseConfigured()) {
    try {
      hasPro = await hasActiveEntitlement(viewer.id);
    } catch (error) {
      console.error("[pricing] Could not load account entitlement:", error);
    }
  }
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <div className="text-center">
        <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
          Unlock all access
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-(--muted-foreground)">
          Every component is free. Pro adds complete app templates and production workflows
          with one payment and lifetime updates.
        </p>
      </div>

      {/* Subgrid: both cards share the parent's four row tracks (title,
          price, CTA, features), so each card must render exactly four row
          items — this keeps the CTAs and feature lists vertically aligned
          regardless of how the price row wraps. The CTA sits between the
          price and the features: the buying decision happens at the price,
          and the list below is the justification, not the gate. */}
      <div className="mt-14 grid gap-x-5 md:grid-cols-2">
        {/* ---------------------------------------------------------- Free */}
        <div className="row-span-4 grid grid-rows-subgrid rounded-2xl border border-(--border) p-7">
          <div className="border-b border-(--border) pb-5">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold">{FREE_PLAN.name}</h2>
              <span className="size-2 rounded-full bg-(--muted-foreground)/40" aria-hidden />
            </div>
            <p className="mt-1 text-sm text-(--muted-foreground)">Free forever</p>
          </div>
          <div className="mt-6 flex items-baseline gap-1.5">
            <span className="text-4xl font-bold tracking-tight">{FREE_PRICE}</span>
            <span className="text-sm text-(--muted-foreground)">/ forever</span>
          </div>

          <Link
            href="/components"
            className="mt-6 flex h-11 w-full items-center justify-center rounded-xl border border-(--border) text-sm font-semibold transition-colors hover:bg-(--muted)"
          >
            Browse the components
          </Link>

          <ul className="mt-7 space-y-3">
            {FREE_PLAN.features.map((feature) => (
              <li key={feature} className="flex items-start gap-2.5 text-sm text-(--muted-foreground)">
                <CheckIcon />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        {/* ----------------------------------------------------------- Pro */}
        <div
          className="row-span-4 grid grid-rows-subgrid rounded-2xl border border-(--primary)/30 bg-(--card) p-7 max-md:mt-5"
          style={{ boxShadow: "var(--shadow-md)" }}
        >
          <div className="border-b border-(--primary)/20 pb-5">
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg font-semibold">{PRO_PLAN.name}</h2>
              <span className="size-2 rounded-full bg-(--primary)" aria-hidden />
              <ProBadge />
            </div>
            <p className="mt-1 text-sm text-(--muted-foreground)">Lifetime access</p>
          </div>
          <div className="mt-6 flex flex-wrap items-baseline gap-x-2 gap-y-1.5">
            <span className="text-4xl font-bold tracking-tight">{PRO_PRICE}</span>
            <span className="text-sm text-(--muted-foreground)">/ one-time</span>
          </div>

          {hasPro ? (
            <Link
              href="/dashboard"
              className="mt-6 flex h-11 w-full items-center justify-center rounded-xl bg-(--accent) text-sm font-semibold text-(--accent-foreground) transition-opacity hover:opacity-90"
            >
              Open dashboard
            </Link>
          ) : !viewer && authReady ? (
            <Link
              href="/sign-in"
              className="mt-6 flex h-11 w-full items-center justify-center rounded-xl bg-(--accent) text-sm font-semibold text-(--accent-foreground) transition-opacity hover:opacity-90"
            >
              Sign in to get Pro
            </Link>
          ) : checkoutReady ? (
            <form action="/api/checkout/session" method="post" className="mt-6">
              <button className="flex h-11 w-full items-center justify-center rounded-xl bg-(--accent) text-sm font-semibold text-(--accent-foreground) transition-opacity hover:opacity-90">
                Get Pro — {PRO_PRICE}
              </button>
            </form>
          ) : (
            <div className="mt-6 rounded-xl border border-dashed border-(--border) px-4 py-3 text-center text-sm text-(--muted-foreground)">
              Account checkout is not configured yet.
            </div>
          )}

          <ul className="mt-7 space-y-3">
            {PRO_PLAN.features.map((feature) => (
              <li key={feature} className="flex items-start gap-2.5 text-sm text-(--muted-foreground)">
                <CheckIcon />
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Counted, never claimed: the inventory a buyer gets today, derived
          from the registry at render time so it can never oversell. Styled to
          match the Pro card above so the list reads as "that card's contents",
          not as site navigation. */}
      {(publishedTemplates.length > 0 || proComponents.length > 0) && (
        <div
          className="mt-12 rounded-2xl border border-(--primary)/30 bg-(--card) p-7"
          style={{ boxShadow: "var(--shadow-md)" }}
        >
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl font-semibold tracking-tight">Included with Pro</h2>
              <ProBadge />
            </div>
            <p className="text-sm text-(--muted-foreground)">
              {publishedTemplates.length} templates
              {proComponents.length > 0 && ` · ${proComponents.length} components`}
            </p>
          </div>

          <h3 className="mt-6 text-xs font-semibold uppercase tracking-wider text-(--muted-foreground)">
            Templates
          </h3>
          <ul className="mt-2 grid gap-0.5 sm:grid-cols-2 lg:grid-cols-3">
            {publishedTemplates.map((t) => (
              <li key={t.slug}>
                <Link
                  href={`/templates/${t.slug}`}
                  className="group flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-(--muted)"
                >
                  {t.name}
                </Link>
              </li>
            ))}
          </ul>

          {proComponents.length > 0 && (
            <>
              <h3 className="mt-6 text-xs font-semibold uppercase tracking-wider text-(--muted-foreground)">
                Production components
              </h3>
              <ul className="mt-2 grid gap-0.5 sm:grid-cols-2 lg:grid-cols-3">
                {proComponents.map((c) => (
                  <li key={c.slug}>
                    <Link
                      href={`/components/${c.slug}`}
                      className="group flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-(--muted)"
                    >
                      {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}

    </div>
  );
}
