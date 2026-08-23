"use client";

import * as React from "react";
import { trackEvent } from "@/lib/analytics";
import { copyText } from "@/lib/clipboard";

export function CopyButton({
  code,
  label = "Copy",
  disabled = false,
}: {
  code: string;
  label?: string;
  disabled?: boolean;
}) {
  const [copied, setCopied] = React.useState(false);

  async function copy() {
    if (disabled) return;
    await copyText(code);
    setCopied(true);
    trackEvent("copy_code", { label });
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={copy}
      disabled={disabled}
      className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-(--border) bg-(--background) px-3 text-xs font-medium text-(--foreground) transition-colors hover:bg-(--muted) disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-(--background)"
    >
      {copied ? (
        <>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5" />
          </svg>
          Copied
        </>
      ) : (
        <>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="14" height="14" x="8" y="8" rx="2" />
            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
          </svg>
          {label}
        </>
      )}
    </button>
  );
}
