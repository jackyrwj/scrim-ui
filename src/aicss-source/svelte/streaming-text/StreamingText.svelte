<script>
  import { onMount } from "svelte";
  export let text = "";
  let shown = "";
  onMount(() => {
    let i = 0;
    const id = setInterval(() => {
      i += 2;
      shown = text.slice(0, i);
      if (i >= text.length) clearInterval(id);
    }, 9);
    return () => clearInterval(id);
  });
</script>

<p class="prose">{shown}<span class="caret {shown.length < text.length ? 'caret-steady' : ''}" /></p>

<style>
/* Theme follows the nearest [data-theme] ancestor, then .dark, then the OS. */
:global(:root),
:global([data-theme="light"]) {
  --st-fg: #1a1a1a;
  --st-caret: #0b0d12;
}
:global([data-theme="dark"]),
:global(.dark) {
  --st-fg: #f5f5f5;
  --st-caret: #f5f5f5;
}
@media (prefers-color-scheme: dark) {
  :global(:root:not([data-theme])) {
  --st-fg: #f5f5f5;
  --st-caret: #f5f5f5;
  }
}
.prose { max-width: 100%; font-size: 14px; line-height: 19px; color: var(--st-fg, #1a1a1a); overflow-wrap: anywhere; }
.caret { display: inline-block; width: 8px; height: 1.05em; margin-left: 2px; background: var(--st-caret, #0b0d12); vertical-align: text-bottom; animation: caret-blink 1s step-end infinite; }
/* solid while streaming, blink only once idle (matches the live component) */
.caret-steady { animation: none; opacity: 1; }
@keyframes caret-blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
@media (prefers-reduced-motion: reduce) { .caret { animation: none; } }
</style>