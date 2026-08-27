/* ------------------------------------------------------------------ */
/* Model Switcher Builder — configuration model                        */
/* ------------------------------------------------------------------ */

export type SwitcherVariant = "dropdown" | "segmented" | "pills" | "command";
export type SwitcherSize = "sm" | "md" | "lg";
export type SwitcherTheme = "light" | "dark";

export type ModelItem = {
  id: string;
  name: string;
  hint: string;
  /** Empty string means no badge. */
  badge: string;
  /** Hex color for the leading dot. */
  dot: string;
  /**
   * Non-interactive section header above this row, e.g. a provider name.
   * Rows sharing a group sit under one label (dropdown and command variants);
   * omit for a flat list.
   */
  group?: string;
};

export type ModelSwitcherConfig = {
  variant: SwitcherVariant;
  size: SwitcherSize;
  theme: SwitcherTheme;
  accent: string;
  radius: number;
  fullWidth: boolean;
  showHints: boolean;
  showBadges: boolean;
  showDots: boolean;
  showCheck: boolean;
  /** Empty string means no prefix inside the trigger. */
  triggerPrefix: string;
  models: ModelItem[];
  selectedId: string;
};

export const VARIANT_LABELS: Record<SwitcherVariant, string> = {
  dropdown: "Dropdown",
  segmented: "Segmented",
  pills: "Pills",
  command: "Command list",
};

export const VARIANT_HINTS: Record<SwitcherVariant, string> = {
  dropdown:
    "A trigger button that opens a list. Best when models have hints or you have more than three.",
  segmented:
    "One inline control with every model visible. Best for two to four short names.",
  pills: "Loose rounded buttons. Reads as a filter row, works well above a composer.",
  command:
    "An always-open searchable list. Best inside a command palette or a settings panel.",
};

export const SIZE_LABELS: Record<SwitcherSize, string> = {
  sm: "Small",
  md: "Medium",
  lg: "Large",
};

export const defaultConfig: ModelSwitcherConfig = {
  variant: "pills",
  size: "md",
  theme: "light",
  accent: "#7c3aed",
  radius: 10,
  fullWidth: false,
  showHints: true,
  showBadges: true,
  showDots: true,
  showCheck: true,
  triggerPrefix: "",
  selectedId: "gpt56sol",
  models: [
    {
      id: "gpt56sol",
      name: "GPT-5.6 Sol",
      hint: "Flagship · most capable",
      badge: "Default",
      dot: "#10a37f",
      group: "OpenAI",
    },
    {
      id: "gpt56terra",
      name: "GPT-5.6 Terra",
      hint: "Balanced and multimodal",
      badge: "",
      dot: "#10a37f",
      group: "OpenAI",
    },
    {
      id: "fable5",
      name: "Claude Fable 5",
      hint: "Most advanced Claude model",
      badge: "Pro",
      dot: "#d97757",
      group: "Anthropic",
    },
    {
      id: "sonnet5",
      name: "Claude Sonnet 5",
      hint: "Balanced speed and quality",
      badge: "Default",
      dot: "#d97757",
      group: "Anthropic",
    },
    {
      id: "gemini31pro",
      name: "Gemini 3.1 Pro",
      hint: "Best for long context and tools",
      badge: "",
      dot: "#4285f4",
      group: "Google",
    },
  ],
};
