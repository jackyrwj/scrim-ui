"use client";

import * as React from "react";

/**
 * "I lost my key."
 *
 * With no accounts, the key is the only thing a customer holds — so the
 * moment they lose it, the site is useless to them and their only remaining
 * option is to email a human. This is that option, automated.
 *
 * The confirmation deliberately does not say whether the address had a
 * licence: /api/license/recover answers identically either way so the
 * endpoint cannot be used to test who bought, and a message that promised
 * more than the server does would just be a lie in the UI layer.
 */
export function RecoverForm() {
  const [email, setEmail] = React.useState("");
  const [sent, setSent] = React.useState(false);
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      const response = await fetch("/api/license/recover", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (response.ok) setSent(true);
      else {
        const data: unknown = await response.json().catch(() => null);
        setError((data as { error?: string } | null)?.error ?? "Something went wrong. Try again.");
      }
    } catch {
      setError("Could not reach the server. Try again.");
    }
    setPending(false);
  }

  if (sent) {
    return (
      <p className="rounded-lg border border-(--border) bg-(--muted)/40 px-4 py-3 text-sm text-(--muted-foreground)">
        If <span className="text-(--foreground)">{email}</span> has a licence, the key is on its way
        to that address.
      </p>
    );
  }

  return (
    <form onSubmit={submit}>
      <div className="flex gap-2">
        <label htmlFor="recover-email" className="sr-only">
          Email address
        </label>
        <input
          id="recover-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
          className="h-10 min-w-0 flex-1 rounded-lg border border-(--border) bg-(--background) px-3 text-[13px] outline-none placeholder:text-(--muted-foreground) focus:border-(--primary)"
        />
        <button
          type="submit"
          disabled={pending}
          className="h-10 shrink-0 rounded-lg border border-(--border) px-4 text-sm font-medium transition-colors hover:bg-(--muted) disabled:opacity-50"
        >
          {pending ? "Sending..." : "Send it"}
        </button>
      </div>
      {error && (
        <p role="alert" className="mt-2 text-xs text-red-500">
          {error}
        </p>
      )}
    </form>
  );
}
