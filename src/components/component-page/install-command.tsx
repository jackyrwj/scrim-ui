"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { trackEvent } from "@/lib/analytics";
import { copyText } from "@/lib/clipboard";
import {
  MANAGER_NAMES,
  installCommand,
  setPackageManager,
  usePackageManager,
} from "@/lib/package-managers";

/**
 * The one-line install command for a registry component.
 *
 * Every published component is already served as a shadcn registry item at
 * /r/<slug>.json — but that endpoint was invisible from the component page,
 * so the only discoverable path to using a component was copying its source
 * out of the "Component source" block by hand. This is the shortcut.
 *
 * The package manager is a per-visitor preference, not per-page, and it is
 * also quoted by the agent prompt inside the Explorer — hence the shared
 * store in lib/package-managers.ts rather than state that lives here.
 */
export function InstallCommand({ url }: { url: string }) {
  const manager = usePackageManager();
  const [copied, setCopied] = React.useState(false);
  const pathname = usePathname();

  const command = installCommand(manager, url);

  async function copy() {
    await copyText(command);
    setCopied(true);
    trackEvent("copy_install_command", { label: manager, item: pathname });
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="overflow-hidden rounded-xl border border-(--border) bg-(--muted)/30">
      <div
        role="tablist"
        aria-label="Package manager"
        className="flex items-center gap-1 border-b border-(--border) px-2 py-1.5"
      >
        {MANAGER_NAMES.map((name) => (
          <button
            key={name}
            type="button"
            role="tab"
            aria-selected={manager === name}
            onClick={() => setPackageManager(name)}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
              manager === name
                ? "bg-(--background) text-(--foreground) shadow-sm"
                : "text-(--muted-foreground) hover:text-(--foreground)"
            }`}
          >
            {name}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-3 px-3 py-2.5">
        <code className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap font-mono text-[13px] text-(--foreground)">
          {command}
        </code>
        <button
          type="button"
          onClick={copy}
          aria-label={copied ? "Copied" : "Copy install command"}
          className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-(--border) bg-(--background) px-3 text-xs font-medium text-(--foreground) transition-colors hover:bg-(--muted)"
        >
          {copied ? (
            <>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M20 6 9 17l-5-5" />
              </svg>
              Copied
            </>
          ) : (
            <>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <rect width="14" height="14" x="8" y="8" rx="2" />
                <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
              </svg>
              Copy
            </>
          )}
        </button>
      </div>
    </div>
  );
}
