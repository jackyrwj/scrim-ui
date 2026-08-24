"use client";

/* ------------------------------------------------------------------ */
/* Hero showcase — an auto-playing tour of three real tools.           */
/*                                                                     */
/* This is deliberately NOT a screen recording. Everything on screen   */
/* is the same component the tool page renders, driven by a scripted   */
/* timeline and a fake cursor. It follows dark mode, stays sharp at    */
/* any size, ships no media bytes, and never goes stale.               */
/*                                                                     */
/* Hovering pauses the script and hands the controls to the visitor.   */
/* ------------------------------------------------------------------ */

import * as React from "react";
import { MockupPreview } from "@/components/tools/chat-mockup/mockup-preview";
import {
  defaultConfig as chatDefaults,
  type MockupConfig,
} from "@/components/tools/chat-mockup/types";
import { SwitcherPreview } from "@/components/tools/model-switcher/switcher-preview";
import { generateCode } from "@/components/tools/model-switcher/generate-code";
import {
  defaultConfig as switcherDefaults,
  type ModelSwitcherConfig,
  type SwitcherVariant,
} from "@/components/tools/model-switcher/types";
import { layoutNodes } from "@/components/tools/flow-diagram/layout-engine";
import { renderFlowSvg } from "@/components/tools/flow-diagram/render-svg";
import type { FlowNode } from "@/components/tools/flow-diagram/types";

/* ------------------------------------------------------------------ */
/* Media queries, read without an effect so no state is set on mount   */
/* ------------------------------------------------------------------ */

function mediaStore(query: string) {
  return {
    subscribe(onChange: () => void) {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    get() {
      return window.matchMedia(query).matches;
    },
  };
}

const narrowStore = mediaStore("(max-width: 640px)");
const reducedStore = mediaStore("(prefers-reduced-motion: reduce)");
const serverFalse = () => false;

/* ------------------------------------------------------------------ */
/* Slide 1 — AI Chat Mockup Generator                                  */
/* ------------------------------------------------------------------ */

type ChatState = {
  reasoning: boolean;
  tools: boolean;
  sources: boolean;
  streaming: boolean;
};

const CHAT_INITIAL: ChatState = {
  reasoning: false,
  tools: false,
  sources: false,
  streaming: true,
};

/** Two turns instead of the tool's three — the hero has less vertical room. */
const CHAT_MESSAGES = chatDefaults.messages.slice(1);

function buildChatConfig(state: ChatState, narrow: boolean, reduced: boolean): MockupConfig {
  const lastIndex = CHAT_MESSAGES.length - 1;
  return {
    ...chatDefaults,
    device: narrow ? "mobile" : "tablet",
    streaming: state.streaming && !reduced,
    showAttachments: false,
    messages: CHAT_MESSAGES.map((msg, i) =>
      i === lastIndex
        ? {
            ...msg,
            reasoning: state.reasoning,
            tools: state.tools,
            sources: state.sources,
          }
        : msg,
    ),
  };
}

/* ------------------------------------------------------------------ */
/* Slide 3 — AI Conversation Flow Diagram                              */
/* ------------------------------------------------------------------ */

const FLOW_PRESETS: { key: string; label: string; nodes: FlowNode[] }[] = [
  {
    key: "flow-simple",
    label: "Simple reply",
    nodes: [
      { id: "f1", type: "user-message", label: "User asks a question", description: "" },
      { id: "f2", type: "ai-response", label: "Model answers", description: "Streams the reply" },
    ],
  },
  {
    key: "flow-tools",
    label: "With a tool call",
    nodes: [
      { id: "g1", type: "user-message", label: "User asks a question", description: "" },
      { id: "g2", type: "ai-response", label: "Model plans the work", description: "Picks the tools" },
      { id: "g3", type: "tool-call", label: "Search the web", description: "External API call" },
      { id: "g4", type: "ai-response", label: "Model answers with sources", description: "" },
    ],
  },
  {
    key: "flow-approval",
    label: "With an approval gate",
    nodes: [
      { id: "h1", type: "user-message", label: "User asks for a change", description: "" },
      { id: "h2", type: "tool-call", label: "Draft the action", description: "" },
      {
        id: "h3",
        type: "approval-gate",
        label: "Run the action?",
        description: "",
        branches: [
          {
            id: "h3a",
            label: "Approved",
            nodes: [{ id: "h4", type: "tool-call", label: "Execute it", description: "" }],
          },
          {
            id: "h3b",
            label: "Rejected",
            nodes: [{ id: "h5", type: "ai-response", label: "Explain what was skipped", description: "" }],
          },
        ],
      },
      { id: "h6", type: "ai-response", label: "Report the result", description: "" },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Slide definitions                                                   */
/* ------------------------------------------------------------------ */

type SlideId = "chat-mockup" | "model-switcher" | "flow-diagram";

const SLIDES: {
  id: SlideId;
  slug: string;
  tab: string;
  headline: string;
  /** Intrinsic px width of the stage content, used to compute the fit scale. */
  width: number;
  narrowWidth: number;
  /** Intrinsic px height, for the slides that are taller than the stage. */
  fitHeight?: boolean;
}[] = [
  {
    id: "chat-mockup",
    slug: "chat-mockup",
    tab: "Chat Mockup",
    headline: "Compose an AI chat screen, export it as a PNG.",
    width: 700,
    narrowWidth: 390,
    fitHeight: true,
  },
  {
    id: "model-switcher",
    slug: "model-switcher",
    tab: "Model Switcher",
    headline: "Design the model picker, copy the React component.",
    width: 620,
    narrowWidth: 340,
    fitHeight: true,
  },
  {
    id: "flow-diagram",
    slug: "flow-diagram",
    tab: "Flow Diagram",
    headline: "Map an agent flow, export it as SVG.",
    width: 700,
    narrowWidth: 340,
    fitHeight: true,
  },
];

/** Every step: move the cursor to a control, click it, hold for `dwell` ms. */
type Step = { key: string; dwell: number };

const MOVE_MS = 620;
const HOLD_AFTER_SLIDE = 1400;

const SCRIPTS: Record<SlideId, Step[]> = {
  "chat-mockup": [
    { key: "chat-reasoning", dwell: 1500 },
    { key: "chat-tools", dwell: 1500 },
    { key: "chat-sources", dwell: 2200 },
  ],
  "model-switcher": [
    { key: "variant-segmented", dwell: 1700 },
    { key: "variant-pills", dwell: 1700 },
    { key: "variant-command", dwell: 2000 },
  ],
  "flow-diagram": [
    { key: "flow-tools", dwell: 2000 },
    { key: "flow-approval", dwell: 2600 },
  ],
};

function slideDuration(id: SlideId): number {
  return (
    SCRIPTS[id].reduce((sum, s) => sum + MOVE_MS + s.dwell, 0) + HOLD_AFTER_SLIDE
  );
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export function HeroShowcase() {
  const narrow = React.useSyncExternalStore(narrowStore.subscribe, narrowStore.get, serverFalse);
  const reduced = React.useSyncExternalStore(reducedStore.subscribe, reducedStore.get, serverFalse);

  const [slideIndex, setSlideIndex] = React.useState(0);
  const [step, setStep] = React.useState(0);
  const [hovered, setHovered] = React.useState(false);
  const [visible, setVisible] = React.useState(false);

  const [chat, setChat] = React.useState<ChatState>(CHAT_INITIAL);
  const [switcher, setSwitcher] = React.useState<ModelSwitcherConfig>(() => ({
    ...switcherDefaults,
    variant: "dropdown",
    fullWidth: false,
  }));
  const [flowPreset, setFlowPreset] = React.useState(0);

  const rootRef = React.useRef<HTMLDivElement>(null);
  const frameRef = React.useRef<HTMLDivElement>(null);
  const stageRef = React.useRef<HTMLDivElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const cursorRef = React.useRef<HTMLDivElement>(null);

  const slide = SLIDES[slideIndex];
  const running = visible && !hovered && !reduced;
  const contentWidth = narrow ? slide.narrowWidth : slide.width;
  const fitHeight = slide.fitHeight ?? false;

  /* The paper pose. It leans further back before it has been scrolled to,
     settles into a light tilt, and lies flat once the visitor engages.
     Phones get no tilt at all — there is no hover there to undo it. */
  const tilt = narrow || reduced || hovered ? "flat" : visible ? "rest" : "enter";

  /* --- Applying one scripted step -------------------------------- */

  const applyControl = React.useCallback((key: string) => {
    if (key.startsWith("chat-")) {
      const field = key.slice(5) as keyof ChatState;
      setChat((c) => ({ ...c, [field]: !c[field] }));
      return;
    }
    if (key.startsWith("variant-")) {
      setSwitcher((c) => ({ ...c, variant: key.slice(8) as SwitcherVariant }));
      return;
    }
    if (key.startsWith("flow-")) {
      const index = FLOW_PRESETS.findIndex((p) => p.key === key);
      if (index >= 0) setFlowPreset(index);
    }
  }, []);

  /* --- Reset a slide's state when it comes back around ------------ */

  const resetSlide = React.useCallback((id: SlideId) => {
    if (id === "chat-mockup") setChat(CHAT_INITIAL);
    if (id === "model-switcher") setSwitcher((c) => ({ ...c, variant: "dropdown" }));
    if (id === "flow-diagram") setFlowPreset(0);
  }, []);

  /* --- Only animate while actually on screen ---------------------- */

  React.useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.25 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  /* --- The timeline ----------------------------------------------- */

  React.useEffect(() => {
    if (!running) return;
    const script = SCRIPTS[slide.id];

    if (step >= script.length) {
      const timer = window.setTimeout(() => {
        const next = (slideIndex + 1) % SLIDES.length;
        resetSlide(SLIDES[next].id);
        setSlideIndex(next);
        setStep(0);
      }, HOLD_AFTER_SLIDE);
      return () => window.clearTimeout(timer);
    }

    const current = script[step];
    const timers = [
      window.setTimeout(() => {
        cursorRef.current?.classList.add("hs-cursor-click");
        applyControl(current.key);
      }, MOVE_MS),
      window.setTimeout(() => cursorRef.current?.classList.remove("hs-cursor-click"), MOVE_MS + 220),
      window.setTimeout(() => setStep((s) => s + 1), MOVE_MS + current.dwell),
    ];
    return () => timers.forEach(window.clearTimeout);
  }, [running, slide.id, slideIndex, step, applyControl, resetSlide]);

  /* --- Park the fake cursor over the control the script is about to
         press. Written straight to the node so no render is needed. -- */

  const cursorTarget = running && !narrow ? SCRIPTS[slide.id][step]?.key : undefined;

  React.useEffect(() => {
    const cursor = cursorRef.current;
    const frame = frameRef.current;
    if (!cursor || !frame) return;
    if (!cursorTarget) {
      cursor.style.opacity = "0";
      return;
    }
    const target = frame.querySelector<HTMLElement>(`[data-ctl="${cursorTarget}"]`);
    if (!target) return;
    /* Both rects are read in the same (tilted) screen space, so the
       difference stays correct inside the transformed frame. */
    const a = target.getBoundingClientRect();
    const b = frame.getBoundingClientRect();
    cursor.style.opacity = "1";
    cursor.style.transform = `translate3d(${a.left - b.left + a.width * 0.6}px, ${
      a.top - b.top + a.height * 0.62
    }px, 0)`;
  }, [cursorTarget, slideIndex, narrow]);

  /* --- Scale the stage content down to fit, and centre it vertically
         while it is still shorter than the stage. ------------------- */

  React.useEffect(() => {
    const stage = stageRef.current;
    const content = contentRef.current;
    if (!stage || !content) return;

    const fit = () => {
      const available = stage.clientWidth - (narrow ? 16 : 40);
      content.style.transform = "";
      const naturalHeight = content.offsetHeight;
      let scale = Math.min(1, available / contentWidth);
      if (fitHeight) {
        scale = Math.min(scale, (stage.clientHeight - 40) / naturalHeight);
      }
      content.style.transform = `scale(${scale})`;
      /* transform-origin is top center, so the visual box stays centred on
         the layout box. mx-auto cannot produce the negative margin this
         needs once the content is wider than the stage. */
      content.style.marginLeft = `${Math.round((available - contentWidth) / 2)}px`;
      const slack = stage.clientHeight - naturalHeight * scale;
      content.style.marginTop = slack > 48 ? `${Math.round(slack / 2)}px` : "16px";
    };

    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(stage);
    observer.observe(content);
    return () => observer.disconnect();
  }, [contentWidth, narrow, fitHeight]);

  /* --- Slide content ---------------------------------------------- */

  /* The tool renders the diagram at 100% width, which makes a tall
     narrow flow enormous. In the hero it is pinned to a fixed height
     instead, so every preset lands at the same visual weight. */
  const flowSvg = React.useMemo(() => {
    const { positioned, edges, merges, viewBox } = layoutNodes(FLOW_PRESETS[flowPreset].nodes);
    return renderFlowSvg(positioned, edges, merges, viewBox, "").replace(
      'style="width:100%;height:auto"',
      `style="height:${narrow ? 240 : 430}px;width:auto;display:block"`,
    );
  }, [flowPreset, narrow]);

  const chatConfig = React.useMemo(
    () => buildChatConfig(chat, narrow, reduced),
    [chat, narrow, reduced],
  );

  /* A peek at the component the tool actually exports, cut at the
     ModelSwitcher declaration so the body visibly changes with the
     variant — which is the whole point of the slide. */
  const switcherCode = React.useMemo(() => {
    const lines = generateCode(switcher).split("\n");
    const start = lines.findIndex((l) => l.startsWith("export function ModelSwitcher"));
    return lines.slice(start < 0 ? 0 : start, (start < 0 ? 0 : start) + 11).join("\n");
  }, [switcher]);

  const controls: { key: string; label: string; active: boolean }[] =
    slide.id === "chat-mockup"
      ? [
          { key: "chat-reasoning", label: "Reasoning", active: chat.reasoning },
          { key: "chat-tools", label: "Tool call", active: chat.tools },
          { key: "chat-sources", label: "Sources", active: chat.sources },
          { key: "chat-streaming", label: "Streaming", active: chat.streaming },
        ]
      : slide.id === "model-switcher"
        ? [
            { key: "variant-dropdown", label: "Dropdown", active: switcher.variant === "dropdown" },
            { key: "variant-segmented", label: "Segmented", active: switcher.variant === "segmented" },
            { key: "variant-pills", label: "Pills", active: switcher.variant === "pills" },
            { key: "variant-command", label: "Command list", active: switcher.variant === "command" },
          ]
        : FLOW_PRESETS.map((p, i) => ({ key: p.key, label: p.label, active: flowPreset === i }));

  return (
    <div
      ref={rootRef}
      className="relative"
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      {/* The camera rig.
          At rest the frame is pushed past the viewport edges and rolled in
          3D, so it reads as a sheet of paper shot up close — each slide
          gets its own angle, and a slow drift keeps the shot alive.
          Hovering pulls the camera back to flat, which is also the moment
          the controls become usable. */}
      <div className="hs-viewport">
        <div className="hs-camera" data-tilt={tilt} data-shot={slide.id}>
          <div className="hs-drift" data-tilt={tilt}>
            <div
              ref={frameRef}
              className="hs-frame relative overflow-hidden rounded-2xl border border-(--border) bg-(--card)"
            >
              {/* Chrome */}
              <div className="flex items-center gap-3 border-b border-(--border) bg-(--muted)/50 px-4 py-2.5">
                <div className="flex shrink-0 gap-1.5" aria-hidden>
                  <span className="h-2.5 w-2.5 rounded-full bg-(--border)" />
                  <span className="h-2.5 w-2.5 rounded-full bg-(--border)" />
                  <span className="h-2.5 w-2.5 rounded-full bg-(--border)" />
                </div>
                <div className="min-w-0 flex-1 truncate rounded-md bg-(--background) px-3 py-1 text-center font-mono text-[11px] text-(--muted-foreground)">
                  ai-ui-resources.app/tools/{slide.slug}
                </div>
                <span className="hidden shrink-0 items-center gap-1.5 text-[11px] text-(--muted-foreground) sm:inline-flex">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${running ? "bg-emerald-500" : "bg-(--muted-foreground)"}`}
                    aria-hidden
                  />
                  {hovered ? "You're driving" : "Live — hover to take over"}
                </span>
              </div>

              {/* Body */}
              <div className="flex flex-col sm:flex-row">
                {/* Control rail — the same switches the real tool page has */}
                <div className="hs-rail flex shrink-0 gap-2 overflow-x-auto border-b border-(--border) p-3 sm:w-52 sm:flex-col sm:overflow-visible sm:border-b-0 sm:border-r sm:p-4">
                  <p className="hidden text-[11px] font-medium tracking-wide text-(--muted-foreground) uppercase sm:block">
                    {slide.id === "chat-mockup" ? "Include" : slide.id === "model-switcher" ? "Variant" : "Preset"}
                  </p>
                  {controls.map((c) => (
                    <button
                      key={c.key}
                      type="button"
                      data-ctl={c.key}
                      onClick={() => applyControl(c.key)}
                      aria-pressed={c.active}
                      className={`shrink-0 rounded-lg border px-3 py-2 text-left text-xs font-medium whitespace-nowrap transition-all sm:text-[13px] ${
                        c.active
                          ? "border-(--primary)/40 bg-(--primary-muted) text-(--primary-muted-foreground)"
                          : "border-(--border) text-(--muted-foreground) hover:border-(--primary)/30 hover:text-(--foreground)"
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                  <p className="mt-auto hidden text-xs leading-5 text-(--muted-foreground) sm:block">
                    {slide.headline}
                  </p>
                </div>

                {/* Stage */}
                <div
                  ref={stageRef}
                  // w-full on phones, where the body stacks: `flex-1` in a
                  // column flex with no definite height let the stage grow to
                  // whatever the un-scaled content wanted, which is the height
                  // the fit calculation is trying to measure against.
                  className="hs-stage relative w-full min-w-0 overflow-hidden bg-(--muted)/30 px-2 sm:flex-1 sm:px-5"
                  style={{ height: narrow ? 520 : 560 }}
                >
                  <div ref={contentRef} className="origin-top" style={{ width: contentWidth }}>
                    {slide.id === "chat-mockup" && <MockupPreview config={chatConfig} />}

                    {slide.id === "model-switcher" && (
                      <div className="space-y-3">
                        <div className="rounded-2xl border border-zinc-200 bg-white p-7 shadow-2xl dark:border-zinc-800">
                          <SwitcherPreview
                            config={switcher}
                            onSelect={(id) => setSwitcher((c) => ({ ...c, selectedId: id }))}
                          />
                        </div>
                        <div className="overflow-hidden rounded-2xl bg-zinc-950 px-4 pt-3 pb-4 text-left shadow-2xl">
                          <p className="mb-2 font-mono text-[10px] tracking-wide text-zinc-500 uppercase">
                            ModelSwitcher.tsx — exported for this exact config
                          </p>
                          <pre className="hs-code overflow-hidden font-mono text-[11px] leading-5 text-zinc-300">
                            {switcherCode}
                          </pre>
                        </div>
                      </div>
                    )}

                    {slide.id === "flow-diagram" && (
                      <div
                        className="mx-auto w-fit rounded-2xl border border-zinc-200 bg-white p-4 shadow-2xl dark:border-zinc-800"
                        dangerouslySetInnerHTML={{ __html: flowSvg }}
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Fake cursor. It lives inside the frame so it tilts with it. */}
              <div
                ref={cursorRef}
                aria-hidden
                className="hs-cursor pointer-events-none absolute top-0 left-0 z-20 opacity-0"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 drop-shadow-md">
                  <path
                    d="M5 2.5 19.5 11 12.6 12.4 9.4 19z"
                    fill="var(--foreground)"
                    stroke="var(--background)"
                    strokeWidth="1.6"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="hs-cursor-ring absolute -top-1.5 -left-1.5 h-8 w-8 rounded-full border-2 border-(--primary)" />
              </div>
            </div>
          </div>
        </div>

        {/* Lives outside the camera rig so it stays flat and legible while
            the shot behind it is rolled over. */}
        <span
          className="hs-hint pointer-events-none absolute right-4 bottom-4 z-30 hidden items-center gap-1.5 sm:inline-flex rounded-full border border-(--border) bg-(--card)/85 px-3 py-1.5 text-[11px] font-medium text-(--muted-foreground) backdrop-blur"
          data-tilt={tilt}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${running ? "bg-emerald-500" : "bg-(--muted-foreground)"}`}
            aria-hidden
          />
          Hover to take over
        </span>
      </div>

      {/* What you are looking at, as a caption rather than a control.
          The tour drives itself; three tab buttons above the frame asked
          the reader to operate a thing that was already playing, and put
          three competing calls to action next to the one that matters. */}
      <ol className="mt-5 grid gap-x-6 gap-y-4 sm:grid-cols-3">
        {SLIDES.map((s, i) => {
          const active = i === slideIndex;
          return (
            <li key={s.id} aria-current={active ? "step" : undefined}>
              <div className="relative h-px w-full overflow-hidden bg-(--border)">
                {active && !reduced && (
                  <span
                    key={`${slideIndex}-${running}`}
                    aria-hidden
                    className="hs-progress absolute inset-y-0 left-0"
                    style={{
                      background: "var(--primary)",
                      animationDuration: `${slideDuration(s.id)}ms`,
                      animationPlayState: running ? "running" : "paused",
                    }}
                  />
                )}
                {active && reduced && (
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
                <span className={active ? "text-(--foreground)" : "text-(--muted-foreground)"}>
                  {s.tab}
                </span>
              </p>
              <p className="mt-1 text-[13px] leading-5 text-(--muted-foreground)">{s.headline}</p>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
