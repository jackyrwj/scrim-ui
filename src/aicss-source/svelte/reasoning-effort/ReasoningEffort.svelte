<script>
  import { onMount, onDestroy, tick } from "svelte";

  const STOPS = ["Low", "Medium", "High", "Extra High"];
  const MODEL = "4.7";
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
  const gradId = `re-${Math.random().toString(36).slice(2, 8)}`;

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

  let rootEl;
  let trackEl;
  let labelEl;
  let display = 1;
  let open = 0;
  let dragging = false;
  let theme = "light";
  let textW = 64;
  let plateauW = plateauFor(64);
  let reveal = 0;
  let value = 1;
  let pointerDown = false;
  let openRaf = 0;
  let plateauRaf = 0;
  let revealRaf = 0;
  let themeObs;
  let media;

  $: center = centerFor(display);
  $: thumbW = REST_W + (DRAG_W - REST_W) * open;
  $: thumbH = REST_H;
  $: thumbBox = (() => {
    let left = center - thumbW / 2;
    let right = left + thumbW;
    if (left < EDGE_PAD) {
      left = EDGE_PAD;
      right = left + thumbW;
    }
    if (right > TRACK - EDGE_PAD) {
      right = TRACK - EDGE_PAD;
      left = right - thumbW;
    }
    return { left, right };
  })();
  $: active = Math.round(display);
  $: level = STOPS[active];
  $: labelKey = level;
  $: plateau = shellGeom(center, plateauW);
  $: labelX = (plateau.topL + plateau.topR) / 2 + (plateau.insetL - plateau.insetR) / 2;
  $: path = shellPath(center, open, plateauW);
  $: fillW = Math.min(TRACK, thumbBox.right + EDGE_PAD);

  function onThumb(index) {
    const x = centerFor(index);
    return x >= thumbBox.left + 0.5 && x <= thumbBox.right - 0.5;
  }

  function readTheme() {
    if (!rootEl) return;
    const marked = rootEl.parentElement?.closest("[data-theme]");
    if (marked) {
      theme = marked.getAttribute("data-theme") === "dark" ? "dark" : "light";
      return;
    }
    if (rootEl.closest(".dark")) {
      theme = "dark";
      return;
    }
    theme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  onMount(() => {
    readTheme();
    const marked = rootEl?.parentElement?.closest("[data-theme]");
    themeObs = new MutationObserver(readTheme);
    if (marked) themeObs.observe(marked, { attributes: true, attributeFilter: ["data-theme"] });
    media = window.matchMedia("(prefers-color-scheme: dark)");
    media.addEventListener("change", readTheme);
    measure();
  });
  onDestroy(() => {
    themeObs?.disconnect();
    media?.removeEventListener("change", readTheme);
    cancelAnimationFrame(openRaf);
    cancelAnimationFrame(plateauRaf);
    cancelAnimationFrame(revealRaf);
  });

  async function measure() {
    await tick();
    const w = labelEl?.getBoundingClientRect().width ?? 0;
    if (w > 0 && Math.abs(w - textW) > 0.4) textW = w;
  }
  $: labelKey, measure();

  function animateOpen(isDragging) {
    if (typeof window === "undefined") return;
    cancelAnimationFrame(openRaf);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const toOpen = isDragging ? 1 : 0;
    const fromOpen = open;
    const fromValue = display;
    const targetValue = isDragging ? fromValue : Math.round(value);
    if (reduce) {
      open = toOpen;
      if (!isDragging) {
        value = targetValue;
        display = targetValue;
      }
      return;
    }
    const start = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - start) / 220);
      const e = easeOut(t);
      open = fromOpen + (toOpen - fromOpen) * e;
      if (!isDragging) {
        display = fromValue + (targetValue - fromValue) * e;
        if (t === 1) value = targetValue;
      }
      if (t < 1) openRaf = requestAnimationFrame(step);
    };
    openRaf = requestAnimationFrame(step);
  }

  function animatePlateau(to) {
    if (typeof window === "undefined") {
      plateauW = to;
      return;
    }
    cancelAnimationFrame(plateauRaf);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const from = plateauW;
    if (reduce || Math.abs(to - from) < 0.3) {
      plateauW = to;
      return;
    }
    const start = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - start) / 90);
      plateauW = from + (to - from) * easeOut(t);
      if (t < 1) plateauRaf = requestAnimationFrame(step);
    };
    plateauRaf = requestAnimationFrame(step);
  }
  $: animatePlateau(plateauFor(textW));

  function animateReveal(isDragging) {
    if (typeof window === "undefined") return;
    cancelAnimationFrame(revealRaf);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const to = isDragging ? 1 : 0;
    const from = reveal;
    if (reduce) {
      reveal = to;
      return;
    }
    const delay = isDragging ? 85 : 0;
    const dur = isDragging ? 132 : 90;
    const start = performance.now();
    const step = (now) => {
      const elapsed = now - start - delay;
      if (elapsed < 0) {
        revealRaf = requestAnimationFrame(step);
        return;
      }
      const t = Math.min(1, elapsed / dur);
      reveal = from + (to - from) * easeOut(t);
      if (t < 1) revealRaf = requestAnimationFrame(step);
    };
    revealRaf = requestAnimationFrame(step);
  }

  function commit(next) {
    value = next;
    display = next;
  }
  function valueFrom(clientX) {
    const rect = trackEl?.getBoundingClientRect();
    if (!rect) return value;
    const t = (clientX - rect.left - RADIUS) / (rect.width - RADIUS * 2);
    return clamp(t * (STOPS.length - 1), 0, STOPS.length - 1);
  }
  function onPointerDown(event) {
    if (event.button !== 0) return;
    pointerDown = true;
    try { event.currentTarget.setPointerCapture(event.pointerId); } catch { /* untrusted */ }
    dragging = true;
    animateOpen(true);
    animateReveal(true);
    commit(valueFrom(event.clientX));
  }
  function onPointerMove(event) {
    if (!pointerDown) return;
    commit(valueFrom(event.clientX));
  }
  function onPointerUp(event) {
    if (!pointerDown) return;
    pointerDown = false;
    try {
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
    } catch { /* untrusted */ }
    dragging = false;
    animateOpen(false);
    animateReveal(false);
  }
  function onKeyDown(event) {
    const max = STOPS.length - 1;
    const current = Math.round(value);
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

<div
  bind:this={rootEl}
  class="root"
  data-theme={theme}
  data-dragging={dragging ? "true" : "false"}
>
  <svg class="shell" viewBox="0 0 {TRACK} {BUMP_H + HEIGHT}" aria-hidden="true">
    <defs>
      <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="var(--ss-shell)" />
        <stop offset="1" stop-color="var(--ss-shell-2)" />
      </linearGradient>
    </defs>
    <path
      d={path}
      fill="url(#{gradId})"
      stroke="var(--ss-line)"
      stroke-width="0.5"
      stroke-linejoin="round"
      vector-effect="non-scaling-stroke"
    />
  </svg>
  <div
    bind:this={labelEl}
    class="label"
    style:left="{labelX}px"
    style:opacity={reveal}
    style:filter={reveal > 0.98 ? undefined : `blur(${((1 - reveal) * 3).toFixed(2)}px)`}
    style:transform="translate(-50%, {3 * (1 - open)}px)"
  >
    {#key labelKey}
      <span class="swap">
        <span class="current">{MODEL}</span>
        <span class="next">{level}</span>
      </span>
    {/key}
  </div>
  <div
    bind:this={trackEl}
    class="track"
    role="slider"
    tabindex="0"
    aria-label="Reasoning effort"
    aria-valuemin="0"
    aria-valuemax={STOPS.length - 1}
    aria-valuenow={active}
    aria-valuetext="{MODEL} {level}"
    on:pointerdown={onPointerDown}
    on:pointermove={onPointerMove}
    on:pointerup={onPointerUp}
    on:pointercancel={onPointerUp}
    on:keydown={onKeyDown}
  >
    <div class="fill" style:width="{fillW}px" />
    <div
      class="thumb"
      style:left="{thumbBox.left}px"
      style:width="{thumbW}px"
      style:height="{thumbH}px"
      style:margin-top="{-thumbH / 2}px"
    />
    {#each STOPS as label, index (label)}
      <span
        class="tick"
        data-on-thumb={onThumb(index) ? "true" : "false"}
        data-active={index === active && !onThumb(index) ? "true" : "false"}
        style:left="{centerFor(index)}px"
        style:height="{tickHeights[index]}px"
      />
    {/each}
  </div>
</div>

<style>
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
