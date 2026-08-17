import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tools",
  description:
    "Free, in-browser tools for designing AI product interfaces. No signup, no install.",
};

type Tool = {
  slug: string;
  name: string;
  description: string;
  status: "published" | "planned";
};

const tools: Tool[] = [
  {
    slug: "chat-mockup",
    name: "AI Chat Mockup Generator",
    description:
      "Compose a realistic AI chat screen — streaming, reasoning, tool calls, citations — and export it as a PNG for your landing page or deck.",
    status: "published",
  },
  {
    slug: "prompt-generator",
    name: "AI Interface Prompt Generator",
    description:
      "Describe your product and get a copy-ready prompt for generating the interface in v0, Claude or Cursor.",
    status: "published",
  },
  {
    slug: "playground",
    name: "Component Playground",
    description:
      "Try the prompt input, streaming message and tool call components in one place — tune their states live and jump to the full component page.",
    status: "published",
  },
];

export default function ToolsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Tools</h1>
      <p className="mt-3 max-w-2xl text-lg text-(--muted-foreground)">
        Free, in-browser tools for designing AI product interfaces. No signup, no install —
        everything runs locally in your browser.
      </p>

      <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => (
          <div key={tool.slug}>
            {tool.status === "published" ? (
              <Link
                href={`/tools/${tool.slug}`}
                className="group flex h-full flex-col rounded-xl border border-(--border) p-5 transition-colors hover:bg-(--muted)/60"
              >
                <span className="font-medium group-hover:underline">{tool.name}</span>
                <p className="mt-1.5 flex-1 text-sm leading-6 text-(--muted-foreground)">
                  {tool.description}
                </p>
                <span className="mt-4 inline-block text-sm font-medium text-(--foreground)">
                  Open tool →
                </span>
              </Link>
            ) : (
              <div className="flex h-full flex-col rounded-xl border border-dashed border-(--border) p-5 opacity-70">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{tool.name}</span>
                  <span className="rounded-full bg-(--muted) px-2 py-0.5 text-[11px] text-(--muted-foreground)">
                    Soon
                  </span>
                </div>
                <p className="mt-1.5 flex-1 text-sm leading-6 text-(--muted-foreground)">
                  {tool.description}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
