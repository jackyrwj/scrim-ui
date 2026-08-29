"use client";

import { Show, UserButton } from "@clerk/nextjs";
import Link from "next/link";

const menuRow =
  "rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-(--muted)";

export function AccountNav({ mobile = false }: { mobile?: boolean }) {
  if (mobile) {
    /* Rendered inside the mobile menu dropdown — the header bar's own Sign in
       button is sm-hidden, so this is the only entry point on phones. The
       signed-in avatar stays in the header bar at every width, so the mobile
       section carries links only. */
    return (
      <Show when="signed-out">
        <Link href="/sign-in" className={menuRow}>
          Sign in
        </Link>
      </Show>
    );
  }

  return (
    <>
      <Show when="signed-out">
        <Link
          href="/sign-in"
          className="hidden h-8 items-center rounded-md border border-(--border) px-3 text-xs font-medium transition-colors hover:bg-(--muted) sm:flex"
        >
          Sign in
        </Link>
      </Show>
      <Show when="signed-in">
        {/* afterSignOutUrl is a ClerkProvider option in Clerk v7 — set it
            there when the provider is wired up, not on UserButton. */}
        <UserButton />
      </Show>
    </>
  );
}
