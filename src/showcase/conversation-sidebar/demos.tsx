"use client";

import * as React from "react";
import {
  ConversationSidebar,
  type Conversation,
  type ConversationGroup,
} from "./conversation-sidebar";

const INITIAL: ConversationGroup[] = [
  {
    id: "pinned",
    label: "Pinned",
    conversations: [
      { id: "c1", title: "Weekly launch plan — draft agenda", updatedAt: "3d", pinned: true },
    ],
  },
  {
    id: "today",
    label: "Today",
    conversations: [
      { id: "c2", title: "Streaming UI patterns", updatedAt: "2m" },
      { id: "c3", title: "Claude model pricing comparison", updatedAt: "1h" },
    ],
  },
  {
    id: "week",
    label: "Previous 7 days",
    conversations: [
      { id: "c4", title: "Agent approval UX review", updatedAt: "2d" },
      { id: "c5", title: "Research: RAG citation formats", updatedAt: "4d" },
      { id: "c6", title: "A very long conversation title that has to truncate somewhere", updatedAt: "6d" },
    ],
  },
];

function removeConversation(groups: ConversationGroup[], id: string) {
  return groups
    .map((g) => ({ ...g, conversations: g.conversations.filter((c) => c.id !== id) }))
    .filter((g) => g.conversations.length > 0);
}

function insertConversation(groups: ConversationGroup[], conv: Conversation, groupId: string) {
  const target = groups.find((g) => g.id === groupId) ?? groups[0];
  if (!target) return [{ id: "today", label: "Today", conversations: [conv] }];
  return groups.map((g) =>
    g.id === target.id ? { ...g, conversations: [conv, ...g.conversations] } : g,
  );
}

function togglePinned(groups: ConversationGroup[], id: string) {
  const conv = groups.flatMap((g) => g.conversations).find((c) => c.id === id);
  if (!conv) return groups;
  const next = removeConversation(groups, id);
  if (conv.pinned) {
    return insertConversation(next, { ...conv, pinned: false }, "today");
  }
  const pinned = next.find((g) => g.id === "pinned");
  if (!pinned) return [{ id: "pinned", label: "Pinned", conversations: [{ ...conv, pinned: true }] }, ...next];
  return next.map((g) =>
    g.id === "pinned" ? { ...g, conversations: [{ ...conv, pinned: true }, ...g.conversations] } : g,
  );
}

/** The sidebar with its state wired up — rename, pin, delete and undo all work. */
export function InteractiveSidebar({
  initialGroups = INITIAL,
  loading = false,
  defaultQuery,
  newChatLabel,
  searchPlaceholder,
  emptyText,
}: {
  initialGroups?: ConversationGroup[];
  loading?: boolean;
  defaultQuery?: string;
  newChatLabel?: string;
  searchPlaceholder?: string;
  emptyText?: string;
}) {
  const [groups, setGroups] = React.useState(initialGroups);
  const [activeId, setActiveId] = React.useState<string | undefined>(
    initialGroups.flatMap((g) => g.conversations)[1]?.id,
  );
  const counter = React.useRef(100);

  return (
    <div className="h-[520px] w-full max-w-[300px] overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
      <ConversationSidebar
        groups={groups}
        activeId={activeId}
        loading={loading}
        defaultQuery={defaultQuery}
        newChatLabel={newChatLabel}
        searchPlaceholder={searchPlaceholder}
        emptyText={emptyText}
        onNewChat={() => {
          const id = `c${counter.current++}`;
          setGroups((g) =>
            insertConversation(g, { id, title: "Untitled chat", updatedAt: "now" }, "today"),
          );
          setActiveId(id);
        }}
        onSelect={setActiveId}
        onRename={(id, title) =>
          setGroups((g) =>
            g.map((gr) => ({
              ...gr,
              conversations: gr.conversations.map((c) => (c.id === id ? { ...c, title } : c)),
            })),
          )
        }
        onTogglePin={(id) => setGroups((g) => togglePinned(g, id))}
        onDelete={(id) => setGroups((g) => removeConversation(g, id))}
        onRestore={(conv) => setGroups((g) => insertConversation(g, conv, "today"))}
      />
    </div>
  );
}

export function DemoDefault() {
  return <InteractiveSidebar />;
}
