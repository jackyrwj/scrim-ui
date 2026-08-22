"use client";

import * as React from "react";
import Link from "next/link";
import { voiceScripts, voiceScriptCategories } from "@/lib/voice-scripts";
import { inputCls } from "@/components/tools/tool-ui";
import { VoiceScriptCard } from "./voice-script-card";

export function VoiceScripts() {
  const [active, setActive] = React.useState<string>("all");
  const [query, setQuery] = React.useState("");

  const filtered = voiceScripts.filter((script) => {
    const inCategory = active === "all" || script.category === active;
    const q = query.trim().toLowerCase();
    const matchesQuery =
      q.length === 0 ||
      script.name.toLowerCase().includes(q) ||
      script.description.toLowerCase().includes(q) ||
      script.tags.some((t) => t.toLowerCase().includes(q));
    return inCategory && matchesQuery;
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Voice Conversation Script Library
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-(--muted-foreground)">
            Ready-made voice assistant transcripts for common scenarios. Load one into the
            mockup generator, copy the text, or use it as a starting point for your own
            interface.
          </p>
        </div>
        <Link
          href="/tools/voice-mockup"
          className="text-sm text-(--muted-foreground) hover:text-(--foreground)"
        >
          ← Back to mockup
        </Link>
      </div>

      {/* Filters */}
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
            All · {voiceScripts.length}
          </button>
          {voiceScriptCategories.map((cat) => {
            const count = voiceScripts.filter((s) => s.category === cat.slug).length;
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
          placeholder="Filter scripts…"
          aria-label="Filter scripts"
          className={`${inputCls} w-full sm:w-64`}
        />
      </div>

      {/* Grid */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((script) => (
          <VoiceScriptCard
            key={script.slug}
            script={script}
            category={voiceScriptCategories.find((c) => c.slug === script.category)}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="mt-6 rounded-xl border border-dashed border-(--border) p-10 text-center">
          <p className="text-sm font-medium">No scripts match your filter</p>
          <p className="mt-1 text-sm text-(--muted-foreground)">
            Try a different category or clear the search.
          </p>
        </div>
      )}
    </div>
  );
}
