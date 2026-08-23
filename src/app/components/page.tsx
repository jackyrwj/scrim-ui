import { createElement } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { components, categories } from "@/lib/registry";
import { categoryIconFor, iconFor } from "@/lib/icons";

export const metadata: Metadata = {
  title: "Components",
  description:
    "Copy-ready UI components for AI products — prompt inputs, streaming messages, tool calls, citations, agent states and more.",
};

const published = () => components.filter((c) => c.status === "published").length;

/**
 * One row in the directory. Dense on purpose: an icon, a name, and nothing else,
 * so the whole library is scannable in a couple of screens rather than a scroll
 * through description cards. The description lives on the component's own page.
 *
 * The grid draws its rules with ring insets rather than per-cell borders, so
 * adjacent cells share a single hairline instead of doubling it up.
 */
function Row({
  slug,
  name,
  published: isPublished,
}: {
  slug: string;
  name: string;
  published: boolean;
}) {
  // createElement rather than `const Icon = iconFor(slug)`: the lookup returns a
  // stable module-scope reference, but react-hooks/static-components cannot tell
  // that from a component defined during render and rejects the JSX form.
  const inner = (
    <>
      {createElement(iconFor(slug), {
        size: 17,
        strokeWidth: 1.75,
        "aria-hidden": true,
        className:
          "shrink-0 text-(--muted-foreground) transition-colors group-hover:text-(--primary)",
      })}
      <span className="truncate">{name}</span>
      {!isPublished && (
        <span className="ml-auto shrink-0 rounded-full border border-(--border) px-1.5 py-px text-[10px] font-medium text-(--muted-foreground)">
          Soon
        </span>
      )}
    </>
  );

  const shell =
    "flex items-center gap-2.5 px-4 py-3.5 text-sm ring-1 ring-inset ring-(--border) transition-colors";

  return isPublished ? (
    <Link href={`/components/${slug}`} className={`group ${shell} hover:bg-(--muted)/60`}>
      {inner}
    </Link>
  ) : (
    <div className={`group ${shell} text-(--muted-foreground)`}>{inner}</div>
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

      <div className="mt-12 space-y-10">
        {categories.map((cat) => {
          const items = components.filter((c) => c.category === cat.slug);
          if (items.length === 0) return null;
          return (
            <section key={cat.slug}>
              <div className="mb-3 flex items-center gap-2">
                {createElement(categoryIconFor(cat.slug), {
                  size: 15,
                  strokeWidth: 1.75,
                  "aria-hidden": true,
                  className: "text-(--primary)",
                })}
                <h2 className="text-sm font-semibold tracking-tight">
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
              </div>
              {/* Two and four columns only, then pad to a multiple of four. A
                  multiple of four is also a multiple of two, so neither
                  breakpoint can leave a half-empty last row. */}
              <div className="grid grid-cols-2 overflow-hidden rounded-xl lg:grid-cols-4">
                {items.map((c) => (
                  <Row
                    key={c.slug}
                    slug={c.slug}
                    name={c.name}
                    published={c.status === "published"}
                  />
                ))}
                {Array.from({ length: (4 - (items.length % 4)) % 4 }, (_, i) => (
                  <div
                    key={`pad-${i}`}
                    aria-hidden
                    className="ring-1 ring-inset ring-(--border)"
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
