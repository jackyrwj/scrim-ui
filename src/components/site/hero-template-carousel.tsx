"use client";

/* ------------------------------------------------------------------ */
/* Hero template carousel — three Pro templates on one filmstrip.      */
/*                                                                     */
/* The slides are narrower than the strip, so the neighbours stay      */
/* visible at the edges: the reader sees there is more to scroll to    */
/* before touching anything. A trackpad swipe, a touch drag and the    */
/* arrow buttons are all the same gesture — native scroll, snap-       */
/* centred on whichever template is nearest the middle. Each slide     */
/* is the real template demo, paused while it sits off-centre.         */
/* Nothing drives the strip automatically: every demo already loops    */
/* on its own timeline, and an auto-advancing frame would cut each     */
/* replay off mid-sentence.                                            */
/*                                                                     */
/* The switcher below the frame is the one the old tool tour used:     */
/* a hairline, an index number, a name. It was a good switcher; only   */
/* the thing it switched needed replacing.                             */
/* ------------------------------------------------------------------ */

import * as React from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AiChatDemo } from "@/components/templates/ai-chat-demo";
import { RagQaDemo } from "@/components/templates/rag-qa-demo";
import { AgentConsoleDemo } from "@/components/templates/agent-console-demo";
import { useReducedMotion } from "@/components/templates/use-demo-motion";

const SLIDES = [
  {
    slug: "ai-chat",
    tab: "AI Chat",
    caption: "streaming, tool calls and reasoning, replayed in one scripted turn.",
    Demo: AiChatDemo,
  },
  {
    slug: "rag-qa",
    tab: "RAG Q&A",
    caption: "upload, retrieve, answer — with citations pinned to the sentences they came from.",
    Demo: RagQaDemo,
  },
  {
    slug: "agent-console",
    tab: "Agent Console",
    caption: "a resumable agent run: approvals, per-step cost, and cancellation that lands.",
    Demo: AgentConsoleDemo,
  },
];

export function HeroTemplateCarousel() {
  const reduced = useReducedMotion();
  const [index, setIndex] = React.useState(0);
  const scrollerRef = React.useRef<HTMLDivElement>(null);

  /* The scroll position is the source of truth; the index is whichever
     slide's centre is nearest the strip's centre, so every way of moving
     — swipe, arrows, switcher — ends in the same state without fighting
     a second copy of it. */
  function onScroll() {
    const el = scrollerRef.current;
    if (!el) return;
    const center = el.scrollLeft + el.clientWidth / 2;
    let best = 0;
    let bestDist = Infinity;
    Array.from(el.children).forEach((child, i) => {
      const slide = child as HTMLElement;
      const d = Math.abs(slide.offsetLeft + slide.offsetWidth / 2 - center);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    });
    if (best !== index) setIndex(best);
  }

  function goTo(i: number) {
    const el = scrollerRef.current;
    if (!el) return;
    const slide = el.children[i] as HTMLElement | undefined;
    if (!slide) return;
    el.scrollTo({
      left: slide.offsetLeft + slide.offsetWidth / 2 - el.clientWidth / 2,
      behavior: reduced ? "auto" : "smooth",
    });
  }

  return (
    <div>
      <div className="relative">
        <div
          ref={scrollerRef}
          onScroll={onScroll}
          tabIndex={0}
          role="region"
          aria-roledescription="carousel"
          aria-label="Template demos"
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") goTo(index - 1);
            if (e.key === "ArrowRight") goTo(index + 1);
          }}
          /* The side padding is half the leftover width, so the first and
             last slides can scroll to the centre like every other one —
             without it they would park hard against the strip's edges. */
          className="flex snap-x snap-mandatory items-start gap-4 overflow-x-auto overscroll-x-contain rounded-xl px-[7%] outline-none focus-visible:ring-2 focus-visible:ring-(--primary)/40 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-5 sm:px-[15%]"
        >
          {SLIDES.map(({ slug, tab, caption, Demo }, i) => (
            /* w-full, not w-[70%]: a percentage width would resolve against
               the content box the paddings have already shrunk, compounding
               to a slide narrower than designed. Filling the content box
               makes the padding the sole controller of the peek ratio —
               px-[15%] ⇒ slide = 70% of the strip. */
            <div
              key={slug}
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${SLIDES.length}: ${tab}`}
              className={`w-full shrink-0 snap-center transition-[opacity,transform] duration-300 ease-out ${
                i === index ? "opacity-100" : "opacity-45 scale-[0.98]"
              }`}
            >
              <Demo caption={false} />
              {/* Only the centred slide keeps its caption: a half-clipped
                  sentence at the strip's edge reads as a bug, not a peek. */}
              <p
                className={`mt-3 text-center text-xs leading-5 text-(--muted-foreground) transition-opacity duration-300 ${
                  i === index ? "opacity-100" : "opacity-0"
                }`}
              >
                <Link
                  href={`/templates/${slug}`}
                  className="font-medium text-(--foreground) underline-offset-4 hover:underline"
                >
                  {tab}
                </Link>{" "}
                — {caption}
              </p>
            </div>
          ))}
        </div>

        {/* Arrows, for the machines a swipe is not an option on. Wide
            enough, they leave the strip entirely; otherwise they float
            over the frame's own chrome and fade out at the ends rather
            than sitting there disabled. */}
        <button
          type="button"
          onClick={() => goTo(index - 1)}
          disabled={index === 0}
          aria-label="Previous template"
          className="absolute top-1/2 left-2 z-10 hidden h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-(--border) bg-(--card)/90 text-(--muted-foreground) shadow-sm backdrop-blur transition-all hover:text-(--foreground) disabled:pointer-events-none disabled:opacity-0 sm:grid xl:-left-12"
        >
          <ChevronLeft size={18} strokeWidth={2} aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => goTo(index + 1)}
          disabled={index === SLIDES.length - 1}
          aria-label="Next template"
          className="absolute top-1/2 right-2 z-10 hidden h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-(--border) bg-(--card)/90 text-(--muted-foreground) shadow-sm backdrop-blur transition-all hover:text-(--foreground) disabled:pointer-events-none disabled:opacity-0 sm:grid xl:-right-12"
        >
          <ChevronRight size={18} strokeWidth={2} aria-hidden />
        </button>
      </div>

      {/* Same switcher the tool tour used, minus the auto-advance it no
          longer needs to narrate: the active hairline is simply full,
          because the demo beneath it is what animates now. */}
      <ol className="mt-5 grid gap-x-6 sm:grid-cols-3">
        {SLIDES.map((s, i) => {
          const active = i === index;
          return (
            <li
              key={s.slug}
              aria-current={active ? "step" : undefined}
              role="button"
              tabIndex={0}
              className="cursor-pointer outline-offset-4"
              onClick={() => goTo(i)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  goTo(i);
                }
              }}
            >
              <div className="relative h-px w-full overflow-hidden bg-(--border)">
                {active && (
                  <span aria-hidden className="absolute inset-0" style={{ background: "var(--primary)" }} />
                )}
              </div>
              <p className="mt-2.5 flex items-baseline gap-2 text-sm font-medium">
                <span
                  className={`font-mono text-[11px] tabular-nums ${
                    active ? "text-(--primary)" : "text-(--muted-foreground)"
                  }`}
                >
                  0{i + 1}
                </span>
                <span
                  className={`transition-colors ${
                    active ? "text-(--foreground)" : "text-(--muted-foreground) hover:text-(--foreground)"
                  }`}
                >
                  {s.tab}
                </span>
              </p>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
