"use client";

import * as React from "react";
import { trackEvent } from "@/lib/analytics";
import { copyText } from "@/lib/clipboard";

/**
 * The copy control that lives in a code block's corner.
 *
 * Icon-only and quiet until the block is hovered or the button is focused —
 * it should not compete with the code for attention, but it must never be
 * keyboard-invisible, hence the focus-visible escape from the fade.
 */
export function CodeCopyButton({ code, label = "Copy code" }: { code: string; label?: string }) {
  const [copied, setCopied] = React.useState(false);

  async function copy() {
    await copyText(code);
    setCopied(true);
    trackEvent("copy_code", { label });
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? "Copied" : label}
      className="inline-flex h-7 shrink-0 items-center gap-1.5 rounded-md px-2 text-[11px] font-medium text-zinc-300 opacity-0 transition hover:bg-white/10 hover:text-white focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/60 group-hover:opacity-100"
    >
      {copied ? (
        <>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M20 6 9 17l-5-5" />
          </svg>
          Copied
        </>
      ) : (
        <>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <rect width="13" height="13" x="9" y="9" rx="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
          Copy
        </>
      )}
    </button>
  );
}
