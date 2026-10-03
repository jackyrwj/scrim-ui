<template>
  <div
    ref="rootRef"
    class="root"
    :data-theme="theme"
    :data-dragging="dragging ? 'true' : 'false'"
  >
    <svg class="shell" :viewBox="`0 0 ${TRACK} ${BUMP_H + HEIGHT}`" aria-hidden="true">
      <defs>
        <linearGradient :id="gradId" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="var(--ss-shell)" />
          <stop offset="1" stop-color="var(--ss-shell-2)" />
        </linearGradient>
      </defs>
      <path
        :d="view.path"
        :fill="`url(#${gradId})`"
        stroke="var(--ss-line)"
        stroke-width="0.5"
        stroke-linejoin="round"
        vector-effect="non-scaling-stroke"
      />
    </svg>
    <div ref="labelRef" class="label" :style="view.labelStyle">
      <span :key="view.labelKey" class="swap">
        <span class="current">4.7</span>
        <span class="next">{{ view.level }}</span>
      </span>
    </div>
    <div
      ref="trackRef"
      class="track"
      role="slider"
      tabindex="0"
      aria-label="Reasoning effort"
      aria-valuemin="0"
      :aria-valuemax="STOPS.length - 1"
      :aria-valuenow="view.active"
      :aria-valuetext="`4.7 ${view.level}`"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
      @keydown="onKeyDown"
    >
      <div class="fill" :style="{ width: view.fillW + 'px' }" />
      <div class="thumb" :style="view.thumbStyle" />
      <span
        v-for="(label, index) in STOPS"
        :key="label"
        class="tick"
        :data-on-thumb="onThumb(index) ? 'true' : 'false'"
        :data-active="index === view.active && !onThumb(index) ? 'true' : 'false'"
        :style="{ left: centerFor(index) + 'px', height: tickHeights[index] + 'px' }"
      />
    </div>
  </div>
</template>

<script>
let gradSeq = 0;
</script>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";

const STOPS = ["Low", "Medium", "High", "Extra High"];
const TRACK = 224;
const HEIGHT = 32;
const RADIUS = HEIGHT / 2;
const BUMP_H = 20;
const REST_W = 27.2;
const DRAG_W = 33.6;
const REST_H = 27.2;
const EDGE_PAD = (HEIGHT - REST_H) / 2;
const LEFT_SHOULDER = 23.572;
const TEXT_SIDE = 20;
const PHI_MAX = 0.6;
const PHI_REACH = 36;
const tickHeights = [4.8, 6.4, 8, 9.6];
const gradId = `re-${++gradSeq}`;

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}
function centerFor(value) {
  return RADIUS + (value / (STOPS.length - 1)) * (TRACK - RADIUS * 2);
}
function easeOut(t) {
  return 1 - (1 - t) ** 3;
}
function plateauFor(width) {
  return Math.max(8, width + TEXT_SIDE * 2 - LEFT_SHOULDER * 2);
}
function smoothstep(t) {
  const x = clamp(t, 0, 1);
  return x * x * (3 - 2 * x);
}
function capFoot(side, phi) {
  const crown = side === -1 ? RADIUS : TRACK - RADIUS;
  return {
    x: crown + side * RADIUS * Math.sin(phi),
    y: BUMP_H + RADIUS * (1 - Math.cos(phi)),
  };
}
function shellGeom(cx, plateau) {
  const crownL = RADIUS;
  const crownR = TRACK - RADIUS;
  let topL = cx - plateau / 2;
  let topR = topL + plateau;
  let phiL = 0;
  let phiR = 0;
  const overflowL = crownL - (topL - LEFT_SHOULDER);
  if (overflowL > 0) {
    phiL = PHI_MAX * smoothstep(overflowL / PHI_REACH);
    const foot = capFoot(-1, phiL);
    const minTopL = foot.x + LEFT_SHOULDER * Math.cos(phiL);
    if (topL < minTopL) {
      topR += minTopL - topL;
      topL = minTopL;
    }
  }
  const overflowR = topR + LEFT_SHOULDER - crownR;
  if (overflowR > 0) {
    phiR = PHI_MAX * smoothstep(overflowR / PHI_REACH);
    const foot = capFoot(1, phiR);
    const maxTopR = foot.x - LEFT_SHOULDER * Math.cos(phiR);
    if (topR > maxTopR) {
      topL -= topR - maxTopR;
      topR = maxTopR;
    }
  }
  const insetL = phiL > 0 ? LEFT_SHOULDER * (1 - Math.cos(phiL)) : 0;
  const insetR = phiR > 0 ? LEFT_SHOULDER * (1 - Math.cos(phiR)) : 0;
  topR += insetL;
  topL -= insetR;
  return { topL, topR, phiL, phiR, insetL, insetR };
}
function shoulderCmds(footX, footY, platX, platY, phi, dir) {
  const xScale = Math.abs(platX - footX) / LEFT_SHOULDER;
  const yScale = Math.max(0.001, (footY - platY) / 20);
  const tangent = { x: dir * Math.cos(phi), y: -Math.sin(phi) };
  const map = (lx, ly) => ({
    x: footX + dir * lx * xScale,
    y: footY + (ly - 20) * yScale,
  });
  const h1 = 5.398 * xScale;
  const p0 = { x: footX, y: footY };
  const c1 = { x: footX + tangent.x * h1, y: footY + tangent.y * h1 };
  const c2 = map(10.012, 16.114);
  const p1 = map(10.93, 10.794);
  const c3 = map(11.916, 4.577);
  const c4 = map(17.277, 0);
  const p3 = { x: platX, y: platY };
  const fmt = (p) => `${p.x.toFixed(2)} ${p.y.toFixed(2)}`;
  if (dir === 1) return `C${fmt(c1)} ${fmt(c2)} ${fmt(p1)}C${fmt(c3)} ${fmt(c4)} ${fmt(p3)}`;
  return `C${fmt(c4)} ${fmt(c3)} ${fmt(p1)}C${fmt(c2)} ${fmt(c1)} ${fmt(p0)}`;
}
function shellPath(cx, openAmount, plateau) {
  const trackTop = BUMP_H;
  const trackBot = BUMP_H + HEIGHT;
  const crownL = RADIUS;
  const crownR = TRACK - RADIUS;
  if (openAmount < 0.012) {
    return `M${crownL} ${trackTop}H${crownR}A${RADIUS} ${RADIUS} 0 0 1 ${crownR} ${trackBot}H${crownL}A${RADIUS} ${RADIUS} 0 0 1 ${crownL} ${trackTop}Z`;
  }
  const bumpTop = BUMP_H * (1 - openAmount);
  const { topL, topR, phiL, phiR } = shellGeom(cx, plateau);
  const cmds = [`M${crownL} ${trackBot}`];
  if (phiL > 0.001) {
    const foot = capFoot(-1, phiL);
    cmds.push(`A${RADIUS} ${RADIUS} 0 0 1 ${foot.x.toFixed(2)} ${foot.y.toFixed(2)}`);
    cmds.push(shoulderCmds(foot.x, foot.y, topL, bumpTop, phiL, 1));
  } else {
    cmds.push(`A${RADIUS} ${RADIUS} 0 0 1 ${crownL} ${trackTop}`);
    const footL = topL - LEFT_SHOULDER;
    if (footL > crownL + 0.4) cmds.push(`H${footL.toFixed(2)}`);
    cmds.push(shoulderCmds(footL, trackTop, topL, bumpTop, 0, 1));
  }
  if (topR > topL + 0.4) cmds.push(`H${topR.toFixed(2)}`);
  if (phiR > 0.001) {
    const foot = capFoot(1, phiR);
    cmds.push(shoulderCmds(foot.x, foot.y, topR, bumpTop, phiR, -1));
    cmds.push(`A${RADIUS} ${RADIUS} 0 0 1 ${crownR} ${trackBot}`);
  } else {
    const footR = topR + LEFT_SHOULDER;
    cmds.push(shoulderCmds(footR, trackTop, topR, bumpTop, 0, -1));
    if (footR < crownR - 0.4) cmds.push(`H${crownR}`);
    cmds.push(`A${RADIUS} ${RADIUS} 0 0 1 ${crownR} ${trackBot}`);
  }
  cmds.push(`H${crownL}Z`);
  return cmds.join("");
}

const rootRef = ref(null);
const trackRef = ref(null);
const labelRef = ref(null);
const display = ref(1);
const open = ref(0);
const dragging = ref(false);
const theme = ref("light");
const textW = ref(64);
const plateauW = ref(plateauFor(64));
const reveal = ref(0);
const valueRef = { current: 1 };
const displayRef = { current: 1 };
const openRef = { current: 0 };
const draggingRef = { current: false };
const plateauRef = { current: plateauFor(64) };
const revealRef = { current: 0 };

const view = computed(() => {
  const center = centerFor(display.value);
  const thumbW = REST_W + (DRAG_W - REST_W) * open.value;
  const thumbH = REST_H;
  let thumbLeft = center - thumbW / 2;
  let thumbRight = thumbLeft + thumbW;
  if (thumbLeft < EDGE_PAD) {
    thumbLeft = EDGE_PAD;
    thumbRight = thumbLeft + thumbW;
  }
  if (thumbRight > TRACK - EDGE_PAD) {
    thumbRight = TRACK - EDGE_PAD;
    thumbLeft = thumbRight - thumbW;
  }
  const active = Math.round(display.value);
  const level = STOPS[active];
  const plateau = shellGeom(center, plateauW.value);
  const labelX = (plateau.topL + plateau.topR) / 2 + (plateau.insetL - plateau.insetR) / 2;
  return {
    path: shellPath(center, open.value, plateauW.value),
    fillW: Math.min(TRACK, thumbRight + EDGE_PAD),
    thumbLeft,
    thumbRight,
    thumbW,
    thumbH,
    active,
    level,
    labelKey: level,
    labelStyle: {
      left: `${labelX}px`,
      opacity: reveal.value,
      filter: reveal.value > 0.98 ? undefined : `blur(${((1 - reveal.value) * 3).toFixed(2)}px)`,
      transform: `translate(-50%, ${3 * (1 - open.value)}px)`,
    },
    thumbStyle: {
      left: `${thumbLeft}px`,
      width: `${thumbW}px`,
      height: `${thumbH}px`,
      marginTop: `${-thumbH / 2}px`,
    },
  };
});

function onThumb(index) {
  const x = centerFor(index);
  return x >= view.value.thumbLeft + 0.5 && x <= view.value.thumbRight - 0.5;
}

function readTheme() {
  const el = rootRef.value;
  if (!el) return;
  const marked = el.parentElement?.closest("[data-theme]");
  if (marked) {
    theme.value = marked.getAttribute("data-theme") === "dark" ? "dark" : "light";
    return;
  }
  if (el.closest(".dark")) {
    theme.value = "dark";
    return;
  }
  theme.value = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

let themeObs = null;
let media = null;
onMounted(() => {
  readTheme();
  const marked = rootRef.value?.parentElement?.closest("[data-theme]");
  themeObs = new MutationObserver(readTheme);
  if (marked) themeObs.observe(marked, { attributes: true, attributeFilter: ["data-theme"] });
  media = window.matchMedia("(prefers-color-scheme: dark)");
  media.addEventListener("change", readTheme);
});
onUnmounted(() => {
  themeObs?.disconnect();
  media?.removeEventListener("change", readTheme);
});

watch(dragging, (isDragging, _, onCleanup) => {
  if (typeof window === "undefined") return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const toOpen = isDragging ? 1 : 0;
  const fromOpen = openRef.current;
  const fromValue = displayRef.current;
  const targetValue = isDragging ? fromValue : Math.round(valueRef.current);
  if (reduce) {
    openRef.current = toOpen;
    open.value = toOpen;
    if (!isDragging) {
      valueRef.current = targetValue;
      displayRef.current = targetValue;
      display.value = targetValue;
    }
    return;
  }
  const start = performance.now();
  let raf = 0;
  const step = (now) => {
    const t = Math.min(1, (now - start) / 220);
    const e = easeOut(t);
    openRef.current = fromOpen + (toOpen - fromOpen) * e;
    open.value = openRef.current;
    if (!isDragging) {
      displayRef.current = fromValue + (targetValue - fromValue) * e;
      display.value = displayRef.current;
      if (t === 1) {
        valueRef.current = targetValue;
        displayRef.current = targetValue;
      }
    }
    if (t < 1) raf = requestAnimationFrame(step);
  };
  raf = requestAnimationFrame(step);
  onCleanup(() => cancelAnimationFrame(raf));
}, { immediate: true });

watch(() => plateauFor(textW.value), (to, _, onCleanup) => {
  if (typeof window === "undefined") return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const from = plateauRef.current;
  if (reduce || Math.abs(to - from) < 0.3) {
    plateauRef.current = to;
    plateauW.value = to;
    return;
  }
  const start = performance.now();
  let raf = 0;
  const step = (now) => {
    const t = Math.min(1, (now - start) / 90);
    plateauRef.current = from + (to - from) * easeOut(t);
    plateauW.value = plateauRef.current;
    if (t < 1) raf = requestAnimationFrame(step);
  };
  raf = requestAnimationFrame(step);
  onCleanup(() => cancelAnimationFrame(raf));
}, { immediate: true });

watch(dragging, (isDragging, _, onCleanup) => {
  if (typeof window === "undefined") return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const to = isDragging ? 1 : 0;
  const from = revealRef.current;
  if (reduce) {
    revealRef.current = to;
    reveal.value = to;
    return;
  }
  const delay = isDragging ? 85 : 0;
  const dur = isDragging ? 132 : 90;
  const start = performance.now();
  let raf = 0;
  const step = (now) => {
    const elapsed = now - start - delay;
    if (elapsed < 0) {
      raf = requestAnimationFrame(step);
      return;
    }
    const t = Math.min(1, elapsed / dur);
    revealRef.current = from + (to - from) * easeOut(t);
    reveal.value = revealRef.current;
    if (t < 1) raf = requestAnimationFrame(step);
  };
  raf = requestAnimationFrame(step);
  onCleanup(() => cancelAnimationFrame(raf));
}, { immediate: true });

watch(() => view.value.labelKey, async () => {
  await nextTick();
  const w = labelRef.value?.getBoundingClientRect().width ?? 0;
  if (w > 0 && Math.abs(w - textW.value) > 0.4) textW.value = w;
}, { flush: "post", immediate: true });

function commit(next) {
  valueRef.current = next;
  displayRef.current = next;
  display.value = next;
}
function valueFrom(clientX) {
  const rect = trackRef.value?.getBoundingClientRect();
  if (!rect) return valueRef.current;
  const t = (clientX - rect.left - RADIUS) / (rect.width - RADIUS * 2);
  return clamp(t * (STOPS.length - 1), 0, STOPS.length - 1);
}
function onPointerDown(event) {
  if (event.button !== 0) return;
  draggingRef.current = true;
  try { event.currentTarget.setPointerCapture(event.pointerId); } catch { /* untrusted */ }
  dragging.value = true;
  commit(valueFrom(event.clientX));
}
function onPointerMove(event) {
  if (!draggingRef.current) return;
  commit(valueFrom(event.clientX));
}
function onPointerUp(event) {
  if (!draggingRef.current) return;
  draggingRef.current = false;
  try {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  } catch { /* untrusted */ }
  dragging.value = false;
}
function onKeyDown(event) {
  const max = STOPS.length - 1;
  const current = Math.round(valueRef.current);
  let next = current;
  if (event.key === "ArrowRight" || event.key === "ArrowUp") next = Math.min(max, current + 1);
  else if (event.key === "ArrowLeft" || event.key === "ArrowDown") next = Math.max(0, current - 1);
  else if (event.key === "Home") next = 0;
  else if (event.key === "End") next = max;
  else return;
  event.preventDefault();
  commit(next);
}
</script>

<style scoped>
.root {
  --ss-shell: rgba(230, 230, 232, 0.504);
  --ss-shell-2: rgba(232, 232, 233, 0.357);
  --ss-line: rgba(0, 0, 0, 0.084);
  --ss-label: #1d1d1d;
  --ss-label-dim: rgba(29, 29, 29, 0.4);
  --ss-tick: rgba(0, 0, 0, 0.176);
  --ss-thumb-shadow: 0 1px 1px rgba(0, 0, 0, 0.1);
  position: relative;
  width: 224px;
  height: 52px;
  user-select: none;
  touch-action: none;
  font-family: inherit;
}
.root[data-theme="dark"] {
  --ss-shell: rgba(255, 255, 255, 0.07);
  --ss-shell-2: rgba(255, 255, 255, 0.1);
  --ss-line: rgba(255, 255, 255, 0.08);
  --ss-label: #ffffff;
  --ss-label-dim: rgba(255, 255, 255, 0.4);
  --ss-tick: rgba(255, 255, 255, 0.256);
  --ss-thumb-shadow: 0 1px 1px rgba(0, 0, 0, 0.18);
}
.shell { position: absolute; inset: 0; display: block; width: 100%; height: 100%; overflow: visible; pointer-events: none; }
.label {
  position: absolute; top: 2.5px; z-index: 2; font-size: 10.5px; font-weight: 500;
  line-height: 14px; letter-spacing: -0.01em; white-space: nowrap; pointer-events: none;
}
.swap { display: flex; gap: 3px; animation: ss-blur-in 180ms ease-out; }
@keyframes ss-blur-in { from { filter: blur(2.5px); opacity: 0.35; } to { filter: blur(0); opacity: 1; } }
@media (prefers-reduced-motion: reduce) { .swap { animation: none; } }
.current { color: var(--ss-label); }
.next { color: var(--ss-label-dim); }
.track { position: absolute; right: 0; bottom: 0; left: 0; height: 32px; border-radius: 16px; cursor: grab; }
.root[data-dragging="true"] .track { cursor: grabbing; }
.fill {
  position: absolute; top: 0; bottom: 0; left: 0; border-radius: 16px;
  background: linear-gradient(90deg, #006aff, #0059d4);
  box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.16); pointer-events: none;
}
.thumb {
  position: absolute; top: 50%; z-index: 2; border-radius: 999px;
  background: linear-gradient(180deg, #ffffff, #f5f5f5);
  box-shadow: var(--ss-thumb-shadow); pointer-events: none;
}
.tick {
  position: absolute; top: 50%; z-index: 3; width: 1.5px; margin-left: -0.75px;
  border-radius: 1px; background: var(--ss-tick); transform: translateY(-50%); pointer-events: none;
}
.tick[data-active="true"] { background: #66a6ff; }
.tick[data-on-thumb="true"] { background: rgba(0, 0, 0, 0.45); }
.track:focus-visible { outline: 2px solid #006aff; outline-offset: 3px; }
</style>
