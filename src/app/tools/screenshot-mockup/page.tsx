import type { Metadata } from "next";
import { ScreenshotMockup } from "@/components/tools/screenshot-mockup/screenshot-mockup";

export const metadata: Metadata = {
  title: "Screenshot Device Mockup",
  description:
    "Upload a screenshot and place it in iPhone, MacBook, iPad or browser device frames. Export a polished mockup PNG. Free, no signup.",
};

export default function ScreenshotMockupPage() {
  return <ScreenshotMockup />;
}
