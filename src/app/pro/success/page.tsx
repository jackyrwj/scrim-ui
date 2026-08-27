import type { Metadata } from "next";
import { CheckoutReturn } from "@/components/pro/checkout-return";

export const metadata: Metadata = {
  title: "Thank you",
  /* Nothing here belongs in an index — it is a receipt, and it exists only
     for the person holding the session id. */
  robots: { index: false, follow: false },
};

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id: sessionId } = await searchParams;

  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center sm:px-6">
      <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-(--accent)/10 text-(--accent)">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M20 6 9 17l-5-5" />
        </svg>
      </div>
      <h1 className="mt-5 text-3xl font-bold tracking-tight">You&apos;re in.</h1>
      <p className="mt-3 text-(--muted-foreground)">
        {/* The one page where an overstatement is read with the receipt still
            open. Everything Pro holds today, and everything it gains, in a
            sentence that stays true either way — no blocks, because there are
            none. */}
        Every Pro component and template is yours, along with everything added to Pro later — this
        machine and every other one.
      </p>

      <CheckoutReturn sessionId={sessionId ?? null} />
    </div>
  );
}
