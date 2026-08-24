import { createElement } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { components, categories } from "@/lib/registry";
import { categoryIconFor, iconFor } from "@/lib/icons";
import { ComponentPreview } from "@/components/site/component-preview";

export const metadata: Metadata = {
  title: "Components",
  description:
    "Copy-ready UI components for AI products — prompt inputs, streaming messages, tool calls, citations, agent states and more.",
};

const published = () => components.filter((c) => c.status === "published").length;

/**
 * One component card: a static preview of the component's shape, then its
 * name — carrying the same Lucide mark the directory and the /icons page use
 * for that slug — and its one-line description.
 *
 * The preview is the reason this page stopped being a dense name list: a
 * library is browsed by recognising a shape, and a row of words makes you
 * click blind. The icon stays because it is the component's identity
 * everywhere else on the site, and it survives the preview being a small,
 * abstract, grey thing — at a glance the mark is what tells a Tool Call from
 * a Search Tool Call.
 *
 * `group` is load-bearing: component-previews.css keys every hover animation
 * off it, so an untouched page has exactly one animated region.
 */
function ComponentCard({
  slug,
  name,
  description,
  variants,
  published: isPublished,
}: {
  slug: string;
  name: string;
  description: string;
  variants: number;
  published: boolean;
}) {
  const body = (
    <>
      <ComponentPreview slug={slug} />
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center gap-2">
          {/* createElement rather than `const Icon = iconFor(slug)`: the lookup
              returns a stable module-scope reference, but
              react-hooks/static-components cannot tell that from a component
              defined during render and rejects the JSX form. */}
          {createElement(iconFor(slug), {
            size: 15,
            strokeWidth: 1.75,
            "aria-hidden": true,
            className:
              "shrink-0 text-(--muted-foreground) transition-colors group-hover:text-(--primary)",
          })}
          <span className="truncate text-sm font-medium group-hover:underline">{name}</span>
          {isPublished ? (
            variants > 1 && (
              <span className="ml-auto shrink-0 rounded-full bg-(--muted) px-2 py-0.5 text-[11px] text-(--muted-foreground)">
                {variants} variants
              </span>
            )
          ) : (
            <span className="ml-auto shrink-0 rounded-full bg-(--muted) px-2 py-0.5 text-[11px] text-(--muted-foreground)">
              Soon
            </span>
          )}
        </div>
        <p className="mt-1.5 line-clamp-2 text-[13px] leading-5 text-(--muted-foreground)">
          {description}
        </p>
      </div>
    </>
  );

  const shell =
    "group flex flex-col overflow-hidden rounded-xl border border-(--border) bg-(--card) transition-all";

  return isPublished ? (
    <Link
      href={`/components/${slug}`}
      className={`${shell} hover:-translate-y-0.5 hover:border-(--primary)/30`}
      style={{ boxShadow: "var(--shadow-sm)" }}
    >
      {body}
    </Link>
  ) : (
    <div className={`${shell} opacity-60`}>{body}</div>
  );
}

export default function ComponentsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <header className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
          {published()} AI UI Components
        </h1>
        <p className="mt-3 text-lg text-(--muted-foreground)">
          Every component has a live preview and copy-ready React + Tailwind source. No
          dependencies, no install.
        </p>
      </header>

      {/* Category jump bar. The page is ten screens of cards now rather than
          two of names, so the categories that used to be section labels also
          have to work as navigation. */}
      <nav aria-label="Jump to category" className="mt-10 flex flex-wrap justify-center gap-2">
        {categories.map((cat) => {
          const count = components.filter((c) => c.category === cat.slug).length;
          if (count === 0) return null;
          return (
            <a
              key={cat.slug}
              href={`#${cat.slug}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-(--border) px-3 py-1.5 text-[13px] text-(--muted-foreground) transition-colors hover:border-(--primary)/30 hover:text-(--foreground)"
            >
              {createElement(categoryIconFor(cat.slug), {
                size: 14,
                strokeWidth: 1.75,
                "aria-hidden": true,
                className: "text-(--primary)",
              })}
              {cat.name}
              <span className="tabular-nums opacity-70">{count}</span>
            </a>
          );
        })}
      </nav>

      <div className="mt-12 space-y-12">
        {categories.map((cat) => {
          const items = components.filter((c) => c.category === cat.slug);
          if (items.length === 0) return null;
          return (
            /* scroll-mt clears the sticky site header when the jump bar lands here. */
            <section key={cat.slug} id={cat.slug} className="scroll-mt-20">
              <div className="mb-4 flex items-center gap-2">
                {createElement(categoryIconFor(cat.slug), {
                  size: 16,
                  strokeWidth: 1.75,
                  "aria-hidden": true,
                  className: "text-(--primary)",
                })}
                <h2 className="text-base font-semibold tracking-tight">
                  <Link
                    href={`/categories/${cat.slug}`}
                    className="transition-colors hover:underline"
                  >
                    {cat.name}
                  </Link>
                </h2>
                <span className="text-xs tabular-nums text-(--muted-foreground)">
                  {items.length}
                </span>
                <p className="ml-2 hidden truncate text-[13px] text-(--muted-foreground) sm:block">
                  {cat.description}
                </p>
              </div>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((c) => (
                  <ComponentCard
                    key={c.slug}
                    slug={c.slug}
                    name={c.name}
                    description={c.description}
                    variants={c.variants.length}
                    published={c.status === "published"}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
