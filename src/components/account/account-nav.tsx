"use client";

import { Show, UserButton } from "@clerk/nextjs";
import Link from "next/link";

export function AccountNav() {
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
        <Link
          href="/dashboard"
          className="hidden text-xs font-medium text-(--muted-foreground) transition-colors hover:text-(--foreground) sm:block"
        >
          Dashboard
        </Link>
        {/* afterSignOutUrl is a ClerkProvider option in Clerk v7 — set it
            there when the provider is wired up, not on UserButton. */}
        <UserButton />
      </Show>
    </>
  );
}
