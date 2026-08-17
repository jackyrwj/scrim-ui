import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getInspirationEntry, inspirationEntries } from "@/lib/inspiration";
import { components } from "@/lib/registry";
import { pageConfigs } from "@/showcase/registry";
import { BrandIcon } from "@/components/brands/brand-icon";
import { PreviewFrame } from "@/components/component-page/preview-frame";

type Props = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return inspirationEntries.map((entry) => ({ slug: entry.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const entry = getInspirationEntry(slug);
  if (!entry) return { title: "Inspiration" };
  return {
    title: entry.product
      ? `${entry.product} UI patterns — Inspiration | AI UI Resources`
      : `${entry.title} — Guide | AI UI Resources`,
    description: entry.summary,
  };
}

export default async function InspirationArticlePage({ params }: Props) {
  const { slug } = await params;
  const entry = getInspirationEntry(slug);
  if (!entry) notFound();

  const linkedComponents = entry.componentSlugs
    .map((cslug) => components.find((c) => c.slug === cslug))
    .filter((c): c is NonNullable<typeof c> => Boolean(c));

  return (
    <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-(--muted-foreground)">
        <Link href="/inspiration" className="transition-colors hover:text-(--foreground)">
          Inspiration
        </Link>
        <span aria-hidden>/</span>
        <span>{entry.product ?? "Guide"}</span>
      </nav>

      <header className="mt-6">
        {entry.kind === "guide" && (
          <span className="inline-flex rounded-full border border-(--border) px-2 py-0.5 text-[11px] font-medium text-(--muted-foreground)">
            Decision guide
          </span>
        )}
        <h1 className="mt-1 flex items-center gap-3 text-3xl font-bold tracking-tight sm:text-4xl">
          {entry.product ? (
            <>
              <BrandIcon name={entry.product} size={32} />
              <span>
                {entry.product}: {entry.title}
              </span>
            </>
          ) : (
            <span>{entry.title}</span>
          )}
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-7 text-(--muted-foreground)">
          {entry.summary}
        </p>
        {entry.disclaimer && (
          <p className="mt-4 max-w-2xl border-l-2 border-(--border) pl-3 text-xs leading-5 text-(--muted-foreground)">
            {entry.disclaimer}
          </p>
        )}
      </header>

      {/* Sections */}
      <div className="mt-12 space-y-12">
        {entry.sections.map((section, i) => {
          const demoConfig = section.elementSlug ? pageConfigs[section.elementSlug] : undefined;
          return (
            <section key={section.heading}>
              <div className="flex items-baseline gap-3">
                <span className="text-sm font-semibold text-(--muted-foreground)">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h2 className="text-xl font-semibold tracking-tight">{section.heading}</h2>
              </div>
              <ul className="mt-4 space-y-3">
                {section.points.map((point) => (
                  <li key={point} className="flex gap-3 text-[15px] leading-7 text-(--foreground)">
                    <span aria-hidden className="mt-[11px] h-1.5 w-1.5 shrink-0 rounded-full bg-(--muted-foreground)" />
                    {point}
                  </li>
                ))}
              </ul>
              {section.evidence && (
                <blockquote className="mt-5 rounded-r-lg border-l-2 border-(--foreground) bg-(--card) py-3 pl-4 pr-4">
                  <p className="text-sm leading-6 text-(--muted-foreground)">
                    “{section.evidence.quote}”
                  </p>
                  <a
                    href={section.evidence.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="mt-2 inline-block text-xs font-medium text-(--foreground) hover:underline"
                  >
                    Source: {section.evidence.sourceLabel} ↗
                  </a>
                </blockquote>
              )}
              {demoConfig && (
                <div className="mt-6">
                  <PreviewFrame
                    title={
                      entry.product
                        ? `Pattern in action — ${entry.product}`
                        : "Pattern in action"
                    }
                  >
                    {demoConfig.heroDemo}
                  </PreviewFrame>
                </div>
              )}
            </section>
          );
        })}
      </div>

      {/* Takeaways */}
      <section className="mt-14 rounded-xl border border-(--border) bg-(--card) p-6 sm:p-8">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-(--muted-foreground)">
          Design takeaways
        </h2>
        <ul className="mt-4 space-y-3">
          {entry.takeaways.map((takeaway) => (
            <li key={takeaway} className="flex gap-3 text-[15px] leading-7">
              <span aria-hidden className="mt-[11px] text-(--muted-foreground)">→</span>
              {takeaway}
            </li>
          ))}
        </ul>
      </section>

      {/* Sources */}
      {entry.sources && entry.sources.length > 0 && (
        <section className="mt-14">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-(--muted-foreground)">
            Sources
          </h2>
          <ol className="mt-4 space-y-2">
            {entry.sources.map((s, i) => (
              <li key={s.url} className="text-sm leading-6">
                <span className="text-(--muted-foreground)">
                  {String(i + 1).padStart(2, "0")}.{" "}
                </span>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-(--foreground) hover:underline"
                >
                  {s.label} ↗
                </a>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* Component loop */}
      {linkedComponents.length > 0 && (
        <section className="mt-14">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-(--muted-foreground)">
            Build it with our components
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {linkedComponents.map((c) => (
              <Link
                key={c.slug}
                href={`/components/${c.slug}`}
                className="group rounded-xl border border-(--border) p-5 transition-colors hover:bg-(--muted)/60"
              >
                <span className="font-medium group-hover:underline">{c.name}</span>
                <p className="mt-1.5 line-clamp-2 text-sm text-(--muted-foreground)">
                  {c.description}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Footer nav */}
      <nav className="mt-14 flex items-center justify-between border-t border-(--border) pt-6 text-sm">
        <Link
          href="/inspiration"
          className="text-(--muted-foreground) transition-colors hover:text-(--foreground)"
        >
          ← All inspiration
        </Link>
        <Link
          href="/components"
          className="text-(--muted-foreground) transition-colors hover:text-(--foreground)"
        >
          Browse components →
        </Link>
      </nav>
    </div>
  );
}
