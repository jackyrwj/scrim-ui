import type { Metadata } from "next";
import { ResponseDiff } from "@/components/tools/response-diff/response-diff";

export const metadata: Metadata = {
  title: "AI Response Diff",
  description:
    "Compare AI model outputs side by side. Paste two responses and see differences highlighted — perfect for evaluating prompts and comparing models.",
};

export default function ResponseDiffPage() {
  return <ResponseDiff />;
}
