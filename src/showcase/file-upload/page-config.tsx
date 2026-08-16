import type { ComponentPageConfig } from "@/lib/component-page";
import { DemoIdle, DemoUploading, DemoDone, DemoError } from "./demos";

export const fileUploadPageConfig: ComponentPageConfig = {
  sourceFile: "file-upload.tsx",
  heroDemo: <DemoIdle />,
  variants: [
    {
      id: "idle",
      title: "Idle dropzone",
      note: "A clickable dashed dropzone with drag-over feedback. Keyboard users can tab to it and activate.",
      demo: <DemoIdle />,
    },
    {
      id: "uploading",
      title: "Uploading",
      note: "Real progress with file name and size. The live demo simulates progress so you can see the motion.",
      demo: <DemoUploading />,
    },
    {
      id: "done",
      title: "Uploaded",
      note: "Confirmation that the file is ready to be used as context, with a remove control.",
      demo: <DemoDone />,
    },
    {
      id: "error",
      title: "Failed",
      note: "The file stays listed with a clear failure message and a retry — never silently dropped.",
      demo: <DemoError />,
    },
  ],
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
