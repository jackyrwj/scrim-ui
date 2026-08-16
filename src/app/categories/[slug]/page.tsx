import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { categories, components, patterns, getCategory } from "@/lib/registry";

export function generateStaticParams() {
  return categories.map((c) => ({ slug: c.slug }));
}

export function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  return params.then(({ slug }) => {
    const cat = getCategory(slug);
    if (!cat) return {};
    return {
      title: `${cat.name} UI Components`,
      description: `${cat.description} Copy-ready React + Tailwind components with live previews and zero dependencies.`,
    };
  });
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const cat = getCategory(slug);
  if (!cat) notFound();

  const published = components.filter((c) => c.category === cat.slug && c.status === "published");
  const planned = components.filter((c) => c.category === cat.slug && c.status === "planned");
  const relatedPatterns = patterns.filter((p) =>
    p.elements.some((el) => published.some((c) => c.slug === el)),
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-(--muted-foreground)">
        <Link href="/categories" className="hover:text-(--foreground)">Categories</Link>
        <span className="mx-2">/</span>
        <span className="text-(--foreground)">{cat.name}</span>
      </nav>

      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{cat.name}</h1>
      <p className="mt-3 max-w-2xl text-lg text-(--muted-foreground)">{cat.description}</p>

      {/* Published components */}
      <section className="mt-12">
        <div className="flex items-end justify-between">
          <h2 className="text-xl font-semibold tracking-tight">Components</h2>
          <span className="text-sm text-(--muted-foreground)">
            {published.length} {published.length === 1 ? "component" : "components"} available
          </span>
        </div>

        {published.length > 0 ? (
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {published.map((c) => (
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
        ) : (
          <div className="mt-5 rounded-xl border border-dashed border-(--border) p-10 text-center">
            <p className="text-sm font-medium">Coming soon</p>
            <p className="mt-1 text-sm text-(--muted-foreground)">
              Components in this category are on the roadmap and will appear here.
            </p>
          </div>
        )}
      </section>

      {/* Planned (roadmap) */}
      {planned.length > 0 && (
        <section className="mt-14">
          <h2 className="text-xl font-semibold tracking-tight">Coming soon</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {planned.map((c) => (
              <div
                key={c.slug}
                className="rounded-xl border border-dashed border-(--border) p-5 opacity-70"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{c.name}</span>
                  <span className="rounded-full bg-(--muted) px-2 py-0.5 text-[11px] text-(--muted-foreground)">
                    Soon
                  </span>
                </div>
                <p className="mt-1.5 line-clamp-2 text-sm text-(--muted-foreground)">
                  {c.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Patterns built from this category */}
      {relatedPatterns.length > 0 && (
        <section className="mt-14 border-t border-(--border) pt-10">
          <h2 className="text-xl font-semibold tracking-tight">Patterns using {cat.name}</h2>
          <p className="mt-1 text-sm text-(--muted-foreground)">
            Complete interfaces composed from these components.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {relatedPatterns.map((p) => (
              <Link
                key={p.slug}
                href={`/patterns/${p.slug}`}
                className="group rounded-xl border border-(--border) p-5 transition-colors hover:bg-(--muted)/60"
              >
                <span className="font-medium group-hover:underline">{p.name}</span>
                <p className="mt-1.5 line-clamp-2 text-sm text-(--muted-foreground)">
                  {p.description}
                </p>
                <span className="mt-4 inline-block text-sm font-medium text-(--foreground)">
                  Open pattern →
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
