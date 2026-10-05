"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import * as React from "react";

/**
 * The chat-history sidebar every AI product rebuilds.
 *
 * A list of conversations is a ten-minute component. What makes this one
 * worth its own file is everything around the list:
 *
 * **Delete is undo-first, never confirm-first.** A confirm dialog makes the
 * reader answer a question before anything has happened; an undo bar lets
 * the action land instantly and be taken back while it is still visible.
 * `onDelete` fires immediately; if `onRestore` is provided, a bar offers to
 * bring the conversation back for a few seconds.
 *
 * **Rename is inline.** The title becomes an input where it sits — Enter
 * commits, Escape cancels. A modal for editing twelve characters is a whole
 * screen change for a two-second task.
 *
 * **Grouping is the caller's job.** "Today" / "Yesterday" / date math is
 * application policy, and timezone-sensitive. This component renders the
 * groups it is given; search filters within them.
 *
 * **Row actions reveal on hover AND focus.** The action buttons live inside
 * each row, so keyboard users reach them by tabbing — `focus-within` keeps
 * them visible while focus is anywhere in the row.
 */

export type Conversation = {
  id: string;
  title: string;
  updatedAt?: string;
  pinned?: boolean;
};

export type ConversationGroup = {
  id: string;
  label: string;
  conversations: Conversation[];
};

export type ConversationSidebarProps = {
  groups: ConversationGroup[];
  activeId?: string;
  /** Skeleton rows instead of the list, for first load. */
  loading?: boolean;
  /** Seeds the search box. The query itself is internal state after that. */
  defaultQuery?: string;
  newChatLabel?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  onNewChat?: () => void;
  onSelect?: (id: string) => void;
  onRename?: (id: string, title: string) => void;
  onTogglePin?: (id: string) => void;
  onDelete?: (id: string) => void;
  /** Enables the undo bar after a delete. Re-insert the conversation. */
  onRestore?: (conversation: Conversation) => void;
  className?: string;
};

/* ------------------------------------------------------------------ */
/* Icons                                                               */
/* ------------------------------------------------------------------ */

function PlusIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="13" height="13" {...props}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function SearchIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="13" height="13" {...props}>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function PinIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="12" height="12" {...props}>
      <path d="M12 17v5" />
      <path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3z" />
    </svg>
  );
}

function PencilIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="12" height="12" {...props}>
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
      <path d="m15 5 4 4" />
    </svg>
  );
}

function TrashIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="12" height="12" {...props}>
      <path d="M3 6h18" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" width="11" height="11" {...props}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function XIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="11" height="11" {...props}>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* ConversationSidebar                                                 */
/* ------------------------------------------------------------------ */

const UNDO_MS = 6000;

export function ConversationSidebar({
  groups,
  activeId,
  loading = false,
  defaultQuery = "",
  newChatLabel = "New chat",
  searchPlaceholder = "Search chats…",
  emptyText = "No conversations yet. Start a new chat to see it here.",
  onNewChat,
  onSelect,
  onRename,
  onTogglePin,
  onDelete,
  onRestore,
  className = "",
}: ConversationSidebarProps) {
  const [query, setQuery] = React.useState(defaultQuery);
  const [renamingId, setRenamingId] = React.useState<string | null>(null);
  const [draft, setDraft] = React.useState("");
  const [deleted, setDeleted] = React.useState<Conversation | null>(null);
  const undoTimer = React.useRef<number | undefined>(undefined);

  /* The undo bar dismisses itself; a new delete restarts the clock. The
     timeout callback is the only place this state changes on a timer, so
     there is nothing to sync in an effect. */
  React.useEffect(() => () => window.clearTimeout(undoTimer.current), []);

  const q = query.trim().toLowerCase();
  const visible = q
    ? groups
        .map((g) => ({
          ...g,
          conversations: g.conversations.filter((c) => c.title.toLowerCase().includes(q)),
        }))
        .filter((g) => g.conversations.length > 0)
    : groups;
  const total = groups.reduce((n, g) => n + g.conversations.length, 0);

  function startRename(conv: Conversation) {
    setRenamingId(conv.id);
    setDraft(conv.title);
  }

  function commitRename() {
    if (renamingId) {
      const title = draft.trim();
      if (title) onRename?.(renamingId, title);
    }
    setRenamingId(null);
  }

  function handleDelete(conv: Conversation) {
    onDelete?.(conv.id);
    if (!onRestore) return;
    window.clearTimeout(undoTimer.current);
    setDeleted(conv);
    undoTimer.current = window.setTimeout(() => setDeleted(null), UNDO_MS);
  }

  function handleUndo() {
    window.clearTimeout(undoTimer.current);
    if (deleted) onRestore?.(deleted);
    setDeleted(null);
  }

  const actionBtn =
    "rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground";

  return (
    <div className={`flex h-full flex-col bg-muted ${className}`}>
      {/* New chat */}
      <div className="p-3 pb-2">
        <Button variant="outline" size="sm"
          type="button"
          onClick={onNewChat}
          disabled={loading}
          className="h-auto min-h-8 whitespace-normal justify-start flex w-full items-center justify-center gap-1.5 rounded-md border border-border bg-card py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
        >
          <PlusIcon />
          {newChatLabel}
        </Button>
      </div>

      {/* Search */}
      <div className="px-3 pb-2">
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchPlaceholder}
            aria-label="Search conversations"
            className="w-full rounded-lg border border-border bg-card py-1.5 pl-8 pr-3 text-base sm:text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring focus:ring-2 focus:ring-ring/40"
          />
        </div>
      </div>

      {/* List */}
      <nav aria-label="Conversations" className="min-h-0 flex-1 overflow-y-auto px-3 pb-2">
        {loading ? (
          <div className="space-y-2.5 pt-2" aria-label="Loading conversations">
            {[70, 88, 55, 80, 64, 92, 48].map((w, i) => (
              <div
                key={i}
                className="h-4 animate-pulse rounded bg-muted"
                style={{ width: `${w}%` }}
              />
            ))}
          </div>
        ) : total === 0 ? (
          <p className="px-2 pt-8 text-center text-xs leading-5 text-muted-foreground">{emptyText}</p>
        ) : visible.length === 0 ? (
          <div className="px-2 pt-8 text-center">
            <p className="text-xs text-muted-foreground">No chats match &ldquo;{query.trim()}&rdquo;.</p>
            <Button variant="ghost" size="sm"
              type="button"
              onClick={() => setQuery("")}
              className="mt-1 text-xs font-medium text-foreground underline underline-offset-2 hover:text-foreground"
            >
              Clear search
            </Button>
          </div>
        ) : (
          visible.map((group) => (
            <div key={group.id} className="pt-3 first:pt-1">
              <p className="px-2 pb-1 text-xs font-medium tracking-wide text-muted-foreground">
                {group.label}
              </p>
              <ul className="space-y-0.5">
                {group.conversations.map((conv) => (
                  <li key={conv.id}>
                    {renamingId === conv.id ? (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          commitRename();
                        }}
                        className="flex items-center gap-1 py-0.5"
                      >
                        <Input
                          autoFocus
                          value={draft}
                          onChange={(e) => setDraft(e.target.value)}
                          onBlur={commitRename}
                          onKeyDown={(e) => {
                            if (e.key === "Escape") setRenamingId(null);
                          }}
                          aria-label="Rename conversation"
                          className="min-w-0 flex-1 rounded-md border border-border bg-card px-2 py-1.5 text-base sm:text-sm text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring focus:ring-2 focus:ring-ring/40"
                        />
                        <Button variant="ghost" size="icon-sm" type="submit" aria-label="Save name" className={actionBtn}>
                          <CheckIcon />
                        </Button>
                        <Button variant="ghost" size="icon-sm"
                          type="button"
                          aria-label="Cancel rename"
                          onClick={() => setRenamingId(null)}
                          className={actionBtn}
                        >
                          <XIcon />
                        </Button>
                      </form>
                    ) : (
                      <div className="group/row relative">
                        <Button variant="ghost" size="sm"
                          type="button"
                          aria-current={conv.id === activeId ? "true" : undefined}
                          onClick={() => onSelect?.(conv.id)}
                          className={`h-auto min-h-8 whitespace-normal justify-start flex w-full items-center gap-1.5 rounded-md px-2.5 py-2 text-left text-sm transition-colors ${
                            conv.id === activeId
                              ? "bg-muted/70 font-medium text-foreground"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground"
                          }`}
                        >
                          <span className="truncate">{conv.title}</span>
                          {conv.pinned && (
                            <PinIcon className="shrink-0 text-muted-foreground" aria-label="Pinned" />
                          )}
                        </Button>
                        {/* Row actions — invisible until hover or keyboard
                            focus lands anywhere in the row, so the list stays
                            quiet but every action stays reachable. */}
                        <span className="absolute right-1 top-1/2 flex -translate-y-1/2 items-center rounded-md bg-muted opacity-100 shadow-sm ring-1 ring-ring transition-opacity group-hover/row:opacity-100 group-focus-within/row:opacity-100">
                          {onTogglePin && (
                            <Button variant="ghost" size="icon-sm"
                              type="button"
                              aria-pressed={!!conv.pinned}
                              aria-label={conv.pinned ? `Unpin: ${conv.title}` : `Pin: ${conv.title}`}
                              onClick={() => onTogglePin(conv.id)}
                              className={actionBtn}
                            >
                              <PinIcon />
                            </Button>
                          )}
                          {onRename && (
                            <Button variant="ghost" size="icon-sm"
                              type="button"
                              aria-label={`Rename: ${conv.title}`}
                              onClick={() => startRename(conv)}
                              className={actionBtn}
                            >
                              <PencilIcon />
                            </Button>
                          )}
                          {onDelete && (
                            <Button variant="ghost" size="icon-sm"
                              type="button"
                              aria-label={`Delete: ${conv.title}`}
                              onClick={() => handleDelete(conv)}
                              className={`min-h-6 min-w-6 ${actionBtn} hover:text-red-600 dark:hover:text-red-400`}
                            >
                              <TrashIcon />
                            </Button>
                          )}
                        </span>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </nav>

      {/* Undo bar */}
      {deleted && (
        <div
          role="status"
          className="flex items-center justify-between gap-2 border-t border-border bg-muted px-3 py-2"
        >
          <span className="truncate text-xs text-muted-foreground">
            Deleted &ldquo;{deleted.title}&rdquo;
          </span>
          <Button variant="ghost" size="sm"
            type="button"
            onClick={handleUndo}
            className="shrink-0 rounded-md px-2 py-1 text-xs font-medium text-foreground underline underline-offset-2 hover:text-foreground"
          >
            Undo
          </Button>
        </div>
      )}
    </div>
  );
}
