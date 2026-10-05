import Link from "next/link";
import { ComponentStyleSample } from "@/components/site/component-style-samples";
import { styledComponentSlugs } from "@/lib/component-style";
import { PreviewAppearance } from "@/components/component-page/preview-appearance";

export const metadata = { title: "Component style preview", robots: { index: false, follow: false } };



export default function StylePreviewPage() {
  return (
    <div className="site-container py-12">
      <Link href="/components" className="text-sm text-(--muted-foreground)">← Components</Link>
      <h1 className="mt-5 text-3xl font-medium tracking-tight">A lighter component style</h1>
      <p className="mt-3 max-w-xl text-sm leading-7 text-(--muted-foreground)">All 55 native components now share the same shadcn/ui theme. Switch appearance, try the controls, and open each component to explore its full configuration.</p>
      <PreviewAppearance>
        <div className="space-y-10">
          {styledComponentSlugs.map((slug) => <section key={slug} className="border-b border-(--border) pb-8 last:border-0 last:pb-0"><div className="mb-5 flex items-center justify-between gap-4"><h3 className="text-sm font-medium">{slug.split("-").map((word) => word[0].toUpperCase() + word.slice(1)).join(" ")}</h3><Link href={`/components/${slug}`} className="text-xs text-(--muted-foreground)">Open component ↗</Link></div><ComponentStyleSample slug={slug} interactive /></section>)}
        </div>
      </PreviewAppearance>
    </div>
  );
}
