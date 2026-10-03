import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ComponentPreview } from "./component-preview";
import { AicssPreview } from "@/components/component-page/aicss-preview";
import { RecreatedPreview } from "@/components/component-page/recreated-preview";

export function GalleryCard({
  slug, name, description, aicss = false, recreated = false, sourceSlug, variants = 1, pro = false, published = true,
}: {
  slug: string;
  name: string;
  description: string;
  aicss?: boolean;
  recreated?: boolean;
  sourceSlug?: string;
  variants?: number;
  pro?: boolean;
  published?: boolean;
}) {
  const content = (
    <>
      {aicss || recreated ? (
        <div className="aicss-card-stage" inert aria-hidden="true">
          <div className="aicss-card-demo">{aicss ? <AicssPreview slug={sourceSlug ?? slug} /> : <RecreatedPreview slug={slug} />}</div>
        </div>
      ) : <ComponentPreview slug={slug} />}
      <div className="flex items-center justify-between gap-3 px-5 py-4">
        <div className="min-w-0">
          <h3 className="text-sm font-medium tracking-[-0.01em]">{name}</h3>
          <p className="mt-1 text-xs text-(--muted-foreground)">
            {!published ? "Coming soon" : aicss ? "React · Vue · Svelte" : recreated ? "React · Tailwind · Original build" : `${variants} variant${variants === 1 ? "" : "s"}${pro ? " · Pro" : ""}`}
          </p>
        </div>
        {published && <ArrowUpRight size={15} strokeWidth={1.5} aria-hidden="true" className="shrink-0 text-(--muted-foreground) transition-colors group-hover:text-(--foreground)" />}
      </div>
      <span className="sr-only">{description}</span>
    </>
  );

  return published ? (
    <article className="gallery-card group">
      {content}
      <Link
        href={`/components/${slug}`}
        aria-label={`View ${aicss ? "AICSS " : ""}${name}`}
        className="absolute inset-0 z-10 rounded-xl"
      />
    </article>
  ) : <div className="gallery-card opacity-60">{content}</div>;
}
