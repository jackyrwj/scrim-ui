"use client";

import * as React from "react";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type StreamingMessageProps = {
  text: string;
  isStreaming?: boolean;
  stopped?: boolean;
  speed?: number;
  onStop?: () => void;
  onRegenerate?: () => void;
  onComplete?: () => void;
  showActions?: boolean;
  avatar?: React.ReactNode;
  className?: string;
};

/* ------------------------------------------------------------------ */
/* Caret                                                               */
/* ------------------------------------------------------------------ */

function Caret() {
  return (
    <>
      <style>{`@keyframes aiui-caret{50%{opacity:0}}`}</style>
      <span
        aria-hidden
        className="ml-0.5 inline-block h-[1em] w-[2px] translate-y-[2px] rounded-full bg-current"
        style={{ animation: "aiui-caret 1s steps(1) infinite" }}
      />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* StreamingMessage                                                    */
/* ------------------------------------------------------------------ */

export function StreamingMessage({
  text,
  isStreaming = false,
  stopped = false,
  speed = 1,
  onStop,
  onRegenerate,
  onComplete,
  showActions = true,
  avatar,
  className = "",
}: StreamingMessageProps) {
  const [count, setCount] = React.useState(isStreaming ? 0 : text.length);
  const doneRef = React.useRef(false);

  /* Adjust state during render whenever the target text or flag changes,
     so the reveal resets without a setState-in-effect */
  const [prev, setPrev] = React.useState<{ text: string; isStreaming: boolean }>({
    text,
    isStreaming,
  });
  if (prev.text !== text || prev.isStreaming !== isStreaming) {
    setPrev({ text, isStreaming });
    setCount(isStreaming ? 0 : text.length);
  }

  /* Reveal loop */
  React.useEffect(() => {
    if (!isStreaming) return;
    doneRef.current = false;
    const tick = window.setInterval(() => {
      setCount((c) => Math.min(c + speed, text.length));
    }, 16);
    return () => window.clearInterval(tick);
  }, [isStreaming, text, speed]);

  /* Fire onComplete once when the reveal finishes */
  React.useEffect(() => {
    if (isStreaming && count >= text.length && !doneRef.current) {
      doneRef.current = true;
      onComplete?.();
    }
  }, [isStreaming, count, text, onComplete]);

  const displayed = text.slice(0, count);

  return (
    <div className={`flex items-start gap-3 ${className}`}>
      {avatar ?? (
        <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-lg bg-zinc-900 text-xs font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900">
          AI
        </div>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium">Assistant</span>
          {isStreaming && (
            <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />
              Generating
            </span>
          )}
          {stopped && (
            <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
              Stopped generating
            </span>
          )}
        </div>

        <div className="mt-1.5 whitespace-pre-wrap rounded-2xl rounded-tl-md border border-zinc-200 bg-zinc-50 px-4 py-3 text-[15px] leading-6 text-zinc-800 dark:border-zinc-800 dark:bg-zinc-800/60 dark:text-zinc-100">
          {displayed}
          {isStreaming && <Caret />}
        </div>

        {/* Actions row */}
        {!isStreaming && showActions && onRegenerate && (
          <div className="mt-2 flex items-center gap-1">
            <button
              type="button"
              onClick={onRegenerate}
              className="inline-flex h-7 items-center gap-1.5 rounded-lg px-2 text-xs text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
                <path d="M21 12a9 9 0 1 1-2.64-6.36L21 8" />
                <path d="M21 3v5h-5" />
              </svg>
              Regenerate
            </button>
          </div>
        )}

        {/* Stop pill */}
        {isStreaming && onStop && (
          <button
            type="button"
            onClick={onStop}
            className="mt-2 inline-flex h-7 items-center gap-1.5 rounded-lg border border-zinc-200 px-2.5 text-xs text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" width="10" height="10">
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
            Stop generating
          </button>
        )}
      </div>
    </div>
  );
}
