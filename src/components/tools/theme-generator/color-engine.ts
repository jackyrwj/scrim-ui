import type { ThemeMode, ColorScheme } from "./types";

type HSL = { h: number; s: number; l: number };

export function hexToHsl(hex: string): HSL {
  const raw = hex.replace("#", "");
  const r = parseInt(raw.slice(0, 2), 16) / 255;
  const g = parseInt(raw.slice(2, 4), 16) / 255;
  const b = parseInt(raw.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }

  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

export function hslToHex(h: number, s: number, l: number): string {
  const sn = s / 100;
  const ln = l / 100;
  const a = sn * Math.min(ln, 1 - ln);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = ln - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

function relativeLuminance(hex: string): number {
  const raw = hex.replace("#", "");
  const toLinear = (c: number) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  const r = toLinear(parseInt(raw.slice(0, 2), 16));
  const g = toLinear(parseInt(raw.slice(2, 4), 16));
  const b = toLinear(parseInt(raw.slice(4, 6), 16));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(fg: string, bg: string): number {
  const l1 = relativeLuminance(fg);
  const l2 = relativeLuminance(bg);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function ensureContrast(fg: string, bg: string, minRatio = 4.5): string {
  if (contrastRatio(fg, bg) >= minRatio) return fg;
  const fgHsl = hexToHsl(fg);
  const bgLum = relativeLuminance(bg);
  const direction = bgLum > 0.5 ? -5 : 5;
  let { h, s, l } = fgHsl;
  for (let i = 0; i < 20; i++) {
    l = clamp(l + direction, 0, 100);
    const candidate = hslToHex(h, s, l);
    if (contrastRatio(candidate, bg) >= minRatio) return candidate;
  }
  return bgLum > 0.5 ? "#000000" : "#ffffff";
}

export function deriveScheme(brandHex: string, mode: ThemeMode): ColorScheme {
  const brand = hexToHsl(brandHex);
  const { h } = brand;

  if (mode === "light") {
    const background = "#ffffff";
    const foreground = "#0f172a";
    const userBubble = hslToHex(h, clamp(brand.s, 40, 70), 92);
    const userBubbleText = ensureContrast(hslToHex(h, clamp(brand.s, 50, 80), 30), userBubble);
    const assistantBubble = "#f1f5f9";
    const assistantBubbleText = ensureContrast("#1e293b", assistantBubble);
    const streamingCursor = brandHex;
    /* Both of these are rendered as *text* in the preview and in every theme
       the tool exports, so they go through ensureContrast like the bubble text
       does. Left raw, a complementary hue at 45% lightness measured 2.77:1 on
       white for the default brand — the tool was handing people a palette that
       fails AA. */
    const thinkingIndicator = ensureContrast(hslToHex((h + 30) % 360, 55, 50), background);
    const toolCallAccent = ensureContrast(hslToHex((h + 180) % 360, 40, 45), background);
    const sourceCardBorder = hslToHex(h, clamp(brand.s, 30, 50), 78);
    const inputBackground = "#f8fafc";
    const inputBorder = "#e2e8f0";
    const mutedText = "#64748b";

    return {
      background, foreground,
      userBubble, userBubbleText,
      assistantBubble, assistantBubbleText,
      streamingCursor, thinkingIndicator,
      toolCallAccent, sourceCardBorder,
      inputBackground, inputBorder, mutedText,
    };
  }

  const background = "#0f172a";
  const foreground = "#f1f5f9";
  const userBubble = hslToHex(h, clamp(brand.s, 30, 60), 22);
  const userBubbleText = ensureContrast(hslToHex(h, clamp(brand.s, 40, 70), 85), userBubble);
  const assistantBubble = "#1e293b";
  const assistantBubbleText = ensureContrast("#e2e8f0", assistantBubble);
  const streamingCursor = hslToHex(h, clamp(brand.s, 50, 80), 65);
  const thinkingIndicator = ensureContrast(hslToHex((h + 30) % 360, 50, 60), background);
  const toolCallAccent = ensureContrast(hslToHex((h + 180) % 360, 35, 55), background);
  const sourceCardBorder = hslToHex(h, clamp(brand.s, 25, 45), 35);
  const inputBackground = "#1e293b";
  const inputBorder = "#334155";
  const mutedText = "#94a3b8";

  return {
    background, foreground,
    userBubble, userBubbleText,
    assistantBubble, assistantBubbleText,
    streamingCursor, thinkingIndicator,
    toolCallAccent, sourceCardBorder,
    inputBackground, inputBorder, mutedText,
  };
}

export function schemeToCssVars(scheme: ColorScheme): string {
  const map: Record<string, string> = {
    "--chat-bg": scheme.background,
    "--chat-fg": scheme.foreground,
    "--chat-user-bubble": scheme.userBubble,
    "--chat-user-bubble-text": scheme.userBubbleText,
    "--chat-assistant-bubble": scheme.assistantBubble,
    "--chat-assistant-bubble-text": scheme.assistantBubbleText,
    "--chat-streaming-cursor": scheme.streamingCursor,
    "--chat-thinking": scheme.thinkingIndicator,
    "--chat-tool-call": scheme.toolCallAccent,
    "--chat-source-border": scheme.sourceCardBorder,
    "--chat-input-bg": scheme.inputBackground,
    "--chat-input-border": scheme.inputBorder,
    "--chat-muted": scheme.mutedText,
  };
  return Object.entries(map).map(([k, v]) => `${k}: ${v};`).join("\n");
}

export function schemeToTailwindConfig(scheme: ColorScheme): string {
  return `// tailwind.config — theme.extend.colors.chat
chat: {
  bg: "${scheme.background}",
  fg: "${scheme.foreground}",
  "user-bubble": "${scheme.userBubble}",
  "user-bubble-text": "${scheme.userBubbleText}",
  "assistant-bubble": "${scheme.assistantBubble}",
  "assistant-bubble-text": "${scheme.assistantBubbleText}",
  "streaming-cursor": "${scheme.streamingCursor}",
  thinking: "${scheme.thinkingIndicator}",
  "tool-call": "${scheme.toolCallAccent}",
  "source-border": "${scheme.sourceCardBorder}",
  "input-bg": "${scheme.inputBackground}",
  "input-border": "${scheme.inputBorder}",
  muted: "${scheme.mutedText}",
}`;
}
