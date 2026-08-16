import type { Metadata } from "next";
import { ChatMockup } from "@/components/tools/chat-mockup/chat-mockup";

export const metadata: Metadata = {
  title: "AI Chat Mockup Generator",
  description:
    "Compose realistic AI chat screenshots with streaming replies, reasoning, tool calls and citations, then export them as PNG. Free, no signup, works in your browser.",
};

export default function ChatMockupPage() {
  return <ChatMockup />;
}
