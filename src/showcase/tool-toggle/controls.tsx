"use client";

import * as React from "react";
import { ToolToggle, type ToolSetting } from "./tool-toggle";
import type { ComponentControls, ControlValues } from "@/lib/component-controls";

/** `name — description` per line; a leading `-` marks the tool locked. */
const SAMPLE = [
  "Web search — Find current information online",
  "Code execution — Run code to verify answers",
  "File access — Read and edit attached files",
].join("\n");

const LOCKED = [
  "Web search — Find current information online",
  "Code execution — Run code to verify answers",
  "-Computer use — Available on the Team plan",
].join("\n");

function parse(text: string): ToolSetting[] {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line, i) => {
      const locked = line.startsWith("-");
      const [name, description] = line.replace(/^-/, "").split("—").map((p) => p.trim());
      return {
        id: `t${i + 1}`,
        name,
        description: description ?? "",
        enabled: !locked && i < 2,
        disabled: locked,
      };
    });
}

export const toolToggleControls: ComponentControls = {
  tag: "ToolToggle",
  importFrom: "./tool-toggle",
  controls: [
    { kind: "text", name: "title", label: "Title", value: "Tools" },
    {
      kind: "text",
      name: "description",
      label: "Description",
      value: "What the assistant is allowed to use",
      multiline: true,
    },
    {
      kind: "text",
      name: "tools",
      label: "Tools (name — description, prefix - to lock)",
      value: SAMPLE,
      multiline: true,
    },
  ],
  handlers: ["onToggle"],
  derive: (v) => {
    const body = parse(String(v.tools))
      .map(
        (t) =>
          `  { id: ${JSON.stringify(t.id)}, name: ${JSON.stringify(t.name)}, description: ${JSON.stringify(t.description)}, enabled: ${t.enabled}${t.disabled ? ", disabled: true" : ""} },`,
      )
      .join("\n");
    return { preamble: `const TOOLS = [\n${body}\n];`, props: { tools: "TOOLS" } };
  },
  presets: [
    {
      id: "default",
      title: "Default",
      note: "Live switches for the assistant's tools — flip one and the state updates.",
      values: { tools: SAMPLE },
    },
    {
      id: "locked",
      title: "Locked tool",
      note: "A tool gated behind a plan is shown but dimmed, so the upgrade path stays discoverable.",
      values: { tools: LOCKED },
    },
  ],
};

/* Seeded from the controls and then owned locally, so the preview responds to
   clicks. Re-seeding is done by remounting on a key that includes the seed —
   the React way to reset state when an input changes — rather than a
   setState inside an effect. */
function LiveToolToggle({ v }: { v: ControlValues }) {
  const [tools, setTools] = React.useState<ToolSetting[]>(() => parse(String(v.tools)));
  return (
    <ToolToggle
      title={String(v.title)}
      description={String(v.description)}
      tools={tools}
      onToggle={(id, enabled) =>
        setTools((list) => list.map((t) => (t.id === id ? { ...t, enabled } : t)))
      }
    />
  );
}

export function renderToolToggle(v: ControlValues, key: string) {
  return <LiveToolToggle key={`${key}:${v.tools}`} v={v} />;
}
