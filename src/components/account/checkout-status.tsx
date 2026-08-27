"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

export function CheckoutStatus({ active }: { active: boolean }) {
  const router = useRouter();
  const [slow, setSlow] = React.useState(false);

  React.useEffect(() => {
    if (!active) return;
    let cancelled = false;
    let attempts = 0;

    async function poll() {
      attempts += 1;
      try {
        const response = await fetch("/api/account/entitlement", { cache: "no-store" });
        const result = (await response.json()) as { hasPro?: boolean };
        if (cancelled) return;
        if (result.hasPro) {
          router.replace("/dashboard");
          router.refresh();
          return;
        }
      } catch {
        // The next attempt covers a transient network failure.
      }

      if (attempts >= 20) setSlow(true);
      else setTimeout(poll, 1500);
    }

    void poll();
    return () => {
      cancelled = true;
    };
  }, [active, router]);

  if (!active) return null;
  return (
    <div className="mb-6 rounded-xl border border-(--primary)/30 bg-(--primary)/5 px-4 py-3 text-sm">
      {slow
        ? "Payment received. Your account is taking longer than usual to update; refresh this page in a moment."
        : "Payment received. Finishing your Pro access…"}
    </div>
  );
}
