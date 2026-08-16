import type { ComponentPageConfig } from "@/lib/component-page";
import { DemoDefault, DemoUploading, DemoError, DemoLive } from "./demos";

export const promptInputAttachmentsPageConfig: ComponentPageConfig = {
  sourceFile: "prompt-input-attachments.tsx",
  heroDemo: <DemoDefault />,
  variants: [
    {
      id: "default",
      title: "Attachments",
      note: "File chips with type icons, sizes and one-click removal — the steady state for a chat composer.",
      demo: <DemoDefault />,
    },
    {
      id: "uploading",
      title: "Uploading",
      note: "Chips show per-file progress so long uploads stay legible.",
      demo: <DemoUploading />,
    },
    {
      id: "error",
      title: "Upload error",
      note: "A failed chip is kept visible with retry — the user never loses the fact that a file exists.",
      demo: <DemoError />,
    },
    {
      id: "live",
      title: "Live sequence",
      note: "Hit the + button to watch a file upload in place, from 0% to ready.",
      demo: <DemoLive />,
    },
  ],
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
