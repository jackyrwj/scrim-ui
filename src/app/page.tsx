import Link from "next/link";
import { components, patterns } from "@/lib/registry";
import { resources } from "@/lib/resources";
import { inspirationEntries } from "@/lib/inspiration";
import { featuredTools, toolLabel } from "@/lib/tools";
import { BrandIcon } from "@/components/brands/brand-icon";
import { AnimateOnScroll, StaggerChildren } from "@/components/site/animate-on-scroll";
import { ToolPreview } from "@/components/site/tool-preview";
import { ComponentPreview } from "@/components/site/component-preview";
import { HeroShowcase } from "@/components/site/hero-showcase";
import { PatternPreview } from "@/components/site/pattern-preview";
import { IconCard } from "@/components/icons/icon-card";
import { createElement } from "react";
import { patternIconFor } from "@/lib/icons";
import { iconGuide } from "@/lib/icon-guide";

/* One icon per idea the site is about, spread across categories so the row
   reads as a map rather than a sample of one corner. */
const FEATURED_ICONS = [
  "Streaming",
  "Tool call",
  "Reasoning",
  "Citation",
  "Approval gate",
  "Context window",
];

export default function Home() {
  const published = components.filter((c) => c.status === "published");
  const totalVariants = published.reduce((sum, c) => sum + c.variants.length, 0);
  const featuredResources = resources.filter((r) =>
    ["Vercel AI SDK", "assistant-ui", "v0"].includes(r.name),
  );
  const popular = published.filter((c) =>
    ["prompt-input", "streaming-message", "user-message", "markdown-message", "tool-call", "code-execution"].includes(c.slug),
  );
  const featuredIcons = FEATURED_ICONS.map((concept) => {
    const entry = iconGuide.find((e) => e.concept === concept);
    if (!entry) throw new Error(`Homepage features an icon concept that no longer exists: ${concept}`);
    return entry;
  });
  const componentName = (slug: string) => components.find((c) => c.slug === slug)?.name ?? slug;
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
        <div className="relative mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
          <div className="mx-auto max-w-3xl text-center">
            <h1
              className="text-3xl font-bold tracking-tight sm:text-5xl"
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
            <p className="mt-4 text-base leading-7 text-(--muted-foreground) sm:text-xl sm:leading-8">
              Free in-browser tools and copy-ready components for building AI interfaces —
              prompt inputs, agent states, tool calls, citations, reasoning, voice and memory.
            </p>
          </div>

          {/* The main event: a live, scripted tour of three real tools.
              Wider than the prose above it — it is the thing being read. */}
          <div className="-mx-1 mt-8 sm:mx-[-3rem] sm:mt-10 lg:mx-[-4.5rem]">
            <HeroShowcase />
          </div>

          {/* Stats, kept to a single quiet line so they don't compete */}
          <p className="mt-8 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm text-(--muted-foreground)">
            {stats.map((s, i) => (
              <span key={s.label} className="inline-flex items-center gap-3">
                {i > 0 && <span aria-hidden>·</span>}
                <span>
                  <span className="font-semibold text-(--foreground)">{s.value}</span> {s.label.toLowerCase()}
                </span>
              </span>
            ))}
          </p>
        </div>
      </section>

      {/* Tools */}
      <section className="bg-(--muted)/30">
        <AnimateOnScroll className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Tools</h2>
              <p className="mt-2 text-(--muted-foreground)">
                Free, in-browser tools for designing AI interfaces.
              </p>
            </div>
            <Link href="/tools" className="shrink-0 whitespace-nowrap text-sm text-(--muted-foreground) hover:text-(--foreground)">
              View all →
            </Link>
          </div>
          <StaggerChildren className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featuredTools.map((tool) => (
              <Link
                key={tool.slug}
                href={`/tools/${tool.slug}`}
                className="aos-stagger-item group flex flex-col overflow-hidden rounded-2xl border border-(--border) bg-(--card) transition-all duration-300 hover:-translate-y-1 hover:border-(--primary)/40"
                style={{ boxShadow: "var(--shadow-sm)" }}
              >
                <ToolPreview slug={tool.slug} />
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold group-hover:underline">{toolLabel(tool)}</span>
                    {tool.isNew && (
                      <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[11px] font-medium text-violet-700 dark:bg-violet-900/40 dark:text-violet-400">
                        New
                      </span>
                    )}
                  </div>
                  <p className="mt-1.5 flex-1 text-sm leading-6 text-(--muted-foreground)">
                    {tool.tagline}
                  </p>
                  <span
                    className="mt-4 inline-flex items-center gap-1 text-sm font-medium"
                    style={{ color: "var(--primary)" }}
                  >
                    {tool.cta ?? "Open tool"}{" "}
                    <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
                      →
                    </span>
                  </span>
                </div>
              </Link>
            ))}
          </StaggerChildren>
        </AnimateOnScroll>
      </section>

      {/* Popular components */}
      <section className="border-b border-(--border)">
        <AnimateOnScroll className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-2xl font-semibold tracking-tight">Components</h2>
            <Link href="/components" className="shrink-0 whitespace-nowrap text-sm text-(--muted-foreground) hover:text-(--foreground)">
              View all →
            </Link>
          </div>
          <StaggerChildren className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {popular.map((c) => (
              <Link
                key={c.slug}
                href={c.status === "published" ? `/components/${c.slug}` : "/components"}
                className="aos-stagger-item group flex flex-col overflow-hidden rounded-xl border border-(--border) bg-(--card) transition-all hover:-translate-y-0.5 hover:border-(--primary)/30"
                style={{ boxShadow: "var(--shadow-sm)" }}
              >
                <ComponentPreview slug={c.slug} />
                <div className="flex flex-1 flex-col p-5">
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
                </div>
              </Link>
            ))}
          </StaggerChildren>
        </AnimateOnScroll>
      </section>

      {/* Patterns */}
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "var(--gradient-subtle)" }}
        />
        <AnimateOnScroll className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Patterns</h2>
              <p className="mt-2 text-(--muted-foreground)">
                Complete, remix-ready interfaces — not just single components.
              </p>
            </div>
            <Link href="/patterns" className="shrink-0 whitespace-nowrap text-sm text-(--muted-foreground) hover:text-(--foreground)">
              View all →
            </Link>
          </div>
          {/* Same rendered tile as /patterns. A pattern is a layout, and the
              layout is the thing you are choosing between — a text card made
              five whole screens look interchangeable. */}
          <StaggerChildren className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {patterns.map((p) => (
              <Link
                key={p.slug}
                href={`/patterns/${p.slug}`}
                className="aos-stagger-item group flex flex-col overflow-hidden rounded-xl border border-(--border) bg-(--card) transition-all hover:-translate-y-0.5 hover:border-(--primary)/30"
                style={{ boxShadow: "var(--shadow-sm)" }}
              >
                <PatternPreview slug={p.slug} />
                <div className="flex flex-1 flex-col p-5">
                  <span className="flex items-center gap-2">
                    {createElement(patternIconFor(p.slug), {
                      size: 15,
                      strokeWidth: 1.75,
                      "aria-hidden": true,
                      className:
                        "shrink-0 text-(--muted-foreground) transition-colors group-hover:text-(--primary)",
                    })}
                    <span className="font-medium group-hover:underline">{p.name}</span>
                  </span>
                  <p className="mt-1.5 text-sm leading-6 text-(--muted-foreground)">
                    {p.description}
                  </p>
                </div>
              </Link>
            ))}
          </StaggerChildren>
        </AnimateOnScroll>
      </section>

      {/* Icons */}
      <section className="bg-(--muted)/30">
        <AnimateOnScroll className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Icons</h2>
              <p className="mt-2 text-(--muted-foreground)">
                One Lucide icon picked per AI concept — copy the SVG, the JSX, or the file.
              </p>
            </div>
            <Link href="/icons" className="shrink-0 whitespace-nowrap text-sm text-(--muted-foreground) hover:text-(--foreground)">
              View all →
            </Link>
          </div>
          {/* The real card from /icons, buttons and all: an icon you cannot
              copy is just decoration, and the copy is the whole offer. */}
          <StaggerChildren className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {featuredIcons.map((e) => (
              // grid, not block: stretches the card to the row height so the
              // copy row sits on the same line across the grid.
              <div key={e.concept} className="aos-stagger-item grid">
                <IconCard
                  concept={e.concept}
                  meaning={e.meaning}
                  name={e.icon.displayName ?? "Icon"}
                  components={e.components.map((slug) => ({ slug, name: componentName(slug) }))}
                >
                  {createElement(e.icon, { size: 22, strokeWidth: 2, "aria-hidden": true })}
                </IconCard>
              </div>
            ))}
          </StaggerChildren>
        </AnimateOnScroll>
      </section>

      {/* Resources */}
      <section className="border-b border-(--border)">
        <AnimateOnScroll className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Resources</h2>
              <p className="mt-2 text-(--muted-foreground)">
                A curated directory of libraries, generators and guides for building AI interfaces.
              </p>
            </div>
            <Link href="/resources" className="shrink-0 whitespace-nowrap text-sm text-(--muted-foreground) hover:text-(--foreground)">
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
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Inspiration</h2>
              <p className="mt-2 text-(--muted-foreground)">
                Product breakdowns and decision guides for AI interfaces — grounded in
                official docs, with a live demo of each pattern you can copy.
              </p>
            </div>
            <Link
              href="/inspiration"
              className="shrink-0 whitespace-nowrap text-sm text-(--muted-foreground) hover:text-(--foreground)"
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
