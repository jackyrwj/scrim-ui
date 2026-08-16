import Link from "next/link";
import type { Metadata } from "next";
import { categories, components } from "@/lib/registry";

export const metadata: Metadata = {
  title: "Categories",
  description:
    "Browse copy-ready AI UI components by category — prompt input, messages, reasoning, tool calls, sources, agents, files and more.",
};

export default function CategoriesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Categories</h1>
      <p className="mt-3 max-w-2xl text-lg text-(--muted-foreground)">
        Every AI product is built from the same blocks. Browse them by category and copy what you
        need.
      </p>

      <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat) => {
          const count = components.filter(
            (c) => c.category === cat.slug && c.status === "published",
          ).length;
          return (
            <Link
              key={cat.slug}
              href={`/categories/${cat.slug}`}
              className="group rounded-xl border border-(--border) p-5 transition-colors hover:bg-(--muted)/60"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium group-hover:underline">{cat.name}</span>
                <span className="rounded-full bg-(--muted) px-2 py-0.5 text-[11px] text-(--muted-foreground)">
                  {count} {count === 1 ? "component" : "components"}
                </span>
              </div>
              <p className="mt-1.5 text-sm leading-6 text-(--muted-foreground)">{cat.description}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
