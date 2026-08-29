"use client";

import * as React from "react";
import { StreamingMarkdown } from "./streaming-markdown";
import { MarkdownMessage } from "../markdown-message/markdown-message";

/* The sample is chosen to hit every ambiguous construct on the way in: bold
   mid-word, an inline code span, a link whose href arrives last, a table
   (the worst reflow), and a fenced block. Anything less and the two columns
   look identical, which would be a demo that flatters the component. */
const SAMPLE = `Streaming markdown is **harder than it looks**, and here is why.

While a token like \`inline code\` is arriving, the opening backtick has landed but the closing one has not. A naive renderer shows the raw character, then removes it.

| Construct | Ambiguous until |
| --- | --- |
| Bold | closing \`**\` |
| Link | closing \`)\` |
| Table | separator row |

See [the streaming guide](/inspiration/streaming-vs-full-reply) for the decision rule.

\`\`\`tsx
<StreamingMarkdown text={text} streaming={status === "streaming"} />
\`\`\``;

/**
 * Replays a string the way a model delivers one: a few characters at a time.
 *
 * Progress is keyed by run id and compared at render, so starting a new
 * replay resets to zero without an effect that calls setState — every write
 * below happens in the interval callback. Same shape as the licence-keyed
 * state in the Pro components.
 */
function useReplay(source: string, runId: number) {
  const [progress, setProgress] = React.useState({ run: 0, index: 0 });
  const index = progress.run === runId ? progress.index : 0;

  React.useEffect(() => {
    if (runId === 0) return;
    let i = 0;
    const id = window.setInterval(() => {
      /* Uneven steps on purpose — a fixed stride can land tidily on
         delimiters and hide the very problem this is demonstrating. */
      i += 2 + Math.floor(Math.random() * 4);
      const next = Math.min(i, source.length);
      setProgress({ run: runId, index: next });
      if (next >= source.length) window.clearInterval(id);
    }, 45);
    return () => window.clearInterval(id);
  }, [runId, source]);

  /* Run 0 is "never played" — show the finished message rather than a blank
     panel, so the demo reads as content even before anyone presses anything. */
  return runId === 0 ? source : source.slice(0, index);
}

export function DemoComparison() {
  const [runId, setRunId] = React.useState(0);
  const text = useReplay(SAMPLE, runId);
  /* Derived, not stored: "playing" is exactly "a run has started and the
     text has not caught up yet", which the render already knows. */
  const playing = runId > 0 && text.length < SAMPLE.length;

  return (
    <div className="w-full">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-[13px] text-(--muted-foreground)">
          Same token stream, two renderers. Watch the left column correct itself.
        </p>
        <button
          type="button"
          onClick={() => setRunId((r) => r + 1)}
          disabled={playing}
          className="h-8 shrink-0 rounded-lg border border-(--border) px-3 text-[13px] font-medium transition-colors hover:bg-(--muted) disabled:opacity-50"
        >
          {playing ? "Streaming..." : "Replay"}
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <div className="mb-1.5 flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-red-500/70" aria-hidden />
            <span className="text-[11px] font-medium text-(--muted-foreground)">
              Re-parsed each token
            </span>
          </div>
          <div className="h-[24rem] overflow-y-auto rounded-xl border border-(--border) bg-(--card) px-4 py-3">
            <MarkdownMessage text={text} />
          </div>
        </div>

        <div>
          <div className="mb-1.5 flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-emerald-500/70" aria-hidden />
            <span className="text-[11px] font-medium text-(--muted-foreground)">
              StreamingMarkdown
            </span>
          </div>
          <div className="h-[24rem] overflow-y-auto rounded-xl border border-(--border) bg-(--card) px-4 py-3">
            <StreamingMarkdown text={text} streaming={playing} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* Frozen mid-token, so the speculative rendering can be read rather than
   caught in motion — this is the state the comparison flashes through. */
const MID_BOLD = `The answer depends on **what you are optim`;
const MID_LINK = `Read [the streaming guide](/inspir`;
const MID_TABLE = `| Construct | Ambiguous until |
| --- | --- |
| Bold | closing`;

export function DemoMidToken() {
  return (
    <div className="w-full space-y-3">
      {[
        { label: "Unclosed bold", text: MID_BOLD },
        { label: "Link with no href yet", text: MID_LINK },
        { label: "Table still filling", text: MID_TABLE },
      ].map((row) => (
        <div key={row.label} className="rounded-xl border border-(--border) bg-(--card) px-4 py-3">
          <div className="mb-2 font-mono text-[11px] text-(--muted-foreground)">{row.label}</div>
          <StreamingMarkdown text={row.text} streaming />
        </div>
      ))}
    </div>
  );
}

export function DemoDefault() {
  return <DemoComparison />;
}
