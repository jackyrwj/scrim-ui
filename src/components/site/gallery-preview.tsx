"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useInView, useReducedMotion } from "@/components/templates/use-demo-motion";

const GalleryClock = createContext<{ elapsed: number; animate: boolean } | null>(null);
const timelineSlugs = new Set(["prompt-input", "streaming-message", "tool-call", "reasoning", "reasoning-steps", "agent-status", "code-execution", "voice-waveform", "voice-input", "generative-ui", "generated-media", "artifact-preview", "agent-run-timeline"]);

export function useGalleryClock() { return useContext(GalleryClock); }

/** Timelines belong to the gallery, not to the installable components. */
export function GalleryPreview({ children, name, slug }: { children: ReactNode; name: string; slug: string }) {
  const frame = useRef<HTMLDivElement>(null);
  const inView = useInView(frame);
  const reduced = useReducedMotion();
  const [paused, setPaused] = useState(false);
  const [elapsed, setElapsed] = useState(9000);
  const running = inView && !reduced && !paused;
  const timelineRunning = running && timelineSlugs.has(slug);

  useEffect(() => {
    if (!timelineRunning) return;
    let timer: ReturnType<typeof setInterval> | undefined;
    const synchronize = () => {
      if (timer) clearInterval(timer);
      timer = undefined;
      if (!document.hidden) timer = setInterval(() => setElapsed((value) => (value + 160) % 10000), 160);
    };
    synchronize();
    document.addEventListener("visibilitychange", synchronize);
    return () => {
      if (timer) clearInterval(timer);
      document.removeEventListener("visibilitychange", synchronize);
    };
  }, [timelineRunning]);

  return (
    <>
    <div ref={frame} className={`aicss-card-stage relative ${running ? "" : "preview-idle"}`} data-preview-slug={slug}>
      <GalleryClock.Provider value={{ elapsed, animate: !reduced }}>
        <div className="aicss-card-demo" inert aria-hidden="true">{children}</div>
      </GalleryClock.Provider>
    </div>
      {!reduced && <Button type="button" variant="ghost" size="icon-sm" aria-label={`${paused ? "Play" : "Pause"} ${name} preview animation`} aria-pressed={paused} onClick={() => setPaused((value) => !value)} className="absolute right-2 top-2 z-20 bg-card/80 text-muted-foreground opacity-60 hover:opacity-100 focus-visible:opacity-100">
        {paused ? <Play size={13} aria-hidden="true" /> : <Pause size={13} aria-hidden="true" />}
      </Button>}
    </>
  );
}
