import type { PatternPageConfig } from "@/lib/pattern-page";
import { aiChatPageConfig } from "./ai-chat/page-config";
import { researchAssistantPageConfig } from "./research-assistant/page-config";
import { codingAgentPageConfig } from "./coding-agent/page-config";

export const patternConfigs: Record<string, PatternPageConfig> = {
  "ai-chat": aiChatPageConfig,
  "research-assistant": researchAssistantPageConfig,
  "coding-agent": codingAgentPageConfig,
};
