import type { Metadata } from "next";
import { tools } from "@/lib/tools";
import { ToolCard } from "@/components/site/tool-card";
import { StaggerChildren } from "@/components/site/animate-on-scroll";
import { CatalogHeader } from "@/components/site/catalog-header";

export const metadata: Metadata = {
  title: "Free AI Interface Design Tools",
  description:
    "Create chat mockups, build prompts, compare models and count tokens with free in-browser tools for AI interfaces.",
};

export default function ToolsPage() {
  return (
    <div className="catalog-page">
      <CatalogHeader eyebrow="The tool collection" title="Tools">
        Create chat mockups, build prompts, compare models, and count tokens — free in your
        browser, with no sign-up.
      </CatalogHeader>

      <StaggerChildren className="mt-12 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {tools.map((tool) => (
          <div key={tool.slug} className="aos-stagger-item grid">
            <ToolCard tool={tool} />
          </div>
        ))}
      </StaggerChildren>
    </div>
  );
}
