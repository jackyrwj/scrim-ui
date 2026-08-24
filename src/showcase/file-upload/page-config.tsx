import type { ComponentPageConfig } from "@/lib/component-page";
import { DemoIdle } from "./demos";
import { fileUploadControls, renderFileUpload } from "./controls";

export const fileUploadPageConfig: ComponentPageConfig = {
  sourceFile: "file-upload.tsx",
  heroDemo: <DemoIdle />,
  explorer: { schema: fileUploadControls, render: renderFileUpload },
  usage: [
    "Reuse the actual selected file's name, size and type icon — never a placeholder.",
    "Show progress immediately; a file that 'hangs' after selecting erodes trust in the whole input.",
    "On error, keep the file visible with retry — a silent drop makes users redo work and blame themselves.",
    "Render the whole dropzone as a real button so keyboard and screen-reader users can activate it.",
    "Restrict by accept only as a hint — always validate types and size on the client.",
  ],
  mistakes: [
    "A dropzone that only works via drag-and-drop, excluding keyboard and touch users.",
    "Faking upload progress for local files that actually complete instantly.",
    "Hiding the file after upload without saying it will be attached to the message.",
    "No feedback on oversized or wrong-type files beyond a console error.",
  ],
};
