"use client";

import type { ComponentControls, ControlValues } from "@/lib/component-controls";
import type { ConversationGroup } from "./conversation-sidebar";
import { InteractiveSidebar } from "./demos";

/** The reader edits the history as text: `#` starts a group, `*` pins a row,
 *  `|` separates the title from its timestamp. `derive` turns it back into
 *  the GROUPS literal the snippet needs. */
const SAMPLE = [
  "# Pinned",
  "* Weekly launch plan — draft agenda | 3d",
  "# Today",
  "Streaming UI patterns | 2m",
  "Claude model pricing comparison | 1h",
  "# Previous 7 days",
  "Agent approval UX review | 2d",
  "Research: RAG citation formats | 4d",
].join("\n");

function parse(text: string): ConversationGroup[] {
  const groups: ConversationGroup[] = [];
  let current: ConversationGroup | null = null;
  text.split("\n").forEach((raw) => {
    const line = raw.trim();
    if (!line) return;
    if (line.startsWith("#")) {
      current = { id: `g${groups.length + 1}`, label: line.replace(/^#+\s*/, "") || "Chats", conversations: [] };
      groups.push(current);
      return;
    }
    if (!current) {
      current = { id: "g1", label: "Chats", conversations: [] };
      groups.push(current);
    }
    const pinned = line.startsWith("*");
    const body = pinned ? line.slice(1).trim() : line;
    const [title, updatedAt] = body.split("|").map((s) => s.trim());
    if (!title) return;
    current.conversations.push({
      id: `${current!.id}c${current!.conversations.length + 1}`,
      title,
      updatedAt: updatedAt || undefined,
      pinned: pinned || undefined,
    });
  });
  return groups.filter((g) => g.conversations.length > 0);
}

function serialize(groups: ConversationGroup[]) {
  const body = groups
    .map((g) => {
      const rows = g.conversations
        .map(
          (c) =>
            `    { id: ${JSON.stringify(c.id)}, title: ${JSON.stringify(c.title)}` +
            `${c.updatedAt ? `, updatedAt: ${JSON.stringify(c.updatedAt)}` : ""}` +
            `${c.pinned ? ", pinned: true" : ""} },`,
        )
        .join("\n");
      return `  {\n    id: ${JSON.stringify(g.id)},\n    label: ${JSON.stringify(g.label)},\n    conversations: [\n${rows}\n    ],\n  },`;
    })
    .join("\n");
  return `const GROUPS = [\n${body}\n];`;
}

export const conversationSidebarControls: ComponentControls = {
  tag: "ConversationSidebar",
  importFrom: "./conversation-sidebar",
  controls: [
    { kind: "text", name: "groups", label: "History (# group, * pinned, title | time)", value: SAMPLE, multiline: true },
    { kind: "text", name: "newChatLabel", label: "New chat label", value: "New chat" },
    { kind: "text", name: "searchPlaceholder", label: "Search placeholder", value: "Search chats…" },
    { kind: "text", name: "defaultQuery", label: "Initial search query", value: "" },
    { kind: "text", name: "emptyText", label: "Empty text", value: "No conversations yet. Start a new chat to see it here.", multiline: true },
    { kind: "boolean", name: "loading", label: "Loading (skeleton rows)", value: false },
  ],
  handlers: ["onNewChat", "onSelect", "onRename", "onTogglePin", "onDelete", "onRestore"],
  remountOn: ["groups", "defaultQuery"],
  derive: (v) => {
    const groups = parse(String(v.groups));
    if (groups.length === 0) return { props: { groups: "[]" } };
    return { preamble: serialize(groups), props: { groups: "GROUPS" } };
  },
  presets: [
    {
      id: "default",
      title: "Default",
      note: "Grouped, one pinned, one active — the everyday state of a history sidebar.",
      values: {},
    },
    {
      id: "searching",
      title: "Searching",
      note: "The query filters across groups; groups with no match disappear.",
      values: { defaultQuery: "claude" },
    },
    {
      id: "empty",
      title: "Empty",
      note: "First run. Say what lands here instead of showing a blank panel.",
      values: { groups: "" },
    },
    {
      id: "loading",
      title: "Loading",
      note: "Skeleton rows while history loads — never a spinner over nothing.",
      values: { loading: true },
    },
  ],
};

export function renderConversationSidebar(v: ControlValues, key: string) {
  return (
    <InteractiveSidebar
      key={key}
      initialGroups={parse(String(v.groups))}
      loading={Boolean(v.loading)}
      defaultQuery={String(v.defaultQuery) || undefined}
      newChatLabel={String(v.newChatLabel)}
      searchPlaceholder={String(v.searchPlaceholder)}
      emptyText={String(v.emptyText)}
    />
  );
}
