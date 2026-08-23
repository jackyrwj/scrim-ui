/* ------------------------------------------------------------------ */
/* Static previews for the homepage "Popular Components" cards.        */
/*                                                                     */
/* Same rationale as tool-preview.tsx — pure markup + CSS, so nothing  */
/* downloads, it stays crisp at any size and it follows dark mode —    */
/* but these show the component's *shape* rather than performing what  */
/* it does. A component library whose most-used components are six     */
/* text-only cards is asking people to click blind; a loop of six more */
/* animations would compete with the hero. Static is the middle.       */
/* Server component on purpose — zero JS.                              */
/* ------------------------------------------------------------------ */

const previews: Record<string, () => React.ReactElement> = {
  "prompt-input": PromptInputPreview,
  "streaming-message": StreamingMessagePreview,
  "user-message": UserMessagePreview,
  "markdown-message": MarkdownMessagePreview,
  "tool-call": ToolCallPreview,
  "code-execution": CodeExecutionPreview,
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
      <div className="w-[262px]">{children}</div>
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
          <span className="rounded-md border border-(--border) px-1.5 py-0.5 text-[9px] text-(--muted-foreground)">
            Sonnet 4.5
          </span>
          <span className="ml-auto h-5 w-5 rounded-md" style={{ background: "var(--primary)" }} />
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
