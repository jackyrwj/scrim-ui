import type { Metadata } from "next";
import { TokenCounter } from "@/components/tools/token-counter/token-counter";

export const metadata: Metadata = {
  title: "Prompt Token Counter",
  description:
    "Paste text and see estimated token counts and API costs for GPT-5.6, Claude, Gemini, DeepSeek and more. Free, no signup, runs in your browser.",
};

export default function TokenCounterPage() {
  return <TokenCounter />;
}
