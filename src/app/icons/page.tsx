import type { Metadata } from "next";
import { createElement } from "react";
import { iconGuide, iconSlug } from "@/lib/icon-guide";
import { categoryIconFor } from "@/lib/icons";
import { categories, components } from "@/lib/registry";
import { IconCard } from "@/components/icons/icon-card";

export const metadata: Metadata = {
  title: "AI Interface Icons",
  description:
    "Which icon to use for streaming, tool calls, approval gates, context windows and every other AI interface concept — mapped to Lucide, with copy and download for each.",
};

const nameOf = (slug: string) => components.find((c) => c.slug === slug)?.name ?? slug;

export default function IconsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <header className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
          {iconGuide.length} AI Interface Icons
        </h1>
        <p className="mt-3 text-lg text-(--muted-foreground)">
          Lucide ships 2,034 icons and no opinion about which one means &ldquo;tool call&rdquo;.
          This is that opinion — one icon picked per concept, with the components that use it.
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

      <footer className="mt-14 border-t border-(--border) pt-6 text-sm text-(--muted-foreground)">
        <p className="max-w-2xl">
          Icons are from{" "}
          <a
            href="https://lucide.dev"
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-2 transition-colors hover:text-(--foreground)"
          >
            Lucide
          </a>
          , used and redistributed under the ISC licence: copyright &copy; Lucide Contributors,
          permission to use, copy, modify and distribute granted provided the copyright notice and
          this permission notice appear in all copies. The pairing of icon to concept is ours.
        </p>
      </footer>
    </div>
  );
}
