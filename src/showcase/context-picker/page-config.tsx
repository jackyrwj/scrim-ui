import type { ComponentPageConfig } from "@/lib/component-page";
import { DemoDefault } from "./demos";
import { contextPickerControls, renderContextPicker } from "./controls";

export const contextPickerPageConfig: ComponentPageConfig = {
  sourceFile: "context-picker.tsx",
  heroDemo: <DemoDefault />,
  explorer: { schema: contextPickerControls, render: renderContextPicker },
  usage: [
    "Open from a visible trigger or the @ key in the composer — the menu is the same either way.",
    "Keep context and tools apart: an item here adds data to the turn and costs tokens; it never enables an action.",
    "Show the token cost per source and for the whole selection, so adding a 200-page PDF is an informed choice.",
    "List permission-required and unavailable sources with their state instead of silently omitting them.",
    "Surface the selection where the turn is composed — chips above the input, mirrored in a Context Files panel.",
  ],
  mistakes: [
    "Mixing tool toggles into the context list — one is data for this turn, the other is an enabled capability.",
    "Auto-advancing focus or stealing keyboard control from the composer when the menu opens.",
    "Hiding a source the user attached last week with no 'unavailable' marker — it reads as data loss.",
    "Letting selection live only inside the popover — closed menu, invisible context, surprise token bill.",
  ],
};
