import { ImageResponse } from "next/og";
import { inspirationEntries, getInspirationEntry } from "@/lib/inspiration";
import { OgCard, OG_SIZE } from "@/components/og/card";

export const alt = "An evidence-driven breakdown of an AI interface";
export const size = OG_SIZE;
export const contentType = "image/png";

export function generateStaticParams() {
  return inspirationEntries.map((entry) => ({ slug: entry.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const entry = getInspirationEntry(slug);
  return new ImageResponse(
    (
      <OgCard
        eyebrow={entry?.kind === "guide" ? "Decision guide" : `Case study · ${entry?.product ?? ""}`}
        title={entry?.title ?? "Inspiration"}
        description={entry?.summary}
      />
    ),
    size,
  );
}
