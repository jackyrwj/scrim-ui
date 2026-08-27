import * as fs from "node:fs";
import * as path from "node:path";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { components, displayName, getComponent, getRelated } from "@/lib/registry";
import { getGuidesForComponent } from "@/lib/inspiration";
import { pageConfigs } from "@/showcase/registry";
import { CodeBlock } from "@/components/component-page/code-block";
import { ComponentExplorer } from "@/components/component-page/explorer";
import { InstallCommand } from "@/components/component-page/install-command";
import { JsonLd } from "@/components/site/json-ld";
import { ProBadge } from "@/components/pro/pro-badge";
import { ProSource } from "@/components/pro/pro-source";
import { getProComponentCatalog } from "@/lib/pro-catalog";
import { componentSchema } from "@/lib/structured-data";
import { SITE_URL } from "@/lib/site";

export function generateStaticParams() {
  return components.filter((c) => c.status === "published").map((c) => ({ slug: c.slug }));
}

export function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  return params.then(({ slug }) => {
    const entry = getComponent(slug);
    if (!entry) return {};
    return {
      /* searchTitle leads with the phrase a developer actually types; the
         generic pattern is the fallback for entries that have not been given
         one. The old pattern spent 26 of ~48 usable characters on
         "React + Tailwind Component" — boilerplate repeated on every page,
         which crowded out the words that distinguish them. */
      title: entry.searchTitle ?? `${displayName(entry)} — React + Tailwind Component`,
      description: entry.description,
    };
  });
}

function readShowcaseSource(slug: string, file: string): string {
  try {
    return fs.readFileSync(path.join(process.cwd(), "src", "showcase", slug, file), "utf8");
  } catch {
    return "// Source unavailable";
  }
}

export default async function ComponentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const entry = getComponent(slug);
  if (!entry || entry.status !== "published") notFound();

  const pro = entry.tier === "pro";
  const proCatalog = pro ? getProComponentCatalog(slug) : undefined;
  const config = pro ? undefined : pageConfigs[slug];
  if ((pro && !proCatalog) || (!pro && !config)) notFound();

  /* Free source is read from this public repository. Pro source is absent
     from the repository and arrives only through the entitlement-gated
     artifact route. */
  const source = pro ? null : readShowcaseSource(slug, config!.sourceFile);
  const usage = proCatalog?.usage ?? config?.usage ?? [];
  const mistakes = proCatalog?.mistakes ?? config?.mistakes ?? [];
  const related = getRelated(entry);
  const guides = getGuidesForComponent(entry.slug);
  /* Free items are prerendered flat files under /r; Pro items are served by
     the key-checked route instead, so the two never share a URL. */
  const registryUrl = `${SITE_URL}/r/${entry.slug}.json`;
  const proRegistryUrl = `${SITE_URL}/r/pro/${entry.slug}.json`;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <JsonLd data={componentSchema(entry)} />

      {/* Header */}
      <nav className="mb-6 text-sm text-(--muted-foreground)">
        <Link href="/components" className="hover:text-(--foreground)">Components</Link>
        <span className="mx-2">/</span>
        <span className="text-(--foreground)">{entry.name}</span>
      </nav>
      <h1 className="flex flex-wrap items-center gap-3 text-3xl font-bold tracking-tight sm:text-4xl">
        {displayName(entry)}
        {pro && <ProBadge className="translate-y-1" />}
      </h1>
      <p className="mt-3 max-w-2xl text-lg text-(--muted-foreground)">{entry.description}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {entry.tags.map((t) => (
          <span key={t} className="rounded-full border border-(--border) px-2.5 py-0.5 text-xs text-(--muted-foreground)">
            {t}
          </span>
        ))}
      </div>

      {/* The registry has served every published component at /r/<slug>.json
          since it was built, but nothing on the page said so — the only
          discoverable way to use a component was copying its source by hand.
          Placed above the preview, where the reader is still deciding
          whether to take the component at all. The Explorer renders its
          agent prompt card directly under the command — the same stack the
          pattern pages use: install, prompt, then the interactive surface
          (presets, controls, preview and generated code in one surface —
          see lib/component-controls.ts). */}
      <section className="mt-6 space-y-3">
        {!pro && <InstallCommand url={registryUrl} />}
        {pro ? (
          <div className="flex min-h-72 flex-col items-center justify-center rounded-xl border border-(--border) bg-(--muted)/30 px-6 text-center">
            <ProBadge />
            <h2 className="mt-4 text-lg font-semibold">The implementation stays private</h2>
            <p className="mt-2 max-w-lg text-sm leading-6 text-(--muted-foreground)">
              This public build contains the product description, API shape and production guidance,
              but not a second copy of the paid component. Pro members can inspect, copy and install
              the complete source below.
            </p>
          </div>
        ) : (
          <ComponentExplorer
            schema={config!.explorer.schema}
            render={config!.explorer.render}
            component={{
              name: displayName(entry),
              slug: entry.slug,
              description: entry.description,
              registryUrl,
              docsUrl: `${SITE_URL}/components/${entry.slug}`,
            }}
          />
        )}
      </section>

      {/* The component file itself, as opposed to the call site the Explorer
          shows. Both are code; naming them both "Code" made the second look
          like a repeat of the first. */}
      <section id="source" className="mt-14 scroll-mt-20">
        <h2 className="text-xl font-semibold tracking-tight">Component source</h2>
        <p className="mb-3 mt-1 text-sm text-(--muted-foreground)">
          {pro
            ? "Single-file React + Tailwind component, no dependencies. Included with Pro — the source and its install command unlock together."
            : "Single-file React + Tailwind component. No dependencies — drop it into any project with Tailwind configured."}
        </p>
        {source === null ? (
          <ProSource
            slug={entry.slug}
            lines={proCatalog?.lines ?? 0}
            registryUrl={proRegistryUrl}
          />
        ) : (
          <CodeBlock code={source} filename={config!.sourceFile} />
        )}
      </section>

      {/* Usage guidelines */}
      <section className="mt-14">
        <h2 className="text-xl font-semibold tracking-tight">When to use it</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-[15px] leading-7 text-(--muted-foreground)">
          {usage.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </section>

      {/* Common mistakes */}
      <section className="mt-14">
        <h2 className="text-xl font-semibold tracking-tight">What breaks in production</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-[15px] leading-7 text-(--muted-foreground)">
          {mistakes.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </section>

      {/* Up-links to decision guides. Guides link down via componentSlugs;
          this is the reverse edge, so a reader deciding WHETHER to use the
          component (not just how) has somewhere to go. */}
      {guides.length > 0 && (
        <section className="mt-14">
          <h2 className="text-xl font-semibold tracking-tight">Guides</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {guides.map((g) => (
              <Link
                key={g.slug}
                href={`/inspiration/${g.slug}`}
                className="group rounded-xl border border-(--border) p-4 transition-colors hover:bg-(--muted)/60"
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium group-hover:underline">{g.title}</span>
                  <span className="shrink-0 rounded-full bg-(--muted) px-2 py-0.5 text-[11px] text-(--muted-foreground)">
                    Guide
                  </span>
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-(--muted-foreground)">{g.summary}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Related */}
      <section className="mt-14 border-t border-(--border) pt-10">
        <h2 className="text-xl font-semibold tracking-tight">Related Components</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {related.map((r) => (
            <Link
              key={r.slug}
              href={r.status === "published" ? `/components/${r.slug}` : "/components"}
              className="group rounded-xl border border-(--border) p-4 transition-colors hover:bg-(--muted)/60"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium group-hover:underline">{r.name}</span>
                {r.status === "planned" && (
                  <span className="rounded-full bg-(--muted) px-2 py-0.5 text-[11px] text-(--muted-foreground)">
                    Soon
                  </span>
                )}
              </div>
              <p className="mt-1 line-clamp-2 text-sm text-(--muted-foreground)">{r.description}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
