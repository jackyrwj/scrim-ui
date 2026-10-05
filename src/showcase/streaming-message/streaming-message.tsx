"use client";

import { Button } from "@/components/ui/button";
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
      <style>{`@keyframes aiui-caret{50%{opacity:0}} @media(prefers-reduced-motion:reduce){.scrim-stream-caret{animation:none!important}}`}</style>
      <span
        aria-hidden
        className="scrim-stream-caret ml-0.5 inline-block h-[1em] w-[2px] translate-y-[2px] rounded-full bg-current"
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
      {avatar && <div className="shrink-0">{avatar}</div>}

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">Assistant</span>
          {isStreaming && (
            <span className="inline-flex items-center gap-1 px-0 py-0.5 text-xs text-muted-foreground">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />
              Generating
            </span>
          )}
          {stopped && (
            <span className="px-0 py-0.5 text-xs text-muted-foreground">
              Stopped generating
            </span>
          )}
        </div>

        <div className="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-foreground">
          {displayed}
          {isStreaming && <Caret />}
        </div>

        {/* Actions row */}
        {!isStreaming && showActions && onRegenerate && (
          <div className="mt-2 flex items-center gap-1">
            <Button variant="ghost" size="sm"
              type="button"
              onClick={onRegenerate}
              className="inline-flex min-h-8 items-center gap-1.5 rounded-md px-2 text-xs text-muted-foreground transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring hover:bg-muted hover:text-foreground"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="15" height="15">
                <path d="M21 12a9 9 0 1 1-2.64-6.36L21 8" />
                <path d="M21 3v5h-5" />
              </svg>
              Regenerate
            </Button>
          </div>
        )}

        {/* Stop pill */}
        {isStreaming && onStop && (
          <Button variant="outline" size="sm"
            type="button"
            onClick={onStop}
            className="mt-2 inline-flex min-h-8 items-center gap-1.5 rounded-md border border-border px-2.5 text-xs text-muted-foreground transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring hover:bg-muted"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" width="10" height="10">
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
            Stop generating
          </Button>
        )}
      </div>
    </div>
  );
}
