/* The tool's real text statistics — shared by the editor page and the
   /tools card demo, so the numbers on the card are computed by the same
   code that computes them in the tool. */

export function countWords(text: string): number {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

export function textStats(text: string) {
  return {
    chars: text.length,
    words: countWords(text),
    tokens: estimateTokens(text),
  };
}
