import type { ComponentPageConfig } from "@/lib/component-page";
import { promptInputPageConfig } from "./prompt-input/page-config";
import { streamingMessagePageConfig } from "./streaming-message/page-config";
import { toolCallPageConfig } from "./tool-call/page-config";
import { reasoningPageConfig } from "./reasoning/page-config";
import { sourceCardPageConfig } from "./source-card/page-config";
import { citationUiPageConfig } from "./citation-ui/page-config";
import { agentStatusPageConfig } from "./agent-status/page-config";
import { approvalRequestPageConfig } from "./approval-request/page-config";
import { fileUploadPageConfig } from "./file-upload/page-config";
import { searchToolCallPageConfig } from "./search-tool-call/page-config";
import { promptInputAttachmentsPageConfig } from "./prompt-input-attachments/page-config";
import { promptInputModelSelectorPageConfig } from "./prompt-input-model-selector/page-config";
import { memoryListPageConfig } from "./memory-list/page-config";
import { memorySuggestionPageConfig } from "./memory-suggestion/page-config";
import { memoryChipPageConfig } from "./memory-chip/page-config";
import { modelSelectorPageConfig } from "./model-selector/page-config";
import { reasoningLevelPageConfig } from "./reasoning-level/page-config";
import { toolTogglePageConfig } from "./tool-toggle/page-config";

/**
 * Map of slug -> page config for every *published* showcase component.
 * Each config carries its live demos, variants and copy — keyed by the
 * same slug used in lib/registry.ts.
 */
export const pageConfigs: Record<string, ComponentPageConfig> = {
  "prompt-input": promptInputPageConfig,
  "streaming-message": streamingMessagePageConfig,
  "tool-call": toolCallPageConfig,
  reasoning: reasoningPageConfig,
  "source-card": sourceCardPageConfig,
  "citation-ui": citationUiPageConfig,
  "agent-status": agentStatusPageConfig,
  "approval-request": approvalRequestPageConfig,
  "file-upload": fileUploadPageConfig,
  "search-tool-call": searchToolCallPageConfig,
  "prompt-input-attachments": promptInputAttachmentsPageConfig,
  "prompt-input-model-selector": promptInputModelSelectorPageConfig,
  "memory-list": memoryListPageConfig,
  "memory-suggestion": memorySuggestionPageConfig,
  "memory-chip": memoryChipPageConfig,
  "model-selector": modelSelectorPageConfig,
  "reasoning-level": reasoningLevelPageConfig,
  "tool-toggle": toolTogglePageConfig,
};
