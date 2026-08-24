import type { ComponentPageConfig } from "@/lib/component-page";
import { DemoDefault } from "./demos";
import { promptInputAttachmentsControls, renderPromptInputAttachments } from "./controls";

export const promptInputAttachmentsPageConfig: ComponentPageConfig = {
  sourceFile: "prompt-input-attachments.tsx",
  heroDemo: <DemoDefault />,
  explorer: { schema: promptInputAttachmentsControls, render: renderPromptInputAttachments },
  usage: [
    "Track upload progress per file, not per batch — large files shouldn't stall small ones.",
    "Keep failed chips visible with retry; a silent drop makes users think their file was sent.",
    "Show type, name and size on every chip so users can audit what will reach the model.",
    "Allow removing any file at any stage, including mid-upload.",
    "Confirm the model's context limit before too many files are attached.",
  ],
  mistakes: [
    "Hiding the file once upload completes — users assume it was dropped and re-upload it.",
    "A single indeterminate spinner for all files instead of per-file progress.",
    "Clearing attachments on send without showing they were included.",
    "Allowing duplicate uploads of the same file with no dedupe or warning.",
  ],
};
