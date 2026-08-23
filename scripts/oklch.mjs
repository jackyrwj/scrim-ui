/* sRGB <-> OKLCH, no dependencies. Used to derive a light- and dark-mode
   legible variant of each brand color while preserving its hue and chroma. */
const f = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const g = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);

export function hexToOklch(hex) {
  const n = parseInt(hex.replace("#", ""), 16);
  const r = f(((n >> 16) & 255) / 255), gg = f(((n >> 8) & 255) / 255), b = f((n & 255) / 255);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * gg + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * gg + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * gg + 0.6299787005 * b);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  return { L, C: Math.hypot(A, B), H: ((Math.atan2(B, A) * 180) / Math.PI + 360) % 360 };
}

function oklchToRgb({ L, C, H }) {
  const a = C * Math.cos((H * Math.PI) / 180), b = C * Math.sin((H * Math.PI) / 180);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    g(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    g(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    g(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
  ];
}

const inGamut = (rgb) => rgb.every((c) => c >= -0.0001 && c <= 1.0001);

/** Clamp chroma down until the color fits sRGB, keeping L and H. */
export function oklchToHex({ L, C, H }) {
  let lo = 0, hi = C;
  if (!inGamut(oklchToRgb({ L, C, H }))) {
    for (let i = 0; i < 24; i++) {
      const mid = (lo + hi) / 2;
      if (inGamut(oklchToRgb({ L, C: mid, H }))) lo = mid; else hi = mid;
    }
  } else lo = C;
  const rgb = oklchToRgb({ L, C: lo, H }).map((c) => Math.round(Math.min(1, Math.max(0, c)) * 255));
  return "#" + rgb.map((c) => c.toString(16).padStart(2, "0")).join("");
}
