import Link from "next/link";
import { components, patterns } from "@/lib/registry";
import { resources, resourceSlug } from "@/lib/resources";
import { inspirationEntries } from "@/lib/inspiration";
import { featuredTools, publishedTools } from "@/lib/tools";
import { ResourceCard } from "@/components/resources/resource-card";
import { previewPath } from "@/lib/previews";
import { InspirationCard } from "@/components/inspiration/entry-card";
import { AnimateOnScroll, StaggerChildren } from "@/components/site/animate-on-scroll";
import { ToolCard } from "@/components/site/tool-card";
import { ComponentPreview } from "@/components/site/component-preview";
import { AiChatDemo } from "@/components/templates/ai-chat-demo";
import { BrandIcon } from "@/components/brands/brand-icon";
import { MODEL_VENDORS } from "@/lib/model-vendors";
import { PatternPreview } from "@/components/site/pattern-preview";
import { IconCard } from "@/components/icons/icon-card";
import { createElement } from "react";
import { patternIconFor } from "@/lib/icons";
import { iconGuide, iconSlug } from "@/lib/icon-guide";
import { InstallCommand } from "@/components/component-page/install-command";
import { SITE_URL } from "@/lib/site";

/* One icon per idea the site is about, spread across categories so the row
   reads as a map rather than a sample of one corner. */
const FEATURED_ICONS = [
  "Streaming",
  "Tool call",
  "Reasoning",
  "Citation",
  "Approval gate",
  "Context window",
  "Web search",
  "Memory",
];

export default function Home() {
  const published = components.filter((c) => c.status === "published");
  /* Six, spread across what the directory covers: two chat-UI libraries, a
     headless kit, the component library everyone starts from, and the two
     generators people actually reach for. */
  const featuredResources = ["Vercel AI SDK", "assistant-ui", "CopilotKit", "shadcn/ui", "v0", "Lovable", "LangChain", "Cursor"].map(
    (name) => {
      const entry = resources.find((r) => r.name === name);
      if (!entry) throw new Error(`Homepage features a resource that is no longer listed: ${name}`);
      return entry;
    },
  );
  const popular = published.filter((c) =>
    ["prompt-input", "streaming-message", "user-message", "markdown-message", "tool-call", "code-execution", "reasoning", "citation-ui"].includes(c.slug),
  );
  const featuredIcons = FEATURED_ICONS.map((concept) => {
    const entry = iconGuide.find((e) => e.concept === concept);
    if (!entry) throw new Error(`Homepage features an icon concept that no longer exists: ${concept}`);
    return entry;
  });
  const componentName = (slug: string) => components.find((c) => c.slug === slug)?.name ?? slug;
  /* Case studies first: a breakdown of an app the reader already uses is the
     entry point, and the guides read better once you have seen one. */
  const featuredInspiration = [
    ...inspirationEntries.filter((e) => e.kind === "case-study"),
    ...inspirationEntries.filter((e) => e.kind !== "case-study"),
  ].slice(0, 8);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "var(--gradient-glow)" }}
        />
        <div className="relative mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
          {/* Wider than a reading measure, because the headline is one line
              from lg up and needs the room. The paragraph under it keeps its
              own narrower max-width — 1024px of prose is not readable. */}
          <div className="mx-auto max-w-5xl text-center">
            {/* States what this is, which is what every peer's headline does
                — twelve were checked and not one frames the reader as lacking
                something. "The UI layer your AI product is missing" made a
                claim about the visitor rather than about the product, and left
                a first-time reader still not knowing this is components. */}
            <h1 className="display-title display-title--hero text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
              The interface layer for AI products
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-(--muted-foreground) sm:text-xl sm:leading-8">
              Free in-browser tools and copy-ready components for AI interfaces —
              prompt inputs, agent states, tool calls and citations.
            </p>

            {/* Every peer's hero answers "how do I get it" with one command;
                this is ours. The same InstallCommand as on component pages, so
                the visitor's package-manager preference carries over. */}
            <div className="mx-auto mt-6 max-w-lg text-left">
              <InstallCommand url={`${SITE_URL}/r/all.json`} />
            </div>

            {/* The main event: a live, scripted tour of three real tools.
                Wider than the prose above it — it is the thing being read. */}
          </div>

          {/* The hero's proof is a real template, playing itself. The scripted
              tool tour this replaced animated controls at the visitor; this is
              the actual AI Chat template UI mounting the actual components it
              ships, on its own timeline. */}
          <div className="mx-auto mt-8 max-w-4xl sm:mt-10">
            <AiChatDemo caption={false} />
            <p className="mt-3 text-center text-xs leading-5 text-(--muted-foreground)">
              <Link href="/templates/ai-chat" className="font-medium text-(--foreground) underline-offset-4 hover:underline">
                AI Chat
              </Link>{" "}
              — the first Pro template, replaying one scripted turn (reasoning → tool call → answer).
            </p>
          </div>

        </div>
      </section>

      {/* Model vendors — recognition strip: the interface layer works with
          the models a product already uses, not a proprietary lineup. */}
      <section>
        <AnimateOnScroll className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
          <div className="flex flex-wrap items-center justify-center gap-x-9 gap-y-4">
            {MODEL_VENDORS.map((v) => (
              <span
                key={v.name}
                title={v.blurb}
                className="flex items-center gap-2 text-(--muted-foreground)"
              >
                {/* Brand color, not muted — the strip is for recognition, and
                    eight spaced marks read fine where fifty would not. */}
                <BrandIcon name={v.name} size={18} />
                <span className="text-sm font-medium">{v.name}</span>
              </span>
            ))}
          </div>
        </AnimateOnScroll>
      </section>

      {/* Tools */}
      <section className="bg-(--muted)/30">
        <AnimateOnScroll className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-14">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
            <div>
              <h2 className="display-title text-2xl font-semibold tracking-tight sm:text-3xl">Tools</h2>
              <p className="mt-2 text-(--muted-foreground)">
                Free, in-browser tools for designing AI interfaces.
              </p>
            </div>
            <Link href="/tools" className="shrink-0 whitespace-nowrap text-sm text-(--muted-foreground) hover:text-(--foreground)">
              All {publishedTools.length} tools →
            </Link>
          </div>
          <StaggerChildren className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featuredTools.map((tool) => (
              <div key={tool.slug} className="aos-stagger-item grid">
                <ToolCard tool={tool} />
              </div>
            ))}
          </StaggerChildren>
        </AnimateOnScroll>
      </section>

      {/* Popular components */}
      <section className="border-b border-(--border)">
        <AnimateOnScroll className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-14">
          <div className="flex items-end justify-between gap-4">
            <h2 className="display-title text-2xl font-semibold tracking-tight sm:text-3xl">Components</h2>
            <Link href="/components" className="shrink-0 whitespace-nowrap text-sm text-(--muted-foreground) hover:text-(--foreground)">
              All {published.length} components →
            </Link>
          </div>
          <StaggerChildren className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {popular.map((c) => (
              <Link
                key={c.slug}
                href={c.status === "published" ? `/components/${c.slug}` : "/components"}
                className="aos-stagger-item group flex flex-col overflow-hidden rounded-xl border border-(--border) bg-(--card) transition-all hover:-translate-y-0.5 hover:border-(--primary)/30"
                style={{ boxShadow: "var(--shadow-sm)" }}
              >
                <ComponentPreview slug={c.slug} />
                <div className="flex flex-1 flex-col p-4">
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
        <AnimateOnScroll className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-14">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
            <div>
              <h2 className="display-title text-2xl font-semibold tracking-tight sm:text-3xl">Patterns</h2>
              <p className="mt-2 text-(--muted-foreground)">
                Complete, remix-ready interfaces — not just single components.
              </p>
            </div>
            <Link href="/patterns" className="shrink-0 whitespace-nowrap text-sm text-(--muted-foreground) hover:text-(--foreground)">
              All {patterns.length} patterns →
            </Link>
          </div>
          {/* Same rendered tile as /patterns. A pattern is a layout, and the
              layout is the thing you are choosing between — a text card made
              five whole screens look interchangeable. */}
          <StaggerChildren className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {patterns.map((p) => (
              <Link
                key={p.slug}
                href={`/patterns/${p.slug}`}
                className="aos-stagger-item group flex flex-col overflow-hidden rounded-xl border border-(--border) bg-(--card) transition-all hover:-translate-y-0.5 hover:border-(--primary)/30"
                style={{ boxShadow: "var(--shadow-sm)" }}
              >
                <PatternPreview slug={p.slug} />
                <div className="flex flex-1 flex-col p-4">
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
        <AnimateOnScroll className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-14">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
            <div>
              <h2 className="display-title text-2xl font-semibold tracking-tight sm:text-3xl">Icons</h2>
              <p className="mt-2 text-(--muted-foreground)">
                One Lucide icon picked per AI concept — copy the SVG, the JSX, or the file.
              </p>
            </div>
            <Link href="/icons" className="shrink-0 whitespace-nowrap text-sm text-(--muted-foreground) hover:text-(--foreground)">
              All {iconGuide.length} icons →
            </Link>
          </div>
          {/* The real card from /icons, buttons and all: an icon you cannot
              copy is just decoration, and the copy is the whole offer. */}
          <StaggerChildren className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {featuredIcons.map((e) => (
              // grid, not block: stretches the card to the row height so the
              // copy row sits on the same line across the grid.
              <div key={e.concept} className="aos-stagger-item grid">
                <IconCard
                  concept={e.concept}
                  slug={iconSlug(e.concept)}
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
        <AnimateOnScroll className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-14">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
            <div>
              <h2 className="display-title text-2xl font-semibold tracking-tight sm:text-3xl">Resources</h2>
              <p className="mt-2 text-(--muted-foreground)">
                A curated directory of libraries, generators and guides for building AI interfaces.
              </p>
            </div>
            <Link href="/resources" className="shrink-0 whitespace-nowrap text-sm text-(--muted-foreground) hover:text-(--foreground)">
              All {resources.length} resources →
            </Link>
          </div>
          {/* The card from /resources, plus the captured screenshot the
              directory cannot afford to show 102 times. The badges, the
              "why we list it" line and the separate link to the official
              site are what make the entry judgeable rather than named. */}
          <StaggerChildren className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {featuredResources.map((r) => (
              // grid, not block: stretches the card to the row height.
              <div key={r.url} className="aos-stagger-item grid">
                <ResourceCard
                  entry={r}
                  headingLevel="h3"
                  preview={previewPath(resourceSlug(r.name))}
                  showNotes={false}
                />
              </div>
            ))}
          </StaggerChildren>
        </AnimateOnScroll>
      </section>

      {/* Inspiration */}
      <section className="bg-(--muted)/30">
        <AnimateOnScroll className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-14">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
            <div>
              <h2 className="display-title text-2xl font-semibold tracking-tight sm:text-3xl">Inspiration</h2>
              <p className="mt-2 text-(--muted-foreground)">
                Product breakdowns and decision guides for AI interfaces — grounded in
                official docs, with a live demo of each pattern you can copy.
              </p>
            </div>
            <Link
              href="/inspiration"
              className="shrink-0 whitespace-nowrap text-sm text-(--muted-foreground) hover:text-(--foreground)"
            >
              All {inspirationEntries.length} articles →
            </Link>
          </div>

          <StaggerChildren className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {featuredInspiration.map((entry) => (
              <div key={entry.slug} className="aos-stagger-item grid">
                <InspirationCard entry={entry} headingLevel="h3" />
              </div>
            ))}
          </StaggerChildren>
        </AnimateOnScroll>
      </section>

      {/* Close */}
      <section className="relative overflow-hidden border-t border-(--border)">
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "var(--gradient-glow)" }}
        />
        <AnimateOnScroll className="relative mx-auto max-w-2xl px-4 py-16 text-center sm:px-6 sm:py-20">
          <h2 className="display-title text-2xl font-semibold tracking-tight text-balance sm:text-4xl">
            Everything here is free and copy-ready
          </h2>
          <p className="mt-3 text-(--muted-foreground)">
            No signup, no install, no package to add. The tools run in your browser and the
            components are single files you paste into your own project.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/tools"
              className="inline-flex h-11 items-center rounded-lg px-6 text-sm font-medium text-(--primary-foreground) transition-all hover:opacity-90 active:scale-[0.98]"
              style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow)" }}
            >
              Open the tools
            </Link>
            <Link
              href="/components"
              className="inline-flex h-11 items-center rounded-lg border border-(--border) px-6 text-sm font-medium transition-all hover:border-(--primary)/40 hover:bg-(--primary-muted) active:scale-[0.98]"
            >
              Browse components
            </Link>
          </div>
        </AnimateOnScroll>
      </section>

    </div>
  );
}
