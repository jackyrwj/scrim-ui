"use client";

import { Button } from "@/components/ui/button";
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
      strokeWidth="1.5"
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
      {/* role="img" is what makes aria-label legal here: on a bare <span> with
          no role, aria-label is a prohibited attribute and is ignored, so the
          animated bars had no accessible name at all. */}
      <span
        role="img"
        aria-label="Speaking"
        className="inline-flex h-3.5 items-center gap-[2px] text-muted-foreground"
      >
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
                  ? "bg-muted text-muted-foreground"
                  : "bg-primary text-primary-foreground"
              }`}
            >
              {user ? <UserIcon /> : "AI"}
            </span>

            <div
              className={`min-w-0 max-w-[75%] rounded-xl px-4 py-3 ${
                user
                  ? "bg-muted text-foreground"
                  : "bg-transparent text-foreground"
              }`}
            >
              <div
                className={`flex items-center gap-2 text-xs ${
                  user ? "text-muted-foreground" : "text-muted-foreground"
                }`}
              >
                <span className="font-medium">{user ? "You" : "Assistant"}</span>
                {turn.speaking && <SpeakingIcon />}
                {turn.time && <span className="tabular-nums">{turn.time}</span>}
                {!turn.speaking && onReplay && (
                  <Button variant="ghost" size="icon-sm"
                    type="button"
                    onClick={() => onReplay(turn.id)}
                    aria-label={`Replay ${user ? "your" : "the assistant's"} message`}
                    className="min-h-6 min-w-6 rounded-md p-0.5 transition-colors hover:text-muted-foreground"
                  >
                    <PlayIcon />
                  </Button>
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
