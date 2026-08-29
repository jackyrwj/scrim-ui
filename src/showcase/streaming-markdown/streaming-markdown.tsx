"use client";

import * as React from "react";

/**
 * Markdown that renders correctly *while it is still arriving*.
 *
 * The received wisdom is that you cannot do this — render plain text while
 * streaming, then swap in rendered markdown when the turn ends. That advice
 * exists because the naive approach genuinely looks broken: `**bol` renders
 * as two literal asterisks, then snaps to bold when the closing pair lands.
 * A paragraph of prose flashes syntax half a dozen times on its way in, and
 * a table sits as a row of raw pipes until its separator arrives.
 *
 * Swapping at the end trades one flaw for a worse one: the entire message
 * reflows at the exact moment the reader is furthest down it.
 *
 * Three ideas make streaming markdown work.
 *
 * 1. COMPLETENESS IS POSITIONAL. Only the tail of the text can be
 *    incomplete. An unmatched `**` in the middle of the text is not a bold
 *    span waiting to close — more text arrived after it, so it is literally
 *    two asterisks. Everything before the tail is parsed strictly, exactly
 *    as a finished document would be.
 *
 * 2. SPECULATIVE CLOSING. In the tail, an unclosed construct is closed
 *    virtually and rendered in its final form: `**bol` renders as bold "bol"
 *    with the asterisks hidden. When `**bold**` completes, nothing changes —
 *    it was already bold. No flash, and more importantly no reflow.
 *
 * 3. WHEN AMBIGUOUS, HOLD. A lone `#`, a single backtick, a table row whose
 *    next line has not arrived — these could become several different
 *    things. Rendering nothing for one token is imperceptible. Rendering the
 *    wrong thing and correcting it is the flicker we came to remove. This is
 *    the rule people skip, because holding output feels like doing less.
 *
 * Speculation is only valid while text is still coming, which is what
 * `streaming` controls. Once the turn is done, unmatched delimiters are
 * literal characters and get rendered as such — the same text parsed by the
 * same rules any other markdown renderer would use.
 */

export type StreamingMarkdownProps = {
  /** The markdown so far. Safe to pass a value that ends mid-token. */
  text: string;
  /**
   * Whether more text is still coming. Drives speculation *and* correctness:
   * with `false`, a trailing `**` is two asterisks, because it is.
   */
  streaming?: boolean;
  className?: string;
};

/* ------------------------------------------------------------------ */
/* Inline — speculative closing                                        */
/* ------------------------------------------------------------------ */

type Unclosed = { index: number; kind: "code" | "strong" | "em" | "link" };

/**
 * The first delimiter in `text` that is opened and never closed.
 *
 * Scans left to right and skips over *matched* pairs rather than searching
 * from the end, so `a *b* c **d` finds the `**` and not the earlier `*`
 * that already closed.
 */
function findUnclosed(text: string): Unclosed | null {
  let i = 0;
  while (i < text.length) {
    const ch = text[i];
    if (ch === "`") {
      const close = text.indexOf("`", i + 1);
      if (close === -1) return { index: i, kind: "code" };
      i = close + 1;
      continue;
    }
    if (ch === "*" && text[i + 1] === "*") {
      const close = text.indexOf("**", i + 2);
      if (close === -1) return { index: i, kind: "strong" };
      i = close + 2;
      continue;
    }
    if (ch === "*") {
      const close = text.indexOf("*", i + 1);
      if (close === -1) return { index: i, kind: "em" };
      i = close + 1;
      continue;
    }
    if (ch === "[") {
      /* A link is only settled once its closing paren lands — `[a](htt` is
         still in flight even though the bracket pair is complete. */
      const close = text.indexOf(")", i);
      if (close === -1) return { index: i, kind: "link" };
      i = close + 1;
      continue;
    }
    i++;
  }
  return null;
}

const LINK_CLASS = "text-(--foreground) underline underline-offset-2";

function renderInline(line: string, speculate: boolean, keyBase: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  const tokenRe = /(`[^`]+`)|(\*\*[^*]+\*\*)|(\*[^*]+\*)|(\[[^\]]+\]\([^)]*\))/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;

  while ((m = tokenRe.exec(line)) !== null) {
    if (m.index > last) {
      nodes.push(<React.Fragment key={`${keyBase}-t${i++}`}>{line.slice(last, m.index)}</React.Fragment>);
    }
    const tok = m[0];
    const k = `${keyBase}-k${i++}`;
    if (tok.startsWith("`")) nodes.push(<code key={k}>{tok.slice(1, -1)}</code>);
    else if (tok.startsWith("**")) nodes.push(<strong key={k}>{tok.slice(2, -2)}</strong>);
    else if (tok.startsWith("[")) {
      const md = tok.match(/^\[([^\]]+)\]\(([^)]*)\)$/);
      nodes.push(
        md && md[2] ? (
          <a key={k} href={md[2]} target="_blank" rel="noreferrer noopener" className={LINK_CLASS}>
            {md[1]}
          </a>
        ) : (
          /* Bracket pair closed, href still empty: style it as a link now so
             that filling the href in later changes nothing visible. */
          <span key={k} className={LINK_CLASS}>
            {md ? md[1] : tok}
          </span>
        ),
      );
    } else nodes.push(<em key={k}>{tok.slice(1, -1)}</em>);
    last = m.index + tok.length;
  }

  const rest = line.slice(last);
  if (!rest) return nodes;

  const unclosed = speculate ? findUnclosed(rest) : null;
  if (!unclosed) {
    nodes.push(<React.Fragment key={`${keyBase}-t${i++}`}>{rest}</React.Fragment>);
    return nodes;
  }

  /* Text before the opener is ordinary. */
  if (unclosed.index > 0) {
    nodes.push(<React.Fragment key={`${keyBase}-t${i++}`}>{rest.slice(0, unclosed.index)}</React.Fragment>);
  }

  const k = `${keyBase}-spec`;
  if (unclosed.kind === "code") {
    nodes.push(<code key={k}>{rest.slice(unclosed.index + 1)}</code>);
  } else if (unclosed.kind === "strong") {
    nodes.push(<strong key={k}>{rest.slice(unclosed.index + 2)}</strong>);
  } else if (unclosed.kind === "em") {
    nodes.push(<em key={k}>{rest.slice(unclosed.index + 1)}</em>);
  } else {
    /* `[label` or `[label](ur` — render the label, already link-styled. The
       href is the only thing still missing and it is not visible anyway, so
       when it lands the text does not move. */
    const body = rest.slice(unclosed.index + 1);
    const bracket = body.indexOf("]");
    nodes.push(
      <span key={k} className={LINK_CLASS}>
        {bracket === -1 ? body : body.slice(0, bracket)}
      </span>,
    );
  }
  return nodes;
}

/* ------------------------------------------------------------------ */
/* Pieces                                                              */
/* ------------------------------------------------------------------ */

function CodeBlock({
  lang,
  code,
  caret,
}: {
  lang: string;
  code: string;
  caret?: React.ReactNode;
}) {
  const [copied, setCopied] = React.useState(false);
  return (
    <div className="my-3 overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
      <div className="flex items-center justify-between border-b border-zinc-200 bg-zinc-50 px-3 py-1.5 dark:border-zinc-800 dark:bg-zinc-900/60">
        <span className="font-mono text-[11px] text-(--muted-foreground)">{lang || "text"}</span>
        <button
          type="button"
          onClick={() => {
            void navigator.clipboard?.writeText(code);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1500);
          }}
          className="text-[11px] text-(--muted-foreground) transition-colors hover:text-(--foreground)"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto bg-zinc-950 px-3 py-3 text-[13px] leading-5 text-zinc-100 dark:bg-zinc-900">
        <code>
          {code}
          {caret}
        </code>
      </pre>
    </div>
  );
}

function isTableSeparator(line: string): boolean {
  return /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/.test(line);
}

function cells(line: string): string[] {
  return line
    .split("|")
    .map((c) => c.trim())
    .filter((c, idx, arr) => !(c === "" && (idx === 0 || idx === arr.length - 1)));
}

/* ------------------------------------------------------------------ */
/* Hold — the ambiguous tail                                           */
/* ------------------------------------------------------------------ */

/**
 * Should the final line be withheld for now?
 *
 * Every case here is a fragment that could still become more than one thing.
 * Holding costs one token of latency, which no one perceives; guessing costs
 * a visible correction, which everyone does.
 */
function shouldHoldLastLine(lines: string[]): boolean {
  const line = lines[lines.length - 1];
  if (line === undefined) return false;
  const t = line.trim();
  if (t === "") return false;

  /* A run of one or two backticks is either inline code opening or a fence
     marker still being typed. Those render completely differently. */
  if (/^`{1,2}$/.test(t)) return true;

  /* Markers with no content yet: `#`, `-`, `>`, `1.` */
  if (/^#{1,6}$/.test(t)) return true;
  if (/^[-*+]$/.test(t)) return true;
  if (/^>$/.test(t)) return true;
  if (/^\d+\.$/.test(t)) return true;

  /* A pipe row is only a table once its separator arrives. Until then it
     could equally be prose containing a pipe. Rendering it as a paragraph
     and promoting it to a table later is the single ugliest reflow in
     streamed markdown, because the whole block changes shape. */
  if (t.includes("|")) {
    const prev = lines[lines.length - 2]?.trim() ?? "";
    const established = prev.includes("|") || isTableSeparator(prev);
    if (!established) return true;
  }

  /* A separator on its own, with the header above it, is safe to hold too —
     the table renders the moment there is something to put under it. */
  if (isTableSeparator(t)) return true;

  return false;
}

/* ------------------------------------------------------------------ */
/* Blocks                                                              */
/* ------------------------------------------------------------------ */

function parseBlocks(
  text: string,
  speculate: boolean,
  keyBase: string,
  caret = false,
): React.ReactNode[] {
  let lines = text.split("\n");
  if (speculate && shouldHoldLastLine(lines)) lines = lines.slice(0, -1);

  const blocks: React.ReactNode[] = [];
  let i = 0;
  let key = 0;

  /* The caret has to sit *inside* the last block, not after it. Rendered as a
     sibling of the blocks it is a span following a <p>, which is block-level,
     so it drops onto a line of its own and reads as a stray character. The
     branches below already know which run of text is last — that is the same
     condition that decides whether to speculate — so the caret rides along
     with it. If the last block is a table or a code block there is no
     sensible inline slot, and it falls through to the trailing push. */
  let caretPlaced = false;
  const tip = (last: boolean) => {
    if (!caret || !last || caretPlaced) return null;
    caretPlaced = true;
    return <Caret />;
  };

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();
    const k = `${keyBase}-b${key++}`;

    if (trimmed === "") {
      i++;
      continue;
    }

    /* Fenced code. An unclosed fence is rendered as a code block straight
       away rather than as a paragraph of backticks — the language label is
       already known, and the block only grows downward from here, so nothing
       above it moves. */
    if (trimmed.startsWith("```")) {
      const lang = trimmed.replace(/^```/, "").trim();
      let j = i + 1;
      const code: string[] = [];
      while (j < lines.length && !lines[j].trimStart().startsWith("```")) {
        code.push(lines[j]);
        j++;
      }
      blocks.push(
        <CodeBlock key={k} lang={lang} code={code.join("\n")} caret={tip(j >= lines.length)} />,
      );
      i = j + 1;
      continue;
    }

    /* Heading */
    const heading = trimmed.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      const level = heading[1].length;
      const sizes = ["text-xl", "text-lg", "text-base", "text-sm", "text-sm", "text-sm"];
      blocks.push(
        <p key={k} className={`mt-4 mb-2 font-semibold first:mt-0 ${sizes[level - 1]}`}>
          {renderInline(heading[2], speculate, k)}
          {tip(i === lines.length - 1)}
        </p>,
      );
      i++;
      continue;
    }

    /* Table */
    if (line.includes("|") && i + 1 < lines.length && isTableSeparator(lines[i + 1])) {
      const header = cells(line);
      let j = i + 2;
      const body: string[][] = [];
      while (j < lines.length && lines[j].includes("|") && !isTableSeparator(lines[j])) {
        body.push(cells(lines[j]));
        j++;
      }
      blocks.push(
        <div key={k} className="my-3 overflow-x-auto">
          <table className="w-full border-collapse text-[13px] leading-5">
            <thead>
              <tr>
                {header.map((h, hk) => (
                  <th key={hk} className="border-b border-zinc-200 px-2 py-1.5 text-left font-medium dark:border-zinc-800">
                    {renderInline(h, false, `${k}-h${hk}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {body.map((row, rk) => (
                <tr key={rk}>
                  {/* Padded to the header's width: a row that is still
                      arriving has fewer cells, and letting the column count
                      change would make the whole table jump. */}
                  {header.map((_, ck) => (
                    <td key={ck} className="border-b border-zinc-100 px-2 py-1.5 align-top dark:border-zinc-900">
                      {renderInline(row[ck] ?? "", false, `${k}-r${rk}c${ck}`)}
                      {/* Last *filled* cell, not the last column: a row that
                          is still arriving is padded out with empty cells,
                          and the caret belongs where the text stopped. */}
                      {tip(
                        j >= lines.length &&
                          rk === body.length - 1 &&
                          ck === Math.min(row.length, header.length) - 1,
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
      i = j;
      continue;
    }

    /* Lists */
    const bullet = trimmed.match(/^[-*+]\s+(.*)$/);
    const ordered = trimmed.match(/^(\d+)\.\s+(.*)$/);
    if (bullet || ordered) {
      const items: string[] = [];
      const isOrdered = Boolean(ordered);
      let j = i;
      while (j < lines.length) {
        const t = lines[j].trim();
        const b = t.match(/^[-*+]\s+(.*)$/);
        const o = t.match(/^(\d+)\.\s+(.*)$/);
        if (isOrdered && o) items.push(o[2]);
        else if (!isOrdered && b) items.push(b[1]);
        else break;
        j++;
      }
      const ListTag = isOrdered ? "ol" : "ul";
      blocks.push(
        <ListTag key={k} className={`my-2 space-y-1 pl-5 ${isOrdered ? "list-decimal" : "list-disc"}`}>
          {items.map((item, ik) => (
            <li key={ik}>
              {renderInline(item, speculate && j === lines.length && ik === items.length - 1, `${k}-i${ik}`)}
              {tip(j >= lines.length && ik === items.length - 1)}
            </li>
          ))}
        </ListTag>,
      );
      i = j;
      continue;
    }

    /* Blockquote */
    const quote = trimmed.match(/^>\s?(.*)$/);
    if (quote) {
      blocks.push(
        <blockquote key={k} className="my-3 border-l-2 border-(--border) pl-3 text-(--muted-foreground)">
          {renderInline(quote[1], speculate && i === lines.length - 1, k)}
          {tip(i === lines.length - 1)}
        </blockquote>,
      );
      i++;
      continue;
    }

    /* Paragraph — consecutive non-blank lines that start no other block. */
    const para: string[] = [];
    let j = i;
    while (
      j < lines.length &&
      lines[j].trim() !== "" &&
      !lines[j].trimStart().startsWith("```") &&
      !/^#{1,6}\s/.test(lines[j].trim()) &&
      !/^[-*+]\s/.test(lines[j].trim()) &&
      !/^\d+\.\s/.test(lines[j].trim()) &&
      !/^>\s?/.test(lines[j].trim())
    ) {
      para.push(lines[j]);
      j++;
    }
    blocks.push(
      <p key={k} className="my-2 leading-6 first:mt-0 last:mb-0">
        {para.map((l, lk) => (
          <React.Fragment key={lk}>
            {lk > 0 && " "}
            {renderInline(l, speculate && j === lines.length && lk === para.length - 1, `${k}-l${lk}`)}
            {tip(j >= lines.length && lk === para.length - 1)}
          </React.Fragment>
        ))}
      </p>,
    );
    i = j;
  }

  if (caret && !caretPlaced) blocks.push(<Caret key={`${keyBase}-caret`} />);

  return blocks;
}

/**
 * The "still typing" tip. `aria-hidden` because a screen reader announcing a
 * blinking rectangle at the end of every partial sentence is noise, not
 * information — the streamed text itself is the signal.
 */
function Caret() {
  return (
    <span
      aria-hidden
      className="ml-0.5 inline-block h-[1em] w-[2px] translate-y-[2px] animate-pulse bg-(--foreground) align-baseline"
    />
  );
}

/* ------------------------------------------------------------------ */
/* Stable / tail split                                                 */
/* ------------------------------------------------------------------ */

/**
 * Everything before the last block boundary can never change again, so it is
 * parsed once and memoised. Without this, every token re-parses the whole
 * message: quadratic over a stream, and very visible by the time an answer
 * is a few thousand tokens long.
 *
 * The boundary has to sit outside a code fence. A blank line inside one is
 * not a block boundary, and splitting there would parse half a fence as
 * prose — hence the parity check rather than a plain `lastIndexOf`.
 */
function splitStable(text: string): { stable: string; tail: string } {
  let from = text.length;
  for (;;) {
    const idx = text.lastIndexOf("\n\n", from);
    if (idx === -1) return { stable: "", tail: text };
    const before = text.slice(0, idx);
    const fences = before.match(/^```/gm)?.length ?? 0;
    if (fences % 2 === 0) return { stable: before, tail: text.slice(idx) };
    from = idx - 1;
    if (from < 0) return { stable: "", tail: text };
  }
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export function StreamingMarkdown({ text, streaming = false, className }: StreamingMarkdownProps) {
  const { stable, tail } = React.useMemo(() => splitStable(text), [text]);

  /* `stable` only changes when a block boundary is crossed — a few times per
     message, not a few hundred. This memo is the whole reason long answers
     stay smooth. */
  const stableBlocks = React.useMemo(() => parseBlocks(stable, false, "s"), [stable]);
  const tailBlocks = parseBlocks(tail, streaming, "t", streaming);

  return (
    <div className={`text-[15px] leading-6 ${className ?? ""}`}>
      {stableBlocks}
      {tailBlocks}
    </div>
  );
}
