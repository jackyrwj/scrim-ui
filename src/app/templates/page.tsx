import Link from "next/link";
import type { Metadata } from "next";
import { templates } from "@/lib/templates";
import { ProBadge } from "@/components/pro/pro-badge";
import { TemplateCardDemo } from "@/components/templates/template-card-demo";

export const metadata: Metadata = {
  title: "Templates — Complete AI Apps",
  description:
    "Full Next.js applications built on the AI SDK — streaming chat with tool calls, reasoning, model switching and saved conversations. Not snippets: apps that run.",
};

export default function TemplatesPage() {
  const published = templates.filter((t) => t.status === "published");

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <header className="max-w-2xl">
        <h1 className="display-title text-3xl font-semibold tracking-tight text-balance sm:text-4xl">Templates</h1>
        <p className="mt-3 text-lg text-(--muted-foreground)">
          Components are files you paste. Templates are the twenty decisions around them — which you
          only enjoy making once.
        </p>
      </header>

      {/* The demo leads the card: someone deciding whether to pay wants to
          see it run, and a sentence was asking them to take that on faith.
          Each demo is the same scripted replay the detail page mounts,
          scaled into the card — the card itself is not a link, because the
          replays have working buttons inside them. */}
      <div className="mt-12 grid gap-6 lg:grid-cols-2">
        {published.map((t) => (
          <article
            key={t.slug}
            className="group flex flex-col overflow-hidden rounded-2xl border border-(--border) bg-(--card) transition-all hover:-translate-y-0.5 hover:border-(--primary)/30"
            style={{ boxShadow: "var(--shadow-sm)" }}
          >
            <TemplateCardDemo slug={t.slug} />
            <div className="flex flex-1 flex-col p-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold">
                  <Link href={`/templates/${t.slug}`} className="group-hover:underline">
                    {t.name}
                  </Link>
                </h2>
                {t.tier === "pro" && <ProBadge />}
              </div>
              <p className="mt-2 line-clamp-3 text-sm leading-6 text-(--muted-foreground)">
                {t.description}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {t.stack.map((s) => (
                  <span key={s} className="rounded-full border border-(--border) px-2.5 py-0.5 text-xs text-(--muted-foreground)">
                    {s}
                  </span>
                ))}
              </div>
              <Link
                href={`/templates/${t.slug}`}
                className="mt-5 inline-flex items-center gap-1 pt-1 text-sm font-medium text-(--primary) hover:underline"
              >
                View template
                <span aria-hidden>→</span>
              </Link>
            </div>
          </article>
        ))}
      </div>

      <p className="mt-8 max-w-2xl text-xs leading-5 text-(--muted-foreground)">
        Every demo above is a scripted replay of the real components the template ships — there is
        no model behind this page, but the buttons inside them are live. The template you download
        talks to your own key.
      </p>
    </div>
  );
}
