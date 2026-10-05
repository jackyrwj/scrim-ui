"use client";

import { Button } from "@/components/ui/button";
import * as React from "react";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type MessageActionsProps = {
  /** Dim the actions while the message is still streaming. */
  disabled?: boolean;
  /** Compact mode shows icon-only buttons. */
  compact?: boolean;
  onCopy?: () => void;
  onRegenerate?: () => void;
  onShare?: () => void;
  onFeedback?: (vote: "up" | "down") => void;
  className?: string;
};

/* ------------------------------------------------------------------ */
/* Icons                                                               */
/* ------------------------------------------------------------------ */

function CopyIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round" width="15" height="15">
      <rect x="9" y="9" width="15" height="15" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function RegenerateIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round" width="15" height="15">
      <path d="M21 12a9 9 0 1 1-2.64-6.36L21 8" />
      <path d="M21 3v5h-5" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round" width="15" height="15">
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <path d="M16 6l-4-4-4 4" />
      <path d="M12 2v13" />
    </svg>
  );
}

function ThumbsUpIcon({ filled }: { filled?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true" strokeLinecap="round"
      strokeLinejoin="round"
      width="15"
      height="15"
    >
      <path d="M7 10v12" />
      <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z" />
    </svg>
  );
}

function ThumbsDownIcon({ filled }: { filled?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true" strokeLinecap="round"
      strokeLinejoin="round"
      width="15"
      height="15"
    >
      <path d="M17 14V2" />
      <path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22a3.13 3.13 0 0 1-3-3.88Z" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* MessageActions                                                      */
/* ------------------------------------------------------------------ */

export function MessageActions({
  disabled = false,
  compact = false,
  onCopy,
  onRegenerate,
  onShare,
  onFeedback,
  className = "",
}: MessageActionsProps) {
  const [copied, setCopied] = React.useState(false);
  const [vote, setVote] = React.useState<"up" | "down" | null>(null);

  const copy = () => {
    onCopy?.();
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  const base =
    "inline-flex min-h-8 items-center gap-1.5 rounded-md px-2 text-sm text-muted-foreground transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";
  const idle = "hover:bg-muted hover:text-foreground";
  const disabledCls = disabled ? "cursor-not-allowed opacity-50 hover:bg-transparent hover:text-muted-foreground" : idle;

  return (
    <div className={`flex flex-wrap items-center gap-1 ${className}`}>
      {/* aria-label on all three, not just in compact mode: `compact` hides the
          text and leaves a button whose only content is an svg, so without it
          a screen reader announces an unnamed button. Harmless when the text is
          showing — an explicit label simply wins over the inner text. */}
      {onCopy && (
        <Button variant="ghost" size="icon-sm"
          type="button"
          onClick={copy}
          disabled={disabled}
          aria-label={copied ? "Copied" : "Copy"}
          className={`min-h-6 min-w-6 ${base} ${disabledCls}`}
        >
          <CopyIcon />
          {!compact && (copied ? "Copied" : "Copy")}
        </Button>
      )}
      {onRegenerate && (
        <Button variant="ghost" size="icon-sm"
          type="button"
          onClick={onRegenerate}
          disabled={disabled}
          title="Regenerate"
          aria-label="Regenerate"
          className={`min-h-6 min-w-6 ${base} ${disabledCls}`}
        >
          <RegenerateIcon />
          {!compact && "Regenerate"}
        </Button>
      )}
      {onFeedback && (
        <>
          <Button variant="ghost" size="icon-sm"
            type="button"
            onClick={() => {
              onFeedback("up");
              setVote((v) => (v === "up" ? null : "up"));
            }}
            disabled={disabled}
            aria-label="Good response"
            aria-pressed={vote === "up"}
            className={`min-h-6 min-w-6 ${base} ${disabledCls} ${vote === "up" ? "bg-muted text-foreground" : ""}`}
          >
            <ThumbsUpIcon filled={vote === "up"} />
          </Button>
          <Button variant="ghost" size="icon-sm"
            type="button"
            onClick={() => {
              onFeedback("down");
              setVote((v) => (v === "down" ? null : "down"));
            }}
            disabled={disabled}
            aria-label="Bad response"
            aria-pressed={vote === "down"}
            className={`min-h-6 min-w-6 ${base} ${disabledCls} ${vote === "down" ? "bg-muted text-foreground" : ""}`}
          >
            <ThumbsDownIcon filled={vote === "down"} />
          </Button>
        </>
      )}
      {onShare && (
        <Button variant="ghost" size="icon-sm"
          type="button"
          onClick={onShare}
          disabled={disabled}
          title="Share"
          aria-label="Share"
          className={`min-h-6 min-w-6 ${base} ${disabledCls}`}
        >
          <ShareIcon />
          {!compact && "Share"}
        </Button>
      )}
    </div>
  );
}
