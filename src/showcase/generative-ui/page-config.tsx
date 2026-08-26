import type { ComponentPageConfig } from "@/lib/component-page";
import { DemoReady } from "./demos";
import { generativeUiControls, renderGenerativeUi } from "./controls";

export const generativeUiPageConfig: ComponentPageConfig = {
  sourceFile: "generative-ui.tsx",
  heroDemo: <DemoReady />,
  explorer: { schema: generativeUiControls, render: renderGenerativeUi },
  usage: [
    "Give every widget a skeleton in its own shape. The layout is known before the data is, so there is no excuse for the card resizing when the result lands.",
    "Always ship a text fallback. Clients run older builds than servers, and a widget the client cannot render should still leave a readable answer behind.",
    "Label the widget. Once model output looks exactly like your own UI, the attribution line is the only thing telling the user which one they are reading.",
    "Keep the raw tool result one click away. Generated cards get questioned, and 'where did 78% come from' should be answerable without opening devtools.",
    "Render widgets from tool results you trust. A component driven by model output is a component driven by whatever the tool returned.",
  ],
  mistakes: [
    "A generic spinner instead of the widget's outline — the card pops into place at a different height and the message list jumps.",
    "Treating an unknown widget type as an error. The model answered; only the renderer is missing. Show the text.",
    "Letting a generated card look identical to a card the user filled in themselves. Interactive widgets especially need to say where their numbers came from.",
    "Streaming partial data straight into the live widget. Half-arrived props render as 'undefined°' and read as a bug rather than as progress.",
    "Putting the status bar on top and the widget below it, copying the tool call layout. Here the result is the content, not the process.",
  ],
};
