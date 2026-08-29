import type { Metadata } from "next";
import { WorkshopV2 } from "@/components/tools/workshop/workshop-v2";

export const metadata: Metadata = {
  title: "AI Component Workshop",
  description:
    "Describe an AI product interface, compose it from production-ready Scrim UI components, refine each part and export the React implementation.",
};

export default function WorkshopPage() {
  return <WorkshopV2 />;
}
