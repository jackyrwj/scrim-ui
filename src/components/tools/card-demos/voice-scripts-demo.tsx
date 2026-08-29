"use client";

import * as React from "react";
import { voiceScriptCategories, voiceScripts } from "@/lib/voice-scripts";
import { VoiceScriptCard } from "../voice-scripts/voice-script-card";
import { useInView, useReducedMotion } from "@/components/templates/use-demo-motion";

/**
 * The Voice Conversation Script Library, browsing itself in a card: the
 * category filter walks across the real categories, and the script card
 * below is the tool's own VoiceScriptCard rendering real library data —
 * transcript preview included.
 */

const PICKS = ["weather-assistant", "interview-coach", "customer-support"]
  .map((slug) => voiceScripts.find((s) => s.slug === slug))
  .filter((s): s is NonNullable<typeof s> => Boolean(s));

const STEP_MS = 4200;

export function VoiceScriptsDemo() {
  const frameRef = React.useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const inView = useInView(frameRef);
  const playing = inView && !reduced;

  const [step, setStep] = React.useState(0);

  React.useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => setStep((s) => (s + 1) % PICKS.length), STEP_MS);
    return () => window.clearInterval(id);
  }, [playing]);

  const active = reduced ? PICKS[0] : PICKS[step];
  const categories = [
    { slug: "all", name: "All" },
    ...voiceScriptCategories.filter((c) => PICKS.some((p) => p.category === c.slug)),
  ];

  return (
    <div ref={frameRef} className="flex h-full flex-col justify-center gap-2.5 p-2">
      {/* The library's category filter, walking across the shown scripts. */}
      <div className="flex flex-wrap gap-1">
        {categories.map((c) => (
          <span
            key={c.slug}
            className={`rounded-full px-2 py-0.5 text-[10px] transition-colors duration-300 ${
              c.slug !== "all" && active.category === c.slug
                ? "bg-(--foreground) text-(--background)"
                : "text-(--muted-foreground)"
            }`}
          >
            {c.name}
          </span>
        ))}
      </div>

      {/* Real script cards, crossfading. Links inside are pointer-events
          none here — the whole card band lives under the tool card. */}
      <div className="relative">
        {PICKS.map((script) => (
          <div
            key={script.slug}
            className="transition-opacity duration-500"
            style={{
              opacity: script === active ? 1 : 0,
              position: script === active ? "relative" : "absolute",
              inset: script === active ? undefined : 0,
            }}
          >
            <VoiceScriptCard
              script={script}
              category={voiceScriptCategories.find((c) => c.slug === script.category)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
