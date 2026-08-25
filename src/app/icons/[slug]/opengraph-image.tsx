import { ImageResponse } from "next/og";
import { iconGuide, iconSlug, getIconEntry } from "@/lib/icon-guide";
import { getCategory } from "@/lib/registry";
import { OgCard, OG_SIZE } from "@/components/og/card";

export const alt = "Which icon means what, in an AI interface";
export const size = OG_SIZE;
export const contentType = "image/png";

export function generateStaticParams() {
  return iconGuide.map((e) => ({ slug: iconSlug(e.concept) }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const entry = getIconEntry(slug);
  return new ImageResponse(
    (
      <OgCard
        eyebrow={`Icon · ${getCategory(entry?.category ?? "")?.name ?? "Guide"}`}
        title={entry?.concept ?? "Icon"}
        description={entry?.meaning}
      />
    ),
    size,
  );
}
