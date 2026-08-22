export type ThemeMode = "light" | "dark";

export type ColorScheme = {
  background: string;
  foreground: string;
  userBubble: string;
  userBubbleText: string;
  assistantBubble: string;
  assistantBubbleText: string;
  streamingCursor: string;
  thinkingIndicator: string;
  toolCallAccent: string;
  sourceCardBorder: string;
  inputBackground: string;
  inputBorder: string;
  mutedText: string;
};

export type ThemeConfig = {
  brandColor: string;
  mode: ThemeMode;
};

export const defaultConfig: ThemeConfig = {
  brandColor: "#6366f1",
  mode: "light",
};

export const COLOR_LABELS: Record<keyof ColorScheme, string> = {
  background: "Background",
  foreground: "Foreground",
  userBubble: "User Bubble",
  userBubbleText: "User Bubble Text",
  assistantBubble: "Assistant Bubble",
  assistantBubbleText: "Assistant Text",
  streamingCursor: "Streaming Cursor",
  thinkingIndicator: "Thinking Indicator",
  toolCallAccent: "Tool Call Accent",
  sourceCardBorder: "Source Card Border",
  inputBackground: "Input Background",
  inputBorder: "Input Border",
  mutedText: "Muted Text",
};
