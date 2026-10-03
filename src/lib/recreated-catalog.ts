export const recreatedComponents = [
  { slug: "ai-agent-input", name: "AI Agent Input", category: "prompt-input", description: "An agent composer with file attachments, model selection and a prompt enhancement state.", sourceFile: "ai-agent-input.tsx" },
  { slug: "approval-card", name: "Approval Card", category: "agents", description: "A review card for commands, clarifying questions and short plans, with a visible decision state.", sourceFile: "approval-card.tsx" },
  { slug: "audio-waves", name: "Audio Waves", category: "voice", description: "A voice-input waveform with a live microphone test and a clear recording state.", sourceFile: "audio-waves.tsx" },
  { slug: "image-generation", name: "Image Generation State", category: "tool-calls", description: "A loading canvas that moves through queued, generating and ready states.", sourceFile: "image-generation.tsx" },
  { slug: "task-list", name: "Agent Task List", category: "agents", description: "A collapsible agent to-do list with done, active and pending task states.", sourceFile: "task-list.tsx" },
] as const;

export function getRecreatedComponent(slug: string) {
  return recreatedComponents.find((component) => component.slug === slug);
}
