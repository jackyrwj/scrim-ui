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
import { LicenseForm } from "@/components/pro/license-form";
import { RecoverForm } from "@/components/pro/recover-form";

export const metadata: Metadata = {
  title: "Pricing — Free and Pro",
  description:
    "Every component is free and MIT licensed. Pro adds complete AI application templates and the components that take a week to get right — one payment, lifetime updates, unlimited projects.",
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
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Pricing</h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-(--muted-foreground)">
          The free library stays free. Pro is the layer above: the pieces that take a week to get
          right, and the templates that are an application rather than a component.
        </p>
      </div>

      <div className="mt-12 grid gap-5 md:grid-cols-2 md:items-start">
        {/* ---------------------------------------------------------- Free */}
        <div className="rounded-2xl border border-(--border) p-7">
          <h2 className="text-lg font-semibold">{FREE_PLAN.name}</h2>
          <p className="mt-1 text-sm text-(--muted-foreground)">{FREE_PLAN.billing}</p>
          <div className="mt-4 text-4xl font-bold tracking-tight">{FREE_PRICE}</div>

          <ul className="mt-6 space-y-3">
            {FREE_PLAN.features.map((feature) => (
              <li key={feature} className="flex items-start gap-2.5 text-sm text-(--muted-foreground)">
                <CheckIcon />
                {feature}
              </li>
            ))}
          </ul>

          <Link
            href="/components"
            className="mt-7 flex h-11 w-full items-center justify-center rounded-xl border border-(--border) text-sm font-semibold transition-colors hover:bg-(--muted)"
          >
            Browse the components
          </Link>
        </div>

        {/* ----------------------------------------------------------- Pro */}
        <div
          className="rounded-2xl border border-(--primary)/30 bg-(--card) p-7"
          style={{ boxShadow: "var(--shadow-md)" }}
        >
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg font-semibold">{PRO_PLAN.name}</h2>
            <ProBadge />
          </div>
          <p className="mt-1 text-sm text-(--muted-foreground)">{PRO_PLAN.billing}</p>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-4xl font-bold tracking-tight">{PRO_PRICE}</span>
            <span className="text-sm text-(--muted-foreground)">once</span>
          </div>

          <ul className="mt-6 space-y-3">
            {PRO_PLAN.features.map((feature) => (
              <li key={feature} className="flex items-start gap-2.5 text-sm text-(--muted-foreground)">
                <CheckIcon />
                {feature}
              </li>
            ))}
          </ul>

          {hasPro ? (
            <Link
              href="/dashboard"
              className="mt-7 flex h-11 w-full items-center justify-center rounded-xl bg-(--accent) text-sm font-semibold text-(--accent-foreground) transition-opacity hover:opacity-90"
            >
              Open dashboard
            </Link>
          ) : !viewer && authReady ? (
            <Link
              href="/sign-in"
              className="mt-7 flex h-11 w-full items-center justify-center rounded-xl bg-(--accent) text-sm font-semibold text-(--accent-foreground) transition-opacity hover:opacity-90"
            >
              Sign in to get Pro
            </Link>
          ) : checkoutReady ? (
            <form action="/api/checkout/session" method="post" className="mt-7">
              <button className="flex h-11 w-full items-center justify-center rounded-xl bg-(--accent) text-sm font-semibold text-(--accent-foreground) transition-opacity hover:opacity-90">
                Get Pro — {PRO_PRICE}
              </button>
            </form>
          ) : (
            <div className="mt-7 rounded-xl border border-dashed border-(--border) px-4 py-3 text-center text-sm text-(--muted-foreground)">
              Account checkout is not configured yet.
            </div>
          )}
        </div>
      </div>

      {/* Counted, never claimed: the inventory a buyer gets today, derived
          from the registry at render time so it can never oversell. */}
      {(publishedTemplates.length > 0 || proComponents.length > 0) && (
        <div className="mt-12">
          <h2 className="text-xl font-semibold tracking-tight">In Pro today</h2>
          <div className="mt-5 space-y-2">
            {publishedTemplates.map((t) => (
              <Link
                key={t.slug}
                href={`/templates/${t.slug}`}
                className="group flex items-center justify-between gap-3 rounded-xl border border-(--border) px-4 py-3 transition-colors hover:bg-(--muted)/60"
              >
                <span className="font-medium group-hover:underline">{t.name} Template</span>
                <ProBadge />
              </Link>
            ))}
            {proComponents.map((c) => (
              <Link
                key={c.slug}
                href={`/components/${c.slug}`}
                className="group flex items-center justify-between gap-3 rounded-xl border border-(--border) px-4 py-3 transition-colors hover:bg-(--muted)/60"
              >
                <span className="font-medium group-hover:underline">{c.name}</span>
                <ProBadge />
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="mt-12 rounded-2xl border border-(--border) p-6">
        <h2 className="text-sm font-semibold">Legacy licence key</h2>
        <p className="mt-1 text-sm text-(--muted-foreground)">
          Keys issued before accounts remain valid. New purchases are linked to your account instead.
        </p>
        <div className="mt-4">
          <LicenseForm />
        </div>

        {/* Next to the key field rather than on a page of its own: the reader
            who has lost their key and the reader who is about to paste one
            arrive here identically, and only one of them knows which they are. */}
        <div className="mt-6 border-t border-(--border) pt-5">
          <h3 className="text-sm font-semibold">Lost your key?</h3>
          <p className="mt-1 text-sm text-(--muted-foreground)">
            Enter the email address you paid with and it will be sent again.
          </p>
          <div className="mt-3">
            <RecoverForm />
          </div>
        </div>
      </div>
    </div>
  );
}
