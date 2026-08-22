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
  variant: "dropdown",
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
  selectedId: "sonnet",
  models: [
    {
      id: "sonnet",
      name: "Claude Sonnet 4",
      hint: "Balanced speed and reasoning",
      badge: "Default",
      dot: "#d97757",
    },
    {
      id: "opus",
      name: "Claude Opus 4",
      hint: "Deepest reasoning, slower",
      badge: "Pro",
      dot: "#7c3aed",
    },
    {
      id: "haiku",
      name: "Claude Haiku 3.5",
      hint: "Fastest, best for short tasks",
      badge: "",
      dot: "#0ea5e9",
    },
  ],
};
