import type { Metadata } from "next";
import { tools } from "@/lib/tools";
import { ToolCard } from "@/components/site/tool-card";
import { StaggerChildren } from "@/components/site/animate-on-scroll";

export const metadata: Metadata = {
  title: "Free AI Interface Design Tools",
  description:
    "Create chat mockups, build prompts, compare models and count tokens with free in-browser tools for AI interfaces.",
};

export default function ToolsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="display-title text-3xl font-semibold tracking-tight sm:text-4xl">
        Tools
      </h1>
      <p className="mt-3 max-w-2xl text-balance text-lg text-(--muted-foreground)">
        Create chat mockups, build prompts, compare models, and count tokens — free in your
        browser, with no sign-up.
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
