/* ------------------------------------------------------------------ */
/* Static thumbnails for the /templates cards.                         */
/*                                                                     */
/* Same pure-markup + CSS idea as component-preview.tsx, and it shares  */
/* that file's animations, but it has a shell of its own — see          */
/* app/template-previews.css for why .cp's banner is the wrong shape    */
/* on a full-width card.                                               */
/*                                                                     */
/* What differs is what a thumbnail of a TEMPLATE has to show. A        */
/* component preview shows one component's shape, centred on a fixed    */
/* 262px stage. A template is not a component — the thing being sold is */
/* the arrangement — so these fill the frame with the app's SILHOUETTE: */
/* sidebar, transcript, composer. At thumbnail size nobody reads the    */
/* content anyway, and a card that renders one composer would be        */
/* claiming a template is a component.                                  */
/*                                                                     */
/* Server component: zero JS on a page that is otherwise a list.        */
/* ------------------------------------------------------------------ */

const previews: Record<string, () => React.ReactElement> = {
  "ai-chat": AiChatThumb,
  "rag-qa": RagQaThumb,
};

export function hasTemplatePreview(slug: string) {
  return slug in previews;
}

export function TemplatePreview({ slug }: { slug: string }) {
  const Preview = previews[slug];
  if (!Preview) return null;
  return (
    <div className="tp" aria-hidden>
      <Preview />
    </div>
  );
}

/* --- ai-chat: sidebar, a turn with a tool call, composer ----------- */
function AiChatThumb() {
  return (
    <div className="absolute inset-0 flex p-2.5">
      {/* Sidebar. Four rows and an active one — the conversation list is
          half the reason this is a template and not a component. */}
      <div className="flex w-[26%] shrink-0 flex-col gap-1 border-r border-(--border) pr-2">
        <div className="h-3 rounded-[3px] border border-(--border)" />
        <div className="mt-0.5 h-2 rounded-full bg-(--border)" style={{ opacity: 0.9 }} />
        <div className="h-2 w-[80%] rounded-full bg-(--border)" style={{ opacity: 0.55 }} />
        <div className="h-2 w-[65%] rounded-full bg-(--border)" style={{ opacity: 0.55 }} />
      </div>

      {/* Transcript */}
      <div className="flex min-w-0 flex-1 flex-col gap-1.5 pl-2.5">
        <div className="flex justify-end">
          <div className="h-3 w-[46%] rounded-md rounded-br-[2px]" style={{ background: "var(--primary)" }} />
        </div>

        {/* The tool call — the one element that says "this is an AI app"
            rather than "this is a chat window". */}
        <div className="rounded-md border border-(--border) bg-(--card) px-1.5 py-1">
          <div className="flex items-center gap-1">
            <span className="cp-dot h-1 w-1 rounded-full" style={{ background: "var(--primary)" }} />
            <span className="h-1 w-[34%] rounded-full bg-(--border)" />
            <span className="ml-auto h-1 w-2 rounded-full bg-(--border)" style={{ opacity: 0.6 }} />
          </div>
          <div className="mt-1 space-y-0.5 rounded-[3px] bg-(--muted) p-1">
            <div className="h-1 w-[58%] rounded-full" style={{ background: "var(--primary)", opacity: 0.45 }} />
            <div className="h-1 w-[40%] rounded-full bg-(--border)" />
          </div>
        </div>

        {/* The answer, mid-stream. */}
        <div className="space-y-1">
          <div className="cp-line h-1 rounded-full bg-(--border)" />
          <div className="flex items-center">
            <div
              className="cp-line h-1 w-[62%] rounded-full bg-(--border)"
              style={{ animationDelay: "0.12s" }}
            />
            <span
              className="cp-caret ml-px inline-block h-[7px] w-px rounded-full"
              style={{ background: "var(--primary)" }}
            />
          </div>
        </div>

        {/* Composer, pinned to the bottom the way it is in the app. */}
        <div className="mt-auto rounded-md border border-(--border) bg-(--card) px-1.5 py-1">
          <div className="h-1 w-[30%] rounded-full bg-(--border)" />
          <div className="mt-1.5 flex items-center gap-1">
            <span className="h-2 w-4 rounded-[3px] border border-(--border)" />
            <span className="h-2 w-6 rounded-[3px] border border-(--border)" />
            <span
              className="ml-auto h-2.5 w-2.5 rounded-full"
              style={{ background: "var(--primary)" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* --- rag-qa: a document with marks, an answer with citations ------- */
/*
   The silhouette that matters here is the SPLIT. Two panes, and marks in
   the left one lining up with chips in the right — at thumbnail size that
   reads as "a document and an answer that point at each other", which is
   the whole product. A single answer column would look like the chat card
   with the sidebar removed.
*/
function RagQaThumb() {
  return (
    <div className="absolute inset-0 flex gap-2 p-2.5">
      {/* The document. Prose lines with two highlighted runs in it — the
          highlight is the only coloured thing on this side, because it is
          the only thing worth noticing. */}
      <div className="flex min-w-0 flex-[1.15] flex-col gap-1 border-r border-(--border) pr-2">
        <div className="h-1.5 w-[45%] rounded-full bg-(--border)" />
        <div className="mt-0.5 h-1 rounded-full bg-(--border)" style={{ opacity: 0.55 }} />
        <div className="h-1 w-[88%] rounded-full bg-(--border)" style={{ opacity: 0.55 }} />
        <div className="h-1 w-[70%] rounded-full" style={{ background: "var(--primary)", opacity: 0.45 }} />
        <div className="mt-1 h-1 rounded-full bg-(--border)" style={{ opacity: 0.55 }} />
        <div className="h-1 w-[52%] rounded-full" style={{ background: "var(--primary)", opacity: 0.45 }} />
        <div className="mt-1 h-1 w-[80%] rounded-full bg-(--border)" style={{ opacity: 0.55 }} />
        <div className="h-1 w-[64%] rounded-full bg-(--border)" style={{ opacity: 0.55 }} />
      </div>

      {/* The answer, mid-stream, with two citation chips in it. */}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-center gap-1">
          <div className="cp-line h-1 flex-1 rounded-full bg-(--border)" />
          <span className="h-1.5 w-1.5 shrink-0 rounded-[2px]" style={{ background: "var(--primary)", opacity: 0.7 }} />
        </div>
        <div className="cp-line h-1 rounded-full bg-(--border)" style={{ animationDelay: "0.1s" }} />
        <div className="flex items-center gap-1">
          <div className="cp-line h-1 w-[55%] rounded-full bg-(--border)" style={{ animationDelay: "0.2s" }} />
          <span className="h-1.5 w-1.5 shrink-0 rounded-[2px]" style={{ background: "var(--primary)", opacity: 0.7 }} />
          <span className="cp-caret inline-block h-[7px] w-px rounded-full" style={{ background: "var(--primary)" }} />
        </div>

        {/* The source list under it — numbered rows, which is what tells
            you the citations resolve to something. */}
        <div className="mt-1.5 space-y-1 rounded-md border border-(--border) bg-(--card) p-1.5">
          {[1, 0.6].map((opacity, i) => (
            <div key={i} className="flex items-center gap-1">
              <span
                className="h-1.5 w-1.5 shrink-0 rounded-[2px]"
                style={{ background: "var(--primary)", opacity: opacity * 0.7 }}
              />
              <span className="h-1 flex-1 rounded-full bg-(--border)" style={{ opacity: opacity * 0.8 }} />
            </div>
          ))}
        </div>

        {/* Composer. */}
        <div className="mt-auto rounded-md border border-(--border) bg-(--card) px-1.5 py-1">
          <div className="h-1 w-[42%] rounded-full bg-(--border)" />
          <div className="mt-1.5 flex items-center gap-1">
            <span className="h-2 w-4 rounded-[3px] border border-(--border)" />
            <span className="ml-auto h-2.5 w-2.5 rounded-full" style={{ background: "var(--primary)" }} />
          </div>
        </div>
      </div>
    </div>
  );
}
