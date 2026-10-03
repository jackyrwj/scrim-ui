"use client";

import { AiAgentInput } from "@/recreated-components/ai-agent-input";
import { ApprovalCard } from "@/recreated-components/approval-card";
import { AudioWaves } from "@/recreated-components/audio-waves";
import { ImageGenerationState } from "@/recreated-components/image-generation";
import { AgentTaskList } from "@/recreated-components/task-list";

export function RecreatedPreview({ slug }: { slug: string }) {
  switch (slug) {
    case "ai-agent-input": return <AiAgentInput />;
    case "approval-card": return <ApprovalCard />;
    case "audio-waves": return <AudioWaves />;
    case "image-generation": return <ImageGenerationState />;
    case "task-list": return <AgentTaskList />;
    default: return null;
  }
}
