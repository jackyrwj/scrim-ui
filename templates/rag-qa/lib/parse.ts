/**
 * Bytes in, text out.
 *
 * Everything downstream of here is offsets into a string, so this function
 * decides what those offsets are *of*. Two rules follow from that, and both
 * are easy to break by accident:
 *
 *  1. **Return the text once and never rewrite it.** The string this returns
 *     is stored, chunked, embedded, cited and rendered. If any later step
 *     normalises it — collapses whitespace, strips a BOM, converts line
 *     endings — every offset taken before that step now points somewhere
 *     else. So the normalising happens HERE, once, before anything measures
 *     it.
 *
 *  2. **Parsing is not instant, and the UI has to know that.** A 40MB PDF is
 *     seconds of work, not milliseconds. The states the uploader shows
 *     (reading → parsing → chunking → embedding) are real phases with real
 *     durations, which is why the ingest route reports them rather than
 *     showing one spinner over the lot.
 */

export type ParsedDocument = {
  name: string;
  text: string;
  bytes: number;
};

export class ParseError extends Error {
  /** What the user should do about it, in a sentence. Rendered as-is. */
  readonly hint: string;
  constructor(message: string, hint: string) {
    super(message);
    this.name = "ParseError";
    this.hint = hint;
  }
}

/** 8MB. Not a limit of the parser — a limit of asking one serverless request
 *  to hold a file in memory, embed it, and answer within its timeout. Raise it
 *  when ingestion moves to a queue, not before. */
export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

const TEXT_EXTENSIONS = ["txt", "md", "markdown", "mdx", "csv", "tsv", "json", "log", "rst"];

export function isSupported(name: string): boolean {
  return TEXT_EXTENSIONS.includes(extensionOf(name));
}

export function acceptAttribute(): string {
  return TEXT_EXTENSIONS.map((e) => `.${e}`).join(",");
}

export async function parseDocument(file: File): Promise<ParsedDocument> {
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new ParseError(
      `${file.name} is ${formatBytes(file.size)}.`,
      `The limit is ${formatBytes(MAX_UPLOAD_BYTES)} — split the document, or move ingestion to a background job.`,
    );
  }

  const extension = extensionOf(file.name);

  if (extension === "pdf") {
    /* Deliberately not bundled. A PDF extractor is a heavy dependency with a
       native build on some platforms, and shipping one in a template means
       everyone who installs this pays for it whether or not they have a PDF.
       The seam is here and it is two lines:

         const { default: pdfParse } = await import("pdf-parse");
         const { text } = await pdfParse(Buffer.from(await file.arrayBuffer()));
         return { name: file.name, text: normalize(text), bytes: file.size };

       Note the `normalize` — extractors return their own line endings, and
       skipping it is exactly the mistake rule 1 above is about. Everything
       else in this template works on PDFs the moment those lines are in. */
    throw new ParseError(
      "PDF extraction is not wired up in this template.",
      "lib/parse.ts has the two-line seam for it — install a PDF text extractor and uncomment. Text and Markdown work as they are.",
    );
  }

  if (!isSupported(file.name)) {
    throw new ParseError(
      `${file.name} is not a text document.`,
      `Supported here: ${TEXT_EXTENSIONS.join(", ")}. Add a branch in lib/parse.ts for anything else.`,
    );
  }

  const text = normalize(await file.text());

  if (text.trim().length === 0) {
    throw new ParseError(
      `${file.name} has no readable text.`,
      "An empty document would embed into nothing and retrieve nothing — nothing to index.",
    );
  }

  return { name: file.name, text, bytes: file.size };
}

/**
 * The one and only place text is rewritten.
 *
 * CRLF becomes LF and a leading byte-order mark goes. Both are single
 * characters that shift every offset after them by one, and both arrive
 * routinely from Windows editors and from Excel's CSV export. Doing this
 * later — in the renderer, say — is how a highlight ends up one character
 * off per preceding line.
 */
function normalize(text: string): string {
  return text.replace(/^﻿/, "").replace(/\r\n?/g, "\n");
}

function extensionOf(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot === -1 ? "" : name.slice(dot + 1).toLowerCase();
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
