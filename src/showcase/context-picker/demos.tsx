"use client";

import * as React from "react";
import { ContextPicker, type ContextItem } from "./context-picker";
import { ContextFiles } from "../context-files/context-files";
import { PromptInput } from "../prompt-input/prompt-input";

export const DEMO_ITEMS: ContextItem[] = [
  { id: "f1", kind: "file", title: "Q3-planning.md", detail: "docs/roadmap", tokens: 2400, recent: true },
  { id: "f2", kind: "file", title: "metrics.csv", detail: "Downloads", tokens: 9800 },
  { id: "f3", kind: "file", title: "old-spec-2024.pdf", detail: "drive/archive", status: "unavailable", tokens: 5200 },
  { id: "w1", kind: "web", title: "AI SDK — useChat", detail: "sdk.vercel.ai/docs", tokens: 3100, recent: true },
  { id: "w2", kind: "web", title: "Pricing page draft", detail: "Notion · shared", status: "permission-required" },
  { id: "k1", kind: "knowledge", title: "Support handbook", detail: "142 articles", tokens: 12400 },
  { id: "a1", kind: "app", title: "Linear", detail: "Workspace: scrim", status: "connecting" },
];

/** Picker above a composer; selections also surface in a Context Files panel. */
export function InteractivePicker() {
  const [selected, setSelected] = React.useState<string[]>(["f1"]);
  const [granted, setGranted] = React.useState<string[]>([]);

  const items = DEMO_ITEMS.map((it) =>
    granted.includes(it.id) && it.status === "permission-required" ? { ...it, status: "available" as const } : it,
  );
  const selectedFiles = selected
    .map((id) => items.find((it) => it.id === id))
    .filter((it): it is ContextItem => Boolean(it))
    .map((it) => ({ name: it.title, detail: it.tokens != null ? `≈ ${(it.tokens / 1000).toFixed(1)}k tokens` : it.detail }));

  return (
    <div className="flex h-[480px] flex-col justify-end gap-3 p-4">
      <ContextFiles files={selectedFiles} title="In this turn" />
      <ContextPicker
        items={items}
        selectedIds={selected}
        onSelectionChange={setSelected}
        onRequestAccess={(item) => setGranted((g) => [...g, item.id])}
        defaultOpen
      />
      <PromptInput placeholder="Ask about your context…" onSubmit={() => {}} />
    </div>
  );
}

export function DemoDefault() {
  return <InteractivePicker />;
}
