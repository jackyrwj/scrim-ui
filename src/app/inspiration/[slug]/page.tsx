import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getInspirationEntry, inspirationEntries } from "@/lib/inspiration";
import { components } from "@/lib/registry";
import { pageConfigs } from "@/showcase/registry";
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
    title: `${entry.product} UI patterns — Inspiration | AI UI Resources`,
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
        <span>{entry.product}</span>
      </nav>

      <header className="mt-6">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {entry.product}: {entry.title}
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-7 text-(--muted-foreground)">
          {entry.summary}
        </p>
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
              {demoConfig && (
                <div className="mt-6">
                  <PreviewFrame title={`Pattern in action — ${entry.product}`}>
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
          ← All breakdowns
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
