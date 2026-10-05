"use client";

import { Button } from "@/components/ui/button";
import * as React from "react";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type MarkdownMessageProps = {
  /** Markdown-ish text — paragraphs, **bold**, *italic*, `code`,
   *  [links](url), fenced ```code blocks, bullet lists and pipe tables. */
  text: string;
  className?: string;
};

/* ------------------------------------------------------------------ */
/* Inline renderer — builds React nodes (no dangerouslySetInnerHTML)    */
/* ------------------------------------------------------------------ */

function renderInline(line: string, keyBase: string): React.ReactNode[] {
  const tokenRe = /(`[^`]+`)|(\*\*[^*]+\*\*)|(\*[^*]+\*)|(\[[^\]]+\]\([^)]+\))/g;
  const nodes: React.ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = tokenRe.exec(line)) !== null) {
    if (m.index > last) {
      nodes.push(
        <React.Fragment key={`${keyBase}-t${i++}`}>{line.slice(last, m.index)}</React.Fragment>,
      );
    }
    const tok = m[0];
    const k = `${keyBase}-k${i++}`;
    if (tok.startsWith("`")) {
      nodes.push(<code key={k}>{tok.slice(1, -1)}</code>);
    } else if (tok.startsWith("**")) {
      nodes.push(<strong key={k}>{tok.slice(2, -2)}</strong>);
    } else if (tok.startsWith("[")) {
      const md = tok.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (md) {
        nodes.push(
          <a
            key={k}
            href={md[2]}
            target="_blank"
            rel="noreferrer noopener"
            className="text-(--foreground) underline underline-offset-2"
          >
            {md[1]}
          </a>,
        );
      } else {
        nodes.push(<em key={k}>{tok.slice(1, -1)}</em>);
      }
    } else {
      nodes.push(<em key={k}>{tok.slice(1, -1)}</em>);
    }
    last = m.index + tok.length;
  }
  if (last < line.length) {
    nodes.push(<React.Fragment key={`${keyBase}-end`}>{line.slice(last)}</React.Fragment>);
  }
  return nodes;
}

function isTableSeparator(line: string): boolean {
  return /^\s*\|?[\s:|-]+\|?\s*$/.test(line) && line.includes("-");
}

/* ------------------------------------------------------------------ */
/* CodeBlock — fenced code with a language label and copy button       */
/* ------------------------------------------------------------------ */

function CodeBlock({ lang, code }: { lang: string; code: string }) {
  const [copied, setCopied] = React.useState(false);

  const copy = () => {
    void navigator.clipboard?.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="my-3 overflow-hidden rounded-xl border border-border">
      <div className="flex items-center justify-between bg-muted px-3 py-1.5">
        {}
        <span className="text-xs font-medium text-muted-foreground">
          {lang || "text"}
        </span>
        <Button variant="ghost" size="sm"
          type="button"
          onClick={copy}
          className="inline-flex h-8 items-center gap-1 rounded-md px-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="12" height="12">
            <rect x="9" y="9" width="13" height="13" rx="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
      <pre className="overflow-x-auto bg-muted px-3 py-3 text-sm leading-5 text-muted-foreground">
        <code>{code}</code>
      </pre>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Block parser — split into paragraphs / lists / tables / code        */
/* ------------------------------------------------------------------ */

function MarkdownBlocks({ text }: { text: string }) {
  const lines = text.split("\n");
  const blocks: React.ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed === "") {
      i++;
      continue;
    }

    /* Fenced code block */
    if (trimmed.startsWith("```")) {
      const lang = trimmed.replace(/^```/, "").trim();
      let j = i + 1;
      const code: string[] = [];
      while (j < lines.length && !lines[j].trimStart().startsWith("```")) {
        code.push(lines[j]);
        j++;
      }
      blocks.push(<CodeBlock key={key++} lang={lang} code={code.join("\n")} />);
      i = j + 1;
      continue;
    }

    /* Pipe table */
    if (line.includes("|") && i + 1 < lines.length && isTableSeparator(lines[i + 1])) {
      const header = line
        .split("|")
        .map((c) => c.trim())
        .filter((c, idx, arr) => !(c === "" && (idx === 0 || idx === arr.length - 1)));
      let j = i + 2;
      const body: string[][] = [];
      while (j < lines.length && lines[j].includes("|") && !isTableSeparator(lines[j])) {
        body.push(
          lines[j]
            .split("|")
            .map((c) => c.trim())
            .filter((c, idx, arr) => !(c === "" && (idx === 0 || idx === arr.length - 1))),
        );
        j++;
      }
      blocks.push(
        <div key={key++} className="my-3 overflow-x-auto">
          <table className="w-full border-collapse text-sm leading-5">
            <thead>
              <tr>
                {header.map((h, hk) => (
                  <th
                    key={hk}
                    className="border-b border-border px-3 py-1.5 text-left font-medium text-muted-foreground"
                  >
                    {renderInline(h, `th${hk}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {body.map((row, rk) => (
                <tr key={rk}>
                  {row.map((cell, ck) => (
                    <td
                      key={ck}
                      className="border-b border-border/70 px-3 py-1.5 text-foreground"
                    >
                      {renderInline(cell, `td${rk}-${ck}`)}
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

    /* Bullet list */
    if (/^\s*[-*]\s+/.test(line)) {
      const items: string[] = [];
      let j = i;
      while (j < lines.length && /^\s*[-*]\s+/.test(lines[j])) {
        items.push(lines[j].replace(/^\s*[-*]\s+/, ""));
        j++;
      }
      blocks.push(
        <ul key={key++} className="my-3 space-y-1 pl-5">
          {items.map((item, ik) => (
            <li key={ik} className="list-disc pl-1">
              {renderInline(item, `li${ik}`)}
            </li>
          ))}
        </ul>,
      );
      i = j;
      continue;
    }

    /* Paragraph */
    let j = i;
    const para: string[] = [];
    while (j < lines.length && lines[j].trim() !== "" && !lines[j].trimStart().startsWith("```")) {
      para.push(lines[j]);
      j++;
    }
    blocks.push(<p key={key++}>{renderInline(para.join(" "), `p${key}`)}</p>);
    i = j;
  }

  return <>{blocks}</>;
}

/* ------------------------------------------------------------------ */
/* MarkdownMessage                                                     */
/* ------------------------------------------------------------------ */

export function MarkdownMessage({ text, className = "" }: MarkdownMessageProps) {
  return (
    <div className={`whitespace-pre-wrap text-sm leading-7 text-foreground ${className}`}>
      <MarkdownBlocks text={text} />
    </div>
  );
}
