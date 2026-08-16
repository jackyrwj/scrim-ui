import Link from "next/link";
import { categories, components, patterns } from "@/lib/registry";
import { resources } from "@/lib/resources";
import { DemoDefault } from "@/showcase/prompt-input/demos";

const inspiration = ["ChatGPT", "Claude", "Perplexity", "Cursor"];

export default function Home() {
  const published = components.filter((c) => c.status === "published");
  const featuredResources = resources.filter((r) =>
    ["Vercel AI SDK", "assistant-ui", "v0"].includes(r.name),
  );
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

      {/* Tools */}
      <section className="border-b border-(--border)">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Tools</h2>
              <p className="mt-2 text-(--muted-foreground)">
                Free, in-browser tools for designing AI interfaces.
              </p>
            </div>
            <Link href="/tools" className="text-sm text-(--muted-foreground) hover:text-(--foreground)">
              View all →
            </Link>
          </div>
          <Link
            href="/tools/chat-mockup"
            className="group mt-8 flex flex-col justify-between gap-4 rounded-xl border border-(--border) bg-(--card) p-6 transition-colors hover:bg-(--muted)/60 sm:flex-row sm:items-center"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold group-hover:underline">
                  AI Chat Mockup Generator
                </span>
                <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[11px] font-medium text-violet-700 dark:bg-violet-900/40 dark:text-violet-400">
                  New
                </span>
              </div>
              <p className="mt-1.5 max-w-xl text-sm leading-6 text-(--muted-foreground)">
                Compose a realistic AI chat screen — streaming, reasoning, tool calls, citations —
                and export it as a PNG for your landing page or deck. No signup, works in your
                browser.
              </p>
            </div>
            <span className="inline-flex shrink-0 items-center gap-1 text-sm font-medium">
              Open tool <span aria-hidden>→</span>
            </span>
          </Link>
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
            {categories.map((cat) => {
              const hasComponents = components.some(
                (c) => c.category === cat.slug && c.status === "published",
              );
              const card = (
                <div
                  className={`rounded-xl border border-(--border) p-4 transition-colors ${
                    hasComponents ? "hover:bg-(--muted)/60" : "opacity-60"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{cat.name}</span>
                    {!hasComponents && (
                      <span className="rounded-full bg-(--muted) px-2 py-0.5 text-[11px] text-(--muted-foreground)">
                        Soon
                      </span>
                    )}
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-(--muted-foreground)">
                    {cat.description}
                  </p>
                </div>
              );
              return hasComponents ? (
                <Link key={cat.slug} href={`/categories/${cat.slug}`} className="block">
                  {card}
                </Link>
              ) : (
                <div key={cat.slug}>{card}</div>
              );
            })}
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

      {/* Resources */}
      <section className="border-b border-(--border)">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Resources</h2>
              <p className="mt-2 text-(--muted-foreground)">
                A curated directory of libraries, generators and guides for building AI interfaces.
              </p>
            </div>
            <Link href="/resources" className="text-sm text-(--muted-foreground) hover:text-(--foreground)">
              View all →
            </Link>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {featuredResources.map((r) => (
              <a
                key={r.url}
                href={r.url}
                target="_blank"
                rel="noreferrer noopener"
                className="group rounded-xl border border-(--border) p-5 transition-colors hover:bg-(--muted)/60"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium group-hover:underline">{r.name}</span>
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
                    {r.free ? "Free" : "Paid"}
                  </span>
                </div>
                <p className="mt-1.5 line-clamp-2 text-sm text-(--muted-foreground)">
                  {r.description}
                </p>
              </a>
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
