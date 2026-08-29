import type { Metadata } from "next";
import { PricingCalculator } from "@/components/tools/pricing-calculator/pricing-calculator";

export const metadata: Metadata = {
  title: "AI Pricing Calculator",
  description:
    "Compare AI model costs across providers. Input your usage and see monthly cost estimates for GPT, Claude, Gemini and DeepSeek.",
};

export default function PricingCalculatorPage() {
  return <PricingCalculator />;
}
