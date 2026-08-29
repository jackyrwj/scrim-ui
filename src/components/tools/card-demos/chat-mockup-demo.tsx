"use client";

import * as React from "react";
import { MockupPreview } from "../chat-mockup/mockup-preview";
import type { MockupConfig, MockupMessage } from "../chat-mockup/types";
import { useInView, useReducedMotion } from "@/components/templates/use-demo-motion";

/**
 * The Chat Mockup Generator, replaying one turn inside a card.
 *
 * The band mounts the tool's own MockupPreview — the exact component the
 * editor renders beside its controls — with a scripted conversation: the
 * question lands, then the answer streams in with the reasoning trace and
 * tool call the tool exists to compose. Each loop alternates light/dark,
 * which is the tool's other headline control.
 *
 * Sources are deliberately left out of the turn: at card scale the
 * citation list costs more height than legibility buys.
 */

const QUESTION = "What makes a chat UI feel AI-native?";

const ANSWER =
  "Streaming text, reasoning you can open, tool calls you can inspect — the interface earns trust by showing its work.";

type Phase = "asked" | "answer";

const TIMELINE: { phase: Phase; ms: number }[] = [
  { phase: "asked", ms: 1100 },
  { phase: "answer", ms: 6800 },
];

function configFor(phase: Phase, loop: number, reduced: boolean): MockupConfig {
  const messages: MockupMessage[] =
    phase === "asked"
      ? [{ id: "q", role: "user", text: QUESTION }]
      : [
          { id: "q", role: "user", text: QUESTION },
          { id: "a", role: "assistant", text: ANSWER, reasoning: true, tools: true },
        ];

  return {
    title: "Acme Assistant",
    subtitle: "AI research assistant",
    modelName: "Claude Sonnet 5",
    device: "mobile",
    theme: loop % 2 === 0 ? "light" : "dark",
    streaming: phase === "answer" && !reduced,
    showComposer: true,
    composerPlaceholder: "Ask anything…",
    showSearch: true,
    showTools: true,
    showAttachments: false,
    avatarLabel: "AI",
    messages,
  };
}

export function ChatMockupDemo() {
  const [step, setStep] = React.useState(0);
  const [loop, setLoop] = React.useState(0);

  const frameRef = React.useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const inView = useInView(frameRef);
  const playing = inView && !reduced;

  /* Reduced motion shows the finished turn: the streaming flag off means
     the full text stands still, which is the informative frame. */
  const phase = reduced ? "answer" : TIMELINE[step].phase;

  React.useEffect(() => {
    if (!playing) return;
    const next = (step + 1) % TIMELINE.length;
    const t = window.setTimeout(() => {
      setStep(next);
      /* Wrapping to the start replays the turn from the question — and
         flips the theme, so the loop doubles as a theme tour. */
      if (next === 0) setLoop((l) => l + 1);
    }, TIMELINE[step].ms);
    return () => window.clearTimeout(t);
  }, [step, playing]);

  const config = configFor(phase, loop, reduced);

  return (
    <div ref={frameRef} className="flex h-full items-center justify-center">
      {/* Keyed by loop so a wrapped timeline remounts the preview and the
          streaming reveal starts over instead of resuming. */}
      <MockupPreview key={loop} config={config} />
    </div>
  );
}
