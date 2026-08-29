"use client";

import * as React from "react";
import { SwitcherPreview } from "../model-switcher/switcher-preview";
import type { ModelSwitcherConfig, SwitcherVariant } from "../model-switcher/types";
import { VARIANT_LABELS } from "../model-switcher/types";
import { useInView, useReducedMotion } from "@/components/templates/use-demo-motion";

/**
 * The Model Switcher Builder, cycling its own settings in a card.
 *
 * The band mounts the real SwitcherPreview and walks it through the four
 * variants the tool offers — pills, segmented, command list, dropdown —
 * moving the selection as it goes, the way clicking through the editor
 * would. The chip row on top mirrors the variant selector in the tool's
 * control rail, so the replay reads as the tool being driven, not as a
 * component floating in space.
 */

const MODELS: ModelSwitcherConfig["models"] = [
  { id: "fable5", name: "Claude Fable 5", hint: "Most advanced Claude model", badge: "Pro", dot: "#d97757", group: "Anthropic" },
  { id: "sonnet5", name: "Claude Sonnet 5", hint: "Balanced speed and quality", badge: "", dot: "#d97757", group: "Anthropic" },
  { id: "gpt56sol", name: "GPT-5.6 Sol", hint: "Flagship · most capable", badge: "Default", dot: "#10a37f", group: "OpenAI" },
  { id: "gemini31pro", name: "Gemini 3.1 Pro", hint: "Best for long context and tools", badge: "", dot: "#4285f4", group: "Google" },
];

const BASE: Omit<ModelSwitcherConfig, "variant" | "selectedId"> = {
  size: "md",
  theme: "light",
  accent: "#7c3aed",
  radius: 10,
  fullWidth: true,
  showHints: true,
  showBadges: true,
  showDots: true,
  showCheck: true,
  triggerPrefix: "",
  models: MODELS,
};

const STEPS: { variant: SwitcherVariant; selectedId: string; ms: number }[] = [
  { variant: "pills", selectedId: "sonnet5", ms: 1500 },
  { variant: "pills", selectedId: "gpt56sol", ms: 1500 },
  { variant: "segmented", selectedId: "gpt56sol", ms: 1700 },
  { variant: "segmented", selectedId: "fable5", ms: 1700 },
  { variant: "command", selectedId: "fable5", ms: 2600 },
  { variant: "command", selectedId: "gemini31pro", ms: 2600 },
  { variant: "dropdown", selectedId: "gemini31pro", ms: 1800 },
  { variant: "dropdown", selectedId: "sonnet5", ms: 1800 },
];

const VARIANTS: SwitcherVariant[] = ["pills", "segmented", "command", "dropdown"];

export function ModelSwitcherDemo() {
  const [step, setStep] = React.useState(0);

  const frameRef = React.useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const inView = useInView(frameRef);
  const playing = inView && !reduced;

  /* Reduced motion keeps the command list — the variant with the most
     information on screen — with a selection made. */
  const current = reduced ? { variant: "command" as const, selectedId: "gpt56sol", ms: 0 } : STEPS[step];

  React.useEffect(() => {
    if (!playing) return;
    const t = window.setTimeout(() => setStep((s) => (s + 1) % STEPS.length), current.ms);
    return () => window.clearTimeout(t);
  }, [step, playing, current.ms]);

  const config: ModelSwitcherConfig = { ...BASE, variant: current.variant, selectedId: current.selectedId };

  return (
    <div ref={frameRef} className="flex h-full flex-col items-center justify-center gap-5 p-1">
      <div className="flex justify-center gap-1.5">
        {VARIANTS.map((v) => (
          <span
            key={v}
            className="rounded-full border px-2.5 py-1 text-[11px] transition-colors"
            style={
              v === current.variant
                ? { borderColor: "var(--primary)", background: "var(--primary-muted)", color: "var(--primary)" }
                : { borderColor: "var(--border)", color: "var(--muted-foreground)" }
            }
          >
            {VARIANT_LABELS[v]}
          </span>
        ))}
      </div>
      <SwitcherPreview config={config} onSelect={() => {}} />
    </div>
  );
}
