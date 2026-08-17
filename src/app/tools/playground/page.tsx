import type { Metadata } from "next";
import { PlaygroundHub } from "@/components/tools/playground/playground-hub";

export const metadata: Metadata = {
  title: "Component Playground",
  description:
    "Tune AI interface components live in one place — prompt inputs, streaming messages and tool call states — then open the full component page for the code.",
};

export default function PlaygroundPage() {
  return <PlaygroundHub />;
}
