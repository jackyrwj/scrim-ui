import type { Metadata } from "next";
import { tools } from "@/lib/tools";
import { ToolCard } from "@/components/site/tool-card";
import { StaggerChildren } from "@/components/site/animate-on-scroll";

export const metadata: Metadata = {
  title: "Tools",
  description:
    "Free, in-browser tools for designing AI product interfaces. No signup, no install.",
};

export default function ToolsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Tools</h1>
      <p className="mt-3 max-w-2xl text-lg text-(--muted-foreground)">
        Free, in-browser tools for designing AI product interfaces. No signup, no install —
        everything runs locally in your browser.
      </p>

      <StaggerChildren className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => (
          <div key={tool.slug} className="aos-stagger-item grid">
            <ToolCard tool={tool} />
          </div>
        ))}
      </StaggerChildren>
    </div>
  );
}
