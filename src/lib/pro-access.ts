"use client";

import * as React from "react";

/**
 * The reader's licence, shared by every locked surface on the page.
 *
 * A module store rather than context, for the same reason
 * lib/package-managers.ts uses one: the gated surfaces (the install command
 * near the top, the source block far below it) sit on opposite sides of a
 * server component, and threading a provider between them would mean turning
 * the whole page into a client tree to share one string.
 *
 * The key is a convenience cache, never the authority. It is stored so a
 * returning reader is not asked again; every actual unlock is decided by the
 * server in /api/pro/source, which re-checks the key on each request. A
 * forged localStorage entry buys nothing but a spinner.
 */

const STORAGE_KEY = "scrim-ui:license";

let current: string | null = null;
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Read lazily, after hydration — this module is imported during the server
 *  render, and seeding from storage earlier would make the first client paint
 *  disagree with the prerendered HTML. */
let restored = false;

function restore() {
  if (restored) return;
  restored = true;
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved && saved !== current) {
      current = saved;
      emit();
    }
  } catch {
    /* Blocked storage costs the reader a re-entry, not a broken page. */
  }
}

export function setLicense(key: string | null) {
  current = key;
  emit();
  try {
    if (key) window.localStorage.setItem(STORAGE_KEY, key);
    else window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* Same as above. */
  }
}

/** The stored key, or null. Renders null on the server and on the first
 *  client pass, then settles in an effect. */
export function useLicense(): string | null {
  const key = React.useSyncExternalStore(
    subscribe,
    () => current,
    () => null,
  );
  React.useEffect(restore, []);
  return key;
}

export type VerifyResult = { valid: true; plan: string } | { valid: false; error: string };

/** Checks a key with the server and, when it holds, stores it. */
export async function verifyLicense(key: string): Promise<VerifyResult> {
  const trimmed = key.trim();
  if (!trimmed) return { valid: false, error: "Enter a licence key." };

  let response: Response;
  try {
    response = await fetch("/api/license/verify", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ key: trimmed }),
    });
  } catch {
    return { valid: false, error: "Could not reach the server. Try again." };
  }

  const data: unknown = await response.json().catch(() => null);
  const parsed = data as { valid?: boolean; plan?: string; error?: string } | null;

  if (parsed?.valid) {
    setLicense(trimmed);
    return { valid: true, plan: parsed.plan ?? "pro" };
  }
  return { valid: false, error: parsed?.error ?? "That key was not recognised." };
}
