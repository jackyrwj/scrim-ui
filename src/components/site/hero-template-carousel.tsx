"use client";

/* ------------------------------------------------------------------ */
/* Hero template carousel — three Pro templates on one drifting        */
/* filmstrip.                                                          */
/*                                                                     */
/* The slides are narrower than the strip, so the neighbours stay      */
/* visible at the edges: the reader sees there is more to scroll to    */
/* before touching anything. A trackpad swipe, a touch drag and the    */
/* arrow buttons are all the same gesture — native scroll, snap-       */
/* centred on whichever template is nearest the middle.                */
/*                                                                     */
/* The strip also drifts on its own, slowly and endlessly: the         */
/* sequence is rendered twice and the scroll position is folded back   */
/* one whole cycle once it passes the first copy, so the loop has no   */
/* seam to see. Anything the visitor does — hover, grab, swipe, an     */
/* arrow key, the switcher — stops the drift and settles the nearest   */
/* template dead centre; a few seconds after they let go, it starts    */
/* moving again. Each slide is the real template demo, running its     */
/* own scripted loop on its own clock.                                 */
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

/* How fast the strip drifts when nobody is holding it, and how long
   it waits after the visitor lets go before drifting again. */
const DRIFT_PX_PER_S = 40;
const RESUME_AFTER_MS = 4000;

/* The distance between a slide and its clone — one full sequence.
   This is the width the scroll gets folded back by to loop. */
function cycleWidth(el: HTMLElement) {
  const head = el.children[0] as HTMLElement | undefined;
  const tail = el.children[SLIDES.length] as HTMLElement | undefined;
  return head && tail ? tail.offsetLeft - head.offsetLeft : 0;
}

export function HeroTemplateCarousel() {
  const reduced = useReducedMotion();
  const [index, setIndex] = React.useState(0);
  const [drifting, setDrifting] = React.useState(true);
  const [inView, setInView] = React.useState(true);
  const scrollerRef = React.useRef<HTMLDivElement>(null);
  const resumeTimer = React.useRef(0);
  const hoveringRef = React.useRef(false);
  const draggingRef = React.useRef(false);
  const focusingRef = React.useRef(false);

  React.useEffect(() => () => window.clearTimeout(resumeTimer.current), []);

  /* Off-screen the strip has no audience — stop paying for its
     animation while the visitor is elsewhere on the page. */
  React.useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  React.useEffect(() => {
    const el = scrollerRef.current;
    if (!el || reduced || !drifting || !inView) return;
    let raf = 0;
    let last = performance.now();
    const step = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      el.scrollLeft += DRIFT_PX_PER_S * dt;
      const cycle = cycleWidth(el);
      if (cycle) {
        if (el.scrollLeft >= cycle) el.scrollLeft -= cycle;
        else if (el.scrollLeft < 0) el.scrollLeft += cycle;
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [drifting, inView, reduced]);

  /* The scroll position stays the source of truth; the index is
     whichever template's centre is nearest the strip's centre —
     measured on the loop's circle, so a clone and its original are
     the same slide. Every way of moving — drift, swipe, arrows, the
     switcher — ends in the same state without a second copy of it. */
  function nearestIndex() {
    const el = scrollerRef.current;
    if (!el) return index;
    const cycle = cycleWidth(el);
    if (!cycle) return index;
    const center = el.scrollLeft + el.clientWidth / 2;
    let best = 0;
    let bestDist = Infinity;
    for (let i = 0; i < SLIDES.length; i++) {
      const slide = el.children[i] as HTMLElement;
      let d = Math.abs(slide.offsetLeft + slide.offsetWidth / 2 - center) % cycle;
      d = Math.min(d, cycle - d);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    }
    return best;
  }

  function onScroll() {
    const best = nearestIndex();
    if (best !== index) setIndex(best);
  }

  /* Everything the visitor does means "let me read": stop the drift,
     bring the snap back so the nearest template settles centred, and
     start moving again a few seconds later — never while a pointer is
     still on the strip or the region still holds focus. */
  function pauseDrift() {
    window.clearTimeout(resumeTimer.current);
    setDrifting(false);
  }

  function scheduleResume() {
    window.clearTimeout(resumeTimer.current);
    resumeTimer.current = window.setTimeout(() => {
      if (!hoveringRef.current && !draggingRef.current && !focusingRef.current) {
        setDrifting(true);
      }
    }, RESUME_AFTER_MS);
  }

  /* Jumping more than a cycle away is wasted motion: pick the copy of
     the slide — original or clone — closest to where we already are. */
  function goTo(i: number) {
    const el = scrollerRef.current;
    if (!el) return;
    const clamped = ((i % SLIDES.length) + SLIDES.length) % SLIDES.length;
    const slide = el.children[clamped] as HTMLElement | undefined;
    if (!slide) return;
    let target = slide.offsetLeft + slide.offsetWidth / 2 - el.clientWidth / 2;
    const cycle = cycleWidth(el);
    if (cycle) {
      const forward = target + cycle;
      target = Math.abs(forward - el.scrollLeft) < Math.abs(target - el.scrollLeft) ? forward : target;
    }
    pauseDrift();
    el.scrollTo({ left: target, behavior: reduced ? "auto" : "smooth" });
  }

  return (
    <div>
      <div className="relative">
        <div
          ref={scrollerRef}
          onScroll={onScroll}
          onPointerEnter={(e) => {
            hoveringRef.current = true;
            pauseDrift();
            /* A finger's pointerenter is immediately a drag — settle
               only for the mouse, where it means "I stopped to look". */
            if (e.pointerType !== "touch") goTo(nearestIndex());
          }}
          onPointerLeave={() => {
            hoveringRef.current = false;
            scheduleResume();
          }}
          onPointerDown={() => {
            draggingRef.current = true;
            pauseDrift();
          }}
          onPointerUp={() => {
            draggingRef.current = false;
            scheduleResume();
          }}
          onPointerCancel={() => {
            draggingRef.current = false;
            scheduleResume();
          }}
          /* Only a horizontal wheel is aimed at the strip; a vertical
             one is the page scrolling past and should not disturb it. */
          onWheel={(e) => {
            if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
            pauseDrift();
            scheduleResume();
          }}
          onFocus={() => {
            focusingRef.current = true;
            pauseDrift();
            goTo(nearestIndex());
          }}
          onBlur={() => {
            focusingRef.current = false;
            scheduleResume();
          }}
          tabIndex={0}
          role="region"
          aria-roledescription="carousel"
          aria-label="Template demos"
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") {
              goTo(index - 1);
              scheduleResume();
            }
            if (e.key === "ArrowRight") {
              goTo(index + 1);
              scheduleResume();
            }
          }}
          /* The side padding is half the leftover width, so the first and
             last slides can scroll to the centre like every other one —
             without it they would park hard against the strip's edges.
             Snap is off while drifting so the two never fight, and back
             on the moment the visitor takes over. */
          className={`flex items-start gap-4 overflow-x-auto overscroll-x-contain rounded-xl px-[7%] outline-none focus-visible:ring-2 focus-visible:ring-(--primary)/40 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-5 sm:px-[15%] ${
            drifting && !reduced ? "snap-none" : "snap-x snap-mandatory"
          }`}
        >
          {/* The second pass is the loop made flesh: identical pixels
              one cycle along, so folding the scroll back is invisible.
              Clones are inert — the keyboard and screen readers should
              meet each template exactly once. */}
          {[...SLIDES, ...SLIDES].map(({ slug, tab, caption, Demo }, i) => {
            const clone = i >= SLIDES.length;
            const n = i % SLIDES.length;
            return (
            /* w-full, not w-[70%]: a percentage width would resolve
               against the content box the paddings have already shrunk,
               compounding to a slide narrower than designed. Filling the
               content box makes the padding the sole controller of the
               peek ratio — px-[15%] ⇒ slide = 70% of the strip. */
            <div
              key={clone ? `${slug}-repeat` : slug}
              aria-roledescription={clone ? undefined : "slide"}
              aria-label={clone ? undefined : `${n + 1} of ${SLIDES.length}: ${tab}`}
              aria-hidden={clone || undefined}
              inert={clone || undefined}
              className={`w-full shrink-0 snap-center transition-[opacity,transform] duration-300 ease-out ${
                n === index ? "opacity-100" : "opacity-45 scale-[0.98]"
              }`}
            >
              <Demo caption={false} />
              {/* Only the centred slide keeps its caption: a half-clipped
                  sentence at the strip's edge reads as a bug, not a peek. */}
              <p
                className={`mt-3 text-center text-xs leading-5 text-(--muted-foreground) transition-opacity duration-300 ${
                  n === index ? "opacity-100" : "opacity-0"
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
            );
          })}
        </div>

        {/* Arrows, for the machines a swipe is not an option on. Wide
            enough, they leave the strip entirely; otherwise they float
            over the frame's own chrome. The loop has no ends, so they
            never disable — prev from the first template is the last. */}
        <button
          type="button"
          onClick={() => {
            goTo(index - 1);
            scheduleResume();
          }}
          aria-label="Previous template"
          className="absolute top-1/2 left-2 z-10 hidden h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-(--border) bg-(--card)/90 text-(--muted-foreground) shadow-sm backdrop-blur transition-all hover:text-(--foreground) sm:grid xl:-left-12"
        >
          <ChevronLeft size={18} strokeWidth={2} aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => {
            goTo(index + 1);
            scheduleResume();
          }}
          aria-label="Next template"
          className="absolute top-1/2 right-2 z-10 hidden h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-(--border) bg-(--card)/90 text-(--muted-foreground) shadow-sm backdrop-blur transition-all hover:text-(--foreground) sm:grid xl:-right-12"
        >
          <ChevronRight size={18} strokeWidth={2} aria-hidden />
        </button>
      </div>

      {/* Same switcher the tool tour used. The hairline no longer
          narrates a timer — the strip beneath it is what moves now, so
          the active line is simply full. */}
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
              onClick={() => {
                goTo(i);
                scheduleResume();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  goTo(i);
                  scheduleResume();
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
