/* ------------------------------------------------------------------ */
/* Small animated previews for the homepage tool cards.                */
/*                                                                     */
/* Each one is an abstraction of what the tool does, not a screenshot:  */
/* pure markup + CSS (see app/tool-previews.css), so there is nothing   */
/* to download, it stays crisp at any size and it follows dark mode.    */
/* Server component on purpose — these ship zero JS.                   */
/* ------------------------------------------------------------------ */

import { ModelIcon } from "@/components/brands/brand-icon";

const previews: Record<string, () => React.ReactElement> = {
  "model-switcher": ModelSwitcherPreview,
  "chat-mockup": ChatMockupPreview,
  "theme-generator": ThemeGeneratorPreview,
  "flow-diagram": FlowDiagramPreview,
  "voice-mockup": VoiceMockupPreview,
  "token-counter": TokenCounterPreview,
  "screenshot-mockup": ScreenshotMockupPreview,
  "voice-scripts": VoiceScriptsPreview,
  "prompt-generator": PromptGeneratorPreview,
  playground: PlaygroundPreview,
};

export function hasToolPreview(slug: string) {
  return slug in previews;
}

export function ToolPreview({ slug }: { slug: string }) {
  const Preview = previews[slug] ?? GenericPreview;
  return (
    <div className="tp" aria-hidden>
      <Preview />
    </div>
  );
}

/* Centres a fixed-size stage so every preview keeps the same optical
   scale no matter how wide the card gets. */
function Stage({ children }: { children: React.ReactNode }) {
  return (
    <div className="absolute inset-0 grid place-items-center p-4">
      <div className="w-[240px]">{children}</div>
    </div>
  );
}

function ModelSwitcherPreview() {
  return (
    <Stage>
      <div
        className="relative flex rounded-lg border border-(--border) bg-(--card) p-1"
        style={{ boxShadow: "var(--shadow-sm)" }}
      >
        <div
          className="tp-thumb absolute top-1 bottom-1 left-1 rounded-md border"
          style={{
            width: "calc((100% - 0.5rem) / 3)",
            background: "var(--primary-muted)",
            borderColor: "var(--primary)",
          }}
        />
        {["Sonnet", "Opus", "Haiku"].map((name) => (
          <div
            key={name}
            className="relative z-10 flex flex-1 items-center justify-center gap-1 py-1.5 text-[11px] font-medium text-(--muted-foreground)"
          >
            <ModelIcon name={`Claude ${name}`} size={10} />
            {name}
          </div>
        ))}
      </div>
      <div className="mt-3 flex justify-center gap-1.5">
        {["Dropdown", "Segmented", "Pills"].map((v) => (
          <span
            key={v}
            className="rounded-full border border-(--border) bg-(--card) px-2 py-0.5 text-[9px] text-(--muted-foreground)"
          >
            {v}
          </span>
        ))}
      </div>
    </Stage>
  );
}

function ChatMockupPreview() {
  return (
    <Stage>
      <div className="space-y-2">
        <div className="flex justify-end">
          <div
            className="tp-bubble rounded-xl rounded-br-sm px-3 py-1.5 text-[10px] text-(--primary-foreground)"
            style={{ background: "var(--primary)", animationDelay: "0s" }}
          >
            How do I stream tokens?
          </div>
        </div>
        <div className="flex justify-start">
          <div
            className="tp-bubble w-[170px] space-y-1.5 rounded-xl rounded-bl-sm border border-(--border) bg-(--card) p-2.5"
            style={{ boxShadow: "var(--shadow-sm)", animationDelay: "0.6s" }}
          >
            {["100%", "85%", "60%"].map((w, i) => (
              <div
                key={w}
                className="tp-line h-1.5 rounded-full bg-(--border)"
                style={{ width: w, animationDelay: `${0.8 + i * 0.35}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    </Stage>
  );
}

function ThemeGeneratorPreview() {
  return (
    <Stage>
      <div className="tp-hue">
        <div
          className="rounded-xl border border-(--border) bg-(--card) p-2.5"
          style={{ boxShadow: "var(--shadow-sm)" }}
        >
          <div className="flex justify-end">
            <div className="h-4 w-24 rounded-md rounded-br-sm" style={{ background: "#7c3aed" }} />
          </div>
          <div className="mt-1.5 flex justify-start">
            <div className="h-4 w-32 rounded-md rounded-bl-sm" style={{ background: "#ede9fe" }} />
          </div>
          <div className="mt-2.5 flex items-center gap-1.5 rounded-lg border border-(--border) px-2 py-1.5">
            <div className="h-1.5 flex-1 rounded-full bg-(--border)" />
            <div className="h-3.5 w-3.5 rounded-md" style={{ background: "#7c3aed" }} />
          </div>
        </div>
        <div className="mt-3 flex justify-center gap-1.5">
          {["#7c3aed", "#8b5cf6", "#a78bfa", "#c4b5fd", "#ede9fe"].map((c) => (
            <div key={c} className="h-4 w-4 rounded-full" style={{ background: c }} />
          ))}
        </div>
      </div>
    </Stage>
  );
}

function FlowDiagramPreview() {
  /* A step, a decision diamond, two outcomes. An earlier version drew the
     split *and* the merge back together, but at this size the four elbows
     read as a dashed box around the nodes rather than as a flow. */
  const node = (x: number, y: number, delay: string) => (
    <g key={`${x}-${y}`}>
      <rect
        x={x}
        y={y}
        width={58}
        height={18}
        rx={5}
        className="tp-active"
        fill="var(--card)"
        stroke="var(--muted-foreground)"
        strokeOpacity={0.35}
        style={{ animationDelay: delay }}
      />
      <rect x={x + 12} y={y + 7.5} width={34} height={3} rx={1.5} fill="var(--muted-foreground)" opacity={0.45} />
    </g>
  );
  return (
    <Stage>
      <svg viewBox="0 0 200 114" className="w-full" role="presentation">
        <g stroke="var(--primary)" strokeWidth={1.5} fill="none" opacity={0.5}>
          <path className="tp-flow" d="M100 30 V40" />
          <path className="tp-flow" d="M100 64 V74 H47 V86" />
          <path className="tp-flow" d="M100 74 H153 V86" />
        </g>
        {node(71, 12, "0s")}
        <polygon
          points="100,40 114,52 100,64 86,52"
          className="tp-active"
          fill="var(--card)"
          stroke="var(--muted-foreground)"
          strokeOpacity={0.35}
          strokeWidth={1}
          style={{ animationDelay: "1.2s" }}
        />
        {node(18, 86, "2.4s")}
        {node(124, 86, "2.4s")}
      </svg>
    </Stage>
  );
}

function VoiceMockupPreview() {
  const heights = [40, 68, 100, 76, 52, 88, 100, 60, 36];
  return (
    <Stage>
      <div
        className="rounded-xl border border-(--border) bg-(--card) px-4 py-5"
        style={{ boxShadow: "var(--shadow-sm)" }}
      >
        <div className="flex h-12 items-center justify-center gap-1.5">
          {heights.map((h, i) => (
            <div
              key={i}
              className="tp-bar w-1.5 rounded-full"
              style={{
                height: `${h}%`,
                background: "var(--primary)",
                animationDelay: `${i * 0.09}s`,
              }}
            />
          ))}
        </div>
        <div className="mt-3 text-center text-[10px] text-(--muted-foreground)">Listening…</div>
      </div>
    </Stage>
  );
}

function TokenCounterPreview() {
  const widths = [22, 34, 16, 28, 40, 20, 30, 24, 38, 18, 26, 32];
  return (
    <Stage>
      <div
        className="rounded-xl border border-(--border) bg-(--card) p-3"
        style={{ boxShadow: "var(--shadow-sm)" }}
      >
        <div className="flex flex-wrap gap-1">
          {widths.map((w, i) => (
            <div
              key={i}
              className="tp-chip h-2 rounded-sm"
              style={{ width: w, animationDelay: `${i * 0.12}s` }}
            />
          ))}
        </div>
        <div className="mt-3 h-1 overflow-hidden rounded-full bg-(--border)">
          <div className="tp-meter h-full rounded-full" style={{ background: "var(--primary)" }} />
        </div>
        <div className="mt-2 flex justify-between text-[9px] text-(--muted-foreground)">
          <span>o200k_base</span>
          <span>1,284 tokens · $0.006</span>
        </div>
      </div>
    </Stage>
  );
}

/* The four below exist because /tools now uses this same card. On the
   homepage only the six featured tools appear and all of them had a
   preview; the full list fell through to GenericPreview, which made four
   different tools look like the same grey placeholder. */

function ScreenshotMockupPreview() {
  return (
    <Stage>
      {/* A browser frame with a screenshot dropping into it. */}
      <div
        className="overflow-hidden rounded-xl border border-(--border) bg-(--card)"
        style={{ boxShadow: "var(--shadow-sm)" }}
      >
        <div className="flex items-center gap-1 border-b border-(--border) bg-(--muted)/60 px-2 py-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-(--border)" />
          <span className="h-1.5 w-1.5 rounded-full bg-(--border)" />
          <span className="h-1.5 w-1.5 rounded-full bg-(--border)" />
          <span className="ml-1 h-1.5 flex-1 rounded-full bg-(--border)" />
        </div>
        <div className="grid h-[76px] place-items-center p-2">
          <div
            className="tp-drop h-full w-full rounded-md"
            style={{
              background:
                "linear-gradient(135deg, var(--primary-muted) 0%, var(--muted) 55%, var(--primary-muted) 100%)",
              border: "1px solid var(--border)",
            }}
          />
        </div>
      </div>
      <div className="mt-3 flex justify-center gap-1.5">
        {["iPhone", "MacBook", "Browser"].map((d) => (
          <span
            key={d}
            className="rounded-full border border-(--border) bg-(--card) px-2 py-0.5 text-[9px] text-(--muted-foreground)"
          >
            {d}
          </span>
        ))}
      </div>
    </Stage>
  );
}

function VoiceScriptsPreview() {
  const rows = ["Booking a table", "Rescheduling a call", "Reading a summary"];
  return (
    <Stage>
      <div
        className="relative rounded-xl border border-(--border) bg-(--card) p-1.5"
        style={{ boxShadow: "var(--shadow-sm)" }}
      >
        {/* The picker walks the list, the way you skim ready-made scripts. */}
        <div
          className="tp-step absolute inset-x-1.5 top-1.5 rounded-md border"
          style={{
            height: "calc((100% - 0.75rem) / 3)",
            background: "var(--primary-muted)",
            borderColor: "var(--primary)",
          }}
        />
        {rows.map((r) => (
          <div
            key={r}
            className="relative z-10 flex items-center gap-1.5 px-2 py-1.5 text-[10px] text-(--muted-foreground)"
          >
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-(--muted-foreground)" />
            {r}
          </div>
        ))}
      </div>
    </Stage>
  );
}

function PromptGeneratorPreview() {
  return (
    <Stage>
      <div
        className="rounded-xl border border-(--border) bg-(--card) p-2.5"
        style={{ boxShadow: "var(--shadow-sm)" }}
      >
        <p className="text-[9px] font-medium tracking-wide text-(--muted-foreground) uppercase">
          Prompt
        </p>
        <div className="mt-1.5 space-y-1.5">
          {["100%", "88%", "64%"].map((w, i) => (
            <div
              key={w}
              className="tp-line h-1.5 rounded-full bg-(--border)"
              style={{ width: w, animationDelay: `${i * 0.4}s`, transformOrigin: "left center" }}
            />
          ))}
        </div>
        <div className="mt-2.5 flex items-center gap-1.5">
          <span className="tp-chip h-4 w-16 rounded-md" />
          <span className="text-[9px] text-(--muted-foreground)">v0 · Claude · Cursor</span>
        </div>
      </div>
    </Stage>
  );
}

function PlaygroundPreview() {
  return (
    <Stage>
      <div
        className="flex gap-2 rounded-xl border border-(--border) bg-(--card) p-2"
        style={{ boxShadow: "var(--shadow-sm)" }}
      >
        {/* Controls on the left, the component answering on the right —
            the whole point of the playground in one frame. */}
        <div className="w-[74px] shrink-0 space-y-1.5 border-r border-(--border) pr-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-1">
              <span className="h-1 flex-1 rounded-full bg-(--border)" />
              {/* The delay goes on both halves: animation-delay does not
                  inherit, and a knob out of step with its track reads as
                  a bug rather than as a switch. */}
              <span
                className="tp-toggle flex h-2.5 w-4 shrink-0 items-center rounded-full px-[2px]"
                style={{ animationDelay: `${i * 0.9}s` }}
              >
                <span
                  className="tp-knob h-1.5 w-1.5 rounded-full bg-(--card)"
                  style={{ animationDelay: `${i * 0.9}s` }}
                />
              </span>
            </div>
          ))}
        </div>
        <div className="flex-1 space-y-1.5">
          <div className="flex gap-1">
            <span className="tp-chip h-3 w-8 rounded" />
            <span className="tp-chip h-3 w-6 rounded" style={{ animationDelay: "1.6s" }} />
          </div>
          {["100%", "76%", "90%"].map((w, i) => (
            <div
              key={w}
              className="tp-line h-1.5 rounded-full bg-(--border)"
              style={{ width: w, animationDelay: `${0.3 + i * 0.3}s`, transformOrigin: "left center" }}
            />
          ))}
        </div>
      </div>
    </Stage>
  );
}

function GenericPreview() {
  return (
    <Stage>
      <div
        className="rounded-xl border border-(--border) bg-(--card) p-3"
        style={{ boxShadow: "var(--shadow-sm)" }}
      >
        {["100%", "70%", "85%"].map((w, i) => (
          <div
            key={w}
            className="tp-line mt-1.5 h-2 rounded-full bg-(--border) first:mt-0"
            style={{ width: w, animationDelay: `${i * 0.3}s`, transformOrigin: "left center" }}
          />
        ))}
      </div>
    </Stage>
  );
}
