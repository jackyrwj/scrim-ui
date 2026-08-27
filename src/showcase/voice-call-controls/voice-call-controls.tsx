"use client";

import * as React from "react";

/**
 * The chrome around a live voice call.
 *
 * Voice input is a button; a voice *call* is a session, and a session needs
 * its own controls. Three things, no more: am I muted, how long has this run,
 * and how do I get out.
 *
 * **Mute is the trust control.** In a call that is always listening, the mic
 * toggle is the single thing a user checks before saying something private.
 * It is a toggle with an unmistakable state — a slashed mic and a label,
 * never an icon swap alone — and it stays in the same spot for the whole
 * call, because hunting for mute mid-sentence is the failure mode.
 *
 * **The clock proves the line is open.** A voice call has no scrollback; the
 * elapsed timer is the only persistent evidence the session is alive. When it
 * stops, the call has dropped whether the UI admits it or not.
 *
 * **End is red and requires no courage.** One tap, always visible, never
 * hidden behind a menu. A user who cannot find the exit will find it by
 * killing the tab, and takes the trust damage with them.
 *
 * What is deliberately not here: transcript, waveform, volume. Those belong
 * to the conversation surface above the bar; this is only the chrome.
 */

export type VoiceCallControlsProps = {
  /** Whether the microphone is currently muted. */
  muted?: boolean;
  /** Fired when the mute toggle is pressed. */
  onToggleMute?: () => void;
  /** Seconds into the call — rendered as m:ss. */
  elapsedSeconds?: number;
  /** Fired when the end-call button is pressed. */
  onEnd?: () => void;
  className?: string;
};

/* ------------------------------------------------------------------ */
/* Icons                                                               */
/* ------------------------------------------------------------------ */

function MicIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <path d="M12 19v3" />
    </svg>
  );
}

function MicOffIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
      <line x1="2" x2="22" y1="2" y2="22" />
      <path d="M18.89 13.23A7.12 7.12 0 0 0 19 12v-2" />
      <path d="M5 10v2a7 7 0 0 0 12 5" />
      <path d="M15 9.34V5a3 3 0 0 0-5.68-1.33" />
      <path d="M9 9v3a3 3 0 0 0 5.12 2.12" />
      <path d="M12 19v3" />
    </svg>
  );
}

function PhoneOffIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
      <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91" />
      <line x1="22" x2="2" y1="2" y2="22" />
    </svg>
  );
}

function formatElapsed(total: number): string {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/* ------------------------------------------------------------------ */
/* VoiceCallControls                                                   */
/* ------------------------------------------------------------------ */

export function VoiceCallControls({
  muted = false,
  onToggleMute,
  elapsedSeconds = 0,
  onEnd,
  className = "",
}: VoiceCallControlsProps) {
  return (
    <div
      className={`flex items-center justify-between rounded-full border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900 ${className}`}
      role="toolbar"
      aria-label="Voice call controls"
    >
      <button
        type="button"
        onClick={onToggleMute}
        aria-pressed={muted}
        className={`flex h-10 items-center gap-2 rounded-full px-3 text-sm font-medium transition-colors ${
          muted
            ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
            : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
        }`}
      >
        {muted ? <MicOffIcon /> : <MicIcon />}
        {muted ? "Muted" : "Mute"}
      </button>

      <span
        className="text-sm tabular-nums text-zinc-500 dark:text-zinc-400"
        aria-label={`Call duration ${formatElapsed(elapsedSeconds)}`}
      >
        {formatElapsed(elapsedSeconds)}
      </span>

      <button
        type="button"
        onClick={onEnd}
        className="flex h-10 items-center gap-2 rounded-full bg-red-600 px-4 text-sm font-medium text-white transition-colors hover:bg-red-500"
      >
        <PhoneOffIcon />
        End
      </button>
    </div>
  );
}
