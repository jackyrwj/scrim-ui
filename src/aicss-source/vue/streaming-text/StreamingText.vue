<template>
  <p class="prose">{{ shown }}<span :class="shown.length < (text?.length ?? 0) ? 'caret caret-steady' : 'caret'" /></p>
</template>

<script setup>
import { ref, onMounted } from "vue";
const props = defineProps({ text: String });
const shown = ref("");
onMounted(() => {
  let i = 0;
  const id = setInterval(() => {
    i += 2;
    shown.value = props.text.slice(0, i);
    if (i >= props.text.length) clearInterval(id);
  }, 9);
});
</script>

<style scoped>
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