"use client";

import * as React from "react";
import type { ComponentControls, ControlValues } from "@/lib/component-controls";
import { GeneratedMediaResult, type MediaKind, type MediaStatus } from "./generated-media";
import { ImageMock, AudioMock, VideoMock } from "./demos";

export const generatedMediaControls: ComponentControls = {
  tag: "GeneratedMediaResult",
  importFrom: "./generated-media",
  preamble: [
    "const MEDIA = {",
    "  image: <img src=\"/generated/ridge.png\" alt=\"A mountain ridge at dusk\" />,",
    "  audio: <audio controls src=\"/generated/loop.mp3\" />,",
    "  video: <video controls src=\"/generated/waves.mp4\" />,",
    "};",
  ].join("\n"),
  controls: [
    { kind: "text", name: "prompt", label: "Prompt", value: "A mountain ridge at dusk, soft gradient sky, minimal illustration", multiline: true },
    { kind: "enum", name: "kind", label: "Media kind", value: "image", options: [
      { value: "image", label: "Image" },
      { value: "audio", label: "Audio" },
      { value: "video", label: "Video" },
    ] },
    { kind: "enum", name: "status", label: "Status", value: "ready", options: [
      { value: "queued", label: "Queued" },
      { value: "generating", label: "Generating" },
      { value: "ready", label: "Ready" },
      { value: "failed", label: "Failed" },
      { value: "cancelled", label: "Cancelled" },
      { value: "blocked", label: "Blocked (policy)" },
    ] },
    { kind: "text", name: "stage", label: "Stage (while generating)", value: "Diffusing latents…" },
    { kind: "number", name: "queuePosition", label: "Queue position", value: 2, min: 1, max: 99 },
    { kind: "text", name: "params", label: "Params (comma separated)", value: "1024×1024, seed 4815, illustration" },
    { kind: "number", name: "variantCount", label: "Variants", value: 3, min: 0, max: 4 },
    { kind: "text", name: "errorMessage", label: "Error message", value: "The worker ran out of memory mid-generation." },
    { kind: "text", name: "blockedReason", label: "Blocked reason", value: "The prompt names a real person. Describe a fictional character instead." },
    { kind: "text", name: "caption", label: "Caption", value: "" },
  ],
  fixed: [{ name: "children", expr: "MEDIA[kind]" }],
  handlers: ["onDownload", "onRegenerate", "onCancel", "onRetry", "onVariantChange"],
  remountOn: ["kind", "status", "variantCount"],
  derive: (v) => {
    const params = String(v.params).split(",").map((s) => s.trim()).filter(Boolean);
    const n = Number(v.variantCount);
    return {
      props: {
        params: `[${params.map((p) => JSON.stringify(p)).join(", ")}]`,
        ...(n > 1
          ? { variants: `[${Array.from({ length: n }, (_, i) => `{ id: "v${i + 1}" }`).join(", ")}]` }
          : {}),
      },
    };
  },
  presets: [
    { id: "queued", title: "Queued", note: "Position in line, no fake progress bar — the wait is stated honestly.", values: { status: "queued" } },
    { id: "generating", title: "Generating", note: "A stage in words, a shimmer with the final shape — never an invented percentage.", values: { status: "generating" } },
    { id: "image", title: "Image", note: "Ready, with prompt, params and variant picker in the footer.", values: {} },
    { id: "audio", title: "Audio", note: "Same frame, different media — the host hands in the player.", values: { kind: "audio", params: "12s, lo-fi, 90bpm", variantCount: 0 } },
    { id: "video", title: "Video", note: "Same frame again — kind changes the icon, label and fallback copy.", values: { kind: "video", params: "4s, 720p, 24fps", variantCount: 0 } },
    { id: "failed", title: "Failed", note: "Infrastructure failure — retry is the action.", values: { status: "failed" } },
    { id: "blocked", title: "Blocked", note: "A safety refusal, not an error — the fix is rephrasing, so there is no Retry.", values: { status: "blocked" } },
  ],
};

const MOCKS = { image: ImageMock, audio: AudioMock, video: VideoMock };

export function renderGeneratedMedia(v: ControlValues, key: string) {
  const kind = String(v.kind) as MediaKind;
  const status = String(v.status) as MediaStatus;
  const params = String(v.params).split(",").map((s) => s.trim()).filter(Boolean);
  const n = Number(v.variantCount);
  const Mock = MOCKS[kind];
  return (
    <div key={key} className="p-4">
      <GeneratedMediaResult
        kind={kind}
        status={status}
        prompt={String(v.prompt)}
        params={params}
        stage={String(v.stage)}
        queuePosition={Number(v.queuePosition)}
        errorMessage={String(v.errorMessage)}
        blockedReason={String(v.blockedReason)}
        caption={String(v.caption) || undefined}
        variants={n > 1 ? Array.from({ length: n }, (_, i) => ({ id: `v${i + 1}` })) : undefined}
        currentVariantId="v1"
        onDownload={() => {}}
        onRegenerate={() => {}}
        onCancel={() => {}}
        onRetry={() => {}}
      >
        <Mock />
      </GeneratedMediaResult>
    </div>
  );
}
