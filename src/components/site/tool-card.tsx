import Link from "next/link";
import { toolLabel, type Tool } from "@/lib/tools";
import { ToolPreview } from "./tool-preview";
import { ToolCardDemo } from "@/components/tools/card-demos/tool-card-demo";
import { hasToolCardDemo } from "@/components/tools/card-demos/slugs";

/**
 * One tool, as it appears on the homepage and on /tools.
 *
 * The two used to disagree: the homepage card carried an animated preview
 * and /tools — the page someone lands on to choose a tool — showed three
 * lines of text. The preview is the part that says what the tool does, so
 * the page for choosing was the one missing it.
 *
 * Server component, like ToolPreview: the previews are markup and CSS and
 * ship no JS.
 */
export function ToolCard({ tool }: { tool: Tool }) {
  if (tool.status !== "published") {
    return (
      <div className="flex h-full flex-col rounded-2xl border border-dashed border-(--border) p-5 opacity-70">
        <div className="flex items-center justify-between gap-2">
          <span className="font-semibold">{tool.name}</span>
          <span className="shrink-0 rounded-full bg-(--muted) px-2 py-0.5 text-[11px] text-(--muted-foreground)">
            Soon
          </span>
        </div>
        <p className="mt-1.5 flex-1 text-sm leading-6 text-(--muted-foreground)">
          {tool.description}
        </p>
      </div>
    );
  }

  return (
    <Link
      href={`/tools/${tool.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-(--border) bg-(--card) transition-all duration-300 hover:-translate-y-1 hover:border-(--primary)/40"
      style={{ boxShadow: "var(--shadow-sm)" }}
    >
      {hasToolCardDemo(tool.slug) ? (
        <ToolCardDemo slug={tool.slug} />
      ) : (
        <ToolPreview slug={tool.slug} />
      )}
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center gap-2">
          <span className="font-semibold group-hover:underline">{toolLabel(tool)}</span>
          {tool.isNew && (
            <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[11px] font-medium text-violet-700 dark:bg-violet-900/40 dark:text-violet-400">
              New
            </span>
          )}
        </div>
        <p className="mt-1.5 flex-1 text-sm leading-6 text-(--muted-foreground)">{tool.tagline}</p>
        <span
          className="mt-4 inline-flex items-center gap-1 text-sm font-medium"
          style={{ color: "var(--primary)" }}
        >
          {tool.cta ?? "Open tool"}{" "}
          <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-0.5">
            →
          </span>
        </span>
      </div>
    </Link>
  );
}
