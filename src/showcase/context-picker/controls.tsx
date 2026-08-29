"use client";

import type { ComponentControls, ControlValues } from "@/lib/component-controls";
import type { ContextItem, ContextSourceKind } from "./context-picker";
import { ContextPicker } from "./context-picker";

/** The reader edits sources as text: `#` sets the kind (file/web/knowledge/
 *  app), a leading mark sets the row's state — `+` preselected, `*` recent,
 *  `!` permission-required, `~` connecting, `x` unavailable — and `|`
 *  separates title, detail and token cost. */
const SAMPLE = [
  "# file",
  "+ Q3-planning.md | docs/roadmap | 2400",
  "metrics.csv | Downloads | 9800",
  "x old-spec-2024.pdf | drive/archive",
  "# web",
  "* AI SDK — useChat | sdk.vercel.ai/docs | 3100",
  "! Pricing page draft | Notion · shared",
  "# knowledge",
  "Support handbook | 142 articles | 12400",
  "# app",
  "~ Linear | Workspace: scrim",
].join("\n");

const KINDS: ContextSourceKind[] = ["file", "web", "knowledge", "app"];

function parse(text: string): { items: ContextItem[]; preselected: string[] } {
  const items: ContextItem[] = [];
  const preselected: string[] = [];
  let kind: ContextSourceKind = "file";
  text.split("\n").forEach((raw) => {
    const line = raw.trim();
    if (!line) return;
    if (line.startsWith("#")) {
      const k = line.replace(/^#+\s*/, "").toLowerCase() as ContextSourceKind;
      if (KINDS.includes(k)) kind = k;
      return;
    }
    const mark = line[0];
    const body = ["+", "*", "!", "~", "x"].includes(mark) ? line.slice(1).trim() : line;
    const [title, detail, tokens] = body.split("|").map((s) => s.trim());
    if (!title) return;
    const id = `c${items.length + 1}`;
    const item: ContextItem = {
      id,
      kind,
      title,
      detail: detail || undefined,
      tokens: tokens && !Number.isNaN(Number(tokens)) ? Number(tokens) : undefined,
      recent: mark === "*" || undefined,
      status: mark === "!" ? "permission-required" : mark === "~" ? "connecting" : mark === "x" ? "unavailable" : undefined,
    };
    items.push(item);
    if (mark === "+") preselected.push(id);
  });
  return { items, preselected };
}

function serialize(items: ContextItem[]) {
  const rows = items
    .map(
      (it) =>
        `  { id: ${JSON.stringify(it.id)}, kind: ${JSON.stringify(it.kind)}, title: ${JSON.stringify(it.title)}` +
        `${it.detail ? `, detail: ${JSON.stringify(it.detail)}` : ""}` +
        `${it.tokens != null ? `, tokens: ${it.tokens}` : ""}` +
        `${it.recent ? ", recent: true" : ""}` +
        `${it.status ? `, status: ${JSON.stringify(it.status)}` : ""} },`,
    )
    .join("\n");
  return `const ITEMS = [\n${rows}\n];`;
}

export const contextPickerControls: ComponentControls = {
  tag: "ContextPicker",
  importFrom: "./context-picker",
  controls: [
    { kind: "text", name: "items", label: "Sources (# kind, + selected, * recent, ! grant, ~ connecting, x unavailable)", value: SAMPLE, multiline: true },
    { kind: "text", name: "defaultQuery", label: "Initial search query", value: "" },
    { kind: "text", name: "triggerLabel", label: "Trigger label", value: "Add context" },
    { kind: "text", name: "searchPlaceholder", label: "Search placeholder", value: "Search files, pages, sources…" },
    { kind: "text", name: "emptyText", label: "Empty text", value: "No matching context." },
    { kind: "boolean", name: "defaultOpen", label: "Panel open", value: true },
  ],
  handlers: ["onSelectionChange", "onRequestAccess"],
  remountOn: ["items", "defaultQuery", "defaultOpen"],
  derive: (v) => {
    const { items, preselected } = parse(String(v.items));
    if (items.length === 0) return { props: { items: "[]" } };
    return {
      preamble: serialize(items),
      props: {
        items: "ITEMS",
        ...(preselected.length > 0 ? { defaultSelectedIds: JSON.stringify(preselected) } : {}),
      },
    };
  },
  presets: [
    {
      id: "open",
      title: "Open",
      note: "Search closed, Recent floated up, one item already in the turn.",
      values: {},
    },
    {
      id: "searching",
      title: "Searching",
      note: "The query matches titles and details across every kind.",
      values: { defaultQuery: "spec" },
    },
    {
      id: "selected",
      title: "Selected",
      note: "Chips above the trigger, token cost summed in the footer.",
      values: {
        items: [
          "# file",
          "+ Q3-planning.md | docs/roadmap | 2400",
          "+ metrics.csv | Downloads | 9800",
          "# knowledge",
          "+ Support handbook | 142 articles | 12400",
        ].join("\n"),
      },
    },
    {
      id: "permission-required",
      title: "Permission required",
      note: "Listed but locked — Grant connects the source, then it can join the turn.",
      values: {
        items: ["# web", "! Pricing page draft | Notion · shared", "! Analytics warehouse | Snowflake", "# file", "Q3-planning.md | docs/roadmap | 2400"].join("\n"),
      },
    },
    {
      id: "empty",
      title: "Empty",
      note: "Nothing to pick from yet — the panel explains instead of showing a blank box.",
      values: { items: "" },
    },
  ],
};

export function renderContextPicker(v: ControlValues, key: string) {
  const { items, preselected } = parse(String(v.items));
  return (
    <div key={key} className="flex h-[440px] flex-col justify-end p-4">
      <ContextPicker
        items={items}
        defaultSelectedIds={preselected}
        defaultOpen={Boolean(v.defaultOpen)}
        defaultQuery={String(v.defaultQuery) || undefined}
        triggerLabel={String(v.triggerLabel)}
        searchPlaceholder={String(v.searchPlaceholder)}
        emptyText={String(v.emptyText)}
      />
    </div>
  );
}
