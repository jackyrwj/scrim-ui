"use client";

import * as React from "react";
import type { ResourceCategory, ResourceEntry } from "@/lib/resources";

function Badge({ tone, children }: { tone: "green" | "violet" | "neutral"; children: React.ReactNode }) {
  const toneCls = {
    green:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
    violet:
      "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-400",
    neutral: "bg-(--muted) text-(--muted-foreground)",
  }[tone];
  return (
    <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${toneCls}`}>
      {children}
    </span>
  );
}

function ResourceCard({ entry }: { entry: ResourceEntry }) {
  return (
    <article className="flex flex-col rounded-xl border border-(--border) p-5 transition-colors hover:border-(--muted-foreground)/50">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-medium leading-snug">
          <a
            href={entry.url}
            target="_blank"
            rel="noreferrer noopener"
            className="transition-colors hover:text-(--foreground) hover:underline"
          >
            {entry.name} <span aria-hidden>↗</span>
          </a>
        </h3>
        <div className="flex shrink-0 gap-1.5">
          <Badge tone={entry.free ? "green" : "neutral"}>
            {entry.free ? "Free" : "Paid"}
          </Badge>
          {entry.ai_native && <Badge tone="violet">AI-native</Badge>}
        </div>
      </div>
      <p className="mt-1.5 text-sm leading-6 text-(--muted-foreground)">{entry.description}</p>
      {entry.notes && (
        <p className="mt-2 text-sm leading-6">
          <span className="font-medium text-(--foreground)">Why we list it: </span>
          <span className="text-(--muted-foreground)">{entry.notes}</span>
        </p>
      )}
      {entry.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {entry.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-(--border) px-2 py-0.5 text-[11px] text-(--muted-foreground)"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
      <span className="mt-3 text-[11px] text-(--muted-foreground)">
        source: {entry.source}
      </span>
    </article>
  );
}

export function ResourcesBrowser({
  entries,
  categories,
}: {
  entries: ResourceEntry[];
  categories: ResourceCategory[];
}) {
  const [active, setActive] = React.useState<string>("all");
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
