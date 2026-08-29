"use client";

import * as React from "react";
import {
  buildPrompt,
  ELEMENT_OPTIONS,
  INTERFACE_OPTIONS,
  PLATFORM_LABELS,
  type PromptConfig,
} from "../prompt-generator/build-prompt";
import { sliceTo, useInView, useReducedMotion } from "@/components/templates/use-demo-motion";

/**
 * The AI Interface Prompt Generator, assembling a prompt in a card. The
 * product line types itself, then the script flips through screen types
 * and AI elements — and every character of the "generated" prompt is the
 * real buildPrompt() output for the configuration on screen, re-derived
 * (and re-revealed) each time it changes.
 */

const PRODUCT = "A team wiki that answers from your docs";

const PRODUCT_TYPE_MS = 2000;
const STEP_MS = 3200;
const PROMPT_REVEAL_MS = 1800;

const CONFIGS: Array<Pick<PromptConfig, "interfaceType" | "platform" | "elements">> = [
  { interfaceType: "chat", platform: "v0", elements: ["streaming", "tool-calls"] },
  { interfaceType: "agent", platform: "claude", elements: ["reasoning", "tool-calls", "voice"] },
  { interfaceType: "landing", platform: "cursor", elements: ["streaming", "citations"] },
];

export function PromptGeneratorDemo() {
  const frameRef = React.useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const inView = useInView(frameRef);
  const playing = inView && !reduced;

  const [product, setProduct] = React.useState("");
  const [prompt, setPrompt] = React.useState("");
  const [step, setStep] = React.useState(0);

  React.useEffect(() => {
    if (!playing) return;
    const started = performance.now();
    const id = window.setInterval(() => {
      const total = performance.now() - started;
      const elapsed = total % STEP_MS;
      const nextStep = Math.floor(total / STEP_MS) % CONFIGS.length;
      setProduct(sliceTo(PRODUCT, Math.min(1, total / PRODUCT_TYPE_MS)));
      setStep(nextStep);
      const config = CONFIGS[nextStep];
      setPrompt(
        sliceTo(
          buildPrompt({
            product: PRODUCT,
            interfaceType: config.interfaceType,
            platform: config.platform,
            model: "",
            style: "",
            elements: config.elements,
          }),
          Math.min(1, elapsed / PROMPT_REVEAL_MS),
        ),
      );
    }, 60);
    return () => window.clearInterval(id);
  }, [playing]);

  const active = reduced ? CONFIGS[0] : CONFIGS[step];
  const productText = reduced ? PRODUCT : product;
  const promptText = reduced
    ? buildPrompt({ product: PRODUCT, ...CONFIGS[0], model: "", style: "" })
    : prompt;

  return (
    <div ref={frameRef} className="flex h-full flex-col justify-center gap-2 p-2">
      {/* Product — the one free-text field, typing itself. */}
      <div className="rounded-lg border border-(--border) bg-(--background) px-3 py-2">
        <p className="mb-0.5 text-[10px] font-medium uppercase tracking-wide text-(--muted-foreground)">
          Product
        </p>
        <p className="font-mono text-[12px] leading-5 text-(--foreground)">
          {productText}
          {!reduced && productText.length < PRODUCT.length && (
            <span className="ml-0.5 inline-block h-[1.1em] w-[2px] translate-y-[0.15em] animate-pulse bg-(--muted-foreground)" />
          )}
        </p>
      </div>

      {/* Screen + AI elements + platform, as chip rows mirroring the editor. */}
      <div className="flex flex-wrap items-center gap-1">
        <span className="mr-0.5 text-[10px] text-(--muted-foreground)">Screen</span>
        {INTERFACE_OPTIONS.map((o) => (
          <span
            key={o.value}
            className={`rounded-full border px-2 py-0.5 text-[10px] transition-colors ${
              o.value === active.interfaceType
                ? "border-transparent bg-(--primary) text-white"
                : "border-(--border) text-(--muted-foreground)"
            }`}
          >
            {o.label}
          </span>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-1">
        <span className="mr-0.5 text-[10px] text-(--muted-foreground)">Elements</span>
        {ELEMENT_OPTIONS.map((o) => (
          <span
            key={o.value}
            className={`rounded-full border px-2 py-0.5 text-[10px] transition-colors ${
              active.elements.includes(o.value)
                ? "border-(--primary)/40 bg-(--primary-muted) text-(--foreground)"
                : "border-(--border) text-(--muted-foreground)"
            }`}
          >
            {o.label}
          </span>
        ))}
        <span className="ml-auto rounded-full border border-(--border) px-2 py-0.5 text-[10px] text-(--muted-foreground)">
          {PLATFORM_LABELS[active.platform]}
        </span>
      </div>

      {/* The generated prompt — buildPrompt() output, revealed. */}
      <div className="flex min-h-0 flex-1 flex-col rounded-lg border border-(--border) bg-(--card)">
        <p className="border-b border-(--border) px-3 py-1.5 text-[10px] font-medium text-(--muted-foreground)">
          Generated prompt
        </p>
        <pre className="flex-1 overflow-hidden whitespace-pre-wrap px-3 py-2 font-mono text-[10px] leading-[1.5] text-(--foreground)">
          {promptText}
        </pre>
      </div>
    </div>
  );
}
