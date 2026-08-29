import type { ComponentPageConfig } from "@/lib/component-page";
import { DemoDefault } from "./demos";
import { generatedMediaControls, renderGeneratedMedia } from "./controls";

export const generatedMediaPageConfig: ComponentPageConfig = {
  sourceFile: "generated-media.tsx",
  heroDemo: <DemoDefault />,
  explorer: { schema: generatedMediaControls, render: renderGeneratedMedia },
  usage: [
    "Report progress as a stage in words — 'Upsampling' is honest, '63%' is invented.",
    "Separate safety blocks from failures: a block asks for a rephrase, a failure offers retry — never the same red box.",
    "Keep the prompt and key params on the result; a generation you can't re-use is a dead end.",
    "Hand the media in as an element with its own alt, controls or transcript — the frame carries the caption, not the semantics.",
    "Hold the body's minimum height across status flips so a queue→ready transition doesn't shove the page.",
  ],
  mistakes: [
    "A determinate progress bar fed by a timer — it sprints to 90%, stalls, and burns trust in every honest bar after it.",
    "Rendering 'blocked by content policy' as a generic error with a Retry button.",
    "Variants that replace each other with no way back — switching should be cheap and reversible.",
    "A broken-image rectangle when the media fails to load — ready-with-no-media needs its own labelled fallback.",
  ],
};
