"use client";

import * as React from "react";

/**
 * A template demo, shrunk into a list-page card.
 *
 * The demos were built for the detail pages, where one of them gets the
 * whole column. Five of them at natural size would make this page a
 * scrollathon, so each one renders at a fixed design width and is scaled
 * to the card width exactly — edge to edge, no matting, so the card's top
 * half IS the app. The height is measured rather than guessed: transforms
 * do not change layout, so the outer box has to be sized explicitly.
 *
 * The design width follows the VIEWPORT, not the card, because the demos'
 * own breakpoints do: their `sm:` rules answer to the window. Rendering at
 * 760px on a desktop viewport means the demo draws its full desktop layout
 * (sidebar and all) and the scale turns it into a miniature of the app,
 * which is exactly what a card preview should be.
 *
 * The demo chunks are lazy and only load once the card is near the
 * viewport — five demos eager would drag every showcase component onto a
 * listing page. Until one arrives the band is a bare muted rectangle at
 * the estimated height; the 400px lead means it is almost never seen.
 */

const demos: Record<string, React.LazyExoticComponent<(props: { caption?: boolean }) => React.ReactElement>> = {
  "ai-chat": React.lazy(() => import("./ai-chat-demo").then((m) => ({ default: m.AiChatDemo }))),
  "rag-qa": React.lazy(() => import("./rag-qa-demo").then((m) => ({ default: m.RagQaDemo }))),
  "agent-console": React.lazy(() => import("./agent-console-demo").then((m) => ({ default: m.AgentConsoleDemo }))),
  "structured-extraction": React.lazy(() =>
    import("./structured-extraction-demo").then((m) => ({ default: m.StructuredExtractionDemo })),
  ),
  "generative-ui": React.lazy(() => import("./generative-ui-demo").then((m) => ({ default: m.GenerativeUiDemo }))),
};

const WIDE = "(min-width: 640px)";

/* Design geometry per viewport mode: the width the demo renders at, and a
   rough natural height (window chrome + the demo's fixed body height) so
   the pre-load band is close enough that the real height is a nudge. */
const DESIGN = {
  wide: { width: 760, height: 520 },
  narrow: { width: 400, height: 455 },
} as const;

function useWideViewport(): boolean {
  return React.useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(WIDE);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => window.matchMedia(WIDE).matches,
    () => true,
  );
}

export function TemplateCardDemo({ slug }: { slug: string }) {
  const Demo = demos[slug];
  const wide = useWideViewport();
  const design = wide ? DESIGN.wide : DESIGN.narrow;

  const outerRef = React.useRef<HTMLDivElement>(null);
  const innerRef = React.useRef<HTMLDivElement>(null);

  const [near, setNear] = React.useState(false);
  const [cardWidth, setCardWidth] = React.useState(0);
  const [natural, setNatural] = React.useState(0);

  /* Load the demo chunk when the card is close, not when it is visible —
     by the time it scrolls in, the band should already be the app. */
  React.useEffect(() => {
    const el = outerRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => entry.isIntersecting && setNear(true), {
      rootMargin: "400px 0px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  React.useEffect(() => {
    const el = outerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setCardWidth(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  React.useEffect(() => {
    const el = innerRef.current;
    if (!el || !near) return;
    const ro = new ResizeObserver(([entry]) => setNatural(entry.contentRect.height));
    ro.observe(el);
    return () => ro.disconnect();
  }, [near]);

  if (!Demo) return null;

  const scale = cardWidth > 0 ? cardWidth / design.width : 0;
  const height =
    natural > 0
      ? natural * scale
      : cardWidth > 0
        ? design.height * scale
        : design.height * 0.72;

  return (
    <div
      ref={outerRef}
      className="tcd relative overflow-hidden border-b border-(--border) bg-(--muted)"
      style={{ height, transition: "height 300ms" }}
    >
      {near && scale > 0 && (
        <div
          className="relative"
          style={{
            width: design.width * scale,
            height: natural > 0 ? natural * scale : 0,
            opacity: natural > 0 ? 1 : 0,
            transition: "opacity 300ms",
          }}
        >
          <div
            ref={innerRef}
            className="absolute left-0 top-0"
            style={{
              width: design.width,
              transform: scale === 1 ? undefined : `scale(${scale})`,
              transformOrigin: "top left",
            }}
          >
            <React.Suspense fallback={null}>
              <Demo caption={false} />
            </React.Suspense>
          </div>
        </div>
      )}
    </div>
  );
}
