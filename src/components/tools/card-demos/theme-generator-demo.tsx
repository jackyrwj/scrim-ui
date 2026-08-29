"use client";

import * as React from "react";
import { ChatPreview } from "../theme-generator/chat-preview";
import { deriveScheme } from "../theme-generator/color-engine";
import type { ThemeMode } from "../theme-generator/types";
import { useInView, useReducedMotion } from "@/components/templates/use-demo-motion";

/**
 * The AI Chat Theme Generator, cycling palettes in a card.
 *
 * The scheme on screen is never hand-picked: each step feeds a brand
 * color through the tool's own deriveScheme(), so the replay shows the
 * actual derivation a visitor would copy. The swatch row under the
 * sample shows where the current colors came from — the base color,
 * labelled, plus the roles the engine derived from it.
 */

/* Modes alternate step to step: with the light x3 / dark x3 split the demo's
   full cycle ran 15.6s against the chat-mockup card's 15.8s, so the two cards
   flipped light/dark in lockstep and read as one shared theme switch.
   Alternating keeps every palette on screen for the same dwell while putting
   this card on a rhythm no neighbour can sync with. */
const STEPS: { color: string; mode: ThemeMode }[] = [
  { color: "#7c3aed", mode: "light" },
  { color: "#0d9488", mode: "dark" },
  { color: "#ea580c", mode: "light" },
  { color: "#2563eb", mode: "dark" },
  { color: "#db2777", mode: "light" },
  { color: "#7c3aed", mode: "dark" },
];

const STEP_MS = 2600;

export function ThemeGeneratorDemo() {
  const [step, setStep] = React.useState(0);

  const frameRef = React.useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const inView = useInView(frameRef);
  const playing = inView && !reduced;

  React.useEffect(() => {
    if (!playing) return;
    const t = window.setTimeout(() => setStep((s) => (s + 1) % STEPS.length), STEP_MS);
    return () => window.clearTimeout(t);
  }, [step, playing]);

  const { color, mode } = STEPS[step];
  const scheme = deriveScheme(color, mode);

  const swatches: { label: string; value: string; title?: string }[] = [
    { label: color.toUpperCase(), value: color, title: "Brand color (the input)" },
    { label: "User", value: scheme.userBubble, title: "userBubble — derived" },
    { label: "Assistant", value: scheme.assistantBubble, title: "assistantBubble — derived" },
    { label: "Cursor", value: scheme.streamingCursor, title: "streamingCursor — derived" },
    { label: "Tool", value: scheme.toolCallAccent, title: "toolCallAccent — derived" },
  ];

  return (
    <div ref={frameRef} className="flex h-full flex-col items-center justify-center gap-4">
      <ChatPreview scheme={scheme} />
      <div className="flex items-center justify-center gap-2">
        {swatches.map((s) => (
          <span key={s.label} title={s.title} className="flex flex-col items-center gap-1">
            <span
              className="h-4 w-4 rounded-full border"
              style={{ background: s.value, borderColor: "var(--border)" }}
            />
            <span className="text-[9px] text-(--muted-foreground)">{s.label}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
