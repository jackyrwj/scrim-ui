import Link from "next/link";
import { categories, components, patterns } from "@/lib/registry";
import { resources } from "@/lib/resources";
import { inspirationEntries } from "@/lib/inspiration";
import { BrandIcon } from "@/components/brands/brand-icon";
import { DemoDefault } from "@/showcase/prompt-input/demos";
import { SurpriseMeButton } from "@/components/site/surprise-me-button";
import { AnimateOnScroll, StaggerChildren } from "@/components/site/animate-on-scroll";

const categoryIcons: Record<string, string> = {
  "prompt-input": "💬",
  messages: "✉️",
  reasoning: "🧠",
  "tool-calls": "🔧",
  sources: "📑",
  agents: "🤖",
  files: "📎",
  voice: "🎙️",
  memory: "💾",
  "model-settings": "⚙️",
};

export default function Home() {
  const published = components.filter((c) => c.status === "published");
  const totalVariants = published.reduce((sum, c) => sum + c.variants.length, 0);
  const featuredResources = resources.filter((r) =>
    ["Vercel AI SDK", "assistant-ui", "v0"].includes(r.name),
  );
  const popular = published.filter((c) =>
    ["prompt-input", "streaming-message", "user-message", "markdown-message", "tool-call", "code-execution"].includes(c.slug),
  );
  const recentlyAdded = [...published]
    .reverse()
    .slice(0, 6)
    .filter((c) => !popular.some((p) => p.slug === c.slug));
  const caseStudies = inspirationEntries.filter((e) => e.kind === "case-study");
  const guides = inspirationEntries.filter((e) => e.kind === "guide");

  const stats = [
    { value: `${published.length}+`, label: "Components" },
    { value: `${totalVariants}+`, label: "Variants" },
    { value: `${patterns.length}`, label: "Patterns" },
    { value: `${resources.length}+`, label: "Resources" },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-(--border)">
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "var(--gradient-glow)" }}
        />
        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <h1
              className="text-4xl font-bold tracking-tight sm:text-5xl"
              style={{
                background: "var(--gradient-primary)",
                backgroundSize: "200% auto",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                animation: "shimmer 6s linear infinite",
              }}
            >
              AI UI Resources
            </h1>
            <p className="mt-5 text-lg leading-8 text-(--muted-foreground) sm:text-xl">
              Beautiful UI patterns and components for AI products. Prompt inputs, agent states,
              tool calls, citations, reasoning, voice, memory and more.
            </p>

            {/* Stats */}
            <div className="mt-8 flex items-center justify-center gap-6 sm:gap-10">
              {stats.map((s) => (
                <div key={s.label} className="text-center">
                  <div className="text-2xl font-bold sm:text-3xl">{s.value}</div>
                  <div className="mt-0.5 text-xs text-(--muted-foreground) sm:text-sm">{s.label}</div>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="mt-8 flex items-center justify-center gap-3">
              <Link
                href="/components"
                className="inline-flex h-10 items-center rounded-lg px-5 text-sm font-medium text-(--primary-foreground) transition-all hover:opacity-90 active:scale-[0.98]"
                style={{ background: "var(--gradient-primary)" }}
              >
                Browse Components
              </Link>
              <Link
                href="/patterns"
                className="inline-flex h-10 items-center rounded-lg border border-(--border) px-5 text-sm font-medium transition-all hover:bg-(--primary-muted) hover:border-(--primary)/30 active:scale-[0.98]"
              >
                Explore Patterns
              </Link>
              <SurpriseMeButton slugs={published.map((c) => c.slug)} />
            </div>

            {/* Quick-start category pills */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              {categories.slice(0, 6).map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/categories/${cat.slug}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-(--border) px-3 py-1 text-xs font-medium transition-all hover:bg-(--primary-muted) hover:border-(--primary)/30"
                >
                  <span>{categoryIcons[cat.slug] ?? "📦"}</span>
                  {cat.name}
                </Link>
              ))}
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
      <section className="bg-(--muted)/30">
        <AnimateOnScroll className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
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
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Link
              href="/tools/chat-mockup"
              className="group flex flex-col justify-between gap-4 rounded-xl border border-(--border) bg-(--card) p-6 transition-all hover:-translate-y-0.5"
              style={{ boxShadow: "var(--shadow-md)" }}
            >
              <div>
                <span className="text-lg font-semibold group-hover:underline">
                  AI Chat Mockup Generator
                </span>
                <p className="mt-1.5 text-sm leading-6 text-(--muted-foreground)">
                  Compose a realistic AI chat screen — streaming, reasoning, tool calls, citations —
                  and export it as a PNG.
                </p>
              </div>
              <span className="inline-flex items-center gap-1 text-sm font-medium" style={{ color: "var(--primary)" }}>
                Open tool <span aria-hidden>→</span>
              </span>
            </Link>
            <Link
              href="/tools/voice-mockup"
              className="group flex flex-col justify-between gap-4 rounded-xl border-l-4 border border-(--border) bg-(--card) p-6 transition-all hover:-translate-y-0.5"
              style={{ borderLeftColor: "var(--primary)", boxShadow: "var(--shadow-md)" }}
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold group-hover:underline">
                    Voice Assistant Mockup Generator
                  </span>
                  <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[11px] font-medium text-violet-700 dark:bg-violet-900/40 dark:text-violet-400">
                    New
                  </span>
                </div>
                <p className="mt-1.5 text-sm leading-6 text-(--muted-foreground)">
                  Compose a realistic voice assistant screen — listening, thinking, speaking,
                  interrupted — and export it as a PNG.
                </p>
              </div>
              <span className="inline-flex items-center gap-1 text-sm font-medium" style={{ color: "var(--primary)" }}>
                Open tool <span aria-hidden>→</span>
              </span>
            </Link>
            <Link
              href="/tools/voice-scripts"
              className="group flex flex-col justify-between gap-4 rounded-xl border border-(--border) bg-(--card) p-6 transition-all hover:-translate-y-0.5"
              style={{ boxShadow: "var(--shadow-sm)" }}
            >
              <div>
                <span className="text-lg font-semibold group-hover:underline">
                  Voice Conversation Scripts
                </span>
                <p className="mt-1.5 text-sm leading-6 text-(--muted-foreground)">
                  Ready-made voice assistant transcripts for common scenarios. Load them into the
                  mockup generator or copy the text.
                </p>
              </div>
              <span className="inline-flex items-center gap-1 text-sm font-medium" style={{ color: "var(--primary)" }}>
                Browse scripts <span aria-hidden>→</span>
              </span>
            </Link>
          </div>
        </AnimateOnScroll>
      </section>

      {/* Popular components */}
      <section className="border-b border-(--border)">
        <AnimateOnScroll className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="flex items-end justify-between">
            <h2 className="text-2xl font-semibold tracking-tight">Popular Components</h2>
            <Link href="/components" className="text-sm text-(--muted-foreground) hover:text-(--foreground)">
              View all →
            </Link>
          </div>
          <StaggerChildren className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {popular.map((c) => (
              <Link
                key={c.slug}
                href={c.status === "published" ? `/components/${c.slug}` : "/components"}
                className="aos-stagger-item group rounded-xl border border-(--border) p-5 transition-all hover:-translate-y-0.5 hover:border-(--primary)/30"
                style={{ boxShadow: "var(--shadow-sm)" }}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium group-hover:underline">{c.name}</span>
                  <div className="flex items-center gap-1.5">
                    {c.variants.length > 1 && (
                      <span className="rounded-full bg-(--muted) px-2 py-0.5 text-[11px] text-(--muted-foreground)">
                        {c.variants.length} variants
                      </span>
                    )}
                    {c.status === "planned" && (
                      <span className="rounded-full bg-(--muted) px-2 py-0.5 text-[11px] text-(--muted-foreground)">
                        Soon
                      </span>
                    )}
                  </div>
                </div>
                <p className="mt-1.5 line-clamp-2 text-sm text-(--muted-foreground)">
                  {c.description}
                </p>
              </Link>
            ))}
          </StaggerChildren>
        </AnimateOnScroll>
      </section>

      {/* Browse by category */}
      <section className="bg-(--muted)/30">
        <AnimateOnScroll className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="text-2xl font-semibold tracking-tight">Browse by Category</h2>
          <StaggerChildren stagger={60} className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((cat) => {
              const count = components.filter(
                (c) => c.category === cat.slug && c.status === "published",
              ).length;
              const hasComponents = count > 0;
              const icon = categoryIcons[cat.slug] ?? "📦";
              const card = (
                <div
                  className={`rounded-xl border border-(--border) p-4 transition-all ${
                    hasComponents
                      ? "hover:-translate-y-0.5 hover:border-(--primary)/30"
                      : "opacity-60"
                  }`}
                  style={hasComponents ? { boxShadow: "var(--shadow-sm)" } : undefined}
                >
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm font-medium">
                      <span className="text-base">{icon}</span>
                      {cat.name}
                    </span>
                    {hasComponents ? (
                      <span className="rounded-full bg-(--primary-muted) px-2 py-0.5 text-[11px] font-medium" style={{ color: "var(--primary)" }}>
                        {count}
                      </span>
                    ) : (
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
                <Link key={cat.slug} href={`/categories/${cat.slug}`} className="aos-stagger-item block">
                  {card}
                </Link>
              ) : (
                <div key={cat.slug} className="aos-stagger-item">{card}</div>
              );
            })}
          </StaggerChildren>
        </AnimateOnScroll>
      </section>

      {/* Recently added */}
      {recentlyAdded.length > 0 && (
        <section className="border-b border-(--border)">
          <AnimateOnScroll className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
            <div className="flex items-end justify-between">
              <h2 className="text-2xl font-semibold tracking-tight">Recently Added</h2>
              <Link href="/components" className="text-sm text-(--muted-foreground) hover:text-(--foreground)">
                View all →
              </Link>
            </div>
            <StaggerChildren className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {recentlyAdded.map((c) => (
                <Link
                  key={c.slug}
                  href={`/components/${c.slug}`}
                  className="aos-stagger-item group rounded-xl border border-(--border) p-5 transition-all hover:-translate-y-0.5 hover:border-(--primary)/30"
                  style={{ boxShadow: "var(--shadow-sm)" }}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium group-hover:underline">{c.name}</span>
                    {c.variants.length > 1 && (
                      <span className="rounded-full bg-(--muted) px-2 py-0.5 text-[11px] text-(--muted-foreground)">
                        {c.variants.length} variants
                      </span>
                    )}
                  </div>
                  <p className="mt-1.5 line-clamp-2 text-sm text-(--muted-foreground)">{c.description}</p>
                </Link>
              ))}
            </StaggerChildren>
          </AnimateOnScroll>
        </section>
      )}

      {/* Patterns */}
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "var(--gradient-subtle)" }}
        />
        <AnimateOnScroll className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6">
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
          <StaggerChildren className="mt-8 grid gap-3 lg:grid-cols-3">
            {patterns.map((p) => (
              <Link
                key={p.slug}
                href={`/patterns/${p.slug}`}
                className="aos-stagger-item group rounded-xl border border-(--border) bg-(--card) p-5 transition-all hover:-translate-y-0.5 hover:border-(--primary)/30"
                style={{ boxShadow: "var(--shadow-sm)" }}
              >
                <span className="font-medium group-hover:underline">{p.name}</span>
                <p className="mt-1.5 text-sm text-(--muted-foreground)">{p.description}</p>
                <span className="mt-4 inline-block text-sm font-medium" style={{ color: "var(--primary)" }}>
                  Open pattern →
                </span>
              </Link>
            ))}
          </StaggerChildren>
        </AnimateOnScroll>
      </section>

      {/* Resources */}
      <section className="border-b border-(--border)">
        <AnimateOnScroll className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
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
                className="group rounded-xl border border-(--border) p-5 transition-all hover:-translate-y-0.5 hover:border-(--primary)/30"
                style={{ boxShadow: "var(--shadow-sm)" }}
              >
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2.5 font-medium group-hover:underline">
                    <BrandIcon name={r.name} />
                    {r.name}
                  </span>
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
        </AnimateOnScroll>
      </section>

      {/* Inspiration */}
      <section className="bg-(--muted)/30">
        <AnimateOnScroll className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Inspiration</h2>
              <p className="mt-2 text-(--muted-foreground)">
                Product breakdowns and decision guides for AI interfaces — grounded in
                official docs, with a live demo of each pattern you can copy.
              </p>
            </div>
            <Link
              href="/inspiration"
              className="text-sm text-(--muted-foreground) hover:text-(--foreground)"
            >
              View all →
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            {caseStudies.map((entry) => (
              <Link
                key={entry.slug}
                href={`/inspiration/${entry.slug}`}
                className="inline-flex items-center gap-2 rounded-full border border-(--border) px-4 py-2 text-sm transition-all hover:border-(--primary)/30 hover:bg-(--primary-muted) hover:scale-[1.02]"
              >
                <BrandIcon name={entry.product ?? ""} size={16} />
                {entry.product}
                <span aria-hidden>→</span>
              </Link>
            ))}
          </div>

          {guides.length > 0 && (
            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {guides.map((entry) => (
                <Link
                  key={entry.slug}
                  href={`/inspiration/${entry.slug}`}
                  className="group rounded-xl border border-(--border) bg-(--card) p-5 transition-all hover:-translate-y-0.5 hover:border-(--primary)/30"
                  style={{ boxShadow: "var(--shadow-sm)" }}
                >
                  <span className="inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium" style={{ background: "var(--primary-muted)", color: "var(--primary)" }}>
                    Guide
                  </span>
                  <span className="mt-2 block font-medium group-hover:underline">
                    {entry.title}
                  </span>
                  <p className="mt-1.5 line-clamp-2 text-sm text-(--muted-foreground)">
                    {entry.summary}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </AnimateOnScroll>
      </section>
    </div>
  );
}
