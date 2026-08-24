import { ImageResponse } from "next/og";
import { OgCard, OG_SIZE } from "@/components/og/card";

export const alt = "Scrim UI — copy-ready UI components for AI products";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <OgCard
        title="The UI layer your AI product is missing"
        description="Free in-browser tools and copy-ready components for AI interfaces — prompt inputs, agent states, tool calls, citations, reasoning, voice and memory."
      />
    ),
    size,
  );
}
