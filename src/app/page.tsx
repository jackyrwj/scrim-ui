import Link from "next/link";
import { HeroTemplateCarousel } from "@/components/site/hero-template-carousel";
import { components, patterns } from "@/lib/registry";
import { aicssComponents } from "@/lib/aicss-catalog";
import { recreatedComponents } from "@/lib/recreated-catalog";
import { featuredTools } from "@/lib/tools";
import { GalleryCard } from "@/components/site/gallery-card";
import { PatternPreview } from "@/components/site/pattern-preview";
import { ToolCard } from "@/components/site/tool-card";

const popularSlugs = ["prompt-input", "streaming-message", "reasoning", "tool-call", "code-execution", "citation-ui"];

export default function Home() {
  const published = components.filter((component) => component.status === "published");
  return (
    <div>
      {/* Hero */}
      <section className="home-hero relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "var(--gradient-glow)" }}
        />
        <div className="relative mx-auto max-w-[1536px] px-4 pt-10 sm:px-6 sm:pt-16">
          {/* The headline balances inside the wide display measure. The
              paragraph under it keeps its own narrower reading measure. */}
          <div className="mx-auto max-w-5xl text-center">
            {/* A short outcome statement that covers both sides of the site:
                tools for designing the interface and code for building it. */}
            <h1 className="display-title display-title--hero relative z-10 pb-[0.12em] text-4xl leading-[1.12] font-semibold tracking-tight text-balance sm:text-5xl">
              Design and build better AI interfaces
            </h1>
            <p className="relative z-0 mx-auto mt-3 max-w-2xl text-balance text-base leading-7 text-(--muted-foreground) sm:text-xl sm:leading-8">
              React components, complete interface patterns, and practical tools for
              building modern AI products.
            </p>
          </div>
        </div>

        {/* The media strip deliberately escapes the prose container. Templates
            are visual proof, so they bleed to both viewport edges while the
            heading and controls keep the page's normal content margins. */}
        <div className="relative mt-8 pb-4 sm:mt-10 sm:pb-6">
          <HeroTemplateCarousel />
        </div>
      </section>

      <div id="components" className="site-container scroll-mt-24 pb-24">
        <div className="mb-10 flex flex-wrap items-center justify-between gap-3 border-b border-(--border) pb-5">
          <p className="text-sm font-medium text-(--foreground)">Explore components</p>
          <Link href="/components" className="text-xs text-(--muted-foreground) transition-colors hover:text-(--foreground)">{published.length + aicssComponents.length + recreatedComponents.length} components in the library ↗</Link>
        </div>
        <section>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {popularSlugs.map((slug) => published.find((component) => component.slug === slug)).filter((component) => component !== undefined).map((component) => (
              <GalleryCard key={component.slug} {...component} variants={component.variants.length} pro={component.tier === "pro"} />
            ))}
            {aicssComponents.filter((component) => ["orbs", "code-block", "file-diff"].includes(component.slug)).map((component) => (
              <GalleryCard key={component.slug} {...component} aicss />
            ))}
          </div>
        </section>

        <section className="mt-16">
          <SectionHeading title="Complete interface patterns" href="/patterns" label="All patterns" />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {patterns.slice(0, 3).map((pattern) => (
              <Link key={pattern.slug} href={`/patterns/${pattern.slug}`} className="gallery-card group">
                <PatternPreview slug={pattern.slug} />
                <div className="px-5 py-4"><h3 className="text-sm font-medium">{pattern.name}</h3><p className="mt-1 text-xs text-(--muted-foreground)">React + Tailwind</p></div>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <SectionHeading title="Tools for your workflow" href="/tools" label="All tools" />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{featuredTools.slice(0, 3).map((tool) => <ToolCard key={tool.slug} tool={tool} />)}</div>
        </section>

        <nav aria-label="More from Scrim UI" className="mt-16 grid gap-4 rounded-xl bg-(--stage) p-6 sm:grid-cols-4">
          {[
            { href: "/templates", label: "Templates", description: "Start with a complete app" },
            { href: "/icons", label: "Icons", description: "Find the right visual language" },
            { href: "/resources", label: "Resources", description: "Explore the AI ecosystem" },
            { href: "/inspiration", label: "Inspiration", description: "Learn from real interfaces" },
          ].map((item) => <Link key={item.href} href={item.href} className="rounded-lg p-2 transition-colors hover:bg-(--primary-muted)"><span className="text-sm font-medium">{item.label} ↗</span><p className="mt-2 text-xs leading-5 text-(--muted-foreground)">{item.description}</p></Link>)}
        </nav>
      </div>
    </div>
  );
}

function SectionHeading({ title, href, label }: { title: string; href: string; label: string }) {
  return <div className="mb-5 flex flex-wrap items-baseline justify-between gap-3"><h2 className="text-base font-medium tracking-[-0.01em]">{title}</h2><Link href={href} className="text-xs text-(--muted-foreground) transition-colors hover:text-(--foreground)">{label} ↗</Link></div>;
}
