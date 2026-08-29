"use client";

import * as React from "react";

/**
 * The `@`-menu for pulling context into the current turn — files, web pages,
 * knowledge bases and connected apps.
 *
 * The line this component holds: **context is not tools.** An item here is
 * data that joins this conversation's context window (and costs tokens);
 * it never enables an action. Tool availability belongs to the composer.
 *
 * Item status is per-source, not global: `permission-required` items are
 * listed but must be granted before they can be selected, `connecting`
 * sources are on their way, and `unavailable` items stay visible with their
 * reason instead of vanishing (a silently missing file reads as a bug).
 */

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type ContextSourceKind = "file" | "web" | "knowledge" | "app";

export type ContextItemStatus = "available" | "permission-required" | "connecting" | "unavailable";

export type ContextItem = {
  id: string;
  kind: ContextSourceKind;
  title: string;
  /** Path, URL, or source detail shown under the title. */
  detail?: string;
  status?: ContextItemStatus;
  /** Context cost of adding this item, surfaced so selection stays informed. */
  tokens?: number;
  /** Recently used — floated into a "Recent" section when the search is empty. */
  recent?: boolean;
};

export type ContextPickerProps = {
  items: ContextItem[];
  /** Controlled selection. Omit and pass defaultSelectedIds for uncontrolled. */
  selectedIds?: string[];
  defaultSelectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  /** Fired when the user grants access to a permission-required item. */
  onRequestAccess?: (item: ContextItem) => void;
  defaultOpen?: boolean;
  defaultQuery?: string;
  triggerLabel?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  className?: string;
};

/* ------------------------------------------------------------------ */
/* Icons                                                               */
/* ------------------------------------------------------------------ */

const ICON_PROPS = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

function AtSignIcon() {
  return (
    <svg {...ICON_PROPS} width="14" height="14">
      <circle cx="12" cy="12" r="4" />
      <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8" />
    </svg>
  );
}

function FileIcon() {
  return (
    <svg {...ICON_PROPS} width="15" height="15">
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg {...ICON_PROPS} width="15" height="15">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
      <path d="M2 12h20" />
    </svg>
  );
}

function KnowledgeIcon() {
  return (
    <svg {...ICON_PROPS} width="15" height="15">
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20" />
    </svg>
  );
}

function AppIcon() {
  return (
    <svg {...ICON_PROPS} width="15" height="15">
      <rect width="7" height="7" x="3" y="3" rx="1" />
      <rect width="7" height="7" x="14" y="3" rx="1" />
      <rect width="7" height="7" x="14" y="14" rx="1" />
      <rect width="7" height="7" x="3" y="14" rx="1" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg {...ICON_PROPS} width="11" height="11">
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg {...ICON_PROPS} width="13" height="13">
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function kindIcon(kind: ContextSourceKind) {
  switch (kind) {
    case "file":
      return <FileIcon />;
    case "web":
      return <GlobeIcon />;
    case "knowledge":
      return <KnowledgeIcon />;
    case "app":
      return <AppIcon />;
  }
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const KIND_LABELS: Record<ContextSourceKind, string> = {
  file: "Files",
  web: "Web pages",
  knowledge: "Knowledge bases",
  app: "Apps",
};

const KIND_ORDER: ContextSourceKind[] = ["file", "web", "knowledge", "app"];

function formatTokens(n: number): string {
  if (n >= 1000) return `≈ ${(n / 1000).toFixed(1).replace(/\.0$/, "")}k tokens`;
  return `≈ ${n} tokens`;
}

/* ------------------------------------------------------------------ */
/* ContextPicker                                                       */
/* ------------------------------------------------------------------ */

export function ContextPicker({
  items,
  selectedIds: selectedIdsProp,
  defaultSelectedIds = [],
  onSelectionChange,
  onRequestAccess,
  defaultOpen = false,
  defaultQuery = "",
  triggerLabel = "Add context",
  searchPlaceholder = "Search files, pages, sources…",
  emptyText = "No matching context.",
  className = "",
}: ContextPickerProps) {
  const idBase = React.useId();
  const rootRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const [open, setOpen] = React.useState(defaultOpen);
  const [query, setQuery] = React.useState(defaultQuery);
  const [internalSelected, setInternalSelected] = React.useState<string[]>(defaultSelectedIds);
  const selectedIds = selectedIdsProp ?? internalSelected;

  const q = query.trim().toLowerCase();
  const matches = items.filter(
    (it) => !q || it.title.toLowerCase().includes(q) || (it.detail ?? "").toLowerCase().includes(q),
  );

  /* Items the keyboard can land on: selectable, or permission-required
     (Enter requests access). Connecting/unavailable rows are inert. */
  const actionable = matches.filter((it) => {
    const status = it.status ?? "available";
    return status === "available" || status === "permission-required";
  });

  const [activeId, setActiveId] = React.useState<string | undefined>(actionable[0]?.id);
  const [prevActionableKey, setPrevActionableKey] = React.useState("");
  const actionableKey = actionable.map((it) => it.id).join("");
  if (actionableKey !== prevActionableKey) {
    setPrevActionableKey(actionableKey);
    if (!activeId || !actionable.some((it) => it.id === activeId)) {
      setActiveId(actionable[0]?.id);
    }
  }

  const selectedItems = selectedIds
    .map((id) => items.find((it) => it.id === id))
    .filter((it): it is ContextItem => Boolean(it));
  const selectedTokens = selectedItems.reduce((sum, it) => sum + (it.tokens ?? 0), 0);

  function setSelection(ids: string[]) {
    setInternalSelected(ids);
    onSelectionChange?.(ids);
  }

  function toggle(item: ContextItem) {
    if (selectedIds.includes(item.id)) {
      setSelection(selectedIds.filter((id) => id !== item.id));
    } else {
      setSelection([...selectedIds, item.id]);
    }
  }

  function activate(item: ContextItem) {
    const status = item.status ?? "available";
    if (status === "permission-required") {
      onRequestAccess?.(item);
    } else if (status === "available") {
      toggle(item);
    }
  }

  function openPanel() {
    setOpen(true);
    window.setTimeout(() => inputRef.current?.focus(), 0);
  }

  /* Close on outside pointer-down. Listener lives in an effect; the state
     write happens in the event callback, not the effect body. */
  React.useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  function onInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (actionable.length === 0) return;
      const i = actionable.findIndex((it) => it.id === activeId);
      const next =
        e.key === "ArrowDown"
          ? actionable[(i + 1 + actionable.length) % actionable.length]
          : actionable[(i - 1 + actionable.length) % actionable.length];
      setActiveId(next.id);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = actionable.find((it) => it.id === activeId);
      if (item) activate(item);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    }
  }

  const recentItems = !q ? matches.filter((it) => it.recent) : [];
  const recentIds = new Set(recentItems.map((it) => it.id));
  const grouped = KIND_ORDER.map((kind) => ({
    kind,
    items: matches.filter((it) => it.kind === kind && !recentIds.has(it.id)),
  })).filter((g) => g.items.length > 0);

  function renderOption(item: ContextItem) {
    const status = item.status ?? "available";
    const selected = selectedIds.includes(item.id);
    const inert = status === "connecting" || status === "unavailable";
    const active = item.id === activeId && !inert;
    return (
      <li
        key={item.id}
        id={`${idBase}-option-${item.id}`}
        role="option"
        aria-selected={selected}
        aria-disabled={inert || undefined}
        onMouseEnter={() => !inert && setActiveId(item.id)}
        onClick={() => activate(item)}
        className={`flex cursor-pointer items-center gap-2.5 px-3 py-2 ${
          active ? "bg-zinc-100 dark:bg-zinc-800" : ""
        } ${inert ? "cursor-default opacity-60" : ""}`}
      >
        <span className="shrink-0 text-zinc-400 dark:text-zinc-500">{kindIcon(item.kind)}</span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13px] font-medium text-zinc-800 dark:text-zinc-100">
            {item.title}
          </span>
          {item.detail && (
            <span className="block truncate text-xs text-zinc-500 dark:text-zinc-400">{item.detail}</span>
          )}
        </span>
        {status === "permission-required" && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRequestAccess?.(item);
            }}
            className="inline-flex shrink-0 items-center gap-1 rounded-md border border-zinc-200 px-2 py-0.5 text-[11px] font-medium text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <LockIcon />
            Grant
          </button>
        )}
        {status === "connecting" && (
          <span className="shrink-0 text-[11px] text-zinc-400 dark:text-zinc-500">Connecting…</span>
        )}
        {status === "unavailable" && (
          <span className="shrink-0 text-[11px] text-zinc-400 dark:text-zinc-500">Unavailable</span>
        )}
        {status === "available" && item.tokens != null && (
          <span className="shrink-0 text-[11px] tabular-nums text-zinc-400 dark:text-zinc-500">
            {formatTokens(item.tokens)}
          </span>
        )}
        {selected && (
          <span className="shrink-0 text-blue-600 dark:text-blue-400" aria-label="Selected">
            <svg {...ICON_PROPS} width="14" height="14">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </span>
        )}
      </li>
    );
  }

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      {/* Selected context — chips so removal is one click, no reopening. */}
      {selectedItems.length > 0 && (
        <ul className="mb-2 flex flex-wrap items-center gap-1.5" aria-label="Selected context">
          {selectedItems.map((item) => (
            <li
              key={item.id}
              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-zinc-50 py-1 pl-2 pr-1 text-xs font-medium text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800/70 dark:text-zinc-200"
            >
              <span className="text-zinc-400 dark:text-zinc-500">{kindIcon(item.kind)}</span>
              <span className="max-w-[180px] truncate">{item.title}</span>
              <button
                type="button"
                onClick={() => toggle(item)}
                aria-label={`Remove ${item.title} from context`}
                className="rounded p-0.5 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-600 dark:hover:bg-zinc-700 dark:hover:text-zinc-300"
              >
                <XIcon />
              </button>
            </li>
          ))}
          {selectedTokens > 0 && (
            <li className="pl-1 text-[11px] tabular-nums text-zinc-400 dark:text-zinc-500">
              {formatTokens(selectedTokens)}
            </li>
          )}
        </ul>
      )}

      <button
        type="button"
        onClick={() => (open ? setOpen(false) : openPanel())}
        aria-expanded={open}
        aria-controls={`${idBase}-listbox`}
        className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-[13px] font-medium text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
      >
        <AtSignIcon />
        {triggerLabel}
      </button>

      {open && (
        <div className="absolute bottom-full left-0 z-20 mb-2 w-[320px] overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
          <div className="border-b border-zinc-100 px-3 py-2 dark:border-zinc-800">
            <input
              ref={inputRef}
              role="combobox"
              aria-expanded="true"
              aria-controls={`${idBase}-listbox`}
              aria-activedescendant={activeId ? `${idBase}-option-${activeId}` : undefined}
              aria-label="Search context"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onInputKeyDown}
              placeholder={searchPlaceholder}
              className="w-full bg-transparent text-[13px] text-zinc-800 outline-none placeholder:text-zinc-400 dark:text-zinc-100 dark:placeholder:text-zinc-500"
            />
          </div>

          <div className="max-h-[280px] overflow-y-auto">
            {matches.length === 0 ? (
              <div className="px-3 py-6 text-center text-xs text-zinc-500 dark:text-zinc-400">
                <p>{emptyText}</p>
                {q && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className="mt-2 rounded-md border border-zinc-200 px-2.5 py-1 text-[11px] font-medium text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  >
                    Clear search
                  </button>
                )}
              </div>
            ) : (
              <ul role="listbox" id={`${idBase}-listbox`} aria-label="Available context" className="py-1">
                {recentItems.length > 0 && (
                  <>
                    <li className="px-3 pb-1 pt-2 text-[11px] font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
                      Recent
                    </li>
                    {recentItems.map(renderOption)}
                  </>
                )}
                {grouped.map((g) => (
                  <React.Fragment key={g.kind}>
                    <li className="px-3 pb-1 pt-2 text-[11px] font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
                      {KIND_LABELS[g.kind]}
                    </li>
                    {g.items.map(renderOption)}
                  </React.Fragment>
                ))}
              </ul>
            )}
          </div>

          {selectedItems.length > 0 && (
            <div className="border-t border-zinc-100 px-3 py-1.5 text-[11px] text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
              {selectedItems.length} in this turn
              {selectedTokens > 0 && ` · ${formatTokens(selectedTokens)}`}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
