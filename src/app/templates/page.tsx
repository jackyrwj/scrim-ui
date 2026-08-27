import Link from "next/link";
import type { Metadata } from "next";
import { templates } from "@/lib/templates";
import { ProBadge } from "@/components/pro/pro-badge";
import { TemplatePreview, hasTemplatePreview } from "@/components/site/template-preview";

export const metadata: Metadata = {
  title: "Templates — Complete AI Apps",
  description:
    "Full Next.js applications built on the AI SDK — streaming chat with tool calls, reasoning, model switching and saved conversations. Not snippets: apps that run.",
};

export default function TemplatesPage() {
  const published = templates.filter((t) => t.status === "published");

  return (
    <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
      <header className="max-w-2xl">
        <h1 className="display-title text-3xl font-semibold tracking-tight text-balance sm:text-4xl">Templates</h1>
        <p className="mt-3 text-lg text-(--muted-foreground)">
          Components are files you paste. Templates are the twenty decisions around them — which you
          only enjoy making once.
        </p>
      </header>

      <div className="mt-12 space-y-4">
        {published.map((t) => (
          <Link
            key={t.slug}
            href={`/templates/${t.slug}`}
            className="group flex flex-col overflow-hidden rounded-2xl border border-(--border) bg-(--card) transition-all hover:-translate-y-0.5 hover:border-(--primary)/30 sm:flex-row"
            style={{ boxShadow: "var(--shadow-sm)" }}
          >
            {/* The card's first answer to "what is this?" is now a shape
                rather than a sentence. Beside the copy rather than above it:
                these cards are full-width rows, and a banner across one is
                more preview than a four-line summary can balance. */}
            {hasTemplatePreview(t.slug) && (
              <div className="shrink-0 border-b border-(--border) sm:w-56 sm:border-b-0 sm:border-r">
                <TemplatePreview slug={t.slug} />
              </div>
            )}
            <div className="min-w-0 flex-1 p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold group-hover:underline">{t.name}</h2>
              {t.tier === "pro" && <ProBadge />}
            </div>
            <p className="mt-2 text-sm leading-6 text-(--muted-foreground)">{t.description}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {t.stack.map((s) => (
                <span key={s} className="rounded-full border border-(--border) px-2.5 py-0.5 text-xs text-(--muted-foreground)">
                  {s}
                </span>
              ))}
            </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
