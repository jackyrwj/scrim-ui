import type { Metadata } from "next";
import { FlowDiagram } from "@/components/tools/flow-diagram/flow-diagram";

export const metadata: Metadata = {
  title: "AI Conversation Flow Diagram",
  description:
    "Build visual conversation flows with user messages, AI responses, tool calls and approval gates. Export as SVG or PNG. Free, no signup.",
};

export default function FlowDiagramPage() {
  return <FlowDiagram />;
}
