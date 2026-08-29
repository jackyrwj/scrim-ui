import * as React from "react";
import { AiChatDemo } from "./ai-chat-demo";
import { RagQaDemo } from "./rag-qa-demo";
import { AgentConsoleDemo } from "./agent-console-demo";
import { StructuredExtractionDemo } from "./structured-extraction-demo";
import { GenerativeUiDemo } from "./generative-ui-demo";
import { VoiceAssistantDemo } from "./voice-assistant-demo";
import { AnswerEngineDemo } from "./answer-engine-demo";
import { MemoryChatDemo } from "./memory-chat-demo";
import { SupportCopilotDemo } from "./support-copilot-demo";
import { ImageStudioDemo } from "./image-studio-demo";
import { ResearchAgentDemo } from "./research-agent-demo";

/**
 * Which templates have a running demo on their page.
 *
 * A map rather than a field on the template registry, for the same reason
 * src/showcase/registry.tsx is separate from lib/registry.ts: lib/templates.ts
 * is data a server component reads, and putting a client component reference
 * in it would drag the whole module into the browser bundle wherever it is
 * imported — including the sitemap.
 *
 * A template with no entry renders nothing rather than a placeholder. An
 * empty frame saying "preview coming soon" is worse than the honest absence:
 * it is a promise made on the page where someone is deciding whether to pay.
 */
const demos: Record<string, (props: { caption?: boolean }) => React.ReactElement> = {
  "ai-chat": AiChatDemo,
  "rag-qa": RagQaDemo,
  "agent-console": AgentConsoleDemo,
  "structured-extraction": StructuredExtractionDemo,
  "generative-ui": GenerativeUiDemo,
  "voice-assistant": VoiceAssistantDemo,
  "answer-engine": AnswerEngineDemo,
  "memory-chat": MemoryChatDemo,
  "support-copilot": SupportCopilotDemo,
  "image-studio": ImageStudioDemo,
  "research-agent": ResearchAgentDemo,
};

export function hasTemplateDemo(slug: string): boolean {
  return slug in demos;
}

export function TemplateDemo({ slug }: { slug: string }) {
  const Demo = demos[slug];
  return Demo ? <Demo /> : null;
}
