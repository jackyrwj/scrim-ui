import type { ComponentPageConfig } from "@/lib/component-page";
import {
  DemoDefault,
  DemoAttachments,
  DemoModelSelector,
  DemoLoading,
  DemoError,
  DemoDisabled,
} from "./demos";
import { PromptInputPlayground } from "./playground";

export const promptInputPageConfig: ComponentPageConfig = {
  sourceFile: "prompt-input.tsx",
  heroDemo: <DemoDefault />,
  playground: <PromptInputPlayground />,
  variants: [
    {
      id: "default",
      title: "Default",
      note: "Enter to send, Shift+Enter for a new line. Send button activates when input is non-empty; while generating it becomes a stop button.",
      demo: <DemoDefault />,
    },
    {
      id: "with-attachments",
      title: "With attachments",
      note: "Attachment chips with file type icons, size and one-click removal.",
      demo: <DemoAttachments />,
    },
    {
      id: "with-model-selector",
      title: "With model selector",
      note: "Inline model picker with capability hints. Closes on Escape or outside click.",
      demo: <DemoModelSelector />,
    },
    {
      id: "loading",
      title: "Loading",
      note: "While a response is generating, the send button is replaced by a stop control.",
      demo: <DemoLoading />,
    },
    {
      id: "error",
      title: "Error",
      note: "Submission failures surface below the input with a red border, without clearing the draft.",
      demo: <DemoError />,
    },
    {
      id: "disabled",
      title: "Disabled",
      note: "For logged-out or read-only states. All controls are inert and the whole input is dimmed.",
      demo: <DemoDisabled />,
    },
  ],
  usage: [
    "Send on Enter, newline on Shift+Enter — never the reverse.",
    "Keep the send button disabled (not hidden) while the input is empty so its position is stable.",
    "Swap send for a stop button while generating — one target, two states.",
    "Preserve the draft on error. Losing a long prompt is the worst possible failure.",
    "Cap the auto-grow height (~5–6 lines) so long prompts never push the conversation off screen.",
  ],
  mistakes: [
    "Hiding the model selector behind settings — model choice belongs at the point of prompting.",
    "Showing a spinner without a way to cancel a generation.",
    "Clearing attachments after send without telling the user they were included.",
    "Letting the textarea grow without bound and cover the whole viewport.",
  ],
};
