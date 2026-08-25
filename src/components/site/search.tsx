"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { trackEvent } from "@/lib/analytics";

type SearchItem = {
  title: string;
  href: string;
  type: "Component" | "Pattern" | "Resource" | "Inspiration" | "Tool";
  description?: string;
};

export function Search({ items }: { items: SearchItem[] }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const filtered = query.trim()
    ? items.filter(
        (item) =>
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.description?.toLowerCase().includes(query.toLowerCase()),
      )
    : items.slice(0, 8);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setActiveIndex(0);
  }, []);

  /* Reset active index when query changes using render-phase adjustment
     instead of an effect, to avoid setState-in-effect warnings. */
  const [prevQuery, setPrevQuery] = useState(query);
  if (prevQuery !== query) {
    setPrevQuery(query);
    setActiveIndex(0);
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape" && open) close();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [close, open]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 0);
  }, [open]);

  /* Report the query once the user stops typing, not on every keystroke.
     A query with zero results is the interesting one: it is a reader telling
     us, in their own words, about a page we have not written yet. */
  const resultCount = filtered.length;
  useEffect(() => {
    const term = query.trim();
    if (term.length < 2) return;
    const timer = setTimeout(() => {
      trackEvent("search", { search_term: term.toLowerCase(), results: resultCount });
    }, 800);
    return () => clearTimeout(timer);
  }, [query, resultCount]);

  const navigate = (href: string) => {
    trackEvent("search_result_click", { item: href, search_term: query.trim().toLowerCase() });
    close();
    if (href.startsWith("http")) {
      window.open(href, "_blank", "noreferrer noopener");
    } else {
      router.push(href);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && filtered[activeIndex]) {
      e.preventDefault();
      navigate(filtered[activeIndex].href);
    }
  };

  const typeColors: Record<string, string> = {
    Component: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-400",
    Pattern: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
    Resource: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
    Inspiration: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
    Tool: "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-400",
  };

  return (
    <>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="hidden h-8 items-center gap-2 rounded-lg border border-(--border) px-3 text-sm text-(--muted-foreground) transition-colors hover:bg-(--muted) sm:inline-flex"
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="7" cy="7" r="5" />
          <line x1="11" y1="11" x2="14" y2="14" />
        </svg>
        <span className="text-xs">Search...</span>
        <kbd className="rounded border border-(--border) px-1 py-0.5 text-[10px]">⌘K</kbd>
      </button>

      {/* Dialog */}
      {open && (
        <div className="fixed inset-0 z-[100]">
          <div className="absolute inset-0 bg-(--background)/60 backdrop-blur-sm" onClick={close} />
          <div className="relative mx-auto mt-[min(20vh,120px)] w-full max-w-lg px-4">
            <div
              className="overflow-hidden rounded-xl border border-(--border) bg-(--card)"
              style={{ boxShadow: "var(--shadow-lg)" }}
            >
              <div className="flex items-center gap-3 border-b border-(--border) px-4">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="shrink-0 text-(--muted-foreground)">
                  <circle cx="7" cy="7" r="5" />
                  <line x1="11" y1="11" x2="14" y2="14" />
                </svg>
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search components, patterns, resources..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="h-12 flex-1 bg-transparent text-sm outline-none placeholder:text-(--muted-foreground)"
                />
                <kbd className="hidden rounded border border-(--border) px-1.5 py-0.5 text-[10px] text-(--muted-foreground) sm:inline">
                  ESC
                </kbd>
              </div>

              <div className="max-h-[50vh] overflow-y-auto p-2">
                {filtered.length === 0 ? (
                  <div className="px-3 py-8 text-center text-sm text-(--muted-foreground)">
                    No results found.
                  </div>
                ) : (
                  <ul>
                    {filtered.map((item, i) => (
                      <li key={item.href}>
                        <button
                          type="button"
                          onClick={() => navigate(item.href)}
                          onMouseEnter={() => setActiveIndex(i)}
                          className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                            i === activeIndex ? "bg-(--muted)" : ""
                          }`}
                        >
                          <span className="flex-1">
                            <span className="font-medium">{item.title}</span>
                            {item.description && (
                              <span className="mt-0.5 block text-xs text-(--muted-foreground) line-clamp-1">
                                {item.description}
                              </span>
                            )}
                          </span>
                          <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${typeColors[item.type] ?? ""}`}>
                            {item.type}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="border-t border-(--border) px-4 py-2 text-[11px] text-(--muted-foreground)">
                <span className="mr-3">↑↓ navigate</span>
                <span className="mr-3">↵ open</span>
                <span>esc close</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
