import type { ComponentPageConfig } from "@/lib/component-page";
import { DemoDefault } from "./demos";
import { streamingMarkdownControls, renderStreamingMarkdown } from "./controls";

export const streamingMarkdownPageConfig: ComponentPageConfig = {
  sourceFile: "streaming-markdown.tsx",
  heroDemo: <DemoDefault />,
  explorer: { schema: streamingMarkdownControls, render: renderStreamingMarkdown },
  usage: [
    "Pass `streaming` straight from the SDK's status — it drives correctness, not just a caret. Finished text must be parsed strictly, because an unmatched `**` in a completed message is two literal asterisks.",
    "Render this instead of swapping renderers at the end of a turn. Swapping reflows the whole message at the moment the reader is furthest down it.",
    "Keep the message container a fixed width. Speculation removes reflow from inside the text; a container that resizes with content puts it back.",
    "Use it for the assistant turn only. User messages are complete the moment they exist and have nothing to speculate about.",
  ],
  mistakes: [
    "Leaving `streaming` on after the turn ends — trailing asterisks or backticks in the final text then render as formatting the author never wrote.",
    "Re-parsing the whole message on every token. Blocks above the last boundary cannot change; parsing them once is the difference between smooth and stuttering at a few thousand tokens.",
    "Rendering an ambiguous fragment rather than holding it. A lone `#` or a pipe row with no separator yet can still become several different things, and correcting it on screen is the flicker you were trying to remove.",
    "Letting a partly-arrived table row set the column count — every subsequent cell then shifts sideways as the row fills.",
  ],
};
