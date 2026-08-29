import type { PatternPageConfig } from "@/lib/pattern-page";
import { aiChatPageConfig } from "./ai-chat/page-config";
import { researchAssistantPageConfig } from "./research-assistant/page-config";
import { codingAgentPageConfig } from "./coding-agent/page-config";
import { voiceAssistantPageConfig } from "./voice-assistant/page-config";
import { modelPreferencesPageConfig } from "./model-preferences/page-config";
import { artifactWorkspacePageConfig } from "./artifact-workspace/page-config";
import { ragWorkspacePageConfig } from "./rag-workspace/page-config";
import { extractionReviewPageConfig } from "./extraction-review/page-config";
import { imageStudioPageConfig } from "./image-studio/page-config";
import { agentConsolePageConfig } from "./agent-console/page-config";
import { supportCopilotPageConfig } from "./support-copilot/page-config";
import { generativeDashboardPageConfig } from "./generative-dashboard/page-config";

export const patternConfigs: Record<string, PatternPageConfig> = {
  "ai-chat": aiChatPageConfig,
  "research-assistant": researchAssistantPageConfig,
  "coding-agent": codingAgentPageConfig,
  "voice-assistant": voiceAssistantPageConfig,
  "model-preferences": modelPreferencesPageConfig,
  "artifact-workspace": artifactWorkspacePageConfig,
  "rag-workspace": ragWorkspacePageConfig,
  "extraction-review": extractionReviewPageConfig,
  "image-studio": imageStudioPageConfig,
  "agent-console": agentConsolePageConfig,
  "support-copilot": supportCopilotPageConfig,
  "generative-dashboard": generativeDashboardPageConfig,
};
