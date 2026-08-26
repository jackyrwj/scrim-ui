/* ------------------------------------------------------------------ */
/* Static previews for the component cards — the homepage's "Popular   */
/* Components" row and every card on /components.                      */
/*                                                                     */
/* Same rationale as tool-preview.tsx — pure markup + CSS, so nothing  */
/* downloads, it stays crisp at any size and it follows dark mode —    */
/* but these show the component's *shape* rather than performing what  */
/* it does. A component library whose most-used components are six     */
/* text-only cards is asking people to click blind; a loop of six more */
/* animations would compete with the hero. Static is the middle.       */
/* Server component on purpose — zero JS.                              */
/*                                                                     */
/* There is one entry per published component, on purpose. GenericPre- */
/* view still exists as a safety net for a slug added to the registry  */
/* before its preview, but a card grid where a quarter of the tiles    */
/* are the same three grey bars is worse than the dense list this page */
/* replaced — the point of a preview grid is that the tiles differ.    */
/* Adding a component means adding its preview here.                   */
/* ------------------------------------------------------------------ */

import { ModelIcon } from "@/components/brands/brand-icon";

const previews: Record<string, () => React.ReactElement> = {
  /* Prompt & Input */
  "prompt-input": PromptInputPreview,
  "prompt-input-attachments": PromptInputAttachmentsPreview,
  "prompt-input-model-selector": PromptInputModelSelectorPreview,
  /* Messages */
  "streaming-message": StreamingMessagePreview,
  "user-message": UserMessagePreview,
  "message-actions": MessageActionsPreview,
  "error-message": ErrorMessagePreview,
  "markdown-message": MarkdownMessagePreview,
  /* Reasoning & Progress */
  reasoning: ReasoningPreview,
  "thinking-indicator": ThinkingIndicatorPreview,
  "reasoning-steps": ReasoningStepsPreview,
  /* Tool Calls */
  "tool-call": ToolCallPreview,
  "generative-ui": GenerativeUiPreview,
  "search-tool-call": SearchToolCallPreview,
  "code-execution": CodeExecutionPreview,
  /* Sources & Citations */
  "source-card": SourceCardPreview,
  "citation-ui": CitationUiPreview,
  /* Agents */
  "agent-status": AgentStatusPreview,
  "approval-request": ApprovalRequestPreview,
  /* Files & Context */
  "file-upload": FileUploadPreview,
  "context-files": ContextFilesPreview,
  /* Memory */
  "memory-list": MemoryListPreview,
  "memory-suggestion": MemorySuggestionPreview,
  "memory-chip": MemoryChipPreview,
  /* Model & Settings */
  "model-selector": ModelSelectorPreview,
  "reasoning-level": ReasoningLevelPreview,
  "tool-toggle": ToolTogglePreview,
  /* Voice */
  "voice-input": VoiceInputPreview,
  "voice-waveform": VoiceWaveformPreview,
  "voice-conversation": VoiceConversationPreview,
};

export function hasComponentPreview(slug: string) {
  return slug in previews;
}

export function ComponentPreview({ slug }: { slug: string }) {
  const Preview = previews[slug] ?? GenericPreview;
  return (
    <div className="cp" aria-hidden>
      <Preview />
    </div>
  );
}

/* Fixed-size stage, same trick as the tool previews: every component
   keeps the same optical scale however wide the card gets. */
function Stage({ children }: { children: React.ReactNode }) {
  return (
    <div className="absolute inset-0 grid place-items-center p-3">
      <div className="cp-stage w-[262px]">{children}</div>
    </div>
  );
}

function Panel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-xl border border-(--border) bg-(--card) ${className}`}
      style={{ boxShadow: "var(--shadow-sm)" }}
    >
      {children}
    </div>
  );
}

function Caret() {
  return (
    <span
      className="cp-caret ml-px inline-block h-[9px] w-px translate-y-[1px] rounded-full align-middle"
      style={{ background: "var(--primary)" }}
    />
  );
}

/* --- prompt-input: the composer, with its toolbar row -------------- */
function PromptInputPreview() {
  return (
    <Stage>
      <Panel className="px-3 py-2.5">
        <div className="text-[10px] leading-4 text-(--muted-foreground)">
          Summarise this thread
          <Caret />
        </div>
        <div className="mt-3 flex items-center gap-1.5">
          <span className="rounded-md border border-(--border) px-1.5 py-0.5 text-[9px] text-(--muted-foreground)">
            @
          </span>
          <span className="inline-flex items-center gap-1 rounded-md border border-(--border) px-1.5 py-0.5 text-[9px] text-(--muted-foreground)">
            <ModelIcon name="Claude Sonnet 4.5" size={8} />
            Sonnet 4.5
          </span>
          <span className="ml-auto">
            <SendButton />
          </span>
        </div>
      </Panel>
    </Stage>
  );
}

/* --- streaming-message: an answer mid-flight ----------------------- */
function StreamingMessagePreview() {
  return (
    <Stage>
      <Panel className="space-y-1.5 p-3">
        {["100%", "88%"].map((w, i) => (
          <div
            key={w}
            className="cp-line h-1.5 rounded-full bg-(--border)"
            style={{ width: w, animationDelay: `${i * 0.12}s` }}
          />
        ))}
        <div className="flex items-center">
          <div
            className="cp-line h-1.5 rounded-full bg-(--border)"
            style={{ width: "54%", animationDelay: "0.24s" }}
          />
          <Caret />
        </div>
      </Panel>
    </Stage>
  );
}

/* --- user-message: the turn that starts everything ----------------- */
function UserMessagePreview() {
  return (
    <Stage>
      <div className="space-y-2">
        <div className="flex items-end justify-end gap-1.5">
          <div
            className="max-w-[170px] rounded-xl rounded-br-sm px-3 py-1.5 text-[10px] leading-4 text-(--primary-foreground)"
            style={{ background: "var(--primary)" }}
          >
            Can you rewrite this in TypeScript?
          </div>
          <div className="h-5 w-5 shrink-0 rounded-full bg-(--border)" />
        </div>
        <div className="flex justify-end pr-6.5">
          <span className="text-[9px] text-(--muted-foreground)">Edited · 2:14 PM</span>
        </div>
      </div>
    </Stage>
  );
}

/* --- markdown-message: heading, prose, list, fenced code ----------- */
function MarkdownMessagePreview() {
  return (
    <Stage>
      <Panel className="space-y-2 p-3">
        <div className="h-2 w-[42%] rounded-full" style={{ background: "var(--muted-foreground)", opacity: 0.55 }} />
        <div className="space-y-1">
          <div className="h-1 w-full rounded-full bg-(--border)" />
          <div className="h-1 w-[76%] rounded-full bg-(--border)" />
        </div>
        <div className="space-y-1">
          {["68%", "58%"].map((w) => (
            <div key={w} className="flex items-center gap-1.5">
              <span className="h-1 w-1 shrink-0 rounded-full" style={{ background: "var(--primary)" }} />
              <span className="h-1 rounded-full bg-(--border)" style={{ width: w }} />
            </div>
          ))}
        </div>
        <div className="space-y-1 rounded-md bg-(--muted) p-1.5">
          <div className="h-1 w-[60%] rounded-full" style={{ background: "var(--primary)", opacity: 0.55 }} />
          <div className="h-1 w-[38%] rounded-full bg-(--border)" />
        </div>
      </Panel>
    </Stage>
  );
}

/* --- tool-call: the collapsed call row, one result underneath ------ */
function ToolCallPreview() {
  return (
    <Stage>
      <Panel className="overflow-hidden">
        <div className="flex items-center gap-2 px-2.5 py-2">
          <span className="cp-dot h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: "var(--primary)" }} />
          <span className="font-mono text-[10px] text-(--foreground)">search_docs</span>
          <span className="ml-auto text-[9px] tabular-nums text-(--muted-foreground)">1.2s</span>
          <span className="text-[9px] text-(--muted-foreground)">▾</span>
        </div>
        <div className="space-y-1 border-t border-(--border) bg-(--muted) px-2.5 py-2">
          <div className="h-1 w-[86%] rounded-full bg-(--border)" />
          <div className="h-1 w-[62%] rounded-full bg-(--border)" />
        </div>
      </Panel>
    </Stage>
  );
}

/* --- generative-ui: the widget on top, attribution underneath ------ */
function GenerativeUiPreview() {
  return (
    <Stage>
      <Panel className="overflow-hidden">
        {/* A card, not text lines: the whole point of the component is that
            the model's answer arrives as product UI. Lines here would make
            the tile indistinguishable from the message previews. */}
        <div className="flex items-center gap-2 px-2.5 py-2.5">
          <span
            className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-white"
            style={{ background: "linear-gradient(135deg, var(--primary), color-mix(in oklab, var(--primary), black 25%))" }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="13" height="13">
              <path d="M17.5 19a4.5 4.5 0 0 0 0-9 6 6 0 0 0-11.6 1.5A3.75 3.75 0 0 0 6.5 19Z" />
            </svg>
          </span>
          <div className="min-w-0 flex-1 space-y-1">
            <div className="text-[13px] font-semibold leading-none tabular-nums text-(--foreground)">29°</div>
            <Line w="64%" />
          </div>
        </div>
        <div className="flex items-center gap-1.5 border-t border-(--border) bg-(--muted) px-2.5 py-1.5">
          <span className="text-[9px]" style={{ color: "var(--primary)" }}>✦</span>
          <span className="font-mono text-[9px] text-(--muted-foreground)">getWeather</span>
          <span className="ml-auto text-[9px] text-(--muted-foreground)">Data ▾</span>
        </div>
      </Panel>
    </Stage>
  );
}

/* --- code-execution: source above, stdout below -------------------- */
function CodeExecutionPreview() {
  return (
    <Stage>
      <Panel className="overflow-hidden">
        <div className="flex items-center gap-1.5 border-b border-(--border) px-2.5 py-1.5">
          <span className="font-mono text-[9px] text-(--muted-foreground)">python</span>
          <span className="ml-auto rounded-full bg-(--primary-muted) px-1.5 py-0.5 text-[9px] font-medium" style={{ color: "var(--primary)" }}>
            Ran
          </span>
        </div>
        <div className="space-y-1 px-2.5 py-2">
          <div className="h-1 w-[72%] rounded-full" style={{ background: "var(--primary)", opacity: 0.55 }} />
          <div className="h-1 w-[48%] rounded-full bg-(--border)" />
        </div>
        <div className="flex items-center gap-1.5 border-t border-(--border) bg-(--muted) px-2.5 py-1.5">
          <span className="font-mono text-[9px] text-(--muted-foreground)">›</span>
          <span className="font-mono text-[9px] text-(--foreground)">42</span>
        </div>
      </Panel>
    </Stage>
  );
}

function GenericPreview() {
  return (
    <Stage>
      <Panel className="space-y-1.5 p-3">
        {["100%", "70%", "85%"].map((w) => (
          <div key={w} className="cp-line h-1.5 rounded-full bg-(--border)" style={{ width: w }} />
        ))}
      </Panel>
    </Stage>
  );
}

/* ================================================================== */
/* Shared bits for the previews below.                                 */
/*                                                                     */
/* The six previews above predate these and each spell their pieces    */
/* out inline. Twenty-three more at that verbosity would have buried   */
/* the differences between components under repeated markup, so the    */
/* recurring shapes — a grey text line, a pill, a rounded icon tile —  */
/* are named here and the preview bodies stay about the length of the  */
/* thing they are describing.                                          */
/* ================================================================== */

/** A stand-in for a run of text. Widths are percentages of the stage. */
function Line({ w, tint = "border" }: { w: string; tint?: "border" | "primary" | "fg" }) {
  const bg =
    tint === "primary"
      ? { background: "var(--primary)", opacity: 0.55 }
      : tint === "fg"
        ? { background: "var(--muted-foreground)", opacity: 0.55 }
        : undefined;
  return (
    <div
      className={`cp-line h-1 rounded-full ${tint === "border" ? "bg-(--border)" : ""}`}
      style={{ width: w, ...bg }}
    />
  );
}

/** The rounded square that leads a header row in most of these components. */
function Tile({
  children,
  className = "bg-(--muted) text-(--muted-foreground)",
  size = 16,
}: {
  children: React.ReactNode;
  className?: string;
  size?: number;
}) {
  return (
    <span
      className={`grid shrink-0 place-items-center rounded-[5px] ${className}`}
      style={{ width: size, height: size }}
    >
      {children}
    </span>
  );
}

/** A status pill. `tone` mirrors the tint the real component uses. */
function Pill({
  children,
  tone = "muted",
}: {
  children: React.ReactNode;
  tone?: "muted" | "primary" | "good" | "bad" | "warn" | "info";
}) {
  const tones: Record<string, string> = {
    muted: "bg-(--muted) text-(--muted-foreground)",
    primary: "bg-(--primary-muted) text-(--primary-muted-foreground)",
    good: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
    bad: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
    warn: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
    info: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
  };
  return (
    <span className={`shrink-0 rounded-full px-1.5 py-px text-[8px] font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
}

/** The little glyphs. Deliberately not Lucide — at 8–10px a 24-unit
    stroked icon turns to mush, and these only need to read as a shape. */
function Glyph({ d, size = 9 }: { d: string; size?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d={d} />
    </svg>
  );
}

const G = {
  check: "M20 6 9 17l-5-5",
  plus: "M12 5v14M5 12h14",
  up: "M12 19V5M5 12l7-7 7 7",
  chevron: "M6 9l6 6 6-6",
  file: "M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2ZM14 2v6h6",
  globe: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20M2 12h20M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20",
  brain: "M9.5 3A2.5 2.5 0 0 0 7 5.5v13a2.5 2.5 0 0 0 5 0v-13A2.5 2.5 0 0 0 9.5 3M12 5.5a2.5 2.5 0 0 1 5 0v13a2.5 2.5 0 0 1-5 0",
  bot: "M12 2v3M6 8h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2M9 13h.01M15 13h.01",
  shield: "M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5Z",
  alert: "M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0ZM12 9v4M12 17h.01",
  mic: "M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3M5 10v1a7 7 0 0 0 14 0v-1M12 19v3",
  clock: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20M12 6v6l4 2",
  upload: "M12 17V3M6 9l6-6 6 6M4 21h16",
  copy: "M9 9h11v11a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V9ZM5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1",
  refresh: "M21 12a9 9 0 1 1-2.6-6.4L21 8M21 3v5h-5",
  thumbUp: "M7 10v11M15 5.9 14 10h5.8a2 2 0 0 1 1.9 2.6l-2.3 8a2 2 0 0 1-1.9 1.4H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.8a2 2 0 0 0 1.8-1.1L12 2a3 3 0 0 1 3 3.9Z",
  star: "M12 2.5 14.9 9l6.6.6-5 4.4 1.5 6.5L12 17l-5.9 3.4L7.6 14l-5-4.4L9.2 9Z",
  wrench: "M14.7 6.3a4 4 0 0 0 5 5l-9.6 9.6a2.8 2.8 0 0 1-4-4Z",
  quote: "M4 6h16M4 12h10M4 18h7",
};

/** A tiny toggle switch, on or off. */
function Switch({ on }: { on: boolean }) {
  return (
    <span
      className="relative block h-2.5 w-4.5 shrink-0 rounded-full transition-colors"
      style={{ background: on ? "var(--primary)" : "var(--border)" }}
    >
      <span
        className="absolute top-[2px] h-1.5 w-1.5 rounded-full bg-white"
        style={{ left: on ? "9px" : "2px" }}
      />
    </span>
  );
}

/** A file chip, as it appears above the composer and in context lists. */
function Chip({ children, tone = "muted" }: { children: React.ReactNode; tone?: "muted" | "bad" }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[8px] ${
        tone === "bad"
          ? "border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300"
          : "border-(--border) bg-(--muted) text-(--muted-foreground)"
      }`}
    >
      {children}
    </span>
  );
}

/** The send button that ends every composer. */
function SendButton() {
  return (
    <span
      className="grid h-5 w-5 shrink-0 place-items-center rounded-md text-(--primary-foreground)"
      style={{ background: "var(--primary)" }}
    >
      <Glyph d={G.up} size={10} />
    </span>
  );
}

/* --- prompt-input-attachments: chips sitting above the composer ---- */
function PromptInputAttachmentsPreview() {
  return (
    <Stage>
      <Panel className="px-3 py-2.5">
        <div className="flex gap-1.5">
          <Chip>
            <Glyph d={G.file} size={8} />
            spec.pdf
          </Chip>
          <Chip>
            <Glyph d={G.file} size={8} />
            notes.md
            <span className="h-0.5 w-5 overflow-hidden rounded-full bg-(--border)">
              <span
                className="block h-full w-2/3 rounded-full"
                style={{ background: "var(--primary)" }}
              />
            </span>
          </Chip>
        </div>
        <div className="mt-2 text-[10px] leading-4 text-(--muted-foreground)">
          Summarise both files
          <Caret />
        </div>
        <div className="mt-2.5 flex items-center">
          <span className="grid h-5 w-5 place-items-center rounded-md border border-(--border) text-(--muted-foreground)">
            <Glyph d={G.plus} size={9} />
          </span>
          <span className="ml-auto">
            <SendButton />
          </span>
        </div>
      </Panel>
    </Stage>
  );
}

/* --- prompt-input-model-selector: the model bar above the field ---- */
function PromptInputModelSelectorPreview() {
  return (
    <Stage>
      <Panel>
        <div className="flex items-center gap-1.5 border-b border-(--border) px-2.5 py-1.5">
          <span className="inline-flex items-center gap-1 rounded-md bg-(--muted) px-1.5 py-0.5 text-[9px] font-medium text-(--foreground)">
            <ModelIcon name="Claude Sonnet 4.5" size={8} />
            Sonnet 4.5
            <span className="text-(--muted-foreground)">
              <Glyph d={G.chevron} size={8} />
            </span>
          </span>
          <span className="truncate text-[8px] text-(--muted-foreground)">
            Balanced speed and depth
          </span>
        </div>
        <div className="px-3 pt-2 pb-1 text-[10px] leading-4 text-(--muted-foreground)">
          Ask anything…
          <Caret />
        </div>
        <div className="flex justify-end px-2.5 pb-2">
          <SendButton />
        </div>
      </Panel>
    </Stage>
  );
}

/* --- message-actions: the row that appears under a finished answer - */
function MessageActionsPreview() {
  return (
    <Stage>
      <div className="space-y-2">
        <Panel className="space-y-1.5 p-3">
          <Line w="100%" />
          <Line w="72%" />
        </Panel>
        <div className="flex items-center gap-1 pl-0.5 text-(--muted-foreground)">
          {[
            [G.copy, "Copy"],
            [G.refresh, "Regenerate"],
          ].map(([d, label]) => (
            <span
              key={label}
              className="inline-flex items-center gap-1 rounded-md bg-(--muted) px-1.5 py-0.5 text-[8px]"
            >
              <Glyph d={d} size={8} />
              {label}
            </span>
          ))}
          <span className="cp-dot inline-flex items-center rounded-md px-1 py-0.5 text-emerald-600 dark:text-emerald-400">
            <Glyph d={G.thumbUp} size={9} />
          </span>
          <span className="inline-flex items-center rounded-md px-1 py-0.5">
            <span className="inline-block rotate-180">
              <Glyph d={G.thumbUp} size={9} />
            </span>
          </span>
        </div>
      </div>
    </Stage>
  );
}

/* --- error-message: the failed turn, with its way out --------------- */
function ErrorMessagePreview() {
  return (
    <Stage>
      <div className="flex items-start gap-2 rounded-xl rounded-tl-sm border border-red-200 bg-red-50/60 px-3 py-2.5 dark:border-red-900/50 dark:bg-red-950/30">
        <span className="mt-px shrink-0 text-red-600 dark:text-red-400">
          <Glyph d={G.alert} size={11} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-medium text-(--foreground)">Something went wrong</div>
          <div className="mt-1.5 space-y-1">
            <Line w="88%" />
            <Line w="54%" />
          </div>
          <span className="mt-2 inline-flex items-center gap-1 rounded-md border border-(--border) bg-(--card) px-1.5 py-0.5 text-[8px] font-medium text-(--muted-foreground)">
            <Glyph d={G.refresh} size={8} />
            Retry
          </span>
        </div>
      </div>
    </Stage>
  );
}

/* --- reasoning: the collapsible trace, open on its numbered steps --- */
function ReasoningPreview() {
  return (
    <Stage>
      <Panel className="overflow-hidden">
        <div className="flex items-center gap-1.5 px-2.5 py-1.5">
          <Tile className="bg-(--primary-muted) text-(--primary-muted-foreground)">
            <Glyph d={G.brain} size={10} />
          </Tile>
          <span className="text-[10px] font-medium text-(--foreground)">Reasoning</span>
          <span className="ml-auto text-[8px] tabular-nums text-(--muted-foreground)">4.1s</span>
          <Pill tone="primary">Thinking</Pill>
        </div>
        <div className="border-t border-(--border) px-3 py-2">
          <ol className="relative space-y-1.5 before:absolute before:top-1.5 before:bottom-1.5 before:left-[5px] before:w-px before:bg-(--border)">
            {["Read the question", "Check the sources", "Draft the answer"].map((_, i) => (
              <li key={i} className="relative flex items-center gap-2 pl-4">
                <span
                  className="absolute left-0 h-[11px] w-[11px] rounded-full border border-(--border) bg-(--card) text-center text-[7px] leading-[10px] text-(--muted-foreground)"
                  aria-hidden
                >
                  {i + 1}
                </span>
                <Line w={["78%", "62%", "50%"][i]} />
              </li>
            ))}
          </ol>
        </div>
      </Panel>
    </Stage>
  );
}

/* --- thinking-indicator: avatar plus the three dots ---------------- */
function ThinkingIndicatorPreview() {
  return (
    <Stage>
      <div className="flex items-center gap-2">
        <span
          className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-[9px] font-semibold text-(--primary-foreground)"
          style={{ background: "var(--primary)" }}
        >
          AI
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-2xl rounded-tl-sm border border-(--border) bg-(--muted) px-3 py-2">
          <span className="flex items-center gap-1">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="cp-dot h-1.5 w-1.5 rounded-full bg-(--muted-foreground)"
                style={{ animationDelay: `${i * 0.16}s` }}
              />
            ))}
          </span>
          <span className="text-[10px] text-(--muted-foreground)">Thinking…</span>
        </span>
      </div>
    </Stage>
  );
}

/* --- reasoning-steps: done, running, pending, stacked -------------- */
function ReasoningStepsPreview() {
  return (
    <Stage>
      <Panel className="overflow-hidden">
        <div className="flex items-center gap-1.5 bg-(--muted) px-2.5 py-1.5">
          <span className="text-(--muted-foreground)">
            <Glyph d={G.clock} size={10} />
          </span>
          <span className="text-[10px] font-medium text-(--foreground)">Reasoning</span>
          <span className="text-[8px] text-(--muted-foreground)">Step 2 of 3</span>
          <span className="ml-auto text-(--muted-foreground)">
            <Glyph d={G.chevron} size={9} />
          </span>
        </div>
        <ol className="space-y-1 border-t border-(--border) p-1.5">
          {(["done", "active", "pending"] as const).map((state, i) => (
            <li
              key={state}
              className={`flex items-center gap-2 rounded-md px-1.5 py-1 ${
                state === "active" ? "bg-(--muted)" : ""
              }`}
            >
              <span className="grid h-3 w-3 shrink-0 place-items-center">
                {state === "done" && (
                  <span className="grid h-3 w-3 place-items-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400">
                    <Glyph d={G.check} size={7} />
                  </span>
                )}
                {state === "active" && (
                  <span className="cp-dot h-2 w-2 rounded-full" style={{ background: "var(--primary)" }} />
                )}
                {state === "pending" && <span className="h-1 w-1 rounded-full bg-(--border)" />}
              </span>
              <Line w={["70%", "84%", "56%"][i]} tint={state === "active" ? "fg" : "border"} />
            </li>
          ))}
        </ol>
      </Panel>
    </Stage>
  );
}

/* --- search-tool-call: the web search, with its sources ------------ */
function SearchToolCallPreview() {
  return (
    <Stage>
      <Panel className="overflow-hidden">
        <div className="flex items-center gap-1.5 px-2.5 py-1.5">
          <Tile className="bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400">
            <Glyph d={G.globe} size={10} />
          </Tile>
          <span className="text-[10px] font-medium text-(--foreground)">Search the web</span>
          <span className="ml-auto">
            <Pill tone="good">3 sources</Pill>
          </span>
        </div>
        <div className="space-y-1.5 border-t border-(--border) px-2.5 py-2">
          {[
            ["82%", "34%"],
            ["66%", "28%"],
          ].map(([a, b]) => (
            <div key={a} className="space-y-1">
              <Line w={a} tint="fg" />
              <Line w={b} />
            </div>
          ))}
        </div>
      </Panel>
    </Stage>
  );
}

/* --- source-card: one result, as it looks in a sources panel ------- */
function SourceCardPreview() {
  return (
    <Stage>
      <Panel className="p-3">
        <div className="flex items-start gap-2">
          <span
            className="grid h-4 w-4 shrink-0 place-items-center rounded text-[8px] font-bold text-(--primary-foreground)"
            style={{ background: "var(--primary)" }}
          >
            A
          </span>
          <div className="min-w-0 flex-1 space-y-1.5">
            <Line w="76%" tint="fg" />
            <div className="text-[8px] text-(--muted-foreground)">anthropic.com</div>
            <Line w="94%" />
            <Line w="60%" />
          </div>
          <span className="grid h-4 w-4 shrink-0 place-items-center rounded bg-(--muted) text-[8px] font-medium text-(--muted-foreground)">
            1
          </span>
        </div>
      </Panel>
    </Stage>
  );
}

/* --- citation-ui: the numbered marker, and what it opens ----------- */
function CitationUiPreview() {
  return (
    <Stage>
      <div className="space-y-1.5">
        <div className="flex items-center gap-1">
          <Line w="46%" />
          <span
            className="grid h-[11px] w-[11px] shrink-0 place-items-center rounded-full text-[7px] font-semibold text-(--primary-foreground)"
            style={{ background: "var(--primary)" }}
          >
            1
          </span>
          <Line w="30%" />
        </div>
        <div className="flex items-center gap-1">
          <Line w="58%" />
          <span className="grid h-[11px] w-[11px] shrink-0 place-items-center rounded-full border border-(--border) bg-(--card) text-[7px] font-semibold text-(--muted-foreground)">
            2
          </span>
        </div>
        <Panel className="mt-1 ml-8 w-[150px] space-y-1 p-2">
          <Line w="88%" tint="fg" />
          <div className="flex items-center gap-1 text-[8px] text-(--muted-foreground)">
            <span>arxiv.org</span>
            <Glyph d="M7 17 17 7M7 7h10v10" size={7} />
          </div>
          <Line w="66%" />
        </Panel>
      </div>
    </Stage>
  );
}

/* --- agent-status: a named agent, running, with progress ----------- */
function AgentStatusPreview() {
  return (
    <Stage>
      <Panel className="p-3">
        <div className="flex items-center gap-2">
          <Tile size={22} className="bg-(--muted) text-(--muted-foreground)">
            <Glyph d={G.bot} size={12} />
          </Tile>
          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-medium text-(--foreground)">Research agent</span>
              <Pill tone="info">Running</Pill>
              <span className="ml-auto text-[8px] tabular-nums text-(--muted-foreground)">
                0:42
              </span>
            </div>
            <Line w="64%" />
          </div>
        </div>
        <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-(--muted)">
          <div className="cp-line h-full w-[62%] rounded-full" style={{ background: "var(--primary)" }} />
        </div>
      </Panel>
    </Stage>
  );
}

/* --- approval-request: human-in-the-loop, both buttons showing ----- */
function ApprovalRequestPreview() {
  return (
    <Stage>
      <Panel className="p-3">
        <div className="flex items-start gap-2">
          <Tile size={20} className="bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400">
            <Glyph d={G.shield} size={11} />
          </Tile>
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-medium text-(--foreground)">Run shell command</div>
            <div className="mt-1.5 rounded-md bg-(--muted) px-2 py-1 font-mono text-[8px] text-(--muted-foreground)">
              rm -rf ./build
            </div>
            <div className="mt-2 flex items-center gap-1.5">
              {/* emerald-700, not the -600 the real component uses: white on
                  -600 is 3.65:1, and at 8px that misses AA. */}
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-700 px-2 py-0.5 text-[8px] font-medium text-white">
                <Glyph d={G.check} size={7} />
                Approve
              </span>
              <span className="rounded-md border border-(--border) px-2 py-0.5 text-[8px] font-medium text-(--muted-foreground)">
                Deny
              </span>
            </div>
          </div>
        </div>
      </Panel>
    </Stage>
  );
}

/* --- file-upload: the dropzone before anything is dropped ---------- */
function FileUploadPreview() {
  return (
    <Stage>
      <div className="flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-(--border) px-6 py-5">
        {/* --card, not --muted: the stage itself is --muted, so a muted
            surface laid straight on it disappears. Anything outside a Panel
            in these previews has to carry its own contrast. */}
        <span className="grid h-8 w-8 place-items-center rounded-full border border-(--border) bg-(--card) text-(--muted-foreground)">
          <Glyph d={G.upload} size={14} />
        </span>
        <span className="text-[10px] font-medium text-(--foreground)">Drop files here</span>
        <span className="text-[8px] text-(--muted-foreground)">or click to browse</span>
      </div>
    </Stage>
  );
}

/* --- context-files: what is in the window, and how full it is ------ */
function ContextFilesPreview() {
  return (
    <Stage>
      <Panel className="overflow-hidden">
        <div className="flex items-center justify-between bg-(--muted) px-2.5 py-1.5">
          <span className="text-[10px] font-medium text-(--foreground)">Context</span>
          <span className="text-[8px] tabular-nums text-(--muted-foreground)">12.4k / 200k</span>
        </div>
        <ul className="divide-y divide-(--border) border-t border-(--border)">
          {["78%", "60%", "68%"].map((w) => (
            <li key={w} className="flex items-center gap-2 px-2.5 py-1.5">
              <span className="shrink-0 text-(--muted-foreground)">
                <Glyph d={G.file} size={9} />
              </span>
              <Line w={w} />
            </li>
          ))}
        </ul>
        <div className="px-2.5 pt-1.5 pb-2">
          <div className="h-1 overflow-hidden rounded-full bg-(--muted)">
            <div className="cp-line h-full w-[38%] rounded-full bg-emerald-500" />
          </div>
        </div>
      </Panel>
    </Stage>
  );
}

/* --- memory-list: what the assistant has kept about you ------------ */
function MemoryListPreview() {
  return (
    <Stage>
      <Panel className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-(--border) px-3 py-2">
          <span className="text-[10px] font-medium text-(--foreground)">Memories</span>
          <Pill>3</Pill>
        </div>
        <ul className="divide-y divide-(--border)">
          {["84%", "66%", "74%"].map((w) => (
            <li key={w} className="flex items-center gap-2 px-3 py-1.5">
              <Tile size={14} className="bg-(--primary-muted) text-(--primary-muted-foreground)">
                <Glyph d={G.star} size={8} />
              </Tile>
              <Line w={w} />
            </li>
          ))}
        </ul>
      </Panel>
    </Stage>
  );
}

/* --- memory-suggestion: the "remember this?" prompt ---------------- */
function MemorySuggestionPreview() {
  return (
    <Stage>
      <Panel className="p-3">
        <div className="flex items-start gap-2">
          <Tile size={18} className="bg-(--primary-muted) text-(--primary-muted-foreground)">
            <Glyph d={G.star} size={10} />
          </Tile>
          <div className="min-w-0 flex-1">
            <div className="text-[9px] text-(--muted-foreground)">Remember this?</div>
            <div className="mt-1">
              <Line w="86%" tint="fg" />
            </div>
            <div className="mt-2 flex items-center gap-1.5">
              <span
                className="rounded-md px-2 py-0.5 text-[8px] font-medium text-(--primary-foreground)"
                style={{ background: "var(--primary)" }}
              >
                Remember
              </span>
              <span className="rounded-md border border-(--border) px-2 py-0.5 text-[8px] font-medium text-(--muted-foreground)">
                Dismiss
              </span>
            </div>
          </div>
        </div>
      </Panel>
    </Stage>
  );
}

/* --- memory-chip: the saved facts, in their compact form ----------- */
function MemoryChipPreview() {
  return (
    <Stage>
      <div className="flex flex-wrap justify-center gap-1.5">
        {[
          ["Prefers TypeScript", true],
          ["Based in Shenzhen", true],
          ["Ships on Fridays", false],
          ["Dark mode", false],
        ].map(([text, saved]) => (
          <span
            key={String(text)}
            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-medium ${
              saved
                ? "border-transparent bg-(--primary-muted) text-(--primary-muted-foreground)"
                : "border-(--border) text-(--muted-foreground)"
            }`}
          >
            {saved ? (
              <Glyph d={G.check} size={8} />
            ) : (
              <span className="h-1 w-1 rounded-full bg-current" />
            )}
            {text}
          </span>
        ))}
      </div>
    </Stage>
  );
}

/* --- model-selector: the standalone select, menu open ------------- */
function ModelSelectorPreview() {
  return (
    <Stage>
      <div className="space-y-1.5">
        <Panel className="flex items-center gap-1.5 px-2.5 py-1.5">
          <ModelIcon name="Claude Sonnet 4.5" size={9} />
          <span className="text-[10px] font-medium text-(--foreground)">Claude Sonnet 4.5</span>
          <Pill>Fast</Pill>
          <span className="ml-auto text-(--muted-foreground)">
            <Glyph d={G.chevron} size={9} />
          </span>
        </Panel>
        <Panel className="divide-y divide-(--border) overflow-hidden">
          {[
            ["GPT-5", true],
            ["Gemini 3 Pro", false],
          ].map(([name, active]) => (
            <div key={String(name)} className="flex items-center gap-1.5 px-2.5 py-1.5">
              <ModelIcon name={String(name)} size={9} />
              <span className="text-[9px] text-(--foreground)">{name}</span>
              {active && (
                <span className="ml-auto text-(--primary)">
                  <Glyph d={G.check} size={9} />
                </span>
              )}
            </div>
          ))}
        </Panel>
      </div>
    </Stage>
  );
}

/* --- reasoning-level: the three-way effort segment ----------------- */
function ReasoningLevelPreview() {
  return (
    <Stage>
      <Panel className="p-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-medium text-(--foreground)">Reasoning effort</span>
          <span className="text-[9px] font-medium text-(--primary)">Medium</span>
        </div>
        <div className="mt-2 grid grid-cols-3 gap-1 rounded-lg bg-(--muted) p-1">
          {["Low", "Medium", "High"].map((label) => (
            <span
              key={label}
              className={`rounded-md py-1 text-center text-[9px] font-medium ${
                label === "Medium"
                  ? "bg-(--card) text-(--foreground)"
                  : "text-(--muted-foreground)"
              }`}
              style={label === "Medium" ? { boxShadow: "var(--shadow-sm)" } : undefined}
            >
              {label}
            </span>
          ))}
        </div>
        <div className="mt-2">
          <Line w="72%" />
        </div>
      </Panel>
    </Stage>
  );
}

/* --- tool-toggle: which tools the model may reach for -------------- */
function ToolTogglePreview() {
  return (
    <Stage>
      <Panel className="overflow-hidden">
        <div className="border-b border-(--border) px-3 py-2">
          <span className="text-[10px] font-medium text-(--foreground)">Tools</span>
        </div>
        <ul className="divide-y divide-(--border)">
          {[
            [G.globe, "Web search", true],
            [G.wrench, "Code interpreter", false],
          ].map(([d, label, on]) => (
            <li key={String(label)} className="flex items-center gap-2 px-3 py-2">
              <Tile size={16}>
                <Glyph d={String(d)} size={9} />
              </Tile>
              <span className="text-[9px] text-(--foreground)">{label}</span>
              <span className="ml-auto">
                <Switch on={Boolean(on)} />
              </span>
            </li>
          ))}
        </ul>
      </Panel>
    </Stage>
  );
}

/* --- voice-input: recording, with the level meter running ---------- */
function VoiceInputPreview() {
  return (
    <Stage>
      <Panel className="flex items-center gap-2.5 p-2.5">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-red-500 text-white">
          <Glyph d={G.mic} size={13} />
        </span>
        <span className="flex h-4 flex-1 items-center gap-[2px] text-red-500 dark:text-red-400">
          {[6, 11, 4, 14, 8, 16, 5, 12, 7, 15, 9, 4, 10, 13, 6].map((h, i) => (
            <span
              key={i}
              className="cp-dot w-[2px] rounded-full bg-current"
              style={{ height: h, animationDelay: `${i * 0.06}s` }}
            />
          ))}
        </span>
        <span className="shrink-0 text-[9px] tabular-nums text-(--muted-foreground)">0:07</span>
      </Panel>
    </Stage>
  );
}

/* --- voice-waveform: the meter on its own, full width -------------- */
function VoiceWaveformPreview() {
  return (
    <Stage>
      <div className="flex h-10 items-center justify-center gap-[3px] text-(--primary)">
        {[
          8, 16, 26, 12, 34, 20, 40, 14, 28, 36, 18, 30, 10, 24, 38, 16, 22, 32, 12, 26, 8, 18, 28,
          14, 20,
        ].map((h, i) => (
          <span
            key={i}
            className="cp-dot w-[3px] rounded-full bg-current"
            style={{ height: h, animationDelay: `${i * 0.05}s` }}
          />
        ))}
      </div>
    </Stage>
  );
}

/* --- voice-conversation: two spoken turns, one still playing ------- */
function VoiceConversationPreview() {
  return (
    <Stage>
      <div className="space-y-2">
        <div className="flex flex-row-reverse items-start gap-2">
          <span className="grid h-6 w-6 shrink-0 place-items-center rounded-lg border border-(--border) bg-(--card) text-[8px] font-semibold text-(--muted-foreground)">
            You
          </span>
          <div
            className="w-[52%] rounded-2xl rounded-tr-sm px-2.5 py-2"
            style={{ background: "var(--primary)" }}
          >
            <div className="h-1 w-full rounded-full bg-white/70" />
            <div className="mt-1.5 h-1 w-2/3 rounded-full bg-white/45" />
          </div>
        </div>
        <div className="flex items-start gap-2">
          <span
            className="grid h-6 w-6 shrink-0 place-items-center rounded-lg text-[8px] font-semibold text-(--primary-foreground)"
            style={{ background: "var(--primary)" }}
          >
            AI
          </span>
          <div className="w-[64%] rounded-2xl rounded-tl-sm border border-(--border) bg-(--card) px-2.5 py-2">
            <span className="flex h-2.5 items-center gap-[2px] text-(--primary)">
              {[4, 8, 5, 10, 6, 9, 4].map((h, i) => (
                <span
                  key={i}
                  className="cp-dot w-[2px] rounded-full bg-current"
                  style={{ height: h, animationDelay: `${i * 0.08}s` }}
                />
              ))}
            </span>
            <div className="mt-1.5 space-y-1">
              <Line w="100%" />
              <Line w="62%" />
            </div>
          </div>
        </div>
      </div>
    </Stage>
  );
}
