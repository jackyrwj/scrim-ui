"use client";

import * as React from "react";
import { combineSections, type PromptSectionData } from "../system-prompt-builder/sections";
import { sliceTo, useInView, useReducedMotion } from "@/components/templates/use-demo-motion";

/**
 * The System Prompt Builder, assembling a prompt in a card. Sections fill
 * in one at a time, and the panel below is the tool's own
 * combineSections() run on exactly the sections on screen — so the
 * markdown grows because the real assembly ran, not because a string was
 * staged.
 */

const SECTIONS: PromptSectionData[] = [
  {
    type: "Role",
    content: "You are a senior frontend engineer who writes clean, tested React and TypeScript.",
  },
  {
    type: "Rules",
    content: "- TypeScript strict mode\n- Functional components only\n- Test every utility",
  },
  {
    type: "Output Format",
    content: "1. Explain the approach\n2. The full code\n3. One usage example",
  },
];

const SECTION_MS = 2200;
const TYPE_MS = 1600;
const HOLD_MS = 1800;
const LOOP_MS = SECTIONS.length * SECTION_MS + HOLD_MS;

export function SystemPromptBuilderDemo() {
  const frameRef = React.useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const inView = useInView(frameRef);
  const playing = inView && !reduced;

  /* Two primitives: how many sections are done, and the text of the one
     currently typing (word-boundary slices — React skips the rest). */
  const [done, setDone] = React.useState(0);
  const [typed, setTyped] = React.useState("");

  React.useEffect(() => {
    if (!playing) return;
    const started = performance.now();
    const id = window.setInterval(() => {
      const elapsed = (performance.now() - started) % LOOP_MS;
      const idx = Math.min(Math.floor(elapsed / SECTION_MS), SECTIONS.length - 1);
      const into = elapsed - idx * SECTION_MS;
      if (into < TYPE_MS) {
        setDone(idx);
        setTyped(sliceTo(SECTIONS[idx].content, into / TYPE_MS));
      } else {
        setDone(idx + 1);
        setTyped("");
      }
    }, 60);
    return () => window.clearInterval(id);
  }, [playing]);

  const doneCount = reduced ? SECTIONS.length : done;
  const current = reduced ? "" : typed;

  const visible: PromptSectionData[] = SECTIONS.map((s, i) =>
    i < doneCount ? s : i === doneCount ? { ...s, content: current } : { ...s, content: "" },
  );
  const combined = combineSections(visible);

  return (
    <div ref={frameRef} className="flex h-full flex-col justify-center gap-2 p-2">
      {/* The section stack, as the editor's left panel. */}
      <div className="space-y-1.5">
        {SECTIONS.map((s, i) => {
          const content = visible[i].content;
          return (
            <div
              key={s.type}
              className={`rounded-lg border px-2.5 py-1.5 transition-colors duration-300 ${
                content
                  ? "border-(--border) bg-(--background)"
                  : "border-dashed border-(--border) bg-transparent"
              }`}
            >
              <p className="text-[10px] font-semibold uppercase tracking-wide text-(--muted-foreground)">
                {s.type}
              </p>
              {content ? (
                <pre className="mt-0.5 overflow-hidden whitespace-pre-wrap font-mono text-[10.5px] leading-4 text-(--foreground)">
                  {content}
                </pre>
              ) : (
                <p className="mt-0.5 font-mono text-[10.5px] leading-4 text-(--muted-foreground)/40">
                  …
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* The combined prompt — combineSections() over the stack above. */}
      <div className="flex min-h-[86px] flex-col rounded-lg border border-(--border) bg-(--card)">
        <p className="border-b border-(--border) px-3 py-1.5 text-[10px] font-medium text-(--muted-foreground)">
          System prompt
        </p>
        <pre className="flex-1 overflow-hidden whitespace-pre-wrap px-3 py-2 font-mono text-[10px] leading-[1.5] text-(--foreground)">
          {combined}
        </pre>
      </div>
    </div>
  );
}
