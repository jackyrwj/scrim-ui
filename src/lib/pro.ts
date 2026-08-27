/**
 * The paid tier.
 *
 * The site's whole traffic story is organic search on component pages, so the
 * rule this module exists to enforce is: a Pro component's PAGE stays public
 * and indexable — title, description, tags, live preview, "when to use it",
 * "what breaks in production" — and only the source and the install command
 * are held back. Hiding the page would trade the one asset that brings
 * readers here for a lock icon nobody would ever see.
 *
 * That rule has a consequence the UI cannot fudge: locked source must never
 * reach the browser. It is not blurred client-side — it is not rendered at
 * all, and arrives only from /api/pro/source once a key checks out. Anything
 * a server component passes to a client component ships in the RSC payload,
 * where "hidden" code is one View Source away.
 */

export type Tier = "free" | "pro";

/**
 * The two tiers, and what each one actually entitles you to.
 *
 * Written as data rather than as page copy because the same list has to
 * appear in three places — /pro, the unlock dialog, and any future checkout —
 * and three hand-maintained copies is how a page ends up promising something
 * the other two do not.
 *
 * The entitlements below describe SCOPE, not inventory: "every Pro template"
 * is a true statement about what the licence covers, including items added
 * later, and it stays true on the day there is one template and on the day
 * there are ten. What is in Pro *today* is counted from the registry at
 * render time (see /pro) rather than written here, so the page cannot drift
 * out of date and cannot oversell.
 *
 * Scope has one limit, and it is why there is no line here about Pro BLOCKS:
 * a category with nothing in it reads as inventory, not scope. "Every Pro
 * block, full source" is legally true of an empty shelf and worthless to the
 * person who just paid to see it — a buyer who clicks that line and finds
 * nothing has not been oversold, they have been shortchanged, and they will
 * read the rest of the list as sales copy. "Everything added to Pro later"
 * already covers blocks for everyone buying today, so nothing about the
 * licence shrank when the line went. Add it back the day the first one ships,
 * not before.
 *
 * Components stay on the list because the shelf is no longer empty: the
 * streaming Markdown renderer, the citation popover, the approval gate and
 * the cost meter. The test is whether the category is empty, not whether it
 * is short.
 */

export const FREE_PLAN = {
  name: "Free",
  priceCents: 0,
  currency: "USD",
  billing: "Free forever",
  features: [
    "Every free component, full source",
    "MIT licensed — commercial use, no attribution",
    "shadcn CLI install, or just copy the file",
    "No dependencies to add, no theme layer to fight",
    "No account, no email, no sign-up",
  ],
} as const;

export const PRO_PLAN = {
  name: "Pro",
  /**
   * Cents, so the display and the checkout agree on one number.
   *
   * $99, per the ladder in docs/pro-roadmap.md: five templates and the first
   * batch of Pro components. The $79 rung was earned and never taken, so this
   * is one raise rather than two — which matters, because /pro tells buyers
   * the price rises as items land, and a promise like that is spent the first
   * time it is not kept.
   */
  priceCents: 9900,
  currency: "USD",
  /** One-time. A subscription would promise a release cadence not yet earned. */
  billing: "One-time payment",
  features: [
    "Everything in Free, unchanged",
    "Every Pro template — complete apps, wired to the AI SDK",
    "Every Pro component, full source",
    "Everything added to Pro later, at no extra cost",
    "shadcn CLI install for every Pro item",
    "Single developer, unlimited projects",
    "Commercial use, including client work",
  ],
} as const;

export function formatPrice(cents: number, currency = PRO_PLAN.currency): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);
}

export const PRO_PRICE = formatPrice(PRO_PLAN.priceCents);
export const FREE_PRICE = formatPrice(FREE_PLAN.priceCents);

/** Where "Get Pro" goes. Empty until a checkout exists — the button then
 *  points at /pro rather than dead-ending on a href of "". */
export const CHECKOUT_URL = process.env.NEXT_PUBLIC_CHECKOUT_URL ?? "";

export function isProTier(tier: Tier | undefined): boolean {
  return tier === "pro";
}
