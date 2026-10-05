"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import * as React from "react";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type VoiceInputState = "idle" | "recording";

export type VoiceInputProps = {
  state?: VoiceInputState;
  onStart?: () => void;
  onStop?: () => void;
  onCancel?: () => void;
  recordingTime?: string;
  transcript?: string;
  className?: string;
};

/* ------------------------------------------------------------------ */
/* Icons                                                               */
/* ------------------------------------------------------------------ */

function MicIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      width="16"
      height="16"
      {...props}
    >
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <path d="M12 19v3" />
    </svg>
  );
}

function StopIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="11" height="11" {...props}>
      <rect x="6" y="6" width="12" height="12" rx="2" />
    </svg>
  );
}

function XIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      width="12"
      height="12"
      {...props}
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Bars                                                               */
/* ------------------------------------------------------------------ */

function Bars({ active }: { active: boolean }) {
  return (
    <>
      <style>{`@keyframes aiui-bar{0%,100%{transform:scaleY(.35)}50%{transform:scaleY(1)}}`}</style>
      <div className="flex h-5 items-center gap-[3px]" aria-hidden>
        {Array.from({ length: 9 }).map((_, i) => (
          <span
            key={i}
            className="w-[3px] rounded-full bg-current"
            style={{
              height: "100%",
              transform: "scaleY(.35)",
              transformOrigin: "center",
              animation: active ? `aiui-bar 0.8s ease-in-out ${i * 0.06}s infinite` : "none",
              opacity: active ? 1 : 0.3,
            }}
          />
        ))}
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* VoiceInput                                                          */
/* ------------------------------------------------------------------ */

export function VoiceInput({
  state = "idle",
  onStart,
  onStop,
  onCancel,
  recordingTime = "0:07",
  transcript = "",
  className = "",
}: VoiceInputProps) {
  if (state === "recording") {
    return (
      <Card
        className={`gap-0 py-0 rounded-xl border border-red-200 bg-card p-3 dark:border-red-900/50 ${className}`}
      >
        <div className="flex items-center gap-3">
          <Button variant="destructive" size="icon-sm"
            type="button"
            onClick={onStop}
            aria-label="Stop recording"
            className="min-h-6 min-w-6 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-500 text-white transition-transform"
          >
            <StopIcon />
          </Button>
          <div className="min-w-0 flex-1 text-red-500 dark:text-red-400">
            <Bars active />
          </div>
          <span className="shrink-0 text-xs tabular-nums text-muted-foreground">{recordingTime}</span>
          {onCancel && (
            <Button variant="ghost" size="icon-sm"
              type="button"
              onClick={onCancel}
              aria-label="Cancel recording"
              className="min-h-6 min-w-6 shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-muted-foreground"
            >
              <XIcon />
            </Button>
          )}
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          {transcript || "Listening…"}
        </p>
      </Card>
    );
  }

  return (
    <Card
      className={`flex-row gap-0 py-0 flex items-center gap-3 rounded-xl border border-border bg-card p-3 ${className}`}
    >
      <Button variant="default" size="icon-sm"
        type="button"
        onClick={onStart}
        aria-label="Start voice input"
        className="min-h-6 min-w-6 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform"
      >
        <MicIcon />
      </Button>
      <span className="text-sm text-muted-foreground">Click to talk</span>
      <div className="ml-auto text-muted-foreground">
        <Bars active={false} />
      </div>
    </Card>
  );
}
