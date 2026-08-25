import { ImageResponse } from "next/og";
import { OgCard, OG_SIZE } from "@/components/og/card";

/**
 * One card for /tools and, by metadata inheritance, for every tool page under
 * it. The ten tools are static routes rather than a [slug] segment, so a card
 * per tool would mean ten near-identical files for a page people reach by
 * clicking rather than by sharing.
 */
export const alt = "Free in-browser tools for designing AI interfaces";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <OgCard
        eyebrow="Tools"
        title="Mock up an AI interface in your browser"
        description="Chat and voice mockups, a theme generator, a token counter and a device framer. No signup, no install — export a PNG or copy the component."
      />
    ),
    size,
  );
}
