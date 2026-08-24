"use client";

import { FileUpload, type FileUploadStatus } from "./file-upload";
import type { ComponentControls, ControlValues } from "@/lib/component-controls";

export const fileUploadControls: ComponentControls = {
  tag: "FileUpload",
  importFrom: "./file-upload",
  controls: [
    {
      kind: "enum",
      name: "status",
      label: "Status",
      value: "idle",
      options: [
        { value: "idle", label: "Idle dropzone" },
        { value: "uploading", label: "Uploading" },
        { value: "done", label: "Uploaded" },
        { value: "error", label: "Failed" },
      ],
    },
    { kind: "text", name: "fileName", label: "File name", value: "design-tokens.json" },
    { kind: "text", name: "fileSize", label: "File size", value: "48 KB" },
    { kind: "number", name: "progress", label: "Progress", value: 64, min: 0, max: 100 },
    { kind: "text", name: "accept", label: "Accept", value: ".json,.md,.txt,.png" },
  ],
  handlers: ["onSelect", "onRetry", "onRemove"],
  presets: [
    {
      id: "idle",
      title: "Idle",
      note: "A clickable dashed dropzone with drag-over feedback; keyboard users can tab to it.",
      values: { status: "idle", progress: 0 },
    },
    {
      id: "uploading",
      title: "Uploading",
      note: "Real progress with file name and size, so a slow upload never looks stuck.",
      values: { status: "uploading", progress: 64 },
    },
    {
      id: "done",
      title: "Uploaded",
      note: "Confirmation the file is ready to use as context, with a remove control.",
      values: { status: "done", progress: 100 },
    },
    {
      id: "error",
      title: "Failed",
      note: "The file stays listed with a clear failure and a retry — never silently dropped.",
      values: { status: "error", progress: 0 },
    },
  ],
  remountOn: ["status"],
};

export function renderFileUpload(v: ControlValues, key: string) {
  return (
    <FileUpload
      key={key}
      status={v.status as FileUploadStatus}
      fileName={String(v.fileName)}
      fileSize={String(v.fileSize)}
      progress={Number(v.progress)}
      accept={String(v.accept)}
      onSelect={() => {}}
      onRetry={() => {}}
      onRemove={() => {}}
    />
  );
}
