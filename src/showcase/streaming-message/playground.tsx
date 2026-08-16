"use client";

import * as React from "react";
import { StreamingMessage } from "./streaming-message";
import { Playground, PField, PToggle, pInputCls } from "@/components/component-page/playground";

const DEFAULT_TEXT =
  "A playground streams text at whatever speed you pick. Crank it up, or hit Stop mid-way and watch the state flip — then regenerate.";

export function StreamingMessagePlayground() {
  const [text, setText] = React.useState(DEFAULT_TEXT);
  const [speed, setSpeed] = React.useState(2);
  const [streaming, setStreaming] = React.useState(true);
  const [stopped, setStopped] = React.useState(false);
  const [showActions, setShowActions] = React.useState(true);

  const restart = () => {
    setStopped(false);
    setStreaming(true);
  };

  return (
    <Playground
      title="Streaming message"
      demo={
        <StreamingMessage
          text={text}
          isStreaming={streaming}
          stopped={stopped}
          speed={speed}
          showActions={showActions}
          onStop={() => {
            setStreaming(false);
            setStopped(true);
          }}
          onRegenerate={restart}
        />
      }
      controls={
        <>
          <PField label="Message text">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={4}
              className={`${pInputCls} resize-y font-mono text-xs leading-5`}
            />
          </PField>

          <PField label={`Speed — ${speed}×`}>
            <input
              type="range"
              min={1}
              max={6}
              step={1}
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="w-full accent-(--foreground)"
            />
          </PField>

          <PToggle
            label="Streaming"
            checked={streaming}
            onChange={(v) => {
              setStreaming(v);
              if (v) setStopped(false);
            }}
          />

          <PToggle
            label="Stopped state"
            checked={stopped}
            onChange={(v) => {
              setStreaming(false);
              setStopped(v);
            }}
          />

          <PToggle label="Actions after stream" checked={showActions} onChange={setShowActions} />

          {!streaming && (
            <button
              type="button"
              onClick={restart}
              className="w-full rounded-lg border border-(--border) px-3 py-2 text-xs font-medium transition-colors hover:bg-(--muted)"
            >
              Restart stream
            </button>
          )}
        </>
      }
    />
  );
}
