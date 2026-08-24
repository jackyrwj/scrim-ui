import { Suspense } from "react";
import type { Metadata } from "next";
import { resources, resourceCategories } from "@/lib/resources";
import { ResourcesBrowser } from "@/components/resources/resources-browser";

export const metadata: Metadata = {
  title: "Resources — AI UI Libraries, Generators & Guides",
  description:
    "A curated directory of component libraries, AI UI generators, design tools, icons and guides for building AI product interfaces.",
};

export default function ResourcesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Resources</h1>
      <p className="mt-3 max-w-2xl text-lg text-(--muted-foreground)">
        A curated directory of the best libraries, generators, design tools and guides for
        building AI interfaces — each with a note on when to use it.
      </p>

      {/* The browser reads `?category=` (the link a detail page comes back on)
          via useSearchParams, which is URL data — reading it on the server
          would make this whole route render on demand. Behind Suspense it
          stays a prerendered page whose filter resolves on the client. */}
      <Suspense fallback={<div className="mt-8 h-[60vh]" />}>
        <ResourcesBrowser entries={resources} categories={resourceCategories} />
      </Suspense>

      <p className="mt-10 text-sm text-(--muted-foreground)">
        Curated by hand, with source attribution. Some resources are freemium — check the vendor
        for current pricing and terms.
      </p>
    </div>
  );
}
