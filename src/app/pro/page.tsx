import type { Metadata } from "next";
import Link from "next/link";
import { components } from "@/lib/registry";
import { publishedTemplates } from "@/lib/templates";
import { CHECKOUT_URL, FREE_PLAN, FREE_PRICE, PRO_PLAN, PRO_PRICE } from "@/lib/pro";
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
const freeComponents = components.filter((c) => c.status === "published" && c.tier !== "pro");
const proComponents = components.filter((c) => c.status === "published" && c.tier === "pro");

function CheckIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mt-1 shrink-0 text-(--primary)" aria-hidden>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export default function ProPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Pricing</h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-(--muted-foreground)">
          The free library stays free — all {freeComponents.length} components, MIT, forever. Pro is
          the layer above: the pieces that take a week to get right, and the templates that are an
          application rather than a component.
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

          {/* Said plainly while checkout is not live. A "Get Pro" button that
              silently does nothing costs more trust than an honest sentence. */}
          {CHECKOUT_URL ? (
            <a
              href={CHECKOUT_URL}
              className="mt-7 flex h-11 w-full items-center justify-center rounded-xl bg-(--accent) text-sm font-semibold text-(--accent-foreground) transition-opacity hover:opacity-90"
            >
              Get Pro — {PRO_PRICE}
            </a>
          ) : (
            <div className="mt-7 rounded-xl border border-dashed border-(--border) px-4 py-3 text-center text-sm text-(--muted-foreground)">
              Checkout is not live yet.
            </div>
          )}
        </div>
      </div>

      {/* Counted, never claimed. A buyer deciding on {PRO_PRICE} deserves the
          inventory rather than the brochure — and stating it plainly costs
          less than being caught overselling it. */}
      <div className="mt-8 rounded-2xl border border-(--border) bg-(--muted)/30 p-6">
        <h2 className="text-sm font-semibold">What is in Pro today</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <div className="text-2xl font-bold tabular-nums">{publishedTemplates.length}</div>
            <div className="text-sm text-(--muted-foreground)">
              {publishedTemplates.length === 1 ? "template" : "templates"}
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold tabular-nums">{proComponents.length}</div>
            <div className="text-sm text-(--muted-foreground)">
              Pro {proComponents.length === 1 ? "component" : "components"}
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold tabular-nums">{freeComponents.length}</div>
            <div className="text-sm text-(--muted-foreground)">free components, included</div>
          </div>
        </div>
        <p className="mt-4 text-sm leading-6 text-(--muted-foreground)">
          Pro is early, and priced that way. Buying now is a bet on what comes next — which is why
          the licence covers everything added later at no extra cost, and why the price rises as
          items land rather than after you have paid.
        </p>
      </div>

      {publishedTemplates.length > 0 && (
        <div className="mt-14">
          <h2 className="text-xl font-semibold tracking-tight">Templates</h2>
          <p className="mb-5 mt-1 text-sm text-(--muted-foreground)">
            Complete applications, not snippets — the reason Pro exists.
          </p>
          <div className="space-y-3">
            {publishedTemplates.map((t) => (
              <Link
                key={t.slug}
                href={`/templates/${t.slug}`}
                className="group block rounded-xl border border-(--border) p-4 transition-colors hover:bg-(--muted)/60"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium group-hover:underline">{t.name} Template</span>
                  <ProBadge />
                </div>
                <p className="mt-1 text-sm text-(--muted-foreground)">{t.description}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {proComponents.length > 0 && (
        <div className="mt-14">
          <h2 className="text-xl font-semibold tracking-tight">Pro components</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {proComponents.map((c) => (
              <Link
                key={c.slug}
                href={`/components/${c.slug}`}
                className="group rounded-xl border border-(--border) p-4 transition-colors hover:bg-(--muted)/60"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium group-hover:underline">{c.name}</span>
                  <ProBadge />
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-(--muted-foreground)">{c.description}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="mt-14 rounded-2xl border border-(--border) p-6">
        <h2 className="text-sm font-semibold">Already have a licence?</h2>
        <p className="mt-1 text-sm text-(--muted-foreground)">
          Paste your key once and every Pro item on the site unlocks in this browser.
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

      <div className="mt-14 space-y-6 border-t border-(--border) pt-10">
        <div>
          <h3 className="text-sm font-semibold">Is the free library going to shrink?</h3>
          <p className="mt-1 text-sm text-(--muted-foreground)">
            No. Everything published free stays free and stays MIT, and new free components keep
            shipping. Pro is additive — nothing that is on the site today moves behind the lock.
          </p>
        </div>
        <div>
          <h3 className="text-sm font-semibold">Will the price go up?</h3>
          <p className="mt-1 text-sm text-(--muted-foreground)">
            Yes, as more Pro items ship. If you buy now you keep everything added later at no extra
            cost — that is the whole trade for buying early.
          </p>
        </div>
        <div>
          <h3 className="text-sm font-semibold">What does the licence cover?</h3>
          <p className="mt-1 text-sm text-(--muted-foreground)">
            One developer, unlimited projects, including client work and commercial products. You
            cannot resell or redistribute the components as a component library of your own.
          </p>
        </div>
        <div>
          <h3 className="text-sm font-semibold">Do I need an account?</h3>
          <p className="mt-1 text-sm text-(--muted-foreground)">
            No. There are no passwords and no login — the licence key is the whole system, and it
            works on every machine you paste it into.
          </p>
        </div>
      </div>
    </div>
  );
}
