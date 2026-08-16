import Link from "next/link";
import { categories, components, patterns } from "@/lib/registry";
import { DemoDefault } from "@/showcase/prompt-input/demos";

const inspiration = ["ChatGPT", "Claude", "Perplexity", "Cursor"];

export default function Home() {
  const published = components.filter((c) => c.status === "published");
  const popular = published.filter((c) =>
    ["prompt-input", "streaming-message", "tool-call", "agent-status", "reasoning", "source-card"].includes(c.slug),
  );
  const recentlyAdded = [...published]
    .reverse()
    .slice(0, 6)
    .filter((c) => !popular.some((p) => p.slug === c.slug));

  return (
    <div>
      {/* Hero */}
      <section className="border-b border-(--border)">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              AI UI Resources
            </h1>
            <p className="mt-5 text-lg leading-8 text-(--muted-foreground) sm:text-xl">
              Beautiful UI patterns and components for AI products. Prompt inputs, agent states,
              tool calls, citations, reasoning, voice, memory and more.
            </p>
            <div className="mt-8 flex items-center justify-center gap-3">
              <Link
                href="/components"
                className="inline-flex h-10 items-center rounded-lg bg-(--foreground) px-5 text-sm font-medium text-(--background) transition-opacity hover:opacity-85"
              >
                Browse Components
              </Link>
              <Link
                href="/patterns"
                className="inline-flex h-10 items-center rounded-lg border border-(--border) px-5 text-sm font-medium transition-colors hover:bg-(--muted)"
              >
                Explore Patterns
              </Link>
            </div>
          </div>
          <div className="mx-auto mt-14 max-w-2xl">
            <DemoDefault />
            <p className="mt-3 text-center text-xs text-(--muted-foreground)">
              Every component on this site is live, interactive and copy-ready.
            </p>
          </div>
        </div>
      </section>

      {/* Popular components */}
      <section className="border-b border-(--border)">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="flex items-end justify-between">
            <h2 className="text-2xl font-semibold tracking-tight">Popular Components</h2>
            <Link href="/components" className="text-sm text-(--muted-foreground) hover:text-(--foreground)">
              View all →
            </Link>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {popular.map((c) => (
              <Link
                key={c.slug}
                href={c.status === "published" ? `/components/${c.slug}` : "/components"}
                className="group rounded-xl border border-(--border) p-5 transition-colors hover:bg-(--muted)/60"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium group-hover:underline">{c.name}</span>
                  {c.status === "planned" && (
                    <span className="rounded-full bg-(--muted) px-2 py-0.5 text-[11px] text-(--muted-foreground)">
                      Soon
                    </span>
                  )}
                </div>
                <p className="mt-1.5 line-clamp-2 text-sm text-(--muted-foreground)">
                  {c.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Browse by category */}
      <section className="border-b border-(--border)">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="text-2xl font-semibold tracking-tight">Browse by Category</h2>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href="/components"
                className="rounded-xl border border-(--border) p-4 transition-colors hover:bg-(--muted)/60"
              >
                <span className="text-sm font-medium">{cat.name}</span>
                <p className="mt-1 line-clamp-2 text-xs leading-5 text-(--muted-foreground)">
                  {cat.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Recently added */}
      {recentlyAdded.length > 0 && (
        <section className="border-b border-(--border)">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
            <div className="flex items-end justify-between">
              <h2 className="text-2xl font-semibold tracking-tight">Recently Added</h2>
              <Link href="/components" className="text-sm text-(--muted-foreground) hover:text-(--foreground)">
                View all →
              </Link>
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {recentlyAdded.map((c) => (
                <Link
                  key={c.slug}
                  href={`/components/${c.slug}`}
                  className="group rounded-xl border border-(--border) p-5 transition-colors hover:bg-(--muted)/60"
                >
                  <span className="font-medium group-hover:underline">{c.name}</span>
                  <p className="mt-1.5 line-clamp-2 text-sm text-(--muted-foreground)">{c.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Patterns */}
      <section className="border-b border-(--border)">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">AI Patterns</h2>
              <p className="mt-2 text-(--muted-foreground)">
                Complete, remix-ready interfaces — not just single components.
              </p>
            </div>
            <Link href="/patterns" className="text-sm text-(--muted-foreground) hover:text-(--foreground)">
              View all →
            </Link>
          </div>
          <div className="mt-8 grid gap-3 lg:grid-cols-3">
            {patterns.map((p) => (
              <Link
                key={p.slug}
                href={`/patterns/${p.slug}`}
                className="group rounded-xl border border-(--border) p-5 transition-colors hover:bg-(--muted)/60"
              >
                <span className="font-medium group-hover:underline">{p.name}</span>
                <p className="mt-1.5 text-sm text-(--muted-foreground)">{p.description}</p>
                <span className="mt-4 inline-block text-sm font-medium text-(--foreground)">
                  Open pattern →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Inspiration */}
      <section>
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="text-2xl font-semibold tracking-tight">Inspiration</h2>
          <p className="mt-2 text-(--muted-foreground)">
            UI pattern breakdowns of the products defining AI interfaces.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            {inspiration.map((name) => (
              <span
                key={name}
                className="inline-flex items-center gap-2 rounded-full border border-(--border) px-4 py-2 text-sm"
              >
                {name}
                <span className="text-xs text-(--muted-foreground)">soon</span>
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
