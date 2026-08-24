"use client";

import * as React from "react";
import Link from "next/link";
import { pageConfigs } from "@/showcase/registry";
import { components } from "@/lib/registry";
import { ComponentExplorer } from "@/components/component-page/explorer";
import { Chip } from "../tool-ui";

/**
 * Every component's Explorer, behind one picker.
 *
 * This used to hard-code three bespoke playgrounds, because a playground was
 * ~90 lines of hand-written state and control JSX and only three had been
 * written. Now that a component declares its props as data, the hub is just
 * the same Explorer the component pages use, pointed at whichever component
 * the reader picks — so it covers all of them and cannot drift from the
 * component page.
 */
const ENTRIES = components
  .filter((c) => c.status === "published" && pageConfigs[c.slug]?.explorer)
  .map((c) => ({ slug: c.slug, name: c.name, description: c.description }));

export function PlaygroundHub() {
  const [active, setActive] = React.useState(ENTRIES[0]?.slug ?? "");
  const entry = ENTRIES.find((e) => e.slug === active) ?? ENTRIES[0];
  const explorer = entry ? pageConfigs[entry.slug]?.explorer : undefined;

  if (!entry || !explorer) return null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Component Playground</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-(--muted-foreground)">
            Every component in the library, with its props exposed. Change anything and the code
            below the preview changes with it — copy it straight into your project.
          </p>
        </div>
        <Link
          href={`/components/${entry.slug}`}
          className="inline-flex h-9 items-center rounded-lg border border-(--border) px-4 text-sm font-medium transition-colors hover:bg-(--muted)"
        >
          Open full component page →
        </Link>
      </div>

      {/* A group, not a tablist: role="tablist" would require role="tab"
          children wired to tabpanels via aria-controls and arrow-key roving
          focus. The Chips carry aria-pressed, which is what they actually are. */}
      <div className="mt-8 flex flex-wrap items-center gap-1.5" role="group" aria-label="Component">
        {ENTRIES.map((e) => (
          <Chip key={e.slug} active={active === e.slug} onClick={() => setActive(e.slug)}>
            {e.name}
          </Chip>
        ))}
      </div>
      <p className="mt-2 text-xs leading-5 text-(--muted-foreground)">{entry.description}</p>

      <div className="mt-6">
        <ComponentExplorer key={entry.slug} schema={explorer.schema} render={explorer.render} />
      </div>
    </div>
  );
}
