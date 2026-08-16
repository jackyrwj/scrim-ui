import Link from "next/link";
import type { Metadata } from "next";
import { patterns, getComponent } from "@/lib/registry";

export const metadata: Metadata = {
  title: "Patterns",
  description:
    "Complete AI interface patterns — AI Chat, Research Assistant and Coding Agent — composed from copy-ready components.",
};

export default function PatternsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">AI Patterns</h1>
      <p className="mt-3 max-w-2xl text-lg text-(--muted-foreground)">
        Complete, remix-ready interfaces built from the components on this site — not single
        components, but the full interaction.
      </p>

      <div className="mt-12 grid gap-4 md:grid-cols-3">
        {patterns.map((p) => {
          const comps = p.elements.map((s) => getComponent(s)?.name).filter(Boolean);
          return (
            <Link
              key={p.slug}
              href={`/patterns/${p.slug}`}
              className="group flex flex-col rounded-2xl border border-(--border) p-6 transition-colors hover:bg-(--muted)/60"
            >
              <span className="text-lg font-semibold group-hover:underline">{p.name}</span>
              <p className="mt-2 flex-1 text-sm leading-6 text-(--muted-foreground)">{p.description}</p>
              <div className="mt-5 flex flex-wrap gap-1.5">
                {comps.map((c) => (
                  <span key={c} className="rounded-full bg-(--muted) px-2 py-0.5 text-[11px] text-(--muted-foreground)">
                    {c}
                  </span>
                ))}
              </div>
              <span className="mt-5 text-sm font-medium text-(--foreground)">Open pattern →</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
