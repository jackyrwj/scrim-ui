/**
 * The strip along the top of the demo saying what this is.
 *
 * The demo exists to answer one question — "does the app actually run?" — and
 * a visitor who gets that answer and then cannot find their way back to the
 * thing being sold has cost me the sale the demo just earned. So: what it is,
 * what is capped, and a link out.
 *
 * Server component, no JavaScript. It is a sentence and a link.
 */
export function DemoBanner() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 border-b border-zinc-200 bg-zinc-50 px-4 py-2 text-center text-[13px] text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
      <span>
        Live demo of the <strong className="font-medium text-zinc-900 dark:text-zinc-100">AI Chat</strong>{" "}
        template — the real app, on a shared key, with replies capped.
      </span>
      <a
        href="https://scrimui.dev/templates/ai-chat"
        className="font-medium text-zinc-900 underline underline-offset-2 dark:text-zinc-100"
      >
        Get the source →
      </a>
    </div>
  );
}
