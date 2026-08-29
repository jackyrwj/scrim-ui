"use client";

import * as React from "react";

/* ------------------------------------------------------------------ */
/* Scripted replays for /tools cards.                                  */
/*                                                                     */
/* Where ToolPreview is an abstraction drawn in CSS, these mount the    */
/* tool's own preview component and drive it through a scripted         */
/* timeline — the same contract the /templates cards follow, minus the  */
/* working buttons: a tool card is a link to the tool, so the band is   */
/* pointer-events-none and a click anywhere opens the real editor.      */
/*                                                                     */
/* Geometry: the band is square (taller than the 16:9 CSS-preview band,*/
/* because a replay needs room to be legible) and each demo renders at  */
/* a fixed design size, scaled to fit and centred. Fixed design size    */
/* means no natural-height measuring — one ResizeObserver for the band  */
/* width is the whole job.                                             */
/* ------------------------------------------------------------------ */

type DemoComponent = React.LazyExoticComponent<() => React.ReactElement>;

const demos: Record<string, { C: DemoComponent; w: number; h: number }> = {
  "chat-mockup": {
    C: React.lazy(() => import("./chat-mockup-demo").then((m) => ({ default: m.ChatMockupDemo }))),
    w: 390,
    h: 440,
  },
  "model-switcher": {
    C: React.lazy(() => import("./model-switcher-demo").then((m) => ({ default: m.ModelSwitcherDemo }))),
    w: 340,
    h: 330,
  },
  "theme-generator": {
    C: React.lazy(() => import("./theme-generator-demo").then((m) => ({ default: m.ThemeGeneratorDemo }))),
    w: 340,
    h: 420,
  },
  "token-counter": {
    C: React.lazy(() => import("./token-counter-demo").then((m) => ({ default: m.TokenCounterDemo }))),
    w: 340,
    h: 330,
  },
  "voice-mockup": {
    C: React.lazy(() => import("./voice-mockup-demo").then((m) => ({ default: m.VoiceMockupDemo }))),
    w: 390,
    h: 450,
  },
  "response-diff": {
    C: React.lazy(() => import("./response-diff-demo").then((m) => ({ default: m.ResponseDiffDemo }))),
    w: 360,
    h: 390,
  },
  "screenshot-mockup": {
    C: React.lazy(() =>
      import("./screenshot-mockup-demo").then((m) => ({ default: m.ScreenshotMockupDemo })),
    ),
    w: 340,
    h: 340,
  },
  "prompt-generator": {
    C: React.lazy(() =>
      import("./prompt-generator-demo").then((m) => ({ default: m.PromptGeneratorDemo })),
    ),
    w: 340,
    h: 420,
  },
  "voice-scripts": {
    C: React.lazy(() =>
      import("./voice-scripts-demo").then((m) => ({ default: m.VoiceScriptsDemo })),
    ),
    w: 340,
    h: 470,
  },
  "pricing-calculator": {
    C: React.lazy(() =>
      import("./pricing-calculator-demo").then((m) => ({ default: m.PricingCalculatorDemo })),
    ),
    w: 340,
    h: 330,
  },
  "system-prompt-builder": {
    C: React.lazy(() =>
      import("./system-prompt-builder-demo").then((m) => ({ default: m.SystemPromptBuilderDemo })),
    ),
    w: 340,
    h: 420,
  },
  "mcp-config-builder": {
    C: React.lazy(() =>
      import("./mcp-config-builder-demo").then((m) => ({ default: m.McpConfigBuilderDemo })),
    ),
    w: 340,
    h: 400,
  },
  "workshop": {
    C: React.lazy(() => import("./workshop-demo").then((m) => ({ default: m.WorkshopDemo }))),
    w: 340,
    h: 470,
  },
  "playground": {
    C: React.lazy(() => import("./playground-demo").then((m) => ({ default: m.PlaygroundDemo }))),
    w: 340,
    h: 360,
  },
};

export function ToolCardDemo({ slug }: { slug: string }) {
  const entry = demos[slug];
  const bandRef = React.useRef<HTMLDivElement>(null);
  const [near, setNear] = React.useState(false);
  const [width, setWidth] = React.useState(0);

  /* Load the chunk before the card scrolls in, not when it is visible. */
  React.useEffect(() => {
    const el = bandRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => entry.isIntersecting && setNear(true), {
      rootMargin: "400px 0px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  React.useEffect(() => {
    const el = bandRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  if (!entry) return null;

  /* Square band: height === width, so one measurement fits both axes. */
  const scale = width > 0 ? Math.min(width / entry.w, width / entry.h) : 0;

  return (
    <div
      ref={bandRef}
      aria-hidden
      className="pointer-events-none relative aspect-square shrink-0 select-none overflow-hidden border-b border-(--border)"
      style={{
        background:
          "radial-gradient(ellipse at 50% 120%, var(--primary-muted) 0%, transparent 65%), var(--muted)",
      }}
    >
      {near && scale > 0 && (
        <div
          className="absolute"
          style={{
            left: (width - entry.w * scale) / 2,
            top: (width - entry.h * scale) / 2,
            width: entry.w * scale,
            height: entry.h * scale,
          }}
        >
          <div
            style={{
              width: entry.w,
              height: entry.h,
              transform: scale === 1 ? undefined : `scale(${scale})`,
              transformOrigin: "top left",
            }}
          >
            <React.Suspense fallback={null}>
              <entry.C />
            </React.Suspense>
          </div>
        </div>
      )}
    </div>
  );
}
