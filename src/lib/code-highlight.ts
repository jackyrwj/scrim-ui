/**
 * A small TSX tokenizer, for colouring the code this site shows.
 *
 * Why hand-written rather than Shiki or Prism: the code blocks here come from
 * two places — the component source, highlighted once per build on the server,
 * and the snippet the Explorer regenerates on every keystroke as the reader
 * moves a control. One tokenizer serves both, so the two look identical, and
 * neither costs the reader a download. Shiki would have meant either shipping a
 * grammar engine to the client or running two different highlighters.
 *
 * It is a lexer, not a parser: it knows strings, comments, numbers, keywords
 * and the shape of JSX, which is all TSX needs to read well. It does not know
 * types or scope, so it will not colour a type differently from a value. That
 * is the trade being made for ~1KB and no dependency.
 */

export type TokenKind =
  | "plain"
  | "comment"
  | "string"
  | "number"
  | "keyword"
  | "tag"
  | "attr"
  | "punct";

export type Token = { kind: TokenKind; text: string };

const KEYWORDS = new Set([
  "import", "from", "export", "default", "const", "let", "var", "function",
  "return", "if", "else", "for", "while", "of", "in", "new", "typeof",
  "type", "interface", "extends", "implements", "as", "async", "await",
  "class", "this", "super", "try", "catch", "finally", "throw", "switch",
  "case", "break", "continue", "do", "void", "null", "undefined", "true",
  "false", "satisfies", "readonly", "keyof",
]);

const IDENT_START = /[A-Za-z_$]/;
const IDENT_PART = /[A-Za-z0-9_$]/;
const DIGIT = /[0-9]/;

/**
 * Split source into coloured tokens.
 *
 * Adjacent tokens of the same kind are merged, which keeps the DOM small on
 * a 400-line component file — most of it is `plain`.
 */
export function tokenize(source: string): Token[] {
  const out: Token[] = [];
  let i = 0;
  /** True just after `<` or `</`, so the next identifier is a tag name. */
  let expectTag = false;
  /** True while inside a `<Tag ...>` header, so identifiers are attributes. */
  let inTagHeader = false;

  const push = (kind: TokenKind, text: string) => {
    if (!text) return;
    const last = out[out.length - 1];
    if (last && last.kind === kind) last.text += text;
    else out.push({ kind, text });
  };

  while (i < source.length) {
    const c = source[i];
    const next = source[i + 1];

    // Comments
    if (c === "/" && next === "/") {
      const end = source.indexOf("\n", i);
      const stop = end === -1 ? source.length : end;
      push("comment", source.slice(i, stop));
      i = stop;
      continue;
    }
    if (c === "/" && next === "*") {
      const end = source.indexOf("*/", i + 2);
      const stop = end === -1 ? source.length : end + 2;
      push("comment", source.slice(i, stop));
      i = stop;
      continue;
    }
    // A JSX comment is a block comment wrapped in braces; the braces are
    // punctuation and the inside is already handled by the case above.

    // Strings and template literals. Template substitutions are left inside
    // the string — colouring them properly would need real parsing, and the
    // snippets here rarely nest much.
    if (c === '"' || c === "'" || c === "`") {
      let j = i + 1;
      while (j < source.length) {
        if (source[j] === "\\") { j += 2; continue; }
        if (source[j] === c) { j += 1; break; }
        j += 1;
      }
      push("string", source.slice(i, j));
      i = j;
      continue;
    }

    // Numbers
    if (DIGIT.test(c)) {
      let j = i;
      while (j < source.length && /[0-9._a-fx]/i.test(source[j])) j += 1;
      push("number", source.slice(i, j));
      i = j;
      continue;
    }

    // Identifiers, keywords, JSX tag and attribute names
    if (IDENT_START.test(c)) {
      let j = i;
      while (j < source.length && IDENT_PART.test(source[j])) j += 1;
      const word = source.slice(i, j);
      if (expectTag) {
        push("tag", word);
        expectTag = false;
        inTagHeader = true;
      } else if (KEYWORDS.has(word)) {
        push("keyword", word);
      } else if (inTagHeader && /[=\s]/.test(source[j] ?? "")) {
        push("attr", word);
      } else {
        push("plain", word);
      }
      i = j;
      continue;
    }

    // JSX angle brackets drive the tag/attribute states above.
    if (c === "<") {
      const after = next === "/" ? source[i + 2] : next;
      if (after && /[A-Za-z]/.test(after)) {
        push("punct", next === "/" ? "</" : "<");
        i += next === "/" ? 2 : 1;
        expectTag = true;
        continue;
      }
      push("punct", c);
      i += 1;
      continue;
    }
    if (c === ">") {
      push("punct", c);
      i += 1;
      inTagHeader = false;
      continue;
    }
    if (c === "/" && next === ">") {
      push("punct", "/>");
      i += 2;
      inTagHeader = false;
      continue;
    }

    if (/[{}()[\].,;:=+\-*/%!?&|^~]/.test(c)) {
      push("punct", c);
      i += 1;
      continue;
    }

    push("plain", c);
    i += 1;
  }

  return out;
}

/** Tailwind class per token kind. Colours are defined in globals.css so the
 *  palette follows the theme rather than being frozen at one appearance. */
export const TOKEN_CLASS: Record<TokenKind, string> = {
  plain: "",
  comment: "tok-comment",
  string: "tok-string",
  number: "tok-number",
  keyword: "tok-keyword",
  tag: "tok-tag",
  attr: "tok-attr",
  punct: "tok-punct",
};
