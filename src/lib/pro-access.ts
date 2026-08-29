"use client";

import * as React from "react";

/**
 * The reader's Pro entitlement, shared by every locked surface on the page.
 *
 * A module store rather than context, for the same reason
 * lib/package-managers.ts uses one: the gated surfaces (the install command
 * near the top, the source block far below it) sit on opposite sides of a
 * server component, and threading a provider between them would mean turning
 * the whole page into a client tree to share one answer.
 *
 * The answer is a convenience cache, never the authority. Every actual unlock
 * is decided by the server in /api/pro/source, which re-checks the account on
 * each request.
 */

const listeners = new Set<() => void>();
type AccountState = { checked: boolean; authenticated: boolean; hasPro: boolean };
const SERVER_ACCOUNT_STATE: AccountState = { checked: false, authenticated: false, hasPro: false };
let accountState: AccountState = { checked: false, authenticated: false, hasPro: false };
let accountRequest: Promise<void> | null = null;

function emit() {
  for (const l of listeners) l();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

async function loadAccountAccess(force = false) {
  if (accountRequest) return accountRequest;
  if (!force && accountState.checked) return;
  accountRequest = fetch("/api/account/entitlement", { cache: "no-store" })
    .then(async (response) => {
      const data = (await response.json().catch(() => null)) as {
        authenticated?: boolean;
        hasPro?: boolean;
      } | null;
      accountState = {
        checked: true,
        authenticated: Boolean(data?.authenticated),
        hasPro: response.ok && Boolean(data?.hasPro),
      };
      emit();
    })
    .catch(() => {
      accountState = { checked: true, authenticated: false, hasPro: false };
      emit();
    })
    .finally(() => {
      accountRequest = null;
    });
  return accountRequest;
}

export type ProAccess = {
  checking: boolean;
  unlocked: boolean;
  authenticated: boolean;
  /** Stable identity of the access grant, used to key fetched artifacts. */
  identity: "account" | null;
};

/** Browser access is the signed-in account's entitlement. */
export function useProAccess(): ProAccess {
  const account = React.useSyncExternalStore(
    subscribe,
    () => accountState,
    () => SERVER_ACCOUNT_STATE,
  );
  React.useEffect(() => {
    /* Recheck on every gated-page mount so an SPA sign-in or a just-completed
       checkout cannot leave a stale anonymous/free result in the module. */
    void loadAccountAccess(true);
  }, []);

  if (account.hasPro) {
    return {
      checking: false,
      unlocked: true,
      authenticated: true,
      identity: "account",
    };
  }
  return {
    checking: !account.checked,
    unlocked: false,
    authenticated: account.authenticated,
    identity: null,
  };
}

export async function refreshAccountAccess() {
  accountState = { ...accountState, checked: false };
  emit();
  await loadAccountAccess(true);
}
