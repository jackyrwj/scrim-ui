import Link from "next/link";
import type { Metadata } from "next";
import { components, categories } from "@/lib/registry";

export const metadata: Metadata = {
  title: "Components",
  description:
    "Copy-ready UI components for AI products — prompt inputs, streaming messages, tool calls, citations, agent states and more.",
};

export default function ComponentsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Components</h1>
      <p className="mt-3 max-w-2xl text-lg text-(--muted-foreground)">
        AI-native UI components with live previews and copy-ready React + Tailwind code.
      </p>

      <div className="mt-12 space-y-14">
        {categories.map((cat) => {
          const items = components.filter((c) => c.category === cat.slug);
          if (items.length === 0) return null;
          return (
            <section key={cat.slug}>
              <h2 className="text-xl font-semibold tracking-tight">{cat.name}</h2>
              <p className="mt-1 text-sm text-(--muted-foreground)">{cat.description}</p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((c) =>
                  c.status === "published" ? (
                    <Link
                      key={c.slug}
                      href={`/components/${c.slug}`}
                      className="group rounded-xl border border-(--border) p-4 transition-colors hover:bg-(--muted)/60"
                    >
                      <span className="font-medium group-hover:underline">{c.name}</span>
                      <p className="mt-1 line-clamp-2 text-sm text-(--muted-foreground)">
                        {c.description}
                      </p>
                    </Link>
                  ) : (
                    <div
                      key={c.slug}
                      className="rounded-xl border border-dashed border-(--border) p-4 opacity-70"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{c.name}</span>
                        <span className="rounded-full bg-(--muted) px-2 py-0.5 text-[11px] text-(--muted-foreground)">
                          Soon
                        </span>
                      </div>
                      <p className="mt-1 line-clamp-2 text-sm text-(--muted-foreground)">
                        {c.description}
                      </p>
                    </div>
                  )
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
