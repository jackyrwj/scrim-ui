"use client";

import * as React from "react";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type VoiceTurn = {
  id: string;
  role: "user" | "assistant";
  text: string;
  time?: string;
  speaking?: boolean;
};

export type VoiceConversationProps = {
  turns: VoiceTurn[];
  onReplay?: (id: string) => void;
  className?: string;
};

/* ------------------------------------------------------------------ */
/* Icons                                                               */
/* ------------------------------------------------------------------ */

function UserIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width="14"
      height="14"
      {...props}
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </svg>
  );
}

function PlayIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="11" height="11" {...props}>
      <path d="M7 4.5v15a1 1 0 0 0 1.52.85l12-7.5a1 1 0 0 0 0-1.7l-12-7.5A1 1 0 0 0 7 4.5z" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Speaking indicator                                                  */
/* ------------------------------------------------------------------ */

function SpeakingIcon() {
  return (
    <>
      <style>{`@keyframes aiui-spk{0%,100%{transform:scaleY(.3)}50%{transform:scaleY(1)}}`}</style>
      <span className="inline-flex h-3.5 items-center gap-[2px] text-violet-500" aria-label="Speaking">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className="w-[2px] rounded-full bg-current"
            style={{
              height: "100%",
              transform: "scaleY(.3)",
              transformOrigin: "center",
              animation: `aiui-spk 0.6s ease-in-out ${i * 0.12}s infinite`,
            }}
          />
        ))}
      </span>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* VoiceConversation                                                   */
/* ------------------------------------------------------------------ */

export function VoiceConversation({
  turns,
  onReplay,
  className = "",
}: VoiceConversationProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      {turns.map((turn) => {
        const user = turn.role === "user";
        return (
          <div key={turn.id} className={`flex items-start gap-3 ${user ? "flex-row-reverse" : ""}`}>
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-semibold ${
                user
                  ? "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
                  : "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
              }`}
            >
              {user ? <UserIcon /> : "AI"}
            </span>

            <div
              className={`min-w-0 max-w-[75%] rounded-2xl px-4 py-3 ${
                user
                  ? "rounded-tr-md bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "rounded-tl-md border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800/60"
              }`}
            >
              <div
                className={`flex items-center gap-2 text-[11px] ${
                  user ? "text-zinc-300 dark:text-zinc-600" : "text-zinc-500 dark:text-zinc-400"
                }`}
              >
                <span className="font-medium">{user ? "You" : "Assistant"}</span>
                {turn.speaking && <SpeakingIcon />}
                {turn.time && <span className="tabular-nums">{turn.time}</span>}
                {!turn.speaking && onReplay && (
                  <button
                    type="button"
                    onClick={() => onReplay(turn.id)}
                    aria-label={`Replay ${user ? "your" : "the assistant's"} message`}
                    className="rounded-md p-0.5 transition-colors hover:text-zinc-600 dark:hover:text-zinc-300"
                  >
                    <PlayIcon />
                  </button>
                )}
              </div>
              <p className="mt-1 text-sm leading-6">{turn.text}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
