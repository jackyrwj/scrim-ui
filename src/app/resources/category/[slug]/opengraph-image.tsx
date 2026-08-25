import { ImageResponse } from "next/og";
import { resources, resourceCategories, getResourceCategory } from "@/lib/resources";
import { OgCard, OG_SIZE } from "@/components/og/card";

export const alt = "Curated resources for building AI interfaces";
export const size = OG_SIZE;
export const contentType = "image/png";

export function generateStaticParams() {
  return resourceCategories.map((c) => ({ slug: c.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = getResourceCategory(slug);
  const count = resources.filter((r) => r.category === slug).length;
  return new ImageResponse(
    (
      <OgCard
        eyebrow="Resources"
        title={`${count} ${category?.name ?? "Resources"}`}
        description={category?.description}
      />
    ),
    size,
  );
}
