import type { Metadata } from "next";
import { createElement } from "react";
import { iconGuide, iconSlug } from "@/lib/icon-guide";
import { categoryIconFor } from "@/lib/icons";
import { categories, components } from "@/lib/registry";
import { IconCard } from "@/components/icons/icon-card";

export const metadata: Metadata = {
  title: "Icon Guide for AI Interfaces",
  description:
    "Find the right Lucide icon for each AI interface concept, then copy it as SVG, JSX or a component file.",
};

const nameOf = (slug: string) => components.find((c) => c.slug === slug)?.name ?? slug;

export default function IconsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <header className="max-w-2xl">
        <h1 className="display-title text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          Icons
        </h1>
        <p className="mt-3 text-lg text-(--muted-foreground)">
          Find a clear, consistent Lucide icon for every AI action and state.
        </p>
      </header>

      <div className="mt-12 space-y-10">
        {categories.map((cat) => {
          const items = iconGuide.filter((e) => e.category === cat.slug);
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
                <h2 className="text-sm font-semibold tracking-tight">{cat.name}</h2>
                <span className="text-xs tabular-nums text-(--muted-foreground)">
                  {items.length}
                </span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((e) => (
                  <IconCard
                    key={e.concept}
                    concept={e.concept}
                    slug={iconSlug(e.concept)}
                    meaning={e.meaning}
                    name={e.icon.displayName ?? "Icon"}
                    components={e.components.map((slug) => ({ slug, name: nameOf(slug) }))}
                  >
                    {/* Lucide's own default weight, not the 1.75 used for UI
                        chrome elsewhere: here the icon is the thing on offer, so
                        what is shown must be what gets copied and downloaded. */}
                    {createElement(e.icon, {
                      size: 22,
                      strokeWidth: 2,
                      "aria-hidden": true,
                    })}
                  </IconCard>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
