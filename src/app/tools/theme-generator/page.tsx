import type { Metadata } from "next";
import { ThemeGenerator } from "@/components/tools/theme-generator/theme-generator";

export const metadata: Metadata = {
  title: "AI Chat Theme Generator",
  description:
    "Pick a brand color and generate a complete AI chat interface color scheme with live preview. Export as CSS variables or Tailwind config. Free, no signup.",
};

export default function ThemeGeneratorPage() {
  return <ThemeGenerator />;
}
