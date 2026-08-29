"use client";

import * as React from "react";
import { AgentStatus } from "@/showcase/agent-status/agent-status";
import { ReasoningSteps } from "@/showcase/reasoning-steps/reasoning-steps";
import { ToolCall } from "@/showcase/tool-call/tool-call";
import { useInView, useReducedMotion } from "@/components/templates/use-demo-motion";

/**
 * The Component Playground, playing in a card: the picker walks across
 * components, and whatever it lands on is the real showcase component
 * below — the same "pick a component, see it live" contract the playground
 * hub offers, minus the code panel.
 */

const STEP_MS = 2800;

export function PlaygroundDemo() {
  const frameRef = React.useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const inView = useInView(frameRef);
  const playing = inView && !reduced;

  const [step, setStep] = React.useState(0);
  const [n, setN] = React.useState(0);

  /* A slow counter gives the AgentStatus progress bar somewhere to be. */
  React.useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => setN((x) => x + 1), 700);
    return () => window.clearInterval(id);
  }, [playing]);

  React.useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => setStep((s) => (s + 1) % 3), STEP_MS);
    return () => window.clearInterval(id);
  }, [playing]);

  const active = reduced ? 0 : step;
  const progress = 0.25 + ((n % 4) * 0.25);

  const chips = ["Agent status", "Tool call", "Reasoning steps"];

  return (
    <div ref={frameRef} className="flex h-full flex-col justify-center gap-3 p-2">
      {/* The hub's component picker. */}
      <div className="flex flex-wrap gap-1">
        {chips.map((c, i) => (
          <span
            key={c}
            className={`rounded-full border px-2 py-0.5 text-[10px] transition-colors duration-300 ${
              i === active
                ? "border-transparent bg-(--primary) text-white"
                : "border-(--border) text-(--muted-foreground)"
            }`}
          >
            {c}
          </span>
        ))}
      </div>

      {/* The picked component, live. */}
      <div className="relative flex min-h-[150px] items-center justify-center rounded-xl border border-(--border) bg-(--card) p-4">
        <div className="w-full transition-opacity duration-300" style={{ opacity: active === 0 ? 1 : 0, position: active === 0 ? "relative" : "absolute" }}>
          <AgentStatus
            name="Research agent"
            status={progress >= 1 ? "completed" : "running"}
            action="Reading sources"
            progress={progress}
            elapsed={`${(n % 4) * 2 + 2}s`}
          />
        </div>
        <div className="w-full transition-opacity duration-300" style={{ opacity: active === 1 ? 1 : 0, position: active === 1 ? "relative" : "absolute" }}>
          <ToolCall
            name="file_read"
            input='{"path":"docs/getting-started.md"}'
            output="1.2 kB · 34 lines"
            status="success"
            duration="0.4s"
            defaultOpen
          />
        </div>
        <div className="w-full transition-opacity duration-300" style={{ opacity: active === 2 ? 1 : 0, position: active === 2 ? "relative" : "absolute" }}>
          <ReasoningSteps
            steps={["Find the docs", "Extract headings", "Summarise"]}
            activeStep={1 + (n % 2)}
            elapsed="1.4s"
            defaultExpanded
          />
        </div>
      </div>

      <p className="text-center text-[10px] text-(--muted-foreground)">
        props exposed · preview + code update live
      </p>
    </div>
  );
}
