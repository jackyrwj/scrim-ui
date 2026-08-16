"use client";

import * as React from "react";
import { StreamingMessage } from "./streaming-message";

const STREAMING_TEXT =
  "A streaming message renders tokens as they arrive from the model, giving the user immediate feedback instead of a blank wait. It combines a live reveal animation with a stop control so generation can be interrupted at any moment.";

const COMPLETE_TEXT =
  "A complete message shows the full response with the streaming affordances removed. The regenerate action appears so the user can request a fresh draft without retyping their prompt.";

export function DemoStreaming() {
  const [cycle, setCycle] = React.useState(0);

  React.useEffect(() => {
    const t = window.setTimeout(() => setCycle((c) => c + 1), 9000);
    return () => window.clearTimeout(t);
  }, [cycle]);

  return <StreamingMessage key={cycle} text={STREAMING_TEXT} isStreaming onStop={() => {}} />;
}

export function DemoComplete() {
  return <StreamingMessage text={COMPLETE_TEXT} onRegenerate={() => {}} />;
}

export function DemoStopped() {
  const partial = STREAMING_TEXT.slice(0, 84);
  const [text, setText] = React.useState(partial);
  const [streaming, setStreaming] = React.useState(false);
  const [stopped, setStopped] = React.useState(true);

  const restart = () => {
    setText(STREAMING_TEXT);
    setStopped(false);
    setStreaming(true);
  };

  return (
    <StreamingMessage
      text={text}
      isStreaming={streaming}
      stopped={stopped}
      onStop={() => {
        setStreaming(false);
        setStopped(true);
      }}
      onRegenerate={restart}
    />
  );
}

export function DemoUserTurn() {
  return (
    <div className="flex items-start justify-end gap-3">
      <div className="max-w-[80%] whitespace-pre-wrap rounded-2xl rounded-tr-md bg-zinc-900 px-4 py-3 text-[15px] leading-6 text-white dark:bg-zinc-100 dark:text-zinc-900">
        Draft an answer in plain English, then give me the same answer in markdown.
      </div>
      <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-lg bg-zinc-200 text-xs font-semibold text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200">
        You
      </div>
    </div>
  );
}
