/**
 * Copy text, falling back to a throwaway textarea.
 *
 * `navigator.clipboard.writeText` rejects on an insecure origin, when the
 * permission is denied, and in some embedded webviews. The old
 * `document.execCommand("copy")` path needs none of that, so it covers the
 * cases the modern API refuses.
 */
export async function copyText(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
    return;
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    // Keep it out of view and off the tab order, but still selectable.
    ta.setAttribute("readonly", "");
    ta.style.cssText = "position:fixed;top:-9999px;opacity:0";
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
  }
}
