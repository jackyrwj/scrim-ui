"use client";

import * as React from "react";
import { setLicense, useLicense, verifyLicense } from "@/lib/pro-access";
import { trackEvent } from "@/lib/analytics";

/**
 * The licence key field on /pro, and the only place to clear a stored key.
 *
 * Separate from the dialog's copy of the same form because the two differ in
 * what they know: the dialog is asked from a locked component and closes on
 * success, while this one has no component to return to and instead has to
 * say what it did.
 */
export function LicenseForm() {
  const license = useLicense();
  const [key, setKey] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [pending, setPending] = React.useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const result = await verifyLicense(key);
    setPending(false);
    if (result.valid) {
      trackEvent("pro_unlocked", { item: "/pro" });
      setKey("");
    } else {
      setError(result.error);
    }
  }

  if (license) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-(--border) bg-(--muted)/40 px-4 py-3">
        <span className="text-sm">
          Pro is unlocked in this browser.{" "}
          <span className="font-mono text-xs text-(--muted-foreground)">
            {license.slice(0, 4)}…{license.slice(-4)}
          </span>
        </span>
        <button
          type="button"
          onClick={() => setLicense(null)}
          className="text-xs font-medium text-(--muted-foreground) underline transition-colors hover:text-(--foreground)"
        >
          Remove key
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit}>
      <div className="flex gap-2">
        <label htmlFor="pro-license-key" className="sr-only">
          Licence key
        </label>
        <input
          id="pro-license-key"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="SCRIM-XXXX-XXXX-XXXX"
          autoComplete="off"
          spellCheck={false}
          className="h-10 min-w-0 flex-1 rounded-lg border border-(--border) bg-(--background) px-3 font-mono text-[13px] outline-none placeholder:text-(--muted-foreground) focus:border-(--primary)"
        />
        <button
          type="submit"
          disabled={pending}
          className="h-10 shrink-0 rounded-lg bg-(--accent) px-4 text-sm font-semibold text-(--accent-foreground) transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {pending ? "Checking..." : "Unlock"}
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
