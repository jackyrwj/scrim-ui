"use client";

import * as React from "react";
import type { ComponentControls, ControlValues } from "@/lib/component-controls";
import { ArtifactPreview, type ArtifactStatus, type ArtifactType, type ArtifactView } from "./artifact-preview";
import { TypeMock } from "./demos";

const SAMPLE_CODE = `export function SalesChart({ data }: { data: number[] }) {
  const max = Math.max(...data);
  return (
    <div className="flex items-end gap-2">
      {data.map((v, i) => (
        <div key={i} style={{ height: (v / max) * 160 }} />
      ))}
    </div>
  );
}`;

const VERSIONS = [
  { id: "v1", label: "v1" },
  { id: "v2", label: "v2" },
];

function LiveArtifact({ v, remountKey }: { v: ControlValues; remountKey: string }) {
  const [versionId, setVersionId] = React.useState("v2");
  const status = String(v.status) as ArtifactStatus;
  const versioned = Boolean(v.versioned);
  return (
    <ArtifactPreview
      key={remountKey}
      title={String(v.title)}
      type={String(v.type) as ArtifactType}
      status={status}
      language={String(v.language) || undefined}
      code={String(v.code) || undefined}
      defaultView={String(v.defaultView) as ArtifactView}
      errorMessage={String(v.errorMessage) || undefined}
      staleNote={String(v.staleNote) || undefined}
      preview={status === "streaming" ? undefined : <TypeMock type={String(v.type) as ArtifactType} />}
      versions={versioned ? VERSIONS : undefined}
      currentVersionId={versioned ? versionId : undefined}
      onVersionChange={versioned ? setVersionId : undefined}
      onClose={() => {}}
    />
  );
}

export const artifactPreviewControls: ComponentControls = {
  tag: "ArtifactPreview",
  importFrom: "./artifact-preview",
  controls: [
    { kind: "text", name: "title", label: "Title", value: "signup-chart.tsx" },
    {
      kind: "enum", name: "type", label: "Artifact type", value: "chart",
      options: [
        { value: "code", label: "Code" },
        { value: "document", label: "Document" },
        { value: "web", label: "Web page" },
        { value: "chart", label: "Chart" },
        { value: "image", label: "Image" },
      ],
    },
    {
      kind: "enum", name: "status", label: "Status", value: "ready",
      options: [
        { value: "ready", label: "Ready" },
        { value: "streaming", label: "Streaming" },
        { value: "error", label: "Error" },
        { value: "stale", label: "Stale" },
      ],
    },
    { kind: "text", name: "code", label: "Source (enables Code view)", value: SAMPLE_CODE, multiline: true },
    { kind: "text", name: "language", label: "Language label", value: "tsx" },
    {
      kind: "enum", name: "defaultView", label: "Initial view", value: "preview",
      options: [
        { value: "preview", label: "Preview" },
        { value: "code", label: "Code" },
      ],
    },
    { kind: "boolean", name: "versioned", label: "Two versions", value: false },
    { kind: "text", name: "errorMessage", label: "Error message", value: "This artifact could not be rendered." },
  ],
  fixed: [{ name: "preview", expr: "<PreviewPane />" }],
  handlers: ["onClose"],
  remountOn: ["defaultView", "versioned"],
  preamble: `function PreviewPane() {
  /* The caller renders the preview — the panel never executes anything. */
  return <div className="p-6 text-sm">Your rendered artifact here</div>;
}`,
  derive: (v) => {
    if (!v.versioned) return {};
    return {
      preamble: `const VERSIONS = [{ id: "v1" }, { id: "v2" }];`,
      props: {
        versions: "VERSIONS",
        currentVersionId: '"v2"',
        onVersionChange: "() => {}",
      },
    };
  },
  presets: [
    {
      id: "streaming",
      title: "Streaming",
      note: "Chrome is stable from the first token; a shimmer holds the panel's shape.",
      values: { status: "streaming" },
    },
    {
      id: "preview",
      title: "Preview",
      note: "Settled and rendered — the everyday state of a finished artifact.",
      values: {},
    },
    {
      id: "code",
      title: "Code",
      note: "The source behind the render — copy and download both read from it.",
      values: { defaultView: "code" },
    },
    {
      id: "error",
      title: "Error",
      note: "The render failed but the conversation did not — source stays readable.",
      values: { status: "error" },
    },
    {
      id: "versioned",
      title: "Versioned",
      note: "The model revised its output. Page versions without losing either.",
      values: { versioned: true },
    },
  ],
};

export function renderArtifactPreview(v: ControlValues, key: string) {
  return <LiveArtifact v={v} remountKey={key} />;
}
