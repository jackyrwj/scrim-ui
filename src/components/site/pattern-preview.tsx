/* ------------------------------------------------------------------ */
/* Static previews for the /patterns cards.                            */
/*                                                                     */
/* Same pure-markup + CSS idea as component-preview.tsx (nothing to     */
/* download, crisp at any size, follows dark mode, zero JS), but at a   */
/* different altitude: a Component preview shows one control's shape,   */
/* a Pattern preview shows how a whole screen is arranged. The reader   */
/* picking between "AI Chat" and "AI Research Assistant" is choosing a  */
/* layout, so the layout is what the tile has to carry — a rail on the  */
/* left, a composer pinned to the bottom, an approval bar under a diff. */
/*                                                                     */
/* One entry per pattern, on purpose: tiles that all looked alike would */
/* be worse than the text cards this replaced.                          */
/* ------------------------------------------------------------------ */

import { ModelIcon } from "@/components/brands/brand-icon";

const previews: Record<string, () => React.ReactElement> = {
  "ai-chat": AIChatPreview,
  "research-assistant": ResearchAssistantPreview,
  "coding-agent": CodingAgentPreview,
  "voice-assistant": VoiceAssistantPreview,
  "model-preferences": ModelPreferencesPreview,
  "artifact-workspace": ArtifactWorkspacePreview,
  "rag-workspace": RagWorkspacePreview,
  "extraction-review": ExtractionReviewPreview,
  "image-studio": ImageStudioPreview,
  "agent-console": AgentConsolePreview,
  "support-copilot": SupportCopilotPreview,
  "generative-dashboard": GenerativeDashboardPreview,
};

export function PatternPreview({ slug, size = "md" }: { slug: string; size?: "md" | "lg" }) {
  const Preview = previews[slug] ?? GenericPreview;
  return (
    <div className={`pp${size === "lg" ? " pp--lg" : ""}`} aria-hidden>
      <Preview />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Shared bits                                                         */
/* ------------------------------------------------------------------ */

/* Fixed-size stage, as on the component and tool grids: every pattern
   keeps the same optical scale however wide the card gets. */
function Stage({ children }: { children: React.ReactNode }) {
  return (
    <div className="absolute inset-0 grid place-items-center p-3.5">
      <div className="pp-stage">{children}</div>
    </div>
  );
}

/* The window every pattern lives in. A pattern is a screen, so it gets a
   screen: one bordered surface at a fixed height, which is what makes the
   five tiles comparable at a glance. */
function Screen({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex h-[150px] overflow-hidden rounded-lg border border-(--border) bg-(--card)"
      style={{ boxShadow: "var(--shadow-sm)" }}
    >
      {children}
    </div>
  );
}

function Line({
  w,
  delay = 0,
  tone = "border",
}: {
  w: string;
  delay?: number;
  tone?: "border" | "primary";
}) {
  return (
    <div
      className={`cp-line h-1.5 rounded-full ${tone === "primary" ? "" : "bg-(--border)"}`}
      style={{
        width: w,
        animationDelay: `${delay}s`,
        ...(tone === "primary" ? { background: "var(--primary)", opacity: 0.5 } : null),
      }}
    />
  );
}

function Chip({ children, active = false }: { children: React.ReactNode; active?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[8px] leading-3 ${
        active
          ? "text-(--primary-muted-foreground)"
          : "border border-(--border) text-(--muted-foreground)"
      }`}
      style={active ? { background: "var(--primary-muted)" } : undefined}
    >
      {children}
    </span>
  );
}

function Dot({ tone = "primary" }: { tone?: "primary" | "muted" }) {
  return (
    <span
      className="cp-dot h-1.5 w-1.5 shrink-0 rounded-full"
      style={{ background: tone === "primary" ? "var(--primary)" : "var(--muted-foreground)" }}
    />
  );
}

function Caret() {
  return (
    <span
      className="cp-caret ml-px inline-block h-[8px] w-px translate-y-[1px] rounded-full align-middle"
      style={{ background: "var(--primary)" }}
    />
  );
}

/* The composer strip. Three of the five patterns end in one, and that
   repetition is the point — it is the same component underneath. */
function Composer({ label = "Ask anything…" }: { label?: string }) {
  return (
    <div className="border-t border-(--border) px-2 py-1.5">
      <div className="flex items-center gap-1.5 rounded-md border border-(--border) px-1.5 py-1">
        <span className="text-[8px] leading-3 text-(--muted-foreground)">
          {label}
          <Caret />
        </span>
        <span
          className="ml-auto h-3 w-3 shrink-0 rounded-[3px]"
          style={{ background: "var(--primary)" }}
        />
      </div>
    </div>
  );
}

/* --- ai-chat: rail, thread, composer ------------------------------- */
function AIChatPreview() {
  return (
    <Stage>
      <Screen>
        {/* Conversation rail */}
        <div className="w-[72px] shrink-0 space-y-1 border-r border-(--border) bg-(--muted)/50 p-1.5">
          <div className="rounded-[4px] border border-dashed border-(--border) px-1 py-1 text-center text-[7px] leading-none text-(--muted-foreground)">
            + New
          </div>
          <div className="space-y-1 pt-0.5">
            <div className="rounded-[4px] px-1 py-1" style={{ background: "var(--primary-muted)" }}>
              <Line w="82%" />
            </div>
            <div className="px-1 py-1">
              <Line w="70%" delay={0.06} />
            </div>
            <div className="px-1 py-1">
              <Line w="88%" delay={0.12} />
            </div>
          </div>
        </div>
        {/* Thread */}
        <div className="flex flex-1 flex-col">
          <div className="flex-1 space-y-2 p-2">
            <div className="flex justify-end">
              <div
                className="w-[52%] space-y-1 rounded-md rounded-br-[2px] px-1.5 py-1.5"
                style={{ background: "var(--primary)" }}
              >
                <div className="h-1.5 w-full rounded-full bg-(--primary-foreground) opacity-70" />
                <div className="h-1.5 w-[62%] rounded-full bg-(--primary-foreground) opacity-70" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Line w="100%" />
              <Line w="92%" delay={0.1} />
              <div className="flex items-center">
                <Line w="58%" delay={0.2} />
                <Caret />
              </div>
            </div>
            <div className="flex gap-1">
              <Chip>1</Chip>
              <Chip>2</Chip>
            </div>
          </div>
          <Composer />
        </div>
      </Screen>
    </Stage>
  );
}

/* --- research-assistant: tool calls, then a cited answer ------------ */
function ResearchAssistantPreview() {
  return (
    <Stage>
      <Screen>
        <div className="flex flex-1 flex-col">
          <div className="flex-1 space-y-1.5 px-2 py-1.5">
            {/* the search run */}
            <div className="space-y-1 rounded-md border border-(--border) p-1.5">
              <div className="flex items-center gap-1">
                <Dot />
                <span className="text-[8px] leading-3 text-(--muted-foreground)">
                  Searching the web
                </span>
                <span className="ml-auto text-[8px] leading-3 text-(--muted-foreground)">3</span>
              </div>
              <Line w="76%" delay={0.06} />
            </div>
            {/* the answer */}
            <div className="space-y-1.5 pt-0.5">
              <Line w="100%" delay={0.18} />
              <div className="flex items-center gap-1">
                <Line w="64%" delay={0.24} />
                <Chip active>1</Chip>
                <Chip active>2</Chip>
              </div>
            </div>
            {/* sources */}
            <div className="flex gap-1.5 pt-0.5">
              {[0, 1].map((i) => (
                <div
                  key={i}
                  className="flex-1 space-y-1 rounded-md border border-(--border) bg-(--muted)/50 p-1.5"
                >
                  <Line w="70%" delay={0.3 + i * 0.06} />
                </div>
              ))}
            </div>
          </div>
          <Composer label="Ask a follow-up…" />
        </div>
      </Screen>
    </Stage>
  );
}

/* --- coding-agent: a run, a diff, and the gate in front of it ------- */
function CodingAgentPreview() {
  return (
    <Stage>
      <Screen>
        <div className="flex flex-1 flex-col">
          {/* status bar */}
          <div className="flex items-center gap-1 border-b border-(--border) px-2 py-1.5">
            <Dot />
            <span className="text-[8px] leading-3 text-(--muted-foreground)">Running · step 3</span>
            <span className="ml-auto">
              <Chip>edit</Chip>
            </span>
          </div>
          <div className="flex-1 space-y-1.5 p-2">
            {/* diff */}
            <div className="overflow-hidden rounded-md border border-(--border)">
              <div className="space-y-[3px] p-1.5">
                <div className="flex items-center gap-1">
                  <span className="w-1 text-[7px] leading-3 text-(--muted-foreground)">-</span>
                  <div
                    className="cp-line h-1.5 flex-1 rounded-full"
                    style={{ background: "color-mix(in oklab, #ef4444 45%, transparent)" }}
                  />
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-1 text-[7px] leading-3 text-(--muted-foreground)">+</span>
                  <div
                    className="cp-line h-1.5 w-[78%] rounded-full"
                    style={{
                      background: "color-mix(in oklab, #22c55e 50%, transparent)",
                      animationDelay: "0.08s",
                    }}
                  />
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-1 text-[7px] leading-3 text-(--muted-foreground)">+</span>
                  <div
                    className="cp-line h-1.5 w-[60%] rounded-full"
                    style={{
                      background: "color-mix(in oklab, #22c55e 50%, transparent)",
                      animationDelay: "0.16s",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
          {/* approval gate */}
          <div className="flex items-center gap-1.5 border-t border-(--border) px-2 py-1.5">
            <span className="text-[8px] leading-3 text-(--muted-foreground)">Apply this edit?</span>
            <span className="ml-auto rounded-[4px] border border-(--border) px-1.5 py-0.5 text-[8px] leading-3 text-(--muted-foreground)">
              Deny
            </span>
            <span
              className="rounded-[4px] px-1.5 py-0.5 text-[8px] leading-3 text-(--primary-foreground)"
              style={{ background: "var(--primary)" }}
            >
              Approve
            </span>
          </div>
        </div>
      </Screen>
    </Stage>
  );
}

/* --- voice-assistant: the waveform is the whole interface ----------- */
function VoiceAssistantPreview() {
  const bars = [5, 11, 17, 23, 15, 9, 19, 25, 13, 7, 15, 21, 11, 6];
  return (
    <Stage>
      <Screen>
        <div className="flex flex-1 flex-col">
          {/* transcript so far */}
          <div className="space-y-1.5 p-2">
            <div className="flex justify-end">
              <div
                className="w-[38%] rounded-md rounded-br-[2px] px-1.5 py-1"
                style={{ background: "var(--primary)" }}
              >
                <div className="h-1.5 w-full rounded-full bg-(--primary-foreground) opacity-70" />
              </div>
            </div>
            <Line w="86%" delay={0.1} />
          </div>
          {/* live waveform */}
          <div className="flex flex-1 items-center justify-center gap-[3px] px-3">
            {bars.map((h, i) => (
              <span
                key={i}
                className="cp-dot w-[3px] rounded-full"
                style={{
                  height: `${h}px`,
                  background: "var(--primary)",
                  opacity: 0.75,
                  animationDelay: `${i * 0.05}s`,
                }}
              />
            ))}
          </div>
          {/* mic, with the typed fallback beside it */}
          <div className="flex items-center gap-1.5 border-t border-(--border) px-2 py-1.5">
            <span
              className="h-4 w-4 shrink-0 rounded-full"
              style={{ background: "var(--primary)" }}
            />
            <span className="text-[8px] leading-3 text-(--muted-foreground)">Listening…</span>
            <span className="ml-auto">
              <Chip>Type instead</Chip>
            </span>
          </div>
        </div>
      </Screen>
    </Stage>
  );
}

/* --- model-preferences: a settings screen, so: rows and controls ---- */
function ModelPreferencesPreview() {
  return (
    <Stage>
      <Screen>
        {/* settings rail */}
        <div className="w-[62px] shrink-0 space-y-1.5 border-r border-(--border) bg-(--muted)/50 p-1.5">
          <div className="rounded-[4px] px-1 py-1" style={{ background: "var(--primary-muted)" }}>
            <Line w="80%" />
          </div>
          <div className="px-1">
            <Line w="66%" delay={0.06} />
          </div>
          <div className="px-1">
            <Line w="74%" delay={0.12} />
          </div>
        </div>
        <div className="flex-1 space-y-2 p-2">
          {/* model row */}
          <div className="flex items-center gap-1.5 rounded-md border border-(--border) px-1.5 py-1">
            <ModelIcon name="Claude Sonnet 5" size={9} />
            <span className="text-[8px] leading-3 text-(--muted-foreground)">Sonnet 5</span>
            <span className="ml-auto text-[7px] leading-3 text-(--muted-foreground)">▾</span>
          </div>
          {/* reasoning level, segmented */}
          <div className="flex gap-1">
            {["Fast", "Balanced", "Deep"].map((l, i) => (
              <span
                key={l}
                className={`flex-1 rounded-[4px] py-0.5 text-center text-[7px] leading-3 ${
                  i === 1
                    ? "text-(--primary-muted-foreground)"
                    : "border border-(--border) text-(--muted-foreground)"
                }`}
                style={i === 1 ? { background: "var(--primary-muted)" } : undefined}
              >
                {l}
              </span>
            ))}
          </div>
          {/* tool toggles */}
          {[true, false].map((on, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <Line w={on ? "42%" : "34%"} delay={0.12 + i * 0.06} />
              <span
                className={`ml-auto flex h-2.5 w-4 shrink-0 items-center rounded-full px-[2px] ${
                  on ? "" : "bg-(--border)"
                }`}
                style={on ? { background: "var(--primary)" } : undefined}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full bg-(--card) ${on ? "ml-auto" : ""}`}
                />
              </span>
            </div>
          ))}
          {/* memory */}
          <div className="flex gap-1 pt-0.5">
            <Chip active>Remembers</Chip>
            <Chip>+2</Chip>
          </div>
        </div>
      </Screen>
    </Stage>
  );
}

/* A status dot in a real status colour (the shared Dot only knows
   primary/muted). Still carries cp-dot so it pulses like the rest. */
function StatusDot({ color }: { color: string }) {
  return (
    <span
      className="cp-dot h-1.5 w-1.5 shrink-0 rounded-full"
      style={{ background: color }}
    />
  );
}

const GREEN = "color-mix(in oklab, #22c55e 80%, transparent)";
const AMBER = "color-mix(in oklab, #f59e0b 85%, transparent)";
const RED = "color-mix(in oklab, #ef4444 80%, transparent)";

/* --- artifact-workspace: the chat drives a versioned artifact panel -- */
function ArtifactWorkspacePreview() {
  return (
    <Stage>
      <Screen>
        {/* conversation rail */}
        <div className="w-[54px] shrink-0 space-y-1 border-r border-(--border) bg-(--muted)/50 p-1.5">
          <div className="rounded-[4px] px-1 py-1" style={{ background: "var(--primary-muted)" }}>
            <Line w="82%" />
          </div>
          <div className="px-1 py-1">
            <Line w="64%" delay={0.06} />
          </div>
          <div className="px-1 py-1">
            <Line w="76%" delay={0.12} />
          </div>
        </div>
        {/* chat */}
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex-1 space-y-1.5 p-2">
            <div className="flex justify-end">
              <div
                className="w-[58%] rounded-md rounded-br-[2px] px-1.5 py-1"
                style={{ background: "var(--primary)" }}
              >
                <div className="h-1.5 w-full rounded-full bg-(--primary-foreground) opacity-70" />
              </div>
            </div>
            <div className="space-y-1">
              <Line w="96%" delay={0.1} />
              <div className="flex items-center">
                <Line w="52%" delay={0.18} />
                <Caret />
              </div>
            </div>
          </div>
          <Composer />
        </div>
        {/* artifact docked on the right, versioned */}
        <div className="flex w-[92px] shrink-0 flex-col border-l border-(--border)">
          <div className="flex items-center gap-1 border-b border-(--border) px-1.5 py-1">
            <span className="text-[7px] leading-3 text-(--muted-foreground)">Chart</span>
            <span className="ml-auto">
              <Chip active>v2</Chip>
            </span>
          </div>
          <div className="flex flex-1 items-end justify-center gap-[3px] px-2 pt-2">
            {[10, 18, 13, 24, 20].map((h, i) => (
              <span
                key={i}
                className="w-[7px] rounded-[2px]"
                style={{
                  height: `${h * 2.2}px`,
                  background: "var(--primary)",
                  opacity: i === 3 ? 0.9 : 0.4,
                }}
              />
            ))}
          </div>
          <div className="px-2 pb-1.5">
            <Line w="70%" delay={0.24} />
          </div>
        </div>
      </Screen>
    </Stage>
  );
}

/* --- rag-workspace: documents in, a cited answer out ----------------- */
function RagWorkspacePreview() {
  return (
    <Stage>
      <Screen>
        {/* document rail */}
        <div className="w-[64px] shrink-0 space-y-1 border-r border-(--border) bg-(--muted)/50 p-1.5">
          <p className="px-1 text-[7px] leading-3 text-(--muted-foreground)">Docs</p>
          <div className="rounded-[4px] px-1 py-1" style={{ background: "var(--primary-muted)" }}>
            <Line w="80%" />
          </div>
          {[0.06, 0.12].map((d) => (
            <div key={d} className="flex items-center gap-1 px-1 py-1">
              <Line w="70%" delay={d} />
              <StatusDot color={GREEN} />
            </div>
          ))}
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex-1 space-y-1.5 p-2">
            {/* cited answer */}
            <div className="space-y-1">
              <Line w="100%" delay={0.08} />
              <div className="flex items-center gap-1">
                <Line w="72%" delay={0.16} />
                <Chip active>1</Chip>
              </div>
              <div className="flex items-center gap-1">
                <Line w="54%" delay={0.24} />
                <Chip active>2</Chip>
                <Caret />
              </div>
            </div>
            {/* inspectable sources */}
            <div className="flex gap-1.5 pt-0.5">
              {[0, 1].map((i) => (
                <div
                  key={i}
                  className="flex-1 space-y-1 rounded-md border border-(--border) bg-(--muted)/50 p-1.5"
                >
                  <Line w="68%" delay={0.32 + i * 0.06} />
                </div>
              ))}
            </div>
          </div>
          {/* context budget */}
          <div className="flex items-center gap-1.5 px-2 pb-1">
            <div className="h-1 flex-1 rounded-full bg-(--border)">
              <div
                className="h-full w-[62%] rounded-full"
                style={{ background: "var(--primary)", opacity: 0.55 }}
              />
            </div>
            <span className="text-[7px] leading-3 tabular-nums text-(--muted-foreground)">62%</span>
          </div>
          <Composer label="Ask about your docs…" />
        </div>
      </Screen>
    </Stage>
  );
}

/* --- extraction-review: fields fill in, the flagged ones wait -------- */
function ExtractionReviewPreview() {
  return (
    <Stage>
      <Screen>
        {/* document rail */}
        <div className="w-[56px] shrink-0 space-y-1 border-r border-(--border) bg-(--muted)/50 p-1.5">
          <div className="rounded-[4px] px-1 py-1" style={{ background: "var(--primary-muted)" }}>
            <Line w="80%" />
          </div>
          <div className="px-1 py-1">
            <Line w="62%" delay={0.06} />
          </div>
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          {/* progress header */}
          <div className="flex items-center gap-1 border-b border-(--border) px-2 py-1.5">
            <Dot />
            <span className="text-[8px] leading-3 text-(--muted-foreground)">
              Extracting · 4 of 6
            </span>
            <span className="ml-auto">
              <Chip>invoice.pdf</Chip>
            </span>
          </div>
          <div className="flex-1 space-y-1.5 p-2">
            {/* confirmed field */}
            <div className="flex items-center gap-1.5">
              <Line w="24%" delay={0.08} />
              <Line w="38%" delay={0.14} />
              <span className="ml-auto">
                <StatusDot color={GREEN} />
              </span>
            </div>
            {/* the field being corrected, original kept */}
            <div className="flex items-center gap-1.5 rounded-md border border-(--border) px-1.5 py-1">
              <Line w="24%" delay={0.2} tone="primary" />
              <div className="flex items-center">
                <Line w="34%" delay={0.26} />
                <Caret />
              </div>
              <span
                className="ml-auto rounded-[3px] px-1 text-[7px] leading-3 text-(--muted-foreground)"
                style={{ background: AMBER }}
              >
                Review
              </span>
            </div>
            {/* low-confidence field */}
            <div className="flex items-center gap-1.5">
              <Line w="24%" delay={0.32} />
              <Line w="30%" delay={0.38} />
              <span className="ml-auto">
                <StatusDot color={AMBER} />
              </span>
            </div>
          </div>
          {/* export is earned once nothing is flagged */}
          <div className="flex items-center gap-1.5 border-t border-(--border) px-2 py-1.5">
            <span className="text-[8px] leading-3 text-(--muted-foreground)">2 need review</span>
            <span
              className="ml-auto rounded-[4px] px-1.5 py-0.5 text-[8px] leading-3 text-(--primary-foreground) opacity-50"
              style={{ background: "var(--primary)" }}
            >
              Export
            </span>
          </div>
        </div>
      </Screen>
    </Stage>
  );
}

/* --- image-studio: a composer rail beside a feed of outcomes --------- */
function ImageStudioPreview() {
  const tiles = [
    { label: "Ready", style: undefined as string | undefined },
    { label: "Queued", dot: AMBER },
    { label: "Blocked", style: RED },
    { label: "", live: true },
  ];
  return (
    <Stage>
      <Screen>
        {/* composer rail */}
        <div className="flex w-[96px] shrink-0 flex-col gap-1.5 border-r border-(--border) bg-(--muted)/50 p-1.5">
          <div className="flex items-center gap-1 rounded-md border border-(--border) bg-(--card) px-1.5 py-1">
            <span className="text-[7px] leading-3 text-(--muted-foreground)">Model</span>
            <span className="ml-auto text-[7px] leading-3 text-(--muted-foreground)">▾</span>
          </div>
          <div className="flex-1 space-y-1 rounded-md border border-(--border) bg-(--card) p-1.5">
            <Line w="92%" />
            <div className="flex items-center">
              <Line w="58%" delay={0.08} />
              <Caret />
            </div>
          </div>
          <div
            className="rounded-md py-1 text-center text-[8px] leading-3 text-(--primary-foreground)"
            style={{ background: "var(--primary)" }}
          >
            Generate
          </div>
        </div>
        {/* results feed: ready, queued, blocked, still generating */}
        <div className="grid flex-1 grid-cols-2 gap-1.5 p-2">
          {tiles.map((t, i) => (
            <div
              key={i}
              className="relative overflow-hidden rounded-md border border-(--border)"
              style={{
                background: `color-mix(in oklab, var(--primary) ${14 + i * 8}%, var(--card))`,
              }}
            >
              {t.live ? (
                <div className="absolute inset-x-1.5 bottom-1.5">
                  <Line w="70%" delay={0.1} tone="primary" />
                </div>
              ) : (
                <span
                  className="absolute bottom-1 left-1 inline-flex items-center gap-1 rounded-[3px] px-1 text-[7px] leading-3 text-(--muted-foreground)"
                  style={{
                    background: t.style ?? "var(--card)",
                    border: t.style ? undefined : "1px solid var(--border)",
                  }}
                >
                  {t.dot && <StatusDot color={t.dot} />}
                  {t.label}
                </span>
              )}
            </div>
          ))}
        </div>
      </Screen>
    </Stage>
  );
}

/* --- agent-console: a fleet roster beside one run's timeline --------- */
function AgentConsolePreview() {
  const roster = [
    { color: "var(--primary)", active: true },
    { color: AMBER, active: false },
    { color: RED, active: false },
  ];
  return (
    <Stage>
      <Screen>
        {/* agent roster */}
        <div className="w-[70px] shrink-0 space-y-1 border-r border-(--border) bg-(--muted)/50 p-1.5">
          {roster.map((a, i) => (
            <div
              key={i}
              className={`flex items-center gap-1 rounded-[4px] border px-1 py-1 ${
                a.active ? "border-(--primary)/40 bg-(--card)" : "border-(--border)"
              }`}
            >
              <StatusDot color={a.color} />
              <Line w="58%" delay={i * 0.06} />
            </div>
          ))}
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          {/* fleet header */}
          <div className="flex items-center gap-1 border-b border-(--border) px-2 py-1.5">
            <span className="text-[8px] leading-3 text-(--muted-foreground)">3 agents</span>
            <span
              className="ml-auto rounded-[3px] px-1 text-[7px] leading-3 text-(--muted-foreground)"
              style={{ background: AMBER }}
            >
              1 approval
            </span>
            <span className="text-[7px] leading-3 tabular-nums text-(--muted-foreground)">
              $0.84
            </span>
          </div>
          {/* run timeline */}
          <div className="flex-1 space-y-1.5 p-2">
            {[
              { w: "72%", d: 0.08, t: "12s" },
              { w: "56%", d: 0.16, t: "4s" },
            ].map((r, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <StatusDot color={GREEN} />
                <Line w={r.w} delay={r.d} />
                <span className="ml-auto text-[7px] leading-3 tabular-nums text-(--muted-foreground)">
                  {r.t}
                </span>
              </div>
            ))}
            {/* the step waiting on a human */}
            <div className="flex items-center gap-1.5">
              <StatusDot color={AMBER} />
              <span className="text-[8px] leading-3 text-(--muted-foreground)">Approve?</span>
              <span
                className="ml-auto rounded-[3px] px-1 py-px text-[7px] leading-3 text-(--primary-foreground)"
                style={{ background: "var(--primary)" }}
              >
                Approve
              </span>
            </div>
          </div>
          <div className="border-t border-(--border) px-2 py-1">
            <span className="text-[7px] leading-3 tabular-nums text-(--muted-foreground)">
              41k tokens · $0.84 · 3m 12s
            </span>
          </div>
        </div>
      </Screen>
    </Stage>
  );
}

/* --- support-copilot: a cited draft with a refund gate --------------- */
function SupportCopilotPreview() {
  return (
    <Stage>
      <Screen>
        {/* ticket rail */}
        <div className="w-[56px] shrink-0 space-y-1 border-r border-(--border) bg-(--muted)/50 p-1.5">
          <div className="rounded-[4px] px-1 py-1" style={{ background: "var(--primary-muted)" }}>
            <Line w="78%" />
          </div>
          <div className="px-1 py-1">
            <Line w="60%" delay={0.06} />
          </div>
          <div className="px-1 py-1">
            <Line w="70%" delay={0.12} />
          </div>
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          {/* ticket header */}
          <div className="flex items-center gap-1 border-b border-(--border) px-2 py-1.5">
            <Chip>T-1042</Chip>
            <span className="text-[8px] leading-3 text-(--muted-foreground)">Refund request</span>
            <span className="ml-auto">
              <StatusDot color={AMBER} />
            </span>
          </div>
          <div className="flex-1 space-y-1.5 p-2">
            {/* grounded draft */}
            <div className="space-y-1">
              <Line w="98%" delay={0.1} />
              <div className="flex items-center gap-1">
                <Line w="66%" delay={0.18} />
                <Chip active>1</Chip>
                <Chip active>2</Chip>
              </div>
            </div>
            {/* rating row on the draft */}
            <div className="flex items-center gap-1 pt-0.5">
              <span className="h-2.5 w-2.5 rounded-[3px] border border-(--border)" />
              <span className="h-2.5 w-2.5 rounded-[3px] border border-(--border)" />
              <span className="ml-1 text-[7px] leading-3 text-(--muted-foreground)">
                Rate draft
              </span>
            </div>
          </div>
          {/* approval gate on the refund */}
          <div className="flex items-center gap-1.5 border-t border-(--border) px-2 py-1.5">
            <span className="text-[8px] leading-3 tabular-nums text-(--muted-foreground)">
              Refund $48.20?
            </span>
            <span className="ml-auto rounded-[4px] border border-(--border) px-1.5 py-0.5 text-[8px] leading-3 text-(--muted-foreground)">
              Deny
            </span>
            <span
              className="rounded-[4px] px-1.5 py-0.5 text-[8px] leading-3 text-(--primary-foreground)"
              style={{ background: "var(--primary)" }}
            >
              Approve
            </span>
          </div>
        </div>
      </Screen>
    </Stage>
  );
}

/* --- generative-dashboard: the chat assembles a widget canvas -------- */
function GenerativeDashboardPreview() {
  return (
    <Stage>
      <Screen>
        {/* chat column */}
        <div className="flex w-[104px] shrink-0 flex-col border-r border-(--border)">
          <div className="flex-1 space-y-1.5 p-2">
            <div className="flex justify-end">
              <div
                className="w-[72%] rounded-md rounded-br-[2px] px-1.5 py-1"
                style={{ background: "var(--primary)" }}
              >
                <div className="h-1.5 w-full rounded-full bg-(--primary-foreground) opacity-70" />
              </div>
            </div>
            <div className="flex items-center gap-1 rounded-md border border-(--border) px-1.5 py-1">
              <Dot />
              <span className="text-[7px] leading-3 text-(--muted-foreground)">build_dashboard</span>
            </div>
          </div>
          <Composer label="Describe a widget…" />
        </div>
        {/* widget canvas */}
        <div className="grid flex-1 grid-cols-2 content-start gap-1.5 bg-(--muted)/50 p-1.5">
          {["Revenue", "Users"].map((label, i) => (
            <div
              key={label}
              className="space-y-1 rounded-md border border-(--border) bg-(--card) p-1.5"
            >
              <span className="block text-[7px] leading-3 text-(--muted-foreground)">{label}</span>
              <Line w="64%" delay={0.08 + i * 0.06} tone="primary" />
            </div>
          ))}
          <div className="col-span-2 rounded-md border border-(--border) bg-(--card) p-1.5">
            <div className="flex items-end gap-[3px] pt-1">
              {[7, 12, 9, 15, 11, 14].map((h, i) => (
                <span
                  key={i}
                  className="w-[6px] rounded-[2px]"
                  style={{
                    height: `${h * 1.8}px`,
                    background: "var(--primary)",
                    opacity: 0.45 + (i % 3) * 0.15,
                  }}
                />
              ))}
            </div>
          </div>
          <div className="col-span-2 space-y-1 rounded-md border border-(--border) bg-(--card) p-1.5">
            {[0.2, 0.28].map((d) => (
              <div key={d} className="flex items-center gap-1">
                <Line w="30%" delay={d} />
                <Line w="42%" delay={d + 0.04} />
                <Line w="18%" delay={d + 0.08} tone="primary" />
              </div>
            ))}
          </div>
        </div>
      </Screen>
    </Stage>
  );
}

/* Safety net for a pattern added to the registry before its preview. */
function GenericPreview() {
  return (
    <Stage>
      <Screen>
        <div className="flex-1 space-y-1.5 p-2">
          {["100%", "70%", "85%", "60%"].map((w) => (
            <Line key={w} w={w} />
          ))}
        </div>
      </Screen>
    </Stage>
  );
}
