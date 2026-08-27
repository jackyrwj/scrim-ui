import { ImageResponse } from "next/og";
import { components, getComponent, getCategory } from "@/lib/registry";
import { OgCard, OG_SIZE } from "@/components/og/card";

export const alt = "A copy-ready AI interface component";
export const size = OG_SIZE;
export const contentType = "image/png";

/* Its own copy, not inherited from page.tsx: an opengraph-image in a dynamic
   segment is a route of its own and is only prerendered for the params it
   declares here. Without it every card would be generated on request. */
export function generateStaticParams() {
  return components.filter((c) => c.status === "published").map((c) => ({ slug: c.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const entry = getComponent(slug);
  return new ImageResponse(
    (
      <OgCard
        eyebrow={getCategory(entry?.category ?? "")?.name ?? "Component"}
        title={entry?.name ?? "Component"}
        description={entry?.description}
        /* Correct today by default — there are no Pro components yet — but
           the day one ships, its card must not go out saying "Free". */
        tagline={
          entry?.tier === "pro" ? "Pro · full source · one-time" : "Free · copy-ready · no signup"
        }
      />
    ),
    size,
  );
}
