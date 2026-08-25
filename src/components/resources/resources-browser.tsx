"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import type { ResourceCategory, ResourceEntry } from "@/lib/resources";
import { ResourceCard } from "./resource-card";

export function ResourcesBrowser({
  entries,
  categories,
}: {
  entries: ResourceEntry[];
  categories: ResourceCategory[];
}) {
  /** `?category=…` — kept so /resources/category/<slug> pages and the
   *  "browse all" footer come back on. Only used as the initial selection;
   *  clicking a filter afterwards does not rewrite the URL. */
  const requested = useSearchParams().get("category");
  const [active, setActive] = React.useState<string>(() =>
    requested && categories.some((c) => c.slug === requested) ? requested : "all",
  );
  const [query, setQuery] = React.useState("");

  const filtered = entries.filter((e) => {
    const inCategory = active === "all" || e.category === active;
    const q = query.trim().toLowerCase();
    const matchesQuery =
      q.length === 0 ||
      e.name.toLowerCase().includes(q) ||
      e.description.toLowerCase().includes(q) ||
      e.notes.toLowerCase().includes(q) ||
      e.tags.some((t) => t.toLowerCase().includes(q));
    return inCategory && matchesQuery;
  });

  return (
    <div>
      {/* Controls */}
      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setActive("all")}
            aria-pressed={active === "all"}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              active === "all"
                ? "bg-(--foreground) text-(--background)"
                : "text-(--muted-foreground) hover:bg-(--muted) hover:text-(--foreground)"
            }`}
          >
            All · {entries.length}
          </button>
          {categories.map((cat) => {
            const count = entries.filter((e) => e.category === cat.slug).length;
            return (
              <button
                key={cat.slug}
                type="button"
                onClick={() => setActive(cat.slug)}
                aria-pressed={active === cat.slug}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  active === cat.slug
                    ? "bg-(--foreground) text-(--background)"
                    : "text-(--muted-foreground) hover:bg-(--muted) hover:text-(--foreground)"
                }`}
              >
                {cat.name} · {count}
              </button>
            );
          })}
        </div>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter resources…"
          aria-label="Filter resources"
          className="w-full rounded-lg border border-(--border) bg-(--background) px-3 py-2 text-sm outline-none transition-colors focus:border-(--foreground) sm:w-64"
        />
      </div>

      {/* Results */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((entry) => (
          <ResourceCard key={entry.url} entry={entry} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="mt-6 rounded-xl border border-dashed border-(--border) p-10 text-center">
          <p className="text-sm font-medium">No resources match your filter</p>
          <p className="mt-1 text-sm text-(--muted-foreground)">
            Try a different category or clear the search.
          </p>
        </div>
      )}
    </div>
  );
}
