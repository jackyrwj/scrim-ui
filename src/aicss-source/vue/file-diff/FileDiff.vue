<template>
  <div class="diff">
    <div class="diff-head">
      <span class="diff-file-wrap">
        <svg class="diff-icon" viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
          <path d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        <span class="diff-file">{{ file }}</span>
      </span>
      <span class="diff-stat">
        <span class="add">+{{ added }}</span>
        <span class="del">-{{ removed }}</span>
      </span>
    </div>
    <div class="diff-body">
      <div class="diff-lines">
        <div v-for="(r, i) in rows" :key="i" :class="['diff-row', r.type]">
          <span class="ln old">{{ r.old ?? "" }}</span>
          <span class="ln new">{{ r.cur ?? "" }}</span>
          <span class="sign">{{ r.type === "add" ? "+" : r.type === "del" ? "-" : "" }}</span>
          <code>
            <span v-for="(tok, j) in tokenize(r.text)" :key="j" :class="tok.t === 'txt' ? undefined : tok.t">{{ tok.v }}</span>
          </code>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const KEYWORDS = new Set([
  "export","function","return","const","let","var","if","else","throw","new",
  "import","from","async","await","class","extends","typeof","void","true",
  "false","null","undefined","for","while","switch","case","break","continue",
  "try","catch","finally","this","super","static","type","interface","enum","as","of","in",
]);

function tokenize(line) {
  const raw = [];
  const re = /(\s+)|(\/\/.*)|(\/\*[\s\S]*?\*\/)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|(\b\d+(?:\.\d+)?\b)|(\b[A-Za-z_$][\w$]*\b)|(\S)/g;
  let m;
  while ((m = re.exec(line))) {
    if (m[1]) raw.push({ kind: "txt", v: m[1] });
    else if (m[2] || m[3]) raw.push({ kind: "cm", v: m[0] });
    else if (m[4]) raw.push({ kind: "str", v: m[0] });
    else if (m[5]) raw.push({ kind: "num", v: m[0] });
    else if (m[6]) raw.push({ kind: "id", v: m[0] });
    else raw.push({ kind: "txt", v: m[0] });
  }
  const out = [];
  for (let i = 0; i < raw.length; i++) {
    const cur = raw[i];
    if (cur.kind !== "id") { out.push({ t: cur.kind, v: cur.v }); continue; }
    if (KEYWORDS.has(cur.v)) { out.push({ t: "kw", v: cur.v }); continue; }
    let j = i + 1;
    while (j < raw.length && raw[j].kind === "txt" && /^\s+$/.test(raw[j].v)) j++;
    const next = raw[j];
    out.push({ t: next && next.v.startsWith("(") ? "fn" : "txt", v: cur.v });
  }
  return out;
}

const ROWS = [
  { old: 12, cur: 12, type: "ctx", text: "export function getToken() {" },
  { old: 13, cur: null, type: "del", text: "  return localStorage.token;" },
  { old: null, cur: 13, type: "add", text: '  const t = cookies.get("session");' },
  { old: null, cur: 14, type: "add", text: '  if (!t) throw new Error("no session");' },
  { old: null, cur: 15, type: "add", text: "  return t;" },
  { old: 14, cur: 16, type: "ctx", text: "}" },
];

const props = defineProps({
  file: { type: String, default: "src/auth.ts" },
  rows: { type: Array, default: () => ROWS },
});
const added = computed(() => props.rows.filter((r) => r.type === "add").length);
const removed = computed(() => props.rows.filter((r) => r.type === "del").length);
</script>

<style scoped>
.diff { border-radius: 12px; background: #fff; box-shadow: 0 1px 2px rgba(0,0,0,0.05), 0 2px 4px rgba(0,0,0,0.02), 0 0 0 0.5px rgba(0,0,0,0.08); padding: 12px 16px 16px; overflow: hidden; font-family: ui-monospace, "SF Mono", Menlo, monospace; }
.diff-head {
  display: flex; align-items: center; gap: 8px;
  margin: -12px -16px 0; padding: 10px 12px 10px 12px;
  background: transparent; border-bottom: 0.5px solid #e6e8ec; font-size: 12.5px;
}
.diff-file-wrap { display: inline-flex; align-items: center; gap: 7px; }
.diff-icon { display: block; width: 15px; height: 15px; color: #a1a1a1; flex: none; }
.diff-file { color: #1a1a1a; line-height: 1; }
.diff-stat { margin-left: auto; display: inline-flex; align-items: center; gap: 8px; font-size: 12px; line-height: 1; }
.diff-stat .add { color: #15a06a; }
.diff-stat .del { color: #dc2626; }
.diff-body {
  position: relative;
  margin: 0 -16px -16px; overflow-x: auto; overflow-y: hidden;
  padding: 4px 0; font-size: 12.5px; line-height: 20px;
  scrollbar-width: none; -ms-overflow-style: none;
}
.diff-body::-webkit-scrollbar { display: none; }
.diff-lines { position: relative; width: max-content; min-width: 100%; }
/* full-height gutter divider at the line-number edge (32px + 32px).
   Lives on the inner track so it stays aligned while the body scrolls. */
.diff-lines::before { content: ""; position: absolute; top: 0; bottom: 0; left: 64px; width: 0.5px; background: #e6e8eb; z-index: 1; pointer-events: none; }
.diff-row {
  position: relative;
  display: grid; grid-template-columns: 32px 32px 18px 1fr; align-items: stretch;
}
.diff-row .ln, .diff-row .sign { user-select: none; color: #a1a1a1; font-size: 11px; }
.diff-row .ln { text-align: right; padding: 0 7px; }
.diff-row .sign { text-align: center; }
.diff-row code { white-space: pre; padding: 0 12px 0 8px; color: #a1a1a1; }
/* left accent bar: solid green for additions, red hatch for deletions */
.diff-row.add::before, .diff-row.del::before {
  content: ""; position: absolute; top: 0; bottom: 0; left: 0; width: 3px;
}
.diff-row.add::before { background: #15a06a; }
.diff-row.del::before {
  background: repeating-linear-gradient(45deg, #dc2626 0, #dc2626 1.5px, transparent 1.5px, transparent 3px);
}
.diff-row.add { background: rgba(26, 127, 55, 0.09); }
.diff-row.add .sign, .diff-row.add .new { color: #15a06a; }
.diff-row.add code { color: #1a1a1a; }
.diff-row.del { background: rgba(207, 34, 46, 0.09); }
.diff-row.del .sign, .diff-row.del .old { color: #dc2626; }
.diff-row.del code { color: #1a1a1a; }
.diff-row code .kw { color: #cf222e; }
.diff-row code .str { color: #0a3069; }
.diff-row code .fn { color: #8250df; }
.diff-row code .num { color: #0550ae; }
.diff-row code .cm { color: #6e7781; }
@media (prefers-color-scheme: dark) {
  .diff { background: #1a1a1a; box-shadow: 0 1px 2px rgba(0,0,0,0.4), 0 2px 4px rgba(0,0,0,0.3), 0 0 0 0.5px rgba(255,255,255,0.12); }
  .diff-head { border-bottom-color: #303030; }
  .diff-file { color: #f5f5f5; }
  .diff-stat .add { color: #34d399; }
  .diff-stat .del { color: #f87171; }
  .diff-lines::before { background: #303030; }
  .diff-row.add { background: rgba(63, 185, 80, 0.15); }
  .diff-row.add::before { background: #34d399; }
  .diff-row.add .sign, .diff-row.add .new { color: #34d399; }
  .diff-row.add code { color: #f5f5f5; }
  .diff-row.del { background: rgba(248, 81, 73, 0.15); }
  .diff-row.del::before { background: repeating-linear-gradient(45deg, #f87171 0, #f87171 1.5px, transparent 1.5px, transparent 3px); }
  .diff-row.del .sign, .diff-row.del .old { color: #f87171; }
  .diff-row.del code { color: #f5f5f5; }
  .diff-row code .kw { color: #ff7b72; }
  .diff-row code .str { color: #a5d6ff; }
  .diff-row code .fn { color: #d2a8ff; }
  .diff-row code .num { color: #79c0ff; }
  .diff-row code .cm { color: #8b949e; }
}
</style>