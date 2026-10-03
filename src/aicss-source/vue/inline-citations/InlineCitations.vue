<template>
  <div class="cite-prose">
    <p>
      <template v-for="(p, i) in segments" :key="i">
        <span v-if="p.mark" class="cite-tip"><a class="cite-mark" :href="p.url" target="_blank" rel="noreferrer">{{ p.value }}</a><span class="cite-tip-box" role="tooltip">{{ p.label }}</span></span><span v-else>{{ p.value }}</span>
      </template>
    </p>
    <div class="cite-footer">
      <a v-for="r in refs" :key="r.n" class="cite-ref" :href="r.url" target="_blank" rel="noreferrer">
        <span class="cite-mark">{{ r.n }}</span>
        <span class="cite-ref-label">{{ r.label }}</span>
        <span class="cite-sep">·</span>
        <span class="cite-ref-host">{{ r.host }}</span>
        <span class="cite-arrow" aria-hidden="true">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18" /></svg>
        </span>
      </a>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
const props = defineProps({
  text: {
    type: String,
    default: "Transformers scale well with data and compute[1], though attention is quadratic in sequence length[2].",
  },
  refs: {
    type: Array,
    default: () => [
      { n: 1, label: "Attention Is All You Need", host: "arxiv.org", url: "https://arxiv.org/abs/1706.03762" },
      { n: 2, label: "Efficient Transformers: A Survey", host: "arxiv.org", url: "https://arxiv.org/abs/2009.06732" },
    ],
  },
});
const segments = computed(() =>
  props.text.split(/(\[\d+\])/g).map((value) => {
    const m = value.match(/^\[(\d+)\]$/);
    if (!m) return { mark: false, value };
    const r = props.refs.find((x) => x.n === Number(m[1]));
    return { mark: true, value: m[1], url: r?.url, label: r?.label };
  })
);
</script>

<style scoped>
.cite-prose { max-width: 100%; font-size: 14px; line-height: 19px; color: #1a1a1a; overflow-wrap: anywhere; }
.cite-prose p { margin: 0; }
.cite-mark { display: inline-flex; align-items: center; justify-content: center; width: 12px; height: 12px; flex: none; border-radius: 4px; background: #f4f5f7; color: #a1a1a1; font-size: 9px; font-weight: 600; line-height: 1; vertical-align: 5.5px; margin: 0 2px; }
a.cite-mark { cursor: pointer; text-decoration: none; transition: color 0.15s, background 0.15s; }
a.cite-mark:hover { color: #1a1a1a; background: #e6e8ec; }
.cite-tip { position: relative; display: inline; }
.cite-tip-box { position: absolute; left: 50%; bottom: calc(100% + 6px); transform: translateX(-50%) translateY(1px); font-size: 10px; line-height: 1; font-weight: 500; color: rgba(255, 255, 255, 0.9); background: rgba(29, 29, 29, 0.6); -webkit-backdrop-filter: blur(6px); backdrop-filter: blur(6px); padding: 4px 5px; border-radius: 6px; white-space: nowrap; pointer-events: none; opacity: 0; filter: blur(2px); transition: opacity 0.15s ease, transform 0.15s ease, filter 0.15s ease; z-index: 1000; }
.cite-tip:hover .cite-tip-box, .cite-tip:focus-within .cite-tip-box { opacity: 1; filter: blur(0); transform: translateX(-50%) translateY(0); }
.cite-footer { display: flex; flex-direction: column; gap: 6px; margin-top: 12px; padding-top: 10px; border-top: 1px solid #e6e8ec; }
.cite-ref { display: flex; align-items: center; gap: 6px; font-size: 12px; line-height: 18px; color: #a1a1a1; min-width: 0; text-decoration: none; cursor: pointer; }
.cite-ref .cite-mark { margin: 0; }
.cite-ref-label { color: #1a1a1a; font-weight: 450; flex: 0 1 auto; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.cite-sep { color: #a1a1a1; flex: none; }
.cite-ref-host { color: #a1a1a1; flex: none; white-space: nowrap; transition: color 0.16s; }
.cite-arrow { display: inline-flex; flex: none; margin-left: -2px; color: #a1a1a1; opacity: 0; transform: rotate(45deg) translate(0, 2px); transition: opacity 0.16s, transform 0.22s; pointer-events: none; }
.cite-ref:hover .cite-arrow { opacity: 1; transform: rotate(45deg) translate(0, 0); }
.cite-ref:hover .cite-ref-host { color: #1a1a1a; }
@media (prefers-color-scheme: dark) {
  .cite-prose { color: #f5f5f5; }
  .cite-mark { background: #424242; }
  a.cite-mark:hover { color: #f5f5f5; background: #525252; }
  .cite-footer { border-top-color: #303030; }
  .cite-sep { color: #737373; }
  .cite-arrow { color: #737373; }
  .cite-ref-label { color: #f5f5f5; }
  .cite-ref:hover .cite-ref-host { color: #f5f5f5; }
  .cite-tip-box { background: rgba(255, 255, 255, 0.12); }
}
:global([data-theme="dark"]) .cite-tip-box,
:global(.dark) .cite-tip-box { background: rgba(255, 255, 255, 0.12); }
</style>