/**
 * Small defences, applied at the render boundary.
 *
 * Everything a widget displays came, ultimately, from text the model read —
 * and the model reads web pages, documents and tool results that other people
 * wrote. Schema validation proves the *shape*; these functions handle the
 * cases where the shape is right and the content is hostile.
 */

/**
 * A link, or nothing.
 *
 * `javascript:` and `data:` URLs are the classic way an "it's only a string"
 * prop becomes code execution. An allowlist of schemes is the only version of
 * this check that is safe to write — a blocklist is a list of the tricks
 * somebody has already thought of.
 *
 * No widget in this template takes a URL, which is the stronger version of
 * the same defence. This is here for the one you add.
 */
export function safeUrl(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Text, trimmed to a length the layout survives.
 *
 * The schemas cap string length already; this is the belt to that pair of
 * braces, and it is what you reach for when a widget renders something the
 * schema could not bound — a joined list, a formatted number, a label built
 * from two fields.
 */
export function clamp(value: string, max: number): string {
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
}
