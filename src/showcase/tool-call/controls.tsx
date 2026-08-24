"use client";

import { ToolCall, type ToolStatus } from "./tool-call";
import type { ComponentControls, ControlValues } from "@/lib/component-controls";

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

const INPUT = `{\n  "query": "best AI chat UI patterns"\n}`;
const OUTPUT = `{\n  "results": 24,\n  "top": [\n    "streaming message patterns",\n    "citation UI patterns"\n  ]\n}`;

export const toolCallControls: ComponentControls = {
  tag: "ToolCall",
  importFrom: "./tool-call",
  controls: [
    { kind: "text", name: "name", label: "Tool name", value: "Search the web" },
    {
      kind: "enum",
      name: "status",
      label: "Status",
      value: "success",
      options: [
        { value: "running", label: "Running" },
        { value: "success", label: "Completed" },
        { value: "error", label: "Failed" },
      ],
    },
    { kind: "text", name: "duration", label: "Duration", value: "1.2s" },
    { kind: "text", name: "input", label: "Input payload", value: INPUT, multiline: true },
    { kind: "text", name: "output", label: "Output", value: OUTPUT, multiline: true },
    { kind: "boolean", name: "defaultOpen", label: "Open by default", value: true },
  ],
  fixed: [{ name: "icon", expr: "<SearchIcon />" }],
  // The icon is a prop, so the snippet has to carry something that defines it
  // or what you paste will not compile.
  preamble: `function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}`,
  handlers: ["onCancel"],
  presets: [
    {
      id: "running",
      title: "Running",
      note: "Spinner, elapsed time and a cancel affordance — the row reads as in-flight.",
      values: { status: "running", output: "", duration: "0.6s" },
    },
    {
      id: "success",
      title: "Completed",
      note: "Green pill; the payload is collapsible and open by default.",
      values: { status: "success", input: INPUT, output: OUTPUT, duration: "1.2s" },
    },
    {
      id: "error",
      title: "Failed",
      note: "Red on border, icon and pill, with the error surfaced in the output.",
      values: {
        status: "error",
        output: `{\n  "error": "upstream timeout after 10s"\n}`,
        duration: "10.0s",
      },
    },
  ],
  remountOn: ["status", "defaultOpen"],
};

export function renderToolCall(v: ControlValues, key: string) {
  return (
    <ToolCall
      key={key}
      name={String(v.name)}
      icon={<SearchIcon />}
      status={v.status as ToolStatus}
      duration={String(v.duration)}
      input={v.input ? String(v.input) : undefined}
      output={v.output ? String(v.output) : undefined}
      defaultOpen={Boolean(v.defaultOpen)}
      onCancel={() => {}}
    />
  );
}
