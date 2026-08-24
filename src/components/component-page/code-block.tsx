import * as React from "react";
import { tokenize, TOKEN_CLASS, type Token } from "@/lib/code-highlight";
import { CodeCopyButton } from "./code-copy-button";
import { CodeExpander } from "./code-expander";

/**
 * A block of source, coloured and copyable.
 *
 * Three things changed from the version this replaces, all of them things
 * readers kept tripping over:
 *
 *  - It is highlighted. The old block was one flat colour, which is fine for
 *    three lines and unreadable for four hundred.
 *  - The copy button lives in the block's own top-right corner rather than
 *    floating beside a heading somewhere above it. That is where every other
 *    docs site puts it, and it means one copy affordance per block instead of
 *    the same "Copy React" rendered twice on a page.
 *  - Long blocks fade out at a fixed height behind an Expand control, instead
 *    of an inner scrollbar that hijacks the page's own scroll.
 *
 * Server component: `tokenize` runs at build time for static source, so the
 * reader downloads coloured markup and no highlighter. The Explorer's live
 * snippet renders the same markup on the client via `CodeTokens`.
 */
export function CodeBlock({
  code,
  filename,
  /** Rendered height cap in lines; beyond this the block fades behind Expand. */
  maxLines = 22,
  className = "",
}: {
  code: string;
  filename?: string;
  maxLines?: number;
  className?: string;
}) {
  const lineCount = code.split("\n").length;
  const body = (
    /* The background is repeated here, not just on the wrapper, so the
       colour is on the text's own ancestor rather than five levels up. It
       makes the horizontally-scrolling area paint itself, and it is what
       lets a contrast checker resolve the token colours — walking up past
       the expander's gradient overlay, axe gives up and assumes white. */
    <pre
      className="overflow-x-auto px-4 py-3.5 text-[13px] leading-6"
      style={{ background: "var(--code-bg)" }}
    >
      <code className="font-mono">
        <CodeTokens code={code} />
      </code>
    </pre>
  );

  return (
    <div
      className={`group relative overflow-hidden rounded-xl border border-(--border) ${className}`}
      style={{ background: "var(--code-bg)", color: "var(--code-fg)" }}
    >
      <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-2">
        <span className="truncate font-mono text-[11px] text-(--tok-punct)">{filename}</span>
        <CodeCopyButton code={code} />
      </div>
      {lineCount > maxLines ? (
        <CodeExpander lines={lineCount} maxLines={maxLines}>
          {body}
        </CodeExpander>
      ) : (
        body
      )}
    </div>
  );
}

/** The coloured spans themselves — shared by the server block above and the
 *  Explorer's client-side live snippet. */
export function CodeTokens({ code, tokens }: { code?: string; tokens?: Token[] }) {
  const list = tokens ?? tokenize(code ?? "");
  return (
    <>
      {list.map((t, i) =>
        t.kind === "plain" ? (
          <React.Fragment key={i}>{t.text}</React.Fragment>
        ) : (
          <span key={i} className={TOKEN_CLASS[t.kind]}>
            {t.text}
          </span>
        ),
      )}
    </>
  );
}
