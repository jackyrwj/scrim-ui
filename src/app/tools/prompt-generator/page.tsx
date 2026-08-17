import type { Metadata } from "next";
import { PromptGenerator } from "@/components/tools/prompt-generator/prompt-generator";

export const metadata: Metadata = {
  title: "AI Interface Prompt Generator",
  description:
    "Generate a copy-ready prompt for building AI interfaces in v0, Claude or Cursor. Describe your product, pick the screen type and AI-UI elements — streaming, tool calls, reasoning, citations — and copy a tailored React + Tailwind prompt.",
};

export default function PromptGeneratorPage() {
  return <PromptGenerator />;
}
