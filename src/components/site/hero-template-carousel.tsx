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
/* seam to see. It opens mid-drift — the first slide already part-way  */
/* off the left edge — never parked beside a blank flank. Anything     */
/* the visitor does — hover, grab, swipe, an arrow key — stops the     */
/* drift; a moment after they let go, it starts moving again. Hover    */
/* only freezes the strip where it stands: a cursor crossing the edge  */
/* is not a request to move anything, and yanking the nearest card to  */
/* centre read as a jump, not an invitation. The deliberate moves —    */
/* a swipe, the arrows — are what settle a template dead centre.       */
/* Each slide is the real template demo, running its own scripted      */
/* loop on its own clock.                                              */
/* ------------------------------------------------------------------ */

import * as React from "react";
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

/* How fast the strip drifts when nobody is holding it. Two resume
   waits: a deliberate move buys the strip a beat for its snap or
   momentum to settle, but a hover owes nothing — the visitor only
   looked, so the drift starts again almost as soon as they leave. */
const DRIFT_PX_PER_S = 40;
const RESUME_AFTER_MS = 1500;
const RESUME_AFTER_HOVER_MS = 300;

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
  /* Snap-on is its own switch, not "not drifting": a hover also stops the
     drift, and turning snap on where the strip happens to be stopped makes
     the browser snap on the spot — the teleport. Only deliberate moves
     earn snap. */
  const [snapping, setSnapping] = React.useState(false);
  const [inView, setInView] = React.useState(true);
  const scrollerRef = React.useRef<HTMLDivElement>(null);
  const resumeTimer = React.useRef(0);
  const hoveringRef = React.useRef(false);
  const draggingRef = React.useRef(false);
  /* Whether the current pause still owes a settle. A pause that began
     with a deliberate move keeps the long wait even if the cursor
     wanders off mid-settle; a hover's pause owes nothing and resumes
     fast. Cleared only when the drift actually restarts. */
  const awaitingSettleRef = React.useRef(false);

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

  /* Opening on scrollLeft 0 parks the first slide dead centre, which
     leaves the whole left padding empty — a static carousel with a
     missing window, not a moving strip. Start mid-transit instead:
     the first slide already part-way off the left edge, the second
     entering on the right — the exact picture the drift is about to
     keep painting. Reduced motion keeps the centred, snapped start:
     with nothing moving, the empty flank is just padding. */
  const startedRef = React.useRef(false);
  React.useEffect(() => {
    const el = scrollerRef.current;
    if (!el || startedRef.current || reduced) return;
    const head = el.children[0] as HTMLElement | undefined;
    const cycle = cycleWidth(el);
    if (!head || !cycle) return;
    const slot = cycle / SLIDES.length;
    const centered = head.offsetLeft + head.offsetWidth / 2 - el.clientWidth / 2;
    el.scrollLeft = centered + slot * 0.45;
    startedRef.current = true;
  }, [reduced]);

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

  /* Everything the visitor does means "let me read". Hover just
     freezes the strip where it stands — re-centring on the way in
     was a jump, not a settle; a swipe or an explicit jump is what
     ends centred, with snap back on to finish the move. Leaving
     starts the drift again almost at once — a look needs no
     cool-down — while a deliberate move buys a beat for the settle,
     and nothing resumes while a pointer is on the strip. */
  function pauseDrift() {
    window.clearTimeout(resumeTimer.current);
    setDrifting(false);
  }

  /* What a deliberate move gets that a hover does not: snap back on, so
     the move ends centred. Enabling snap mid-transit makes the browser
     snap immediately — that teleport is exactly what a hover must not
     do. */
  function pauseToSettle() {
    pauseDrift();
    setSnapping(true);
    awaitingSettleRef.current = true;
  }

  function scheduleResume(after = RESUME_AFTER_MS) {
    window.clearTimeout(resumeTimer.current);
    resumeTimer.current = window.setTimeout(() => {
      if (!hoveringRef.current && !draggingRef.current) {
        setDrifting(true);
        setSnapping(false);
        awaitingSettleRef.current = false;
      }
    }, after);
  }

  function endDrag() {
    draggingRef.current = false;
    scheduleResume();
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
    pauseToSettle();
    el.scrollTo({ left: target, behavior: reduced ? "auto" : "smooth" });
  }

  return (
    <div>
      <div className="relative">
        <div
          ref={scrollerRef}
          onScroll={onScroll}
          onPointerEnter={() => {
            hoveringRef.current = true;
            pauseDrift();
          }}
          onPointerLeave={() => {
            hoveringRef.current = false;
            /* A pause that was only a hover owes no settle: start
               again almost at once. One that began with a move keeps
               the full wait — its snap may still be finishing. */
            scheduleResume(awaitingSettleRef.current ? RESUME_AFTER_MS : RESUME_AFTER_HOVER_MS);
          }}
          onPointerDown={() => {
            draggingRef.current = true;
            pauseToSettle();
            /* A flung drag can end outside the window, where no
               pointerup lands on the strip — watch from up top, or
               the drag flag outlives the drag and the drift never
               comes back. */
            window.addEventListener("pointerup", endDrag, { once: true });
            window.addEventListener("pointercancel", endDrag, { once: true });
          }}
          /* Only a horizontal wheel is aimed at the strip; a vertical
             one is the page scrolling past and should not disturb it. */
          onWheel={(e) => {
            if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
            pauseToSettle();
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
             Snap is off while drifting (they would fight) and off under a
             hovering cursor (engaging it mid-transit snaps on the spot —
             the teleport); deliberate moves turn it on to settle, and
             reduced motion keeps it on because nothing moves anyway. */
          className={`flex items-start gap-4 overflow-x-auto overscroll-x-contain rounded-xl px-[7%] outline-none focus-visible:ring-2 focus-visible:ring-(--primary)/40 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-5 sm:px-[15%] ${
            !reduced && !snapping ? "snap-none" : "snap-x snap-mandatory"
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
              /* For now the slides are strictly a moving preview: nothing
                 inside them is clickable. The demos carry real buttons
                 and inputs that a marketing page has no business
                 answering, and a click target inside a drifting strip
                 invites misclicks. Events fall through to the strip
                 itself, so pause-on-hover and swipe still work. The
                 full experience lives on the template's own page. */
              className={`pointer-events-none w-full shrink-0 snap-center transition-[opacity,transform] duration-300 ease-out ${
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
                <span className="font-medium text-(--foreground)">{tab}</span> — {caption}
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
    </div>
  );
}
