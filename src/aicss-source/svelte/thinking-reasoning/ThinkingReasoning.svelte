<script>
  import { onMount, onDestroy } from "svelte";

const SENTENCES = [
  "Reading the request and the current selection, then locating the jwt.verify call inside the auth middleware.",
  "The verify call sets no algorithms allowlist, so a token signed with 'none' or a weak cipher could be accepted.",
  "Tracing where the signing secret is loaded from and confirming it is never logged or sent back to the client.",
  "Planning to pin the algorithm to HS256 and to validate the issuer and audience claims on every incoming request.",
  "Scanning the existing tests around the middleware so the fix stays covered and nothing downstream regresses.",
  "Drafting the patch with a focused regression test that rejects tampered, expired, and unsigned tokens.",
];

// Per-sentence reveal cadence (ms). Sums to ~5s of "thinking".
const DELAYS = [700, 900, 800, 850, 800, 900];
const THINK_MS = DELAYS.reduce((a, b) => a + b, 0);
const ELAPSED_S = Math.max(1, Math.round(THINK_MS / 1000));
const COLLAPSE_BEAT = 360;

// Geometry - keep in sync with the CSS below.
const SENT_H = 40; // 2 lines × 20px
const GAP = 4;
const MAX_H = 180; // viewport grows with content up to this, then scrolls
const FADE = 16; // top/bottom fade once the viewport is capped

  let phase = "thinking";
  let revealed = 0;
  let open = false;
  let fade = { top: false, bottom: true };
  let viewportEl;

  $: done = phase === "done";
  $: expanded = done ? open : true;
  $: count = done ? SENTENCES.length : revealed;
  $: contentH = count > 0 ? count * SENT_H + (count - 1) * GAP : 0;
  $: capped = contentH > MAX_H;
  $: viewH = capped ? MAX_H : contentH;
  $: scrollable = done && open;
  $: translate = scrollable ? 0 : capped ? MAX_H - FADE - contentH : 0;
  $: showTop = scrollable ? fade.top : capped;
  $: showBottom = scrollable ? fade.bottom : capped;
  $: mask = capped
    ? `linear-gradient(to bottom, transparent 0, #000 ${showTop ? FADE : 0}px, #000 calc(100% - ${showBottom ? FADE : 0}px), transparent 100%)`
    : "none";

  function onScroll() {
    if (!viewportEl) return;
    fade = {
      top: viewportEl.scrollTop > 1,
      bottom: viewportEl.scrollTop + viewportEl.clientHeight < viewportEl.scrollHeight - 1,
    };
  }

  function toggle() {
    const next = !open;
    if (next) {
      fade = { top: false, bottom: true };
      if (viewportEl) viewportEl.scrollTop = 0;
    }
    open = next;
  }

  let timers = [];

  onMount(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      revealed = SENTENCES.length;
      phase = "done";
      return;
    }
    const at = (ms, fn) => timers.push(setTimeout(fn, ms));
    let t = 0;
    DELAYS.forEach((d, i) => {
      t += d;
      at(t, () => (revealed = i + 1));
    });
    at(THINK_MS + COLLAPSE_BEAT, () => (phase = "done"));
  });

  onDestroy(() => timers.forEach(clearTimeout));
</script>

<div class="tr">
  <button
    type="button"
    class="tr-header"
    class:is-clickable={done}
    aria-expanded={expanded}
    aria-label="Toggle thought"
    on:click={() => done && toggle()}
  >
    {#if done}
      <span class="tr-label"><span class="tr-verb">Thought</span> for {ELAPSED_S}s</span>
    {:else}
      <span class="tr-label tr-shimmer">Thinking…</span>
    {/if}
    {#if done}
      <svg class="tr-chevron" viewBox="0 0 24 24" width="12" height="12" aria-hidden="true">
        <path d="m4.5 15.75 7.5-7.5 7.5 7.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    {/if}
  </button>

  <div class="tr-collapsible" class:is-collapsed={!expanded}>
    <div class="tr-inner">
      <div
        class="tr-viewport"
        class:is-scroll={scrollable}
        bind:this={viewportEl}
        style="height: {viewH}px; mask-image: {mask}; -webkit-mask-image: {mask};"
        on:scroll={onScroll}
      >
        <div class="tr-stream" style="transform: translateY({translate}px)">
          {#each SENTENCES.slice(0, count) as line, i (i)}
            <p class="tr-sentence">{line}</p>
          {/each}
        </div>
      </div>
    </div>
  </div>
</div>

<style>
.tr {
  display: flex;
  flex-direction: column;
  width: 360px;
  max-width: 100%;
  /* anchor the header: header (20) + viewport margin (6) + max viewport (180) */
  min-height: 206px;
  font-family: "Inter", system-ui, sans-serif;
  /* soft fade-in on (re)mount */
  animation: tr-block-in 320ms cubic-bezier(0.22, 1, 0.36, 1) both;
}
@keyframes tr-block-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
.tr-header {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  align-self: flex-start;
  min-height: 20px;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: default;
}
.tr-header.is-clickable { cursor: pointer; }
.tr-label {
  font-size: 13px;
  line-height: 18px;
  font-weight: 500;
  /* softer than "Thought" so "for Ns" matches the dark-mode hierarchy */
  color: var(--tre-label, color-mix(in srgb, #a1a1a1 68%, transparent));
  letter-spacing: -0.005em;
}
.tr-verb { color: var(--tre-verb, #a1a1a1); }
.tr-chevron {
  color: var(--tre-chevron, #a1a1a1);
  transition: transform 280ms cubic-bezier(0.22, 1, 0.36, 1);
  /* base path is an up caret; collapsed summary points down */
  transform: rotate(180deg);
}
.tr-header[aria-expanded="true"] .tr-chevron { transform: rotate(0deg); }
.tr-header.is-clickable:hover .tr-chevron { color: var(--tre-hover, #a1a1a1); }
.tr-collapsible {
  display: grid;
  grid-template-rows: 1fr;
  opacity: 1;
  transition: grid-template-rows 320ms cubic-bezier(0.22, 1, 0.36, 1),
    opacity 220ms ease;
}
.tr-collapsible.is-collapsed {
  grid-template-rows: 0fr;
  opacity: 0;
  pointer-events: none;
}
.tr-inner { min-height: 0; overflow: hidden; }
/* viewport: grows with the content, then caps at MAX_H. While thinking
   the stream auto-scrolls behind a soft fade; once unfolded by the user
   it becomes natively scrollable and the fades follow the scroll position. */
.tr-viewport {
  margin-top: 6px;
  overflow: hidden;
  transition: height 360ms cubic-bezier(0.22, 1, 0.36, 1);
}
.tr-viewport.is-scroll {
  overflow-y: auto;
  scrollbar-width: none;
}
.tr-viewport.is-scroll::-webkit-scrollbar { display: none; }
.tr-stream {
  display: flex;
  flex-direction: column;
  gap: 4px;
  transition: transform 560ms cubic-bezier(0.22, 1, 0.36, 1);
  will-change: transform;
}
.tr-sentence {
  margin: 0;
  height: 40px;
  line-height: 20px;
  font-size: 13px;
  font-weight: 425;
  color: var(--tre-sentence, #a1a1a1);
  letter-spacing: -0.005em;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  animation: tr-sentence-in 420ms cubic-bezier(0.22, 1, 0.36, 1) both;
}
@keyframes tr-sentence-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
/* label-shine: a soft brightness valley sweeps through the text */
.tr-shimmer {
  color: transparent;
  -webkit-text-fill-color: transparent;
  background: linear-gradient(
    90deg,
    #a1a1a1 0%, #a1a1a1 30%,
    rgba(161, 161, 161, 0.45) 45%, rgba(161, 161, 161, 0.45) 55%,
    #a1a1a1 70%, #a1a1a1 100%
  );
  background-size: 300% 100%;
  -webkit-background-clip: text;
  background-clip: text;
  animation: tr-shine 2.25s cubic-bezier(0.25, 0.1, 0.25, 1) infinite;
}
@keyframes tr-shine {
  0%, 18% { background-position: 100% 0; }
  82%, 100% { background-position: 0% 0; }
}
:global(:root),
:global([data-theme="light"]) {
  --tre-label: color-mix(in srgb, #a1a1a1 68%, transparent);
  --tre-verb: #a1a1a1;
  --tre-chevron: #a1a1a1;
  --tre-sentence: #a1a1a1;
  --tre-hover: #a1a1a1;
}
:global([data-theme="dark"]),
:global(.dark) {
  --tre-label: #737373;
  --tre-verb: #a3a3a3;
  --tre-chevron: #737373;
  --tre-sentence: #737373;
  --tre-hover: #a3a3a3;
}
@media (prefers-color-scheme: dark) {
  :global(:root:not([data-theme])) {
    --tre-label: #737373;
    --tre-verb: #a3a3a3;
    --tre-chevron: #737373;
    --tre-sentence: #737373;
    --tre-hover: #a3a3a3;
  }
}
</style>