import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ApiTokenPanel } from "@/components/account/api-token-panel";
import { CheckoutStatus } from "@/components/account/checkout-status";
import {
  getDashboardData,
  listApiTokens,
  type DashboardData,
} from "@/lib/account-store.server";
import { clerkConfigured, getViewer } from "@/lib/auth.server";
import { databaseConfigured } from "@/lib/db.server";
import { PRO_PRICE } from "@/lib/pro";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

const emptyDashboard: DashboardData = { hasPro: false, purchases: [] };

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string }>;
}) {
  if (!clerkConfigured()) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20">
        <h1 className="text-3xl font-bold">Dashboard setup required</h1>
        <p className="mt-3 text-(--muted-foreground)">
          Clerk is not configured on this deployment yet.
        </p>
      </div>
    );
  }

  const viewer = await getViewer();
  if (!viewer) redirect("/sign-in");
  const query = await searchParams;

  let data = emptyDashboard;
  let tokens: Awaited<ReturnType<typeof listApiTokens>> = [];
  let setupError: string | null = null;
  if (!databaseConfigured()) {
    setupError = "The account database is not configured yet.";
  } else {
    try {
      [data, tokens] = await Promise.all([
        getDashboardData(viewer.id),
        listApiTokens(viewer.id),
      ]);
    } catch (error) {
      console.error("[dashboard] Could not load account data:", error);
      setupError = "The account database is unavailable or its migration has not been applied.";
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-(--muted-foreground)">{viewer.email}</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">Your Scrim UI account</h1>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            data.hasPro ? "bg-(--primary)/10 text-(--primary)" : "bg-(--muted)"
          }`}
        >
          {data.hasPro ? "Pro" : "Free"}
        </span>
      </div>

      <div className="mt-8">
        <CheckoutStatus active={query.checkout === "success" && !data.hasPro} />
        {setupError && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-600">
            {setupError}
          </div>
        )}
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <section className="rounded-2xl border border-(--border) p-6">
          <h2 className="font-semibold">Plan</h2>
          {data.hasPro ? (
            <>
              <p className="mt-4 text-3xl font-bold">Pro</p>
              <p className="mt-2 text-sm text-(--muted-foreground)">
                Lifetime access to every Pro component and template.
              </p>
              <div className="mt-5 flex gap-4 text-sm font-medium">
                <Link href="/components" className="underline">Components</Link>
                <Link href="/templates" className="underline">Templates</Link>
              </div>
            </>
          ) : (
            <>
              <p className="mt-4 text-3xl font-bold">Free</p>
              <p className="mt-2 text-sm text-(--muted-foreground)">
                Upgrade once for lifetime Pro access.
              </p>
              <form action="/api/checkout/session" method="post" className="mt-5">
                <button className="h-10 rounded-xl bg-(--accent) px-5 text-sm font-semibold text-(--accent-foreground)">
                  Get Pro — {PRO_PRICE}
                </button>
              </form>
            </>
          )}
        </section>

        <section className="rounded-2xl border border-(--border) p-6">
          <h2 className="font-semibold">Purchases</h2>
          {data.purchases.length === 0 ? (
            <p className="mt-4 text-sm text-(--muted-foreground)">No purchases yet.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {data.purchases.map((purchase) => (
                <div key={purchase.id} className="flex items-center justify-between gap-4 text-sm">
                  <div>
                    <p className="font-medium">
                      {(purchase.amountTotal / 100).toLocaleString("en-US", {
                        style: "currency",
                        currency: purchase.currency,
                      })}
                    </p>
                    <p className="text-xs text-(--muted-foreground)">
                      {new Date(purchase.createdAt).toLocaleDateString("en-US")} · {purchase.status}
                    </p>
                  </div>
                  {purchase.hasInvoice && (
                    <a href={`/api/account/invoice/${purchase.id}`} className="text-xs underline">
                      Invoice
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {data.hasPro && (
        <div className="mt-5">
          <ApiTokenPanel initialTokens={tokens} />
        </div>
      )}

      <section className="mt-5 rounded-2xl border border-(--border) p-6">
        <h2 className="font-semibold">Legacy licence keys</h2>
        <p className="mt-2 text-sm text-(--muted-foreground)">
          Keys issued before accounts remain valid. You can still paste one on the Pricing page;
          new purchases are attached directly to your account.
        </p>
      </section>
    </div>
  );
}
