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
/* One entry per pattern, on purpose: five tiles that all looked alike  */
/* would be worse than the text cards this replaced.                    */
/* ------------------------------------------------------------------ */

import { ModelIcon } from "@/components/brands/brand-icon";

const previews: Record<string, () => React.ReactElement> = {
  "ai-chat": AIChatPreview,
  "research-assistant": ResearchAssistantPreview,
  "coding-agent": CodingAgentPreview,
  "voice-assistant": VoiceAssistantPreview,
  "model-preferences": ModelPreferencesPreview,
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
