import { permanentRedirect } from "next/navigation";
import { aicssComponents, aicssComponentPath } from "@/lib/aicss-catalog";

export function generateStaticParams() {
  return aicssComponents.map((component) => ({ slug: component.sourceSlug }));
}

export default async function LegacyAicssComponentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const component = aicssComponents.find((entry) => entry.sourceSlug === slug);
  permanentRedirect(component ? aicssComponentPath(component.slug) : "/components");
}
