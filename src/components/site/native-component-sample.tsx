"use client";

import type { ReactNode } from "react";
import dynamic from "next/dynamic";
import { defaultValues, presetValues, type ComponentControls, type ControlValues } from "@/lib/component-controls";
import { Skeleton } from "@/components/ui/skeleton";
import { useGalleryClock } from "./gallery-preview";
import { galleryAnimationValues } from "@/lib/gallery-animation";

// Reuse the Explorer's data and renderer so gallery previews cannot drift from installed source.
function createSample(schema: ComponentControls, render: (values: ControlValues, key: string) => ReactNode) {
  return function Sample({ interactive = false }: { interactive?: boolean }) {
    const clock = useGalleryClock();
    const values = clock && !interactive
      ? galleryAnimationValues(schema, clock.animate ? clock.elapsed : 9000)
      : schema.presets[0] ? presetValues(schema, schema.presets[0]) : defaultValues(schema);
    if (!interactive) {
      for (const name of ["isStreaming", "planning"]) {
        if (name in values) values[name] = false;
      }
    }
    return <>{render(values, "style-sample")}</>;
  };
}

function SampleLoading() { return <Skeleton className="h-20 w-full rounded-lg" />; }
const samples = {
  "agent-handoff": dynamic(() => import("@/showcase/agent-handoff/controls").then((module) => createSample(module.agentHandoffControls, module.renderAgentHandoff)), { loading: SampleLoading }),
  "agent-plan": dynamic(() => import("@/showcase/agent-plan/controls").then((module) => createSample(module.agentPlanControls, module.renderAgentPlan)), { loading: SampleLoading }),
  "agent-run-timeline": dynamic(() => import("@/showcase/agent-run-timeline/controls").then((module) => createSample(module.agentRunTimelineControls, module.renderAgentRunTimeline)), { loading: SampleLoading }),
  "agent-status": dynamic(() => import("@/showcase/agent-status/controls").then((module) => createSample(module.agentStatusControls, module.renderAgentStatus)), { loading: SampleLoading }),
  "approval-gate": dynamic(() => import("@/showcase/approval-gate/controls").then((module) => createSample(module.approvalGateControls, module.renderApprovalGate)), { loading: SampleLoading }),
  "approval-request": dynamic(() => import("@/showcase/approval-request/controls").then((module) => createSample(module.approvalRequestControls, module.renderApprovalRequest)), { loading: SampleLoading }),
  "artifact-preview": dynamic(() => import("@/showcase/artifact-preview/controls").then((module) => createSample(module.artifactPreviewControls, module.renderArtifactPreview)), { loading: SampleLoading }),
  "citation-popover": dynamic(() => import("@/showcase/citation-popover/controls").then((module) => createSample(module.citationPopoverControls, module.renderCitationPopover)), { loading: SampleLoading }),
  "citation-ui": dynamic(() => import("@/showcase/citation-ui/controls").then((module) => createSample(module.citationUiControls, module.renderCitationUi)), { loading: SampleLoading }),
  "code-execution": dynamic(() => import("@/showcase/code-execution/controls").then((module) => createSample(module.codeExecutionControls, module.renderCodeExecution)), { loading: SampleLoading }),
  "confidence-answer": dynamic(() => import("@/showcase/confidence-answer/controls").then((module) => createSample(module.confidenceAnswerControls, module.renderConfidenceAnswer)), { loading: SampleLoading }),
  "context-files": dynamic(() => import("@/showcase/context-files/controls").then((module) => createSample(module.contextFilesControls, module.renderContextFiles)), { loading: SampleLoading }),
  "context-picker": dynamic(() => import("@/showcase/context-picker/controls").then((module) => createSample(module.contextPickerControls, module.renderContextPicker)), { loading: SampleLoading }),
  "context-usage": dynamic(() => import("@/showcase/context-usage/controls").then((module) => createSample(module.contextUsageControls, module.renderContextUsage)), { loading: SampleLoading }),
  "conversation-sidebar": dynamic(() => import("@/showcase/conversation-sidebar/controls").then((module) => createSample(module.conversationSidebarControls, module.renderConversationSidebar)), { loading: SampleLoading }),
  "cost-meter": dynamic(() => import("@/showcase/cost-meter/controls").then((module) => createSample(module.costMeterControls, module.renderCostMeter)), { loading: SampleLoading }),
  "edit-diff-view": dynamic(() => import("@/showcase/edit-diff-view/controls").then((module) => createSample(module.editDiffViewControls, module.renderEditDiffView)), { loading: SampleLoading }),
  "error-message": dynamic(() => import("@/showcase/error-message/controls").then((module) => createSample(module.errorMessageControls, module.renderErrorMessage)), { loading: SampleLoading }),
  "eval-results": dynamic(() => import("@/showcase/eval-results/controls").then((module) => createSample(module.evalResultsControls, module.renderEvalResults)), { loading: SampleLoading }),
  "file-upload": dynamic(() => import("@/showcase/file-upload/controls").then((module) => createSample(module.fileUploadControls, module.renderFileUpload)), { loading: SampleLoading }),
  "generated-media": dynamic(() => import("@/showcase/generated-media/controls").then((module) => createSample(module.generatedMediaControls, module.renderGeneratedMedia)), { loading: SampleLoading }),
  "generative-ui": dynamic(() => import("@/showcase/generative-ui/controls").then((module) => createSample(module.generativeUiControls, module.renderGenerativeUi)), { loading: SampleLoading }),
  "inline-correction": dynamic(() => import("@/showcase/inline-correction/controls").then((module) => createSample(module.inlineCorrectionControls, module.renderInlineCorrection)), { loading: SampleLoading }),
  "markdown-message": dynamic(() => import("@/showcase/markdown-message/controls").then((module) => createSample(module.markdownMessageControls, module.renderMarkdownMessage)), { loading: SampleLoading }),
  "memory-chip": dynamic(() => import("@/showcase/memory-chip/controls").then((module) => createSample(module.memoryChipControls, module.renderMemoryChip)), { loading: SampleLoading }),
  "memory-list": dynamic(() => import("@/showcase/memory-list/controls").then((module) => createSample(module.memoryListControls, module.renderMemoryList)), { loading: SampleLoading }),
  "memory-suggestion": dynamic(() => import("@/showcase/memory-suggestion/controls").then((module) => createSample(module.memorySuggestionControls, module.renderMemorySuggestion)), { loading: SampleLoading }),
  "memory-toast": dynamic(() => import("@/showcase/memory-toast/controls").then((module) => createSample(module.memoryToastControls, module.renderMemoryToast)), { loading: SampleLoading }),
  "message-actions": dynamic(() => import("@/showcase/message-actions/controls").then((module) => createSample(module.messageActionsControls, module.renderMessageActions)), { loading: SampleLoading }),
  "model-selector": dynamic(() => import("@/showcase/model-selector/controls").then((module) => createSample(module.modelSelectorControls, module.renderModelSelector)), { loading: SampleLoading }),
  "moderation-flag": dynamic(() => import("@/showcase/moderation-flag/controls").then((module) => createSample(module.moderationFlagControls, module.renderModerationFlag)), { loading: SampleLoading }),
  "output-comparison": dynamic(() => import("@/showcase/output-comparison/controls").then((module) => createSample(module.outputComparisonControls, module.renderOutputComparison)), { loading: SampleLoading }),
  "prompt-editor": dynamic(() => import("@/showcase/prompt-editor/controls").then((module) => createSample(module.promptEditorControls, module.renderPromptEditor)), { loading: SampleLoading }),
  "prompt-input": dynamic(() => import("@/showcase/prompt-input/controls").then((module) => createSample(module.promptInputControls, module.renderPromptInput)), { loading: SampleLoading }),
  "prompt-input-attachments": dynamic(() => import("@/showcase/prompt-input-attachments/controls").then((module) => createSample(module.promptInputAttachmentsControls, module.renderPromptInputAttachments)), { loading: SampleLoading }),
  "prompt-input-model-selector": dynamic(() => import("@/showcase/prompt-input-model-selector/controls").then((module) => createSample(module.promptInputModelSelectorControls, module.renderPromptInputModelSelector)), { loading: SampleLoading }),
  "reasoning": dynamic(() => import("@/showcase/reasoning/controls").then((module) => createSample(module.reasoningControls, module.renderReasoning)), { loading: SampleLoading }),
  "reasoning-level": dynamic(() => import("@/showcase/reasoning-level/controls").then((module) => createSample(module.reasoningLevelControls, module.renderReasoningLevel)), { loading: SampleLoading }),
  "reasoning-steps": dynamic(() => import("@/showcase/reasoning-steps/controls").then((module) => createSample(module.reasoningStepsControls, module.renderReasoningSteps)), { loading: SampleLoading }),
  "refusal-message": dynamic(() => import("@/showcase/refusal-message/controls").then((module) => createSample(module.refusalMessageControls, module.renderRefusalMessage)), { loading: SampleLoading }),
  "response-rating": dynamic(() => import("@/showcase/response-rating/controls").then((module) => createSample(module.responseRatingControls, module.renderResponseRating)), { loading: SampleLoading }),
  "response-versions": dynamic(() => import("@/showcase/response-versions/controls").then((module) => createSample(module.responseVersionsControls, module.renderResponseVersions)), { loading: SampleLoading }),
  "search-tool-call": dynamic(() => import("@/showcase/search-tool-call/controls").then((module) => createSample(module.searchToolCallControls, module.renderSearchToolCall)), { loading: SampleLoading }),
  "source-card": dynamic(() => import("@/showcase/source-card/controls").then((module) => createSample(module.sourceCardControls, module.renderSourceCard)), { loading: SampleLoading }),
  "source-list": dynamic(() => import("@/showcase/source-list/controls").then((module) => createSample(module.sourceListControls, module.renderSourceList)), { loading: SampleLoading }),
  "streaming-markdown": dynamic(() => import("@/showcase/streaming-markdown/controls").then((module) => createSample(module.streamingMarkdownControls, module.renderStreamingMarkdown)), { loading: SampleLoading }),
  "streaming-message": dynamic(() => import("@/showcase/streaming-message/controls").then((module) => createSample(module.streamingMessageControls, module.renderStreamingMessage)), { loading: SampleLoading }),
  "thinking-indicator": dynamic(() => import("@/showcase/thinking-indicator/controls").then((module) => createSample(module.thinkingIndicatorControls, module.renderThinkingIndicator)), { loading: SampleLoading }),
  "tool-call": dynamic(() => import("@/showcase/tool-call/controls").then((module) => createSample(module.toolCallControls, module.renderToolCall)), { loading: SampleLoading }),
  "tool-toggle": dynamic(() => import("@/showcase/tool-toggle/controls").then((module) => createSample(module.toolToggleControls, module.renderToolToggle)), { loading: SampleLoading }),
  "user-message": dynamic(() => import("@/showcase/user-message/controls").then((module) => createSample(module.userMessageControls, module.renderUserMessage)), { loading: SampleLoading }),
  "voice-call-controls": dynamic(() => import("@/showcase/voice-call-controls/controls").then((module) => createSample(module.voiceCallControlsControls, module.renderVoiceCallControls)), { loading: SampleLoading }),
  "voice-conversation": dynamic(() => import("@/showcase/voice-conversation/controls").then((module) => createSample(module.voiceConversationControls, module.renderVoiceConversation)), { loading: SampleLoading }),
  "voice-input": dynamic(() => import("@/showcase/voice-input/controls").then((module) => createSample(module.voiceInputControls, module.renderVoiceInput)), { loading: SampleLoading }),
  "voice-waveform": dynamic(() => import("@/showcase/voice-waveform/controls").then((module) => createSample(module.voiceWaveformControls, module.renderVoiceWaveform)), { loading: SampleLoading }),
};

export function NativeComponentSample({ slug, interactive = false }: { slug: string; interactive?: boolean }) {
  const Sample = samples[slug as keyof typeof samples];
  return Sample ? <Sample interactive={interactive} /> : null;
}
