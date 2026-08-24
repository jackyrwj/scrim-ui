import { ImageResponse } from "next/og";
import { patterns, getPattern } from "@/lib/registry";
import { OgCard, OG_SIZE } from "@/components/og/card";

export const alt = "A whole AI screen you can copy";
export const size = OG_SIZE;
export const contentType = "image/png";

export function generateStaticParams() {
  return patterns.map((p) => ({ slug: p.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const entry = getPattern(slug);
  return new ImageResponse(
    (
      <OgCard eyebrow="Pattern" title={entry?.name ?? "Pattern"} description={entry?.description} />
    ),
    size,
  );
}
