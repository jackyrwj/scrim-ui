"use client";

import * as React from "react";

/**
 * The reader's package manager, shared by every surface that prints a command.
 *
 * Two surfaces now quote an install command — the bar under the title and the
 * agent prompt in the Explorer — and they must agree. Local state in each
 * would have let the bar say `pnpm dlx` while the prompt handed an agent
 * `npx`, which is the kind of mismatch nobody notices until it has been
 * pasted into a repo.
 *
 * A module-level store rather than context because the two surfaces are on
 * opposite sides of a server component: threading a provider through
 * page.tsx would mean making the page's whole subtree client-rendered to
 * share one string.
 */
export const MANAGERS = {
  npm: (url: string) => `npx shadcn@latest add ${url}`,
  pnpm: (url: string) => `pnpm dlx shadcn@latest add ${url}`,
  yarn: (url: string) => `yarn dlx shadcn@latest add ${url}`,
  bun: (url: string) => `bunx --bun shadcn@latest add ${url}`,
} as const;

export type Manager = keyof typeof MANAGERS;

export const MANAGER_NAMES = Object.keys(MANAGERS) as Manager[];

const STORAGE_KEY = "scrim-ui:package-manager";

function isManager(value: string | null): value is Manager {
  return value !== null && value in MANAGERS;
}

let current: Manager = "npm";
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

/**
 * Read once, lazily, on the first subscribe after hydration. Not at module
 * scope: this module is imported during the server render, where `window`
 * does not exist, and seeding from storage before hydration would make the
 * client's first paint disagree with the prerendered HTML.
 */
let restored = false;

function restore() {
  if (restored) return;
  restored = true;
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (isManager(saved) && saved !== current) {
      current = saved;
      emit();
    }
  } catch {
    /* Private mode and blocked storage are not worth a broken page. */
  }
}

export function setPackageManager(next: Manager) {
  if (next === current) return;
  current = next;
  emit();
  try {
    window.localStorage.setItem(STORAGE_KEY, next);
  } catch {
    /* The preference is a convenience, not state anything depends on. */
  }
}

/** Subscribes to the shared choice. Renders "npm" on the server and on the
 *  first client pass, then settles to the stored value in an effect. */
export function usePackageManager(): Manager {
  const manager = React.useSyncExternalStore(
    subscribe,
    () => current,
    () => "npm" as Manager,
  );
  React.useEffect(restore, []);
  return manager;
}

/** The install command for a registry item under the current choice. */
export function installCommand(manager: Manager, url: string): string {
  return MANAGERS[manager](url);
}
