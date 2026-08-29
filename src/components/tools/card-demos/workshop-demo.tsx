"use client";

import * as React from "react";
import { UserMessage } from "@/showcase/user-message/user-message";
import { ReasoningSteps } from "@/showcase/reasoning-steps/reasoning-steps";
import { ToolCall } from "@/showcase/tool-call/tool-call";
import { CitationList, type Citation } from "@/showcase/citation-ui/citation-ui";
import { useInView, useReducedMotion } from "@/components/templates/use-demo-motion";

/**
 * The UI Workshop, composing the library's real components in a card: a
 * user message lands, reasoning runs step by step, a tool call succeeds,
 * and citations arrive under the answer — the same element toggles the
 * workshop's editor flips, replayed as a timeline. Every block below is
 * the actual showcase component, not a drawing of one.
 */

const QUESTION = "Compare the top AI UI libraries and pick one for a docs chatbot.";

const REASONING = ["Parse the request", "Search sources", "Compare features"];

const CITATIONS: Citation[] = [
  { id: 1, title: "AI UI patterns — 2026 roundup", url: "https://example.com/ai-ui-2026" },
  { id: 2, title: "Streaming UX guidelines", url: "https://example.com/streaming-ux" },
  { id: 3, title: "Tool call transparency", url: "https://example.com/tool-calls" },
];

const LOOP_MS = 10000;

export function WorkshopDemo() {
  const frameRef = React.useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const inView = useInView(frameRef);
  const playing = inView && !reduced;

  /* One quantized clock drives the whole composition. */
  const [ms, setMs] = React.useState(0);

  React.useEffect(() => {
    if (!playing) return;
    const started = performance.now();
    const id = window.setInterval(
      () => setMs(Math.round(((performance.now() - started) % LOOP_MS) / 200) * 200),
      200,
    );
    return () => window.clearInterval(id);
  }, [playing]);

  const t = reduced ? LOOP_MS - 1 : ms;

  const showUser = t > 400;
  const showReasoning = t > 1000;
  const stepIdx = Math.min(REASONING.length - 1, Math.floor((t - 1000) / 900));
  const reasonElapsed = `${(((showReasoning ? t : 1000) - 1000) / 1000).toFixed(1)}s`;
  const showTool = t > 4200;
  const toolRunning = t < 6000;
  const showCitations = t > 7600;

  const chips = [
    { label: "User message", on: showUser },
    { label: "Reasoning", on: showReasoning },
    { label: "Tool call", on: showTool },
    { label: "Citations", on: showCitations },
  ];

  return (
    <div ref={frameRef} className="flex h-full flex-col justify-center gap-2.5 p-2">
      {/* The workshop's element toggles, lit as each block joins. */}
      <div className="flex flex-wrap gap-1">
        {chips.map((c) => (
          <span
            key={c.label}
            className={`rounded-full border px-2 py-0.5 text-[9.5px] transition-colors duration-300 ${
              c.on
                ? "border-(--primary)/40 bg-(--primary-muted) text-(--foreground)"
                : "border-(--border) text-(--muted-foreground)"
            }`}
          >
            {c.label}
          </span>
        ))}
      </div>

      {/* Keep the card frame stable while the replay grows. The contents are
          bottom-anchored like a conversation viewport, so newer steps remain
          visible and older ones move above the crop instead of resizing it. */}
      <div
        className={`relative h-[390px] shrink-0 overflow-hidden rounded-xl border border-(--border) bg-(--card) transition-opacity duration-500 ${
          showUser ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="absolute inset-x-3 bottom-3 flex flex-col gap-3">
          <UserMessage text={QUESTION} showActions={false} />

          {showReasoning && (
            <ReasoningSteps
              steps={REASONING}
              activeStep={stepIdx}
              elapsed={reasonElapsed}
              defaultExpanded
            />
          )}

          {showTool && (
            <ToolCall
              name="web_search"
              input='{"query":"AI UI libraries 2026"}'
              output={toolRunning ? undefined : "12 results · 3 sources kept"}
              status={toolRunning ? "running" : "success"}
              duration={toolRunning ? undefined : "1.8s"}
              defaultOpen
            />
          )}

          {showCitations && <CitationList citations={CITATIONS} linkable={false} />}
        </div>
      </div>
    </div>
  );
}
