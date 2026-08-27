import { ImageResponse } from "next/og";
import { getTemplate, templates } from "@/lib/templates";
import { OgCard, OG_SIZE } from "@/components/og/card";

export const alt = "A complete AI application, wired to the AI SDK";
export const size = OG_SIZE;
export const contentType = "image/png";

/* Its own copy of the params, same as the component route: an
   opengraph-image in a dynamic segment is a route of its own and is only
   prerendered for the params it declares here. Without it every share of a
   template link generates the card on request. */
export function generateStaticParams() {
  return templates.filter((t) => t.status === "published").map((t) => ({ slug: t.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const entry = getTemplate(slug);
  return new ImageResponse(
    (
      <OgCard
        eyebrow="Template"
        title={entry ? `${entry.name} Template` : "Template"}
        description={entry?.description}
        /* Not the site's default "Free" line — see OgCard. */
        tagline={
          entry?.tier === "pro" ? "Pro · complete app · one-time" : "Free · copy-ready · no signup"
        }
      />
    ),
    size,
  );
}
