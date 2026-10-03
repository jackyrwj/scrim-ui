<script setup lang="ts">
import { computed } from "vue";

/** The stage the geometry is tuned on; --orb-k scales it to `size`. */
const STAGE = 28;

/** Default rendered size - 20×20 indicator box. */
const SIZE = 20;

type LatticeVariant = "S1" | "S2" | "S3" | "S4" | "S5";
type LensVariant = "B1" | "B2" | "B3" | "B4" | "B5";
type RingVariant = "C1" | "C2" | "C3" | "C4" | "C5";
type HelixVariant = "G1" | "G2" | "G3" | "G4" | "G5";
type MorphVariant = "M1" | "M2" | "M3" | "M4" | "M5";
type OrbVariant = LatticeVariant | LensVariant | RingVariant | HelixVariant | MorphVariant;

const LATTICE_VARIANTS: LatticeVariant[] = ["S1", "S2", "S3", "S4", "S5"];

const RING_VARIANTS: RingVariant[] = ["C1", "C2", "C3", "C4", "C5"];

const HELIX_VARIANTS: HelixVariant[] = ["G1", "G2", "G3", "G4", "G5"];

const MORPH_VARIANTS: MorphVariant[] = ["M1", "M2", "M3", "M4", "M5"];

const ORB_TASKS: Record<OrbVariant, string> = {
  S1: "Thinking",
  S2: "Processing",
  S3: "Working",
  S4: "Searching",
  S5: "Finalizing",
  B1: "Thinking",
  B2: "Searching",
  B3: "Generating",
  B4: "Solving",
  B5: "Routing",
  C1: "Loading",
  C2: "Listening",
  C3: "Streaming",
  C4: "Analyzing",
  C5: "Compiling",
  G1: "Processing",
  G2: "Sequencing",
  G3: "Uploading",
  G4: "Syncing",
  G5: "Idling",
  M1: "Shaping",
  M2: "Expanding",
  M3: "Unfolding",
  M4: "Transforming",
  M5: "Dispersing",
};

function isLattice(v: OrbVariant): v is LatticeVariant {
  return (LATTICE_VARIANTS as OrbVariant[]).includes(v);
}

function isRing(v: OrbVariant): v is RingVariant {
  return (RING_VARIANTS as OrbVariant[]).includes(v);
}

function isHelix(v: OrbVariant): v is HelixVariant {
  return (HELIX_VARIANTS as OrbVariant[]).includes(v);
}

function isMorph(v: OrbVariant): v is MorphVariant {
  return (MORPH_VARIANTS as OrbVariant[]).includes(v);
}

const N = 3; // lattice is N×N
const PITCH = 6; // centre-to-centre spacing in stage px; the dot size is CSS
const MID = (N - 1) / 2;

/** Clockwise walk of the lattice perimeter - the track `orbit` runs on. */
const RING: [number, number][] = (() => {
  const ring: [number, number][] = [];
  for (let x = 0; x < N; x++) ring.push([x, 0]);
  for (let y = 1; y < N; y++) ring.push([N - 1, y]);
  for (let x = N - 2; x >= 0; x--) ring.push([x, N - 1]);
  for (let y = N - 2; y >= 1; y--) ring.push([0, y]);
  return ring;
})();

const RING_INDEX = new Map(RING.map(([x, y], i) => [x + "," + y, i]));

/**
 * Per-cell `animation-delay` in ms. Negative values seed a cell partway
 * into its cycle, which is what turns 8 identical animations into one
 * comet travelling the ring.
 */
function cellDelay(v: LatticeVariant, x: number, y: number): number {
  const dx = x - MID;
  const dy = y - MID;
  const ring = Math.max(Math.abs(dx), Math.abs(dy));
  switch (v) {
    // Radiates from the centre on a round wavefront. Centre leads a beat
    // early so the next swell doesn't sit behind the outer fade.
    case "S1":
      return Math.hypot(dx, dy) * 700 - (dx === 0 && dy === 0 ? 180 : 0);
    // A broad band crosses the grid on the diagonal. The spread is close to
    // the wave duration, which both widens the band and makes the sweep
    // continuous - the far corner restarts as the near one does.
    case "S2":
      return ((x + y) / (2 * (N - 1))) * 1500;
    // One head with a decaying tail, running the perimeter clockwise.
    case "S3": {
      const i = RING_INDEX.get(x + "," + y);
      if (i === undefined) return 0;
      return -(((RING.length - i) % RING.length) / RING.length) * 1700;
    }
    // A soft column travels left to right.
    case "S4":
      return (x / (N - 1)) * 1100;
    // Like S3 but scrambled order - the pulse jumps pseudo-randomly.
    case "S5": {
      const i = RING_INDEX.get(x + "," + y);
      if (i === undefined) return 0;
      const scrambled = (i * 3) % RING.length;
      return -(scrambled / RING.length) * 1700;
    }
  }
}

/**
 * `settle` gathers each cell from a position rotated one way around the
 * centre and releases it to the mirror rotation, so the cycle keeps swirling
 * the same way instead of rewinding to where it came from.
 */
const SWIRL = 1.05; // radians of rotation at each end, ~60°
const SPREAD = 1.6; // outward push, on top of the rotation

/** Offset from a cell's own grid slot to its swirled position, in stage px. */
function swirl(x: number, y: number, angle: number): [number, number] {
  const dx = x - MID;
  const dy = y - MID;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return [
    ((dx * cos - dy * sin) * SPREAD - dx) * PITCH,
    ((dx * sin + dy * cos) * SPREAD - dy) * PITCH,
  ];
}

interface Cell {
  key: string;
  left: number;
  top: number;
  delay: number;
  /** Where `settle` gathers this cell from, and releases it to. */
  ax: number;
  ay: number;
  bx: number;
  by: number;
  /** Sits out the choreography (interior cells during `orbit`). */
  still: boolean;
  /** Centre cell - the static frame under reduced motion. */
  mid: boolean;
}

/** The 9 lattice cells, with position, phase and swirl vectors. */
function latticeCells(v: LatticeVariant): Cell[] {
  const cells: Cell[] = [];
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      const [ax, ay] = swirl(x, y, -SWIRL);
      const [bx, by] = swirl(x, y, SWIRL);
      cells.push({
        key: x + "," + y,
        left: x * PITCH,
        top: y * PITCH,
        delay: cellDelay(v, x, y),
        ax,
        ay,
        bx,
        by,
        still: (v === "S3" || v === "S5") && !RING_INDEX.has(x + "," + y),
        mid: x === MID && y === MID,
      });
    }
  }
  return cells;
}

const RING_N = 8;
const RING_R = 8;

interface RingDot {
  key: number;
  rx: number;
  ry: number;
  delay: number;
}

function ringDuration(v: RingVariant): number {
  switch (v) {
    case "C1": return 1600;
    case "C2": return 2000;
    case "C3": return 1800;
    case "C4": return 1600;
    case "C5": return 2200;
  }
}

function ringDelay(v: RingVariant, i: number): number {
  const dur = ringDuration(v);
  switch (v) {
    case "C1":
      return -((RING_N - 1 - i) / RING_N) * dur;
    case "C2":
    case "C3":
      return -((RING_N - 1 - i) / RING_N) * dur;
    case "C4":
      return i % 2 === 0 ? 0 : -(dur / 2);
    case "C5": {
      const scrambled = (i * 3) % RING_N;
      return -(scrambled / RING_N) * dur;
    }
    default:
      return -(i / RING_N) * dur;
  }
}

function ringDots(v: RingVariant): RingDot[] {
  const dots: RingDot[] = [];
  for (let i = 0; i < RING_N; i++) {
    const angle = (i / RING_N) * Math.PI * 2 - Math.PI / 2;
    dots.push({
      key: i,
      rx: Math.cos(angle) * RING_R,
      ry: Math.sin(angle) * RING_R,
      delay: ringDelay(v, i),
    });
  }
  return dots;
}

const GLOBE_R = 8.5;
const GLOBE_TILT = (14 * Math.PI) / 180;
const GLOBE_STEPS = 8;

const GLOBE_RINGS: { lat: number; count: number }[] = [
  { lat: 52, count: 8 },
  { lat: 26, count: 8 },
  { lat: 0, count: 8 },
  { lat: -26, count: 8 },
  { lat: -52, count: 8 },
];

interface GlobeDot {
  key: number;
  style: Record<string, string>;
  css: string;
}

function projectGlobe(x: number, y: number, z: number, spin: number) {
  const cs = Math.cos(spin);
  const ss = Math.sin(spin);
  const x1 = x * cs - z * ss;
  const z1 = x * ss + z * cs;
  const y1 = y;
  const ct = Math.cos(GLOBE_TILT);
  const st = Math.sin(GLOBE_TILT);
  return {
    x: x1,
    y: y1 * ct - z1 * st,
    z: y1 * st + z1 * ct,
  };
}

function globeOpacity(z: number) {
  const t = Math.max(0, Math.min(1, (z / GLOBE_R + 0.15) / 1.15));
  return 0.12 + 0.88 * t * t;
}

type RingMove = { ring: number; angle: number };
const RING_HALF = Math.PI;
const RING_ARC = 3;

function ringDir(ring: number) {
  return ring % 2 === 0 ? -1 : 1;
}

const G3_MOVES: RingMove[] = (() => {
  const moves: RingMove[] = [];
  for (let pass = 0; pass < 2; pass++) {
    for (let r = 0; r < GLOBE_RINGS.length; r++) {
      moves.push({ ring: r, angle: ringDir(r) * RING_HALF });
    }
  }
  return moves;
})();

const G4_MOVES: RingMove[] = [2, 1, 3, 0, 4, 2, 1, 3, 0, 4].map((ring) => ({
  ring,
  angle: ringDir(ring) * RING_HALF,
}));

function ringTurnPoses(
  x0: number,
  y0: number,
  z0: number,
  ringIndex: number,
  moves: RingMove[],
): [number, number, number][] {
  let x = x0;
  let y = y0;
  let z = z0;
  const poses: [number, number, number][] = [[x, y, z]];
  for (let m = 0; m < moves.length; m++) {
    const move = moves[m];
    const xS = x;
    const yS = y;
    const zS = z;
    for (let s = 1; s <= RING_ARC; s++) {
      if (ringIndex === move.ring) {
        const a = move.angle * (s / RING_ARC);
        const c = Math.cos(a);
        const sn = Math.sin(a);
        x = xS * c - zS * sn;
        y = yS;
        z = xS * sn + zS * c;
      }
      poses.push([x, y, z]);
    }
  }
  return poses;
}

const G5_SLOW = 0.4;
const G5_BURST = (Math.PI * 2 - G5_SLOW * 4) / 4;
const G5_POSES: { s: number; spin: number }[] = (() => {
  const poses: { s: number; spin: number }[] = [{ s: 1.0, spin: 0 }];
  let spin = 0;
  const steps: { s: number; kind: "slow" | "burst" }[] = [
    { s: 1.0, kind: "slow" },
    { s: 0.9, kind: "burst" },
    { s: 0.9, kind: "slow" },
    { s: 0.8, kind: "burst" },
    { s: 0.8, kind: "slow" },
    { s: 0.9, kind: "burst" },
    { s: 0.9, kind: "slow" },
    { s: 1.0, kind: "burst" },
  ];
  for (const step of steps) {
    spin += step.kind === "slow" ? G5_SLOW : G5_BURST;
    poses.push({ s: step.s, spin });
  }
  return poses;
})();

function globeKeyframeStyle(
  x0: number,
  y0: number,
  z0: number,
  variant: HelixVariant,
  ringIndex: number,
  j = 0,
): Record<string, string> {
  const style: Record<string, string> = {};

  if (variant === "G5") {
    for (let k = 0; k < G5_POSES.length; k++) {
      const sc = G5_POSES[k].s;
      const spin = G5_POSES[k].spin;
      const p = projectGlobe(x0 * sc, y0 * sc, z0 * sc, spin);
      style["--g" + k + "x"] = p.x.toFixed(2) + "px";
      style["--g" + k + "y"] = (-p.y).toFixed(2) + "px";
      style["--g" + k + "o"] = globeOpacity(p.z).toFixed(3);
    }
    return style;
  }

  if (variant === "G3" || variant === "G4") {
    const poses = ringTurnPoses(
      x0,
      y0,
      z0,
      ringIndex,
      variant === "G3" ? G3_MOVES : G4_MOVES,
    );
    for (let k = 0; k < poses.length; k++) {
      const pos = poses[k];
      const p = projectGlobe(pos[0], pos[1], pos[2], 0);
      style["--g" + k + "x"] = p.x.toFixed(2) + "px";
      style["--g" + k + "y"] = (-p.y).toFixed(2) + "px";
      style["--g" + k + "o"] = globeOpacity(p.z).toFixed(3);
    }
    return style;
  }

  const dir = variant === "G2" && ringIndex % 2 === 1 ? -1 : 1;

  for (let k = 0; k < GLOBE_STEPS; k++) {
    const phase = k / GLOBE_STEPS;
    const spin = dir * phase * Math.PI * 2;
    const p = projectGlobe(x0, y0, z0, spin);
    style["--g" + k + "x"] = p.x.toFixed(2) + "px";
    style["--g" + k + "y"] = (-p.y).toFixed(2) + "px";
    style["--g" + k + "o"] = globeOpacity(p.z).toFixed(3);
  }
  return style;
}

function globeDots(v: HelixVariant): GlobeDot[] {
  const dots: GlobeDot[] = [];
  let idx = 0;
  for (let ringIndex = 0; ringIndex < GLOBE_RINGS.length; ringIndex++) {
    const ring = GLOBE_RINGS[ringIndex];
    const latRad = (ring.lat * Math.PI) / 180;
    const y0 = Math.sin(latRad) * GLOBE_R;
    const ringR = Math.cos(latRad) * GLOBE_R;
    for (let j = 0; j < ring.count; j++) {
      const lon = (j / ring.count) * Math.PI * 2;
      const style = globeKeyframeStyle(
        Math.cos(lon) * ringR,
        y0,
        Math.sin(lon) * ringR,
        v,
        ringIndex,
        j,
      );
      dots.push({
        key: idx,
        style,
        css: Object.keys(style)
          .map((k) => k + ":" + style[k])
          .join(";"),
      });
      idx++;
    }
  }
  return dots;
}

const MORPH_N = 8;
const MORPH_R = 7;

type ShapeFn = (i: number) => [number, number];

const shapeCircle: ShapeFn = (i) => {
  const a = (i / MORPH_N) * Math.PI * 2 - Math.PI / 2;
  return [Math.cos(a) * MORPH_R, Math.sin(a) * MORPH_R];
};

const shapeOctagon: ShapeFn = (i) => {
  const a = (i / MORPH_N) * Math.PI * 2 - Math.PI / 2;
  const r = MORPH_R * 0.92;
  const sector = Math.round(a / (Math.PI / 4)) * (Math.PI / 4);
  return [Math.cos(sector) * r, Math.sin(sector) * r];
};

const shapeSquare: ShapeFn = (i) => {
  const h = MORPH_R * 0.85;
  const corners: [number, number][] = [[-h, -h], [h, -h], [h, h], [-h, h]];
  const t = ((i / MORPH_N) * 4 + 0.5) % 4;
  const side = Math.floor(t) % 4;
  const frac = t - Math.floor(t);
  const from = corners[side];
  const to = corners[(side + 1) % 4];
  return [from[0] + (to[0] - from[0]) * frac, from[1] + (to[1] - from[1]) * frac];
};

const shapeCircleAt =
  (turn: number): ShapeFn =>
  (i) => {
    const a = (i / MORPH_N) * Math.PI * 2 - Math.PI / 2 + turn;
    return [Math.cos(a) * MORPH_R, Math.sin(a) * MORPH_R];
  };

const SCATTER_TRAIL = 0.12;

const shapeScatterA: ShapeFn = (i) => {
  const a = (i / MORPH_N) * Math.PI * 2 - Math.PI / 2;
  return [-Math.cos(a) * MORPH_R, Math.sin(a) * MORPH_R];
};

const shapeScatterB: ShapeFn = shapeCircle;
const shapeScatterC: ShapeFn = shapeScatterA;

const shapeDiamond: ShapeFn = (i) => {
  const corners: [number, number][] = [[0, -MORPH_R], [MORPH_R, 0], [0, MORPH_R], [-MORPH_R, 0]];
  const t = (i / MORPH_N) * 4;
  const side = Math.floor(t) % 4;
  const frac = t - Math.floor(t);
  const from = corners[side];
  const to = corners[(side + 1) % 4];
  return [from[0] + (to[0] - from[0]) * frac, from[1] + (to[1] - from[1]) * frac];
};

const shapeCenter: ShapeFn = (i) => {
  const a = (i / MORPH_N) * Math.PI * 2 - Math.PI / 2;
  return [Math.cos(a) * 1.5, Math.sin(a) * 1.5];
};

function morphShapes(v: MorphVariant): [ShapeFn, ShapeFn, ShapeFn, ShapeFn] {
  switch (v) {
    case "M1": return [shapeCircle, shapeSquare, shapeDiamond, shapeSquare];
    case "M2": return [shapeCenter, shapeCircle, shapeCenter, shapeCircle];
    case "M3":
      return [
        shapeCircleAt(0),
        shapeCircleAt(Math.PI / 2),
        shapeCircleAt(Math.PI),
        shapeCircleAt(Math.PI * 1.5),
      ];
    case "M4": return [shapeCircle, shapeDiamond, shapeCircle, shapeDiamond];
    case "M5": return [shapeCircle, shapeScatterA, shapeScatterB, shapeScatterC];
  }
}

interface MorphDot {
  key: number;
  m1: string;
  m2: string;
  m3: string;
  m4: string;
  delay?: string;
  depth?: string;
}

function morphDots(v: MorphVariant): MorphDot[] {
  const [s1, s2, s3, s4] = morphShapes(v);
  const dots: MorphDot[] = [];
  for (let i = 0; i < MORPH_N; i++) {
    const [x1, y1] = s1(i);
    const [x2, y2] = s2(i);
    const [x3, y3] = s3(i);
    const [x4, y4] = s4(i);
    dots.push({
      key: i,
      m1: x1.toFixed(1) + "px, " + y1.toFixed(1) + "px",
      m2: x2.toFixed(1) + "px, " + y2.toFixed(1) + "px",
      m3: x3.toFixed(1) + "px, " + y3.toFixed(1) + "px",
      m4: x4.toFixed(1) + "px, " + y4.toFixed(1) + "px",
      delay: v === "M5" ? -i * 10 + "ms" : undefined,
      depth: v === "M5" ? Math.abs(Math.cos((i / MORPH_N) * Math.PI * 2 - Math.PI / 2)).toFixed(2) : undefined,
    });
  }
  return dots;
}

const props = withDefaults(
  defineProps<{
    variant?: OrbVariant;
    /** Rendered edge length in px. The 28px geometry scales to fit. */
    size?: number;
    /** Accessible label, and the status text when `pill` is set. */
    label?: string;
    /** Wraps the orb and its label in a status pill. */
    pill?: boolean;
  }>(),
  { variant: "S1", size: SIZE, label: undefined, pill: false },
);

const lattice = computed(() => isLattice(props.variant));
const ring = computed(() => isRing(props.variant));
const helix = computed(() => isHelix(props.variant));
const morph = computed(() => isMorph(props.variant));
const cells = computed(() =>
  isLattice(props.variant) ? latticeCells(props.variant) : [],
);
const dots = computed(() =>
  isRing(props.variant) ? ringDots(props.variant) : [],
);
const gDots = computed(() =>
  isHelix(props.variant) ? globeDots(props.variant) : [],
);
const mDots = computed(() =>
  isMorph(props.variant) ? morphDots(props.variant) : [],
);
const text = computed(() => props.label ?? ORB_TASKS[props.variant] + "…");
</script>

<template>
  <span class="root" :data-pill="pill ? '' : null">
    <!-- In pill form the visible label already carries the meaning, so the
         glyph steps out of the accessibility tree. -->
    <span
      class="glyph"
      :role="pill ? null : 'img'"
      :aria-label="pill ? null : text"
      :aria-hidden="pill ? 'true' : null"
      :style="{
        width: size + 'px',
        height: size + 'px',
        '--orb-k': size / STAGE,
      }"
    >
      <span v-if="lattice" class="lattice" :data-variant="variant">
        <span
          v-for="c in cells"
          :key="c.key"
          class="cell"
          :data-still="c.still ? '' : null"
          :data-mid="c.mid ? '' : null"
          :style="{
            left: c.left + 'px',
            top: c.top + 'px',
            animationDelay: c.delay + 'ms',
            '--orb-ax': c.ax + 'px',
            '--orb-ay': c.ay + 'px',
            '--orb-bx': c.bx + 'px',
            '--orb-by': c.by + 'px',
          }"
        />
      </span>
      <span v-else-if="ring" class="ring" :data-variant="variant">
        <span
          v-for="d in dots"
          :key="d.key"
          class="ring-dot"
          :style="{
            '--orb-rx': d.rx + 'px',
            '--orb-ry': d.ry + 'px',
            animationDelay: d.delay + 'ms',
          }"
        />
      </span>
      <span v-else-if="helix" class="helix" :data-variant="variant">
        <span
          v-for="d in gDots"
          :key="d.key"
          class="helix-dot"
          :style="d.style"
        />
      </span>
      <span v-else-if="morph" class="morph" :data-variant="variant">
        <span
          v-for="d in mDots"
          :key="d.key"
          class="morph-dot"
          :style="{
            '--m-1': d.m1,
            '--m-2': d.m2,
            '--m-3': d.m3,
            '--m-4': d.m4,
            '--m-depth': d.depth,
            'animation-delay': d.delay,
          }"
        />
      </span>
      <span v-else class="lens" :data-variant="variant">
        <span class="shape shape-a" />
        <span class="shape shape-b" />
        <span class="shape shape-c" />
        <!-- focus is the one variant that needs a fourth circle: its cast
             sits on the corners of a square, and three corners do not make
             a square. -->
        <span v-if="variant === 'B1'" class="shape shape-d" />
      </span>
    </span>
    <span v-if="pill" class="pill-label">{{ text }}</span>
  </span>
</template>

<style scoped>
/* Orbs - two families of agent activity indicator.
 *
 * The geometry is authored at a 28px stage and scaled with --orb-k, so
 * the hand-tuned dot sizes, pitch and blur radii hold at any size.
 *
 * Per-segment easings inside @keyframes are written as literals: an
 * `animation-timing-function` declaration inside a keyframe block is
 * read by the animation engine, not resolved against the element, so a
 * var() there would not resolve. The numbers mirror the three custom
 * properties below exactly. */

.root {
  --orb-ease-smooth: cubic-bezier(0.22, 1, 0.36, 1);
  --orb-ease-out: cubic-bezier(0.17, 1, 0.32, 1);
  --orb-ease-in-out: cubic-bezier(0.66, 0, 0.34, 1);

  display: inline-flex;
  align-items: center;
  vertical-align: middle;
  color: #1a1a1a;
}

/* The inline pill form - same component, wrapped. */
.root[data-pill] {
  gap: 7px;
  height: 30px;
  padding: 0 11px 0 5px;
  border-radius: 999px;
  background: #ffffff;
  /* A hairline ring rather than a border, so it can't affect layout, plus
     a tight contact shadow and a wider ambient one. */
  box-shadow:
    0 0 0 0.5px rgba(0, 0, 0, 0.08),
    0 1px 2px rgba(0, 0, 0, 0.05),
    0 2px 4px rgba(0, 0, 0, 0.02);
}

.pill-label {
  font-family: "Inter", system-ui, sans-serif;
  font-size: 11.5px;
  font-weight: 425;
  line-height: 1;
  color: #a1a1a1;
  white-space: nowrap;
}

.glyph {
  position: relative;
  display: block;
  flex: none;
  width: 20px;
  height: 20px;
  overflow: hidden;
  contain: strict;
}

@media (prefers-color-scheme: dark) {
  .root {
    color: #f5f5f5;
  }
  .root[data-pill] {
    background: #1a1a1a;
    box-shadow:
      0 0 0 0.5px rgba(255, 255, 255, 0.12),
      0 1px 2px rgba(0, 0, 0, 0.4),
      0 2px 4px rgba(0, 0, 0, 0.3);
  }
  .pill-label {
    color: #a3a3a3;
  }
}

/* --- Lattice: discrete dots on a fixed 3×3 grid ------------------- */

.lattice {
  position: absolute;
  left: 0;
  top: 0;
  width: 28px;
  height: 28px;
  transform-origin: 0 0;
  /* Three 3px dots on a 6px pitch measure 15px, so the grid is offset to sit
     centred on the 28px stage. It deliberately does not fill the stage: that
     is what keeps its visual weight level with the Lens circles. */
  transform: scale(var(--orb-k, 1)) translate(6.5px, 6.5px);
  /* Resting ink of an unlit cell - the grid stays legible between beats.
     --orb-dim is for cells sitting a choreography out entirely. */
  --orb-rest: 0.14;
  --orb-dim: 0.07;
}

@media (prefers-color-scheme: dark) {
  /* Light ink on a dark surface reads dimmer at the same alpha. */
  .lattice {
    --orb-rest: 0.2;
    --orb-dim: 0.1;
  }
}

.cell {
  position: absolute;
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: currentColor;
  opacity: var(--orb-rest);
}

/* One wave shape drives all three sweeps. What separates them is the pair of
   duration and per-cell stagger: the stagger sets how fast the wavefront
   travels, the duration how many cells it holds lit at once - which is to
   say, how wide the band reads. */
.lattice[data-variant="S1"] .cell {
  animation: orb-wave 1.7s var(--orb-ease-in-out) infinite both;
}

.lattice[data-variant="S2"] .cell {
  animation: orb-wave 1.7s var(--orb-ease-in-out) infinite both;
}

.lattice[data-variant="S4"] .cell {
  animation: orb-wave 1.6s var(--orb-ease-in-out) infinite both;
}

.lattice[data-variant="S3"] .cell {
  animation: orb-comet 1.7s var(--orb-ease-smooth) infinite both;
}

/* Interior cells sit out `orbit` and drop back, so the ring reads as a
   ring and the travelling head has something to stand out against. */
.lattice[data-variant="S3"] .cell[data-still] {
  animation: none;
  opacity: var(--orb-dim);
}

.lattice[data-variant="S5"] .cell {
  animation: orb-comet 1.7s var(--orb-ease-smooth) infinite both;
}

.lattice[data-variant="S5"] .cell[data-still] {
  animation: none;
  opacity: var(--orb-dim);
}

/* Swells and subsides on the same symmetric curve, so there is no flash and
   no hard edge - the cell rises out of its resting ink and sinks back into
   it. The long tail after 56% is the gap between beats. */
@keyframes orb-wave {
  0% {
    opacity: var(--orb-rest);
    transform: scale(1);
    animation-timing-function: cubic-bezier(0.66, 0, 0.34, 1);
  }
  28% {
    opacity: 1;
    transform: scale(1.18);
    animation-timing-function: cubic-bezier(0.66, 0, 0.34, 1);
  }
  56% {
    opacity: var(--orb-rest);
    transform: scale(1);
  }
  100% {
    opacity: var(--orb-rest);
    transform: scale(1);
  }
}

/* Starts lit and decays, so staggered ring cells form a head and tail.
   The decay spans ~3.5 of the 8 ring positions - enough to read as a comet. */
@keyframes orb-comet {
  0% {
    opacity: 1;
    transform: scale(1.2);
    /* Linear, so the cells behind the head form an even gradient instead
       of collapsing to rest within the first two. */
    animation-timing-function: linear;
  }
  45% {
    opacity: var(--orb-rest);
    transform: scale(1);
  }
  100% {
    opacity: var(--orb-rest);
    transform: scale(1);
  }
}

/* --- Lens: three circles at depth, blur reads as distance --------- */

.lens {
  position: absolute;
  left: 0;
  top: 0;
  width: 28px;
  height: 28px;
  transform-origin: 0 0;
  transform: scale(var(--orb-k, 1));
}

.shape {
  position: absolute;
  left: 50%;
  top: 50%;
  width: var(--orb-d, 7px);
  height: var(--orb-d, 7px);
  /* Pulled back by its own half-size, so --orb-d is the only knob a variant
     has to touch to resize the cast and it stays centred on the stage. */
  margin: calc(var(--orb-d, 7px) / -2) 0 0 calc(var(--orb-d, 7px) / -2);
  border-radius: 50%;
  background: currentColor;
}

/* focus - attention travels the cast: each circle pulls into focus in turn.
   Four circles on the corners of a square, one size for all of them, so the
   only thing separating them is which one is sharp.

   A second longer than the three-circle version it grew out of: the square
   has four stations to visit and each one keeps the same unhurried second.

   The delays count down rather than up because a more negative delay seeds a
   circle further into its cycle: -3s of a 4s cycle runs three quarters ahead,
   which is what sends focus round the square clockwise. */
.lens[data-variant="B1"] .shape {
  --orb-d: 6px;
  animation: orb-focus 4s var(--orb-ease-smooth) infinite both;
}

.lens[data-variant="B1"] .shape-a {
  --orb-ox: -4.5px;
  --orb-oy: -4.5px;
  animation-delay: 0s;
}

.lens[data-variant="B1"] .shape-b {
  --orb-ox: 4.5px;
  --orb-oy: -4.5px;
  animation-delay: -3s;
}

.lens[data-variant="B1"] .shape-c {
  --orb-ox: 4.5px;
  --orb-oy: 4.5px;
  animation-delay: -2s;
}

.lens[data-variant="B1"] .shape-d {
  --orb-ox: -4.5px;
  --orb-oy: 4.5px;
  animation-delay: -1s;
}

/* Opacity gradient around the square: active = 1.0, next neighbour = 0.30,
   diagonal = 0.10, far = 0.05. Two circles are always clearly visible, the
   rest are ghost hints. */
@keyframes orb-focus {
  0%,
  100% {
    opacity: 0.05;
    filter: blur(2px);
    transform: translate(var(--orb-ox), var(--orb-oy)) scale(1.12);
    animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  }
  12% {
    opacity: 1;
    filter: blur(0);
    transform: translate(var(--orb-ox), var(--orb-oy)) scale(1);
    animation-timing-function: linear;
  }
  22% {
    opacity: 1;
    filter: blur(0);
    transform: translate(var(--orb-ox), var(--orb-oy)) scale(1);
    animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  }
  /* Next neighbour - one quarter away: clearly visible */
  38% {
    opacity: 0.3;
    filter: blur(1.2px);
    transform: translate(var(--orb-ox), var(--orb-oy)) scale(1.06);
    animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  }
  /* Diagonal - half a cycle away: ghost */
  58% {
    opacity: 0.1;
    filter: blur(1.8px);
    transform: translate(var(--orb-ox), var(--orb-oy)) scale(1.1);
    animation-timing-function: linear;
  }
  /* Far neighbour - three quarters away: barely there */
  82% {
    opacity: 0.05;
    filter: blur(2px);
    transform: translate(var(--orb-ox), var(--orb-oy)) scale(1.12);
  }
}

/* drift - the cast circles the stage on one track, sharp at the front and
   blurred away at the back, so the orb reads as looking around. Uniform
   size: the depth cue is doing the work, a size ladder would fight it. */
.lens[data-variant="B2"] .shape {
  animation: orb-revolve 3.3s linear infinite both;
}

/* Evenly spaced around the track, so one is always at the front. */
.lens[data-variant="B2"] .shape-a {
  animation-delay: 0s;
}

.lens[data-variant="B2"] .shape-b {
  animation-delay: -1.1s;
}

.lens[data-variant="B2"] .shape-c {
  animation-delay: -2.2s;
}

/* rotate() then translateY() walks a circle. Linear all the way: an eased
   rotation on a circular path reads as a wobble, not as travel. */
@keyframes orb-revolve {
  0% {
    opacity: 1;
    filter: blur(0);
    transform: rotate(0deg) translateY(6.5px) scale(1);
  }
  25% {
    opacity: 0.55;
    filter: blur(1.3px);
    transform: rotate(90deg) translateY(6.5px) scale(0.82);
  }
  50% {
    opacity: 0.28;
    filter: blur(2.4px);
    transform: rotate(180deg) translateY(6.5px) scale(0.66);
  }
  75% {
    opacity: 0.55;
    filter: blur(1.3px);
    transform: rotate(270deg) translateY(6.5px) scale(0.82);
  }
  100% {
    opacity: 1;
    filter: blur(0);
    transform: rotate(360deg) translateY(6.5px) scale(1);
  }
}

/* bloom - shapes emanate from the centre, blurring out as they grow.
   Linear keeps the total ink even; on a front-loaded curve the shapes
   jump to their large, blurred end state and the orb alternates between
   a heavy blot and an empty haze. */
.lens[data-variant="B3"] .shape {
  animation: orb-bloom 4.2s linear infinite both;
}

.lens[data-variant="B3"] .shape-a {
  animation-delay: 0s;
}

.lens[data-variant="B3"] .shape-b {
  animation-delay: -1.4s;
}

.lens[data-variant="B3"] .shape-c {
  animation-delay: -2.8s;
}

/* Each ripple dies at 62% and waits out the rest, so the three overlapping
   blooms leave gaps. Without the gap the aggregate is a constant haze and
   the outward motion stops reading at all. Sharp circle appears, holds
   briefly, then dissolves outward - blur only kicks in once opacity starts
   dropping, so the circle stays crisp while it's visible and the blur reads
   as the ripple dissipating. */
@keyframes orb-bloom {
  0% {
    opacity: 0;
    filter: blur(0);
    transform: scale(0.35);
    animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
  }
  8% {
    opacity: 1;
    filter: blur(0);
    transform: scale(0.55);
    animation-timing-function: linear;
  }
  24% {
    opacity: 1;
    filter: blur(0);
    transform: scale(0.72);
    animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
  }
  42% {
    opacity: 0.1;
    filter: blur(1.8px);
    transform: scale(1.5);
  }
  62% {
    opacity: 0;
    filter: blur(2.8px);
    transform: scale(2.4);
  }
  100% {
    opacity: 0;
    filter: blur(2.8px);
    transform: scale(2.4);
  }
}

/* converge - a single circle traces an equilateral triangle (top → bottom-right
   → bottom-left → top) with handoff-style easing: full size and sharp at each
   vertex, smaller and slightly blurred in transit.  orbB breathes at the
   centroid as a subtle depth cue; orbC is hidden. */
.lens[data-variant="B4"] .shape-a {
  animation: orb-converge 3.6s linear infinite both;
}
.lens[data-variant="B4"] .shape-b {
  animation: orb-breathe 3.6s ease-in-out infinite both;
}
.lens[data-variant="B4"] .shape-c {
  display: none;
}

@keyframes orb-converge {
  0% {
    transform: translate(0px, -5px) scale(1);
    filter: blur(0);
    animation-timing-function: linear;
  }
  10% {
    transform: translate(0px, -5px) scale(1);
    filter: blur(0);
    animation-timing-function: cubic-bezier(0.55, 0, 1, 0.45);
  }
  22% {
    transform: translate(2.15px, -1.25px) scale(0.72);
    filter: blur(0.8px);
    animation-timing-function: cubic-bezier(0.33, 1, 0.68, 1);
  }
  33% {
    transform: translate(4.3px, 2.5px) scale(1);
    filter: blur(0);
    animation-timing-function: linear;
  }
  43% {
    transform: translate(4.3px, 2.5px) scale(1);
    filter: blur(0);
    animation-timing-function: cubic-bezier(0.55, 0, 1, 0.45);
  }
  55% {
    transform: translate(0px, 2.5px) scale(0.72);
    filter: blur(0.8px);
    animation-timing-function: cubic-bezier(0.33, 1, 0.68, 1);
  }
  66% {
    transform: translate(-4.3px, 2.5px) scale(1);
    filter: blur(0);
    animation-timing-function: linear;
  }
  77% {
    transform: translate(-4.3px, 2.5px) scale(1);
    filter: blur(0);
    animation-timing-function: cubic-bezier(0.55, 0, 1, 0.45);
  }
  88% {
    transform: translate(-2.15px, -1.25px) scale(0.72);
    filter: blur(0.8px);
    animation-timing-function: cubic-bezier(0.33, 1, 0.68, 1);
  }
  100% {
    transform: translate(0px, -5px) scale(1);
    filter: blur(0);
  }
}

/* handoff - the cast crosses the focal plane one after another, always left
   to right, like work being passed on. The shorthand curve is only a
   fallback; every segment below sets its own. */
.lens[data-variant="B5"] .shape {
  animation: orb-handoff 2.8s linear infinite both;
}

/* Half a cycle apart, so one is always at the focal plane while the other is
   invisible at an end and the loop point cannot be seen. */
.lens[data-variant="B5"] .shape-a {
  animation-delay: 0s;
}

.lens[data-variant="B5"] .shape-c {
  animation-delay: -1.4s;
}

/* The third holds the centre and breathes - a soft depth cue behind the
   traffic rather than another traveller. */
.lens[data-variant="B5"] .shape-b {
  animation-name: orb-breathe;
  animation-duration: 3.6s;
}

/* Enters small from the left, reaches standard size at the focal plane, then
   shrinks and fades out to the right. At the dwell (centre) the circle is
   exactly 1× - no pulsing, no bounce, just a clean handoff. */
@keyframes orb-handoff {
  0% {
    opacity: 0;
    filter: blur(2.4px);
    transform: translateX(-11px) scale(0.55);
    animation-timing-function: cubic-bezier(0.33, 1, 0.68, 1);
  }
  22% {
    opacity: 1;
    filter: blur(0);
    transform: translateX(-1px) scale(1);
    animation-timing-function: linear;
  }
  37% {
    opacity: 1;
    filter: blur(0);
    transform: translateX(0) scale(1);
    animation-timing-function: linear;
  }
  52% {
    opacity: 1;
    filter: blur(0);
    transform: translateX(1px) scale(1);
    animation-timing-function: cubic-bezier(0.33, 1, 0.68, 1);
  }
  70% {
    opacity: 0;
    filter: blur(2.4px);
    transform: translateX(11px) scale(0.55);
  }
  100% {
    opacity: 0;
    filter: blur(2.4px);
    transform: translateX(11px) scale(0.55);
  }
}

@keyframes orb-breathe {
  0%,
  100% {
    opacity: 0.16;
    filter: blur(2.4px);
    transform: scale(1.2);
  }
  50% {
    opacity: 0.32;
    filter: blur(1.6px);
    transform: scale(0.98);
  }
}

/* --- Ring: eight circles on a fixed ring ----------------------------- */

.ring {
  position: absolute;
  inset: 0;
  transform: scale(var(--orb-k, 1));
  --orb-ring-rest: 0.22;
}

@media (prefers-color-scheme: dark) {
  .ring {
    --orb-ring-rest: 0.3;
  }
}

.ring-dot {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 3px;
  height: 3px;
  margin: -1.5px 0 0 -1.5px;
  border-radius: 50%;
  background: currentColor;
  transform: translate(var(--orb-rx), var(--orb-ry));
}

.ring[data-variant="C1"] .ring-dot {
  opacity: var(--orb-ring-rest);
  animation: orb-ring-chase 1.6s linear infinite both;
}

@keyframes orb-ring-chase {
  0%, 11% {
    opacity: 1;
  }
  12.5%, 100% {
    opacity: var(--orb-ring-rest);
  }
}

.ring[data-variant="C2"] .ring-dot {
  animation: orb-ring-pulse 2s ease-in-out infinite both;
}

@keyframes orb-ring-pulse {
  0%, 100% {
    opacity: 0.18;
    transform: translate(var(--orb-rx), var(--orb-ry)) scale(0.7);
  }
  50% {
    opacity: 1;
    transform: translate(var(--orb-rx), var(--orb-ry)) scale(1.15);
  }
}

.ring[data-variant="C3"] .ring-dot {
  animation: orb-ring-comet 1.8s ease-in-out infinite both;
}

@keyframes orb-ring-comet {
  0%, 100% {
    opacity: 0.08;
    transform: translate(var(--orb-rx), var(--orb-ry));
  }
  12% {
    opacity: 1;
    transform: translate(var(--orb-rx), var(--orb-ry));
    animation-timing-function: cubic-bezier(0.33, 1, 0.68, 1);
  }
  35% {
    opacity: 0.5;
    transform: translate(var(--orb-rx), var(--orb-ry));
  }
  60% {
    opacity: 0.12;
    transform: translate(var(--orb-rx), var(--orb-ry));
  }
}

.ring[data-variant="C4"] .ring-dot {
  animation: orb-ring-stagger 1.6s ease-in-out infinite both;
}

@keyframes orb-ring-stagger {
  0%, 100% {
    opacity: 1;
    transform: translate(var(--orb-rx), var(--orb-ry));
  }
  50% {
    opacity: 0.15;
    transform: translate(var(--orb-rx), var(--orb-ry));
  }
}

.ring[data-variant="C5"] .ring-dot {
  animation: orb-ring-comet 1.8s ease-in-out infinite both;
}

/* ---- Globe (Helix family) ---- */
.helix {
  position: absolute;
  inset: 0;
  transform: scale(var(--orb-k, 1));
}

.helix-dot {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 2px;
  height: 2px;
  margin: -1px 0 0 -1px;
  border-radius: 50%;
  background: currentColor;
  will-change: transform, opacity;
}

.helix[data-variant="G1"] .helix-dot {
  animation: orb-globe-spin 4.5s linear infinite both;
}
.helix[data-variant="G2"] .helix-dot {
  animation: orb-globe-spin 3.6s linear infinite both;
}
.helix[data-variant="G3"] .helix-dot {
  animation: orb-globe-ringturn 2.8s linear infinite both;
}
.helix[data-variant="G4"] .helix-dot {
  animation: orb-globe-ringturn 2.8s linear infinite both;
}
.helix[data-variant="G5"] .helix-dot {
  animation: orb-globe-breathe 3.6s linear infinite both;
}

@keyframes orb-globe-spin {
  0%, 100% {
    transform: translate(var(--g0x), var(--g0y));
    opacity: var(--g0o);
  }
  12.5% {
    transform: translate(var(--g1x), var(--g1y));
    opacity: var(--g1o);
  }
  25% {
    transform: translate(var(--g2x), var(--g2y));
    opacity: var(--g2o);
  }
  37.5% {
    transform: translate(var(--g3x), var(--g3y));
    opacity: var(--g3o);
  }
  50% {
    transform: translate(var(--g4x), var(--g4y));
    opacity: var(--g4o);
  }
  62.5% {
    transform: translate(var(--g5x), var(--g5y));
    opacity: var(--g5o);
  }
  75% {
    transform: translate(var(--g6x), var(--g6y));
    opacity: var(--g6o);
  }
  87.5% {
    transform: translate(var(--g7x), var(--g7y));
    opacity: var(--g7o);
  }
}

@keyframes orb-globe-ringturn {
  0% { transform: translate(var(--g0x), var(--g0y)); opacity: var(--g0o); }
  2.5% { transform: translate(var(--g1x), var(--g1y)); opacity: var(--g1o); }
  5% { transform: translate(var(--g2x), var(--g2y)); opacity: var(--g2o); }
  7.5%, 10% { transform: translate(var(--g3x), var(--g3y)); opacity: var(--g3o); }
  12.5% { transform: translate(var(--g4x), var(--g4y)); opacity: var(--g4o); }
  15% { transform: translate(var(--g5x), var(--g5y)); opacity: var(--g5o); }
  17.5%, 20% { transform: translate(var(--g6x), var(--g6y)); opacity: var(--g6o); }
  22.5% { transform: translate(var(--g7x), var(--g7y)); opacity: var(--g7o); }
  25% { transform: translate(var(--g8x), var(--g8y)); opacity: var(--g8o); }
  27.5%, 30% { transform: translate(var(--g9x), var(--g9y)); opacity: var(--g9o); }
  32.5% { transform: translate(var(--g10x), var(--g10y)); opacity: var(--g10o); }
  35% { transform: translate(var(--g11x), var(--g11y)); opacity: var(--g11o); }
  37.5%, 40% { transform: translate(var(--g12x), var(--g12y)); opacity: var(--g12o); }
  42.5% { transform: translate(var(--g13x), var(--g13y)); opacity: var(--g13o); }
  45% { transform: translate(var(--g14x), var(--g14y)); opacity: var(--g14o); }
  47.5%, 50% { transform: translate(var(--g15x), var(--g15y)); opacity: var(--g15o); }
  52.5% { transform: translate(var(--g16x), var(--g16y)); opacity: var(--g16o); }
  55% { transform: translate(var(--g17x), var(--g17y)); opacity: var(--g17o); }
  57.5%, 60% { transform: translate(var(--g18x), var(--g18y)); opacity: var(--g18o); }
  62.5% { transform: translate(var(--g19x), var(--g19y)); opacity: var(--g19o); }
  65% { transform: translate(var(--g20x), var(--g20y)); opacity: var(--g20o); }
  67.5%, 70% { transform: translate(var(--g21x), var(--g21y)); opacity: var(--g21o); }
  72.5% { transform: translate(var(--g22x), var(--g22y)); opacity: var(--g22o); }
  75% { transform: translate(var(--g23x), var(--g23y)); opacity: var(--g23o); }
  77.5%, 80% { transform: translate(var(--g24x), var(--g24y)); opacity: var(--g24o); }
  82.5% { transform: translate(var(--g25x), var(--g25y)); opacity: var(--g25o); }
  85% { transform: translate(var(--g26x), var(--g26y)); opacity: var(--g26o); }
  87.5%, 90% { transform: translate(var(--g27x), var(--g27y)); opacity: var(--g27o); }
  92.5% { transform: translate(var(--g28x), var(--g28y)); opacity: var(--g28o); }
  95% { transform: translate(var(--g29x), var(--g29y)); opacity: var(--g29o); }
  97.5%, 100% { transform: translate(var(--g30x), var(--g30y)); opacity: var(--g30o); }
}

@keyframes orb-globe-breathe {
  0% {
    transform: translate(var(--g0x), var(--g0y));
    opacity: var(--g0o);
  }
  19% {
    transform: translate(var(--g1x), var(--g1y));
    opacity: var(--g1o);
  }
  25% {
    transform: translate(var(--g2x), var(--g2y));
    opacity: var(--g2o);
  }
  44% {
    transform: translate(var(--g3x), var(--g3y));
    opacity: var(--g3o);
  }
  50% {
    transform: translate(var(--g4x), var(--g4y));
    opacity: var(--g4o);
  }
  69% {
    transform: translate(var(--g5x), var(--g5y));
    opacity: var(--g5o);
  }
  75% {
    transform: translate(var(--g6x), var(--g6y));
    opacity: var(--g6o);
  }
  94% {
    transform: translate(var(--g7x), var(--g7y));
    opacity: var(--g7o);
  }
  100% {
    transform: translate(var(--g8x), var(--g8y));
    opacity: var(--g8o);
  }
}

/* ---- Morph ---- */
.morph {
  position: absolute;
  inset: 0;
  transform: scale(var(--orb-k, 1));
}

.morph-dot {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 3px;
  height: 3px;
  margin: -1.5px 0 0 -1.5px;
  border-radius: 50%;
  background: currentColor;
  animation: orb-morph 4.8s cubic-bezier(0.4, 0, 0.2, 1) infinite both;
}

@keyframes orb-morph {
  0%, 5%   { transform: translate(var(--m-1)); }
  25%, 30% { transform: translate(var(--m-2)); }
  50%, 55% { transform: translate(var(--m-3)); }
  75%, 80% { transform: translate(var(--m-4)); }
  100%     { transform: translate(var(--m-1)); }
}

.morph[data-variant="M2"] {
  animation: orb-morph-twist 9.6s linear infinite;
}

.morph[data-variant="M4"] {
  animation: orb-morph-twist 9.6s linear infinite;
}

.morph[data-variant="M5"] .morph-dot {
  animation: orb-morph-scatter 2.8s cubic-bezier(0.4, 0, 0.2, 1) infinite both;
}

@keyframes orb-morph-scatter {
  0%, 12% { transform: translate(var(--m-1)); opacity: 1; }
  38%, 62% { transform: translate(var(--m-2)); opacity: calc(1 - 0.6 * var(--m-depth, 0)); }
  88%, 100% { transform: translate(var(--m-1)); opacity: 1; }
}

@keyframes orb-morph-twist {
  from { transform: scale(var(--orb-k, 1)) rotate(0deg); }
  to   { transform: scale(var(--orb-k, 1)) rotate(360deg); }
}

@media (prefers-reduced-motion: reduce) {
  .cell,
  .shape,
  .ring-dot,
  .helix-dot,
  .morph-dot {
    animation: none !important;
  }
  .cell[data-mid] {
    opacity: 1 !important;
  }
  .shape {
    opacity: 0.3 !important;
    filter: blur(1.4px) !important;
    transform: none !important;
  }
  .shape-a {
    opacity: 1 !important;
    filter: blur(0) !important;
  }
  .ring-dot {
    opacity: 0.7 !important;
  }
  .ring,
  .helix,
  .morph {
    animation: none !important;
  }
}
</style>

<!-- Usage:
       <Orb variant="S4" />
       <Orb variant="B4" size={40} />
       <Orb variant="C3" />
       <Orb variant="B2" label="Searching the web…" pill />
-->