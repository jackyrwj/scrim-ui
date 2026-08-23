/**
 * Which Lucide icon stands for each Category and Component.
 *
 * We use Lucide rather than drawing our own — see
 * docs/adr/0003-lucide-for-icons.md. Every name here was checked against the
 * installed package; a typo renders nothing, so add entries by copying a real
 * export out of `lucide-react`, never from memory.
 *
 * Only the site uses these. Copyable Components stay dependency-free by rule and
 * keep their own inline SVG.
 */
import {
  AudioWaveform,
  BookMarked,
  BookmarkCheck,
  Bot,
  Brain,
  ChevronsUpDown,
  Cpu,
  Database,
  Ellipsis,
  FileText,
  Files,
  Gauge,
  Globe,
  Layers,
  Lightbulb,
  ListOrdered,
  LoaderCircle,
  MessageCircle,
  MessageSquare,
  MessageSquareWarning,
  Mic,
  MicVocal,
  Paperclip,
  Quote,
  ShieldCheck,
  SlidersHorizontal,
  SquareTerminal,
  TextCursor,
  TextCursorInput,
  TextInitial,
  ToggleRight,
  Upload,
  Wrench,
  type LucideIcon,
} from "lucide-react";

/** Category slug -> its icon. Used by the homepage cards and the directory. */
export const categoryIcons: Record<string, LucideIcon> = {
  "prompt-input": TextCursorInput,
  messages: MessageSquare,
  reasoning: Brain,
  "tool-calls": Wrench,
  sources: BookMarked,
  agents: Bot,
  files: Files,
  voice: Mic,
  memory: Database,
  "model-settings": SlidersHorizontal,
};

/** Component slug -> its icon, for the dense directory rows. */
export const componentIcons: Record<string, LucideIcon> = {
  // prompt-input
  "prompt-input": TextCursorInput,
  "prompt-input-attachments": Paperclip,
  "prompt-input-model-selector": ChevronsUpDown,
  // messages
  "streaming-message": TextCursor,
  "user-message": MessageCircle,
  "message-actions": Ellipsis,
  "error-message": MessageSquareWarning,
  "markdown-message": TextInitial,
  // reasoning
  reasoning: Brain,
  "thinking-indicator": LoaderCircle,
  "reasoning-steps": ListOrdered,
  // tool-calls
  "tool-call": Wrench,
  "search-tool-call": Globe,
  "code-execution": SquareTerminal,
  // sources
  "source-card": FileText,
  "citation-ui": Quote,
  // agents
  "agent-status": Bot,
  "approval-request": ShieldCheck,
  // files
  "file-upload": Upload,
  "context-files": Files,
  // memory
  "memory-list": Database,
  "memory-suggestion": Lightbulb,
  "memory-chip": BookmarkCheck,
  // model-settings
  "model-selector": Cpu,
  "reasoning-level": Gauge,
  "tool-toggle": ToggleRight,
  // voice
  "voice-input": Mic,
  "voice-waveform": AudioWaveform,
  "voice-conversation": MicVocal,
};

/** Falls back to a neutral mark so a new Component never renders a blank cell. */
export function iconFor(slug: string): LucideIcon {
  return componentIcons[slug] ?? Layers;
}

/** Category icon, with the same guarantee. */
export function categoryIconFor(slug: string): LucideIcon {
  return categoryIcons[slug] ?? Layers;
}
