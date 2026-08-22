import type { Metadata } from "next";
import { ModelSwitcherTool } from "@/components/tools/model-switcher/model-switcher";

export const metadata: Metadata = {
  title: "Model Switcher Builder",
  description:
    "Design a custom AI model switcher — dropdown, segmented, pills or command list — with live preview, then copy a dependency-free React component. Free, no signup.",
};

export default function ModelSwitcherPage() {
  return <ModelSwitcherTool />;
}
