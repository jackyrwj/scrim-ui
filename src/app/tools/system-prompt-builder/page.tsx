import type { Metadata } from "next";
import { SystemPromptBuilder } from "@/components/tools/system-prompt-builder/system-prompt-builder";

export const metadata: Metadata = {
  title: "System Prompt Builder",
  description:
    "Build structured system prompts with modular sections. Define role, rules, output format, and constraints — then copy the combined prompt.",
};

export default function SystemPromptBuilderPage() {
  return <SystemPromptBuilder />;
}
