"use client";

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
      strokeWidth="2"
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
      strokeWidth="2.5"
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
      <div
        className={`rounded-xl border border-red-200 bg-white p-3 dark:border-red-900/50 dark:bg-zinc-900 ${className}`}
      >
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onStop}
            aria-label="Stop recording"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-500 text-white transition-transform hover:scale-105"
          >
            <StopIcon />
          </button>
          <div className="min-w-0 flex-1 text-red-500 dark:text-red-400">
            <Bars active />
          </div>
          <span className="shrink-0 text-xs tabular-nums text-zinc-500 dark:text-zinc-400">{recordingTime}</span>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              aria-label="Cancel recording"
              className="shrink-0 rounded-md p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800"
            >
              <XIcon />
            </button>
          )}
        </div>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
          {transcript || "Listening…"}
        </p>
      </div>
    );
  }

  return (
    <div
      className={`flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900 ${className}`}
    >
      <button
        type="button"
        onClick={onStart}
        aria-label="Start voice input"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-white transition-transform hover:scale-105 dark:bg-zinc-100 dark:text-zinc-900"
      >
        <MicIcon />
      </button>
      <span className="text-sm text-zinc-500 dark:text-zinc-400">Click to talk</span>
      <div className="ml-auto text-zinc-300 dark:text-zinc-600">
        <Bars active={false} />
      </div>
    </div>
  );
}
