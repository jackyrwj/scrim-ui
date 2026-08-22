export type FrameType =
  | "iphone15pro"
  | "macbook"
  | "ipad"
  | "browser"
  | "generic-phone";

export type BackgroundStyle = {
  type: "solid" | "gradient";
  color1: string;
  color2: string;
  gradientAngle: number;
};

export type ShadowLevel = "none" | "sm" | "md" | "lg" | "xl";

export type ScreenshotConfig = {
  imageDataUrl: string | null;
  frame: FrameType;
  background: BackgroundStyle;
  shadow: ShadowLevel;
  padding: number;
  rotation: number;
};

export const defaultConfig: ScreenshotConfig = {
  imageDataUrl: null,
  frame: "browser",
  background: {
    type: "gradient",
    color1: "#6366f1",
    color2: "#a855f7",
    gradientAngle: 135,
  },
  shadow: "lg",
  padding: 48,
  rotation: 0,
};

export const FRAME_OPTIONS: { value: FrameType; label: string }[] = [
  { value: "browser", label: "Browser Window" },
  { value: "iphone15pro", label: "iPhone 15 Pro" },
  { value: "macbook", label: "MacBook Pro" },
  { value: "ipad", label: "iPad" },
  { value: "generic-phone", label: "Generic Phone" },
];

export const SHADOW_OPTIONS: { value: ShadowLevel; label: string }[] = [
  { value: "none", label: "None" },
  { value: "sm", label: "Small" },
  { value: "md", label: "Medium" },
  { value: "lg", label: "Large" },
  { value: "xl", label: "Extra Large" },
];

export const SHADOW_CSS: Record<ShadowLevel, string> = {
  none: "none",
  sm: "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.08)",
  md: "0 4px 6px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.08)",
  lg: "0 10px 25px rgba(0,0,0,0.15), 0 4px 10px rgba(0,0,0,0.1)",
  xl: "0 20px 50px rgba(0,0,0,0.2), 0 8px 20px rgba(0,0,0,0.12)",
};

export const MAX_FILE_SIZE = 10 * 1024 * 1024;
