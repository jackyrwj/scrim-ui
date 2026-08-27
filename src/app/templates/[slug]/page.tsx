import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getComponent } from "@/lib/registry";
import { getTemplate, templates } from "@/lib/templates";
import { getProTemplateCatalog } from "@/lib/pro-catalog";
import { ProBadge } from "@/components/pro/pro-badge";
import { ProTemplate } from "@/components/pro/pro-template";
import { TemplateDemo, hasTemplateDemo } from "@/components/templates/template-demo";
import { SITE_URL } from "@/lib/site";

export function generateStaticParams() {
  return templates.filter((t) => t.status === "published").map((t) => ({ slug: t.slug }));
}

export function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  return params.then(({ slug }) => {
    const entry = getTemplate(slug);
    if (!entry) return {};
    return {
      title: entry.searchTitle ?? `${entry.name} Template — Next.js + AI SDK`,
      description: entry.description,
    };
  });
}

export default async function TemplatePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const entry = getTemplate(slug);
  if (!entry || entry.status !== "published") notFound();

  /* Paths and line counts come from the generated public catalog. The paid
     contents live in the private artifact origin and never touch this render. */
  const files = getProTemplateCatalog(entry.slug)?.files ?? [];
  const components = entry.componentSlugs.map(getComponent).filter((c) => c !== undefined);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <nav className="mb-6 text-sm text-(--muted-foreground)">
        <Link href="/templates" className="hover:text-(--foreground)">Templates</Link>
        <span className="mx-2">/</span>
        <span className="text-(--foreground)">{entry.name}</span>
      </nav>

      <h1 className="flex flex-wrap items-center gap-3 text-3xl font-bold tracking-tight sm:text-4xl">
        {entry.name} Template
        {entry.tier === "pro" && <ProBadge className="translate-y-1" />}
      </h1>
      <p className="mt-3 max-w-2xl text-lg text-(--muted-foreground)">{entry.description}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {entry.stack.map((s) => (
          <span key={s} className="rounded-full border border-(--border) px-2.5 py-0.5 text-xs text-(--muted-foreground)">
            {s}
          </span>
        ))}
      </div>

      {/* The page's whole case for itself, now that the feature prose is
          gone: someone deciding whether to pay wants to see it run, and a
          screen of bullet points was asking them to take that on faith while
          pushing the file list below two folds. */}
      {hasTemplateDemo(entry.slug) && (
        <section className="mt-8">
          <TemplateDemo slug={entry.slug} />
        </section>
      )}

      <section id="files" className="mt-12 scroll-mt-20">
        <h2 className="text-xl font-semibold tracking-tight">Every file in it</h2>
        <p className="mb-5 mt-1 text-sm text-(--muted-foreground)">
          The full file list, with line counts — nothing is hidden about what you are getting, only
          the contents are.
        </p>
        <ProTemplate
          slug={entry.slug}
          files={files.map((f) => ({ path: f.path, lines: f.lines }))}
          registryUrl={`${SITE_URL}/r/pro/template-${entry.slug}.json`}
        />
      </section>

      {components.length > 0 && (
        <section className="mt-14 border-t border-(--border) pt-10">
          <h2 className="text-xl font-semibold tracking-tight">Built on these components</h2>
          <p className="mb-5 mt-1 text-sm text-(--muted-foreground)">
            All free, all documented on their own pages. The template is what wires them together.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {components.map((c) => (
              <Link
                key={c.slug}
                href={`/components/${c.slug}`}
                className="group rounded-xl border border-(--border) p-4 transition-colors hover:bg-(--muted)/60"
              >
                <span className="font-medium group-hover:underline">{c.name}</span>
                <p className="mt-1 line-clamp-2 text-sm text-(--muted-foreground)">{c.description}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mt-14 border-t border-(--border) pt-10">
        <h2 className="text-xl font-semibold tracking-tight">Running it</h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-[15px] leading-7 text-(--muted-foreground)">
          <li>
            Download the zip and unpack it, or install it with the shadcn command above — either
            way the app lands in its own directory. Then{" "}
            <code className="font-mono text-[13px]">npm install</code>.
          </li>
          <li>
            Add an <code className="font-mono text-[13px]">AI_GATEWAY_API_KEY</code> to{" "}
            <code className="font-mono text-[13px]">.env.local</code> — one key reaches every model
            the template uses{entry.slug === "rag-qa" ? ", the embedding model included" : ""}.
          </li>
          <li>
            <code className="font-mono text-[13px]">npm run dev</code>. To use a provider directly
            instead, install its package and change{" "}
            {/* Two lines in the RAG template, because the embedding model is a
                second choice — and one it is worth knowing you are making,
                since changing it later invalidates every vector already
                stored. Naming the real number beats a tidy "one line". */}
            {entry.slug === "rag-qa" ? (
              <>
                the two model lines in{" "}
                <code className="font-mono text-[13px]">lib/models.ts</code>
              </>
            ) : (
              "one line in the chat route"
            )}
            .
          </li>
        </ol>
      </section>
    </div>
  );
}
