import type { SwitcherSize, SwitcherTheme } from "./types";

/* ------------------------------------------------------------------ */
/* Pure style tokens. Shared by the live preview and the code export   */
/* so the exported component is pixel-identical to what you saw.       */
/* ------------------------------------------------------------------ */

export type Palette = {
  bg: string;
  fg: string;
  muted: string;
  border: string;
  hover: string;
  panel: string;
  chip: string;
  chipText: string;
  shadow: string;
};

const LIGHT: Palette = {
  bg: "#ffffff",
  fg: "#18181b",
  muted: "#71717a",
  border: "#e4e4e7",
  hover: "#f4f4f5",
  panel: "#ffffff",
  chip: "#f4f4f5",
  // zinc-600, not zinc-500: at 10px on the chip fill zinc-500 lands at
  // 4.39:1, just under the 4.5:1 WCAG AA threshold.
  chipText: "#52525b",
  shadow: "0 10px 30px -12px rgba(24,24,27,0.25)",
};

const DARK: Palette = {
  bg: "#18181b",
  fg: "#fafafa",
  muted: "#a1a1aa",
  border: "#3f3f46",
  hover: "#27272a",
  panel: "#18181b",
  chip: "#27272a",
  chipText: "#a1a1aa",
  shadow: "0 10px 30px -12px rgba(0,0,0,0.6)",
};

export function getPalette(theme: SwitcherTheme): Palette {
  return theme === "dark" ? DARK : LIGHT;
}

export type Sizing = {
  height: number;
  paddingX: number;
  font: number;
  hintFont: number;
  badgeFont: number;
  gap: number;
  dot: number;
};

const SIZES: Record<SwitcherSize, Sizing> = {
  sm: { height: 30, paddingX: 10, font: 12, hintFont: 11, badgeFont: 10, gap: 6, dot: 6 },
  md: { height: 36, paddingX: 12, font: 13, hintFont: 12, badgeFont: 10, gap: 8, dot: 7 },
  lg: { height: 44, paddingX: 16, font: 15, hintFont: 13, badgeFont: 11, gap: 10, dot: 8 },
};

export function getSizing(size: SwitcherSize): Sizing {
  return SIZES[size];
}

/** rgba() version of a #rrggbb color, used for soft accent fills. */
export function withAlpha(hex: string, alpha: number): string {
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return hex;
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** Black or white, whichever reads better on top of `hex`. */
export function readableOn(hex: string): string {
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return "#ffffff";
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;
  const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  const l = 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  return l > 0.45 ? "#18181b" : "#ffffff";
}
