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
  ArrowLeftRight,
  AudioLines,
  AudioWaveform,
  BadgeQuestionMark,
  BellRing,
  BookMarked,
  BookmarkCheck,
  Bot,
  Braces,
  Brain,
  ChartPie,
  ChevronsUpDown,
  ClipboardCheck,
  Coins,
  Cpu,
  Database,
  Ellipsis,
  FileDiff,
  FileText,
  Files,
  Flag,
  Gauge,
  GitCompare,
  Globe,
  Hand,
  Layers,
  Lightbulb,
  List,
  ListOrdered,
  LoaderCircle,
  MessageCircle,
  MessageSquare,
  MessagesSquare,
  MessageSquareQuote,
  MessageSquareWarning,
  Mic,
  MicVocal,
  Paperclip,
  PenLine,
  PhoneOff,
  Quote,
  Route,
  ShieldCheck,
  ShieldX,
  SlidersHorizontal,
  Sparkles,
  SquareTerminal,
  Telescope,
  TextCursor,
  TextCursorInput,
  TextInitial,
  ThumbsUp,
  ToggleRight,
  Type,
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
  feedback: ThumbsUp,
  files: Files,
  voice: Mic,
  memory: Database,
  "model-settings": SlidersHorizontal,
  safety: ShieldCheck,
};

/** Component slug -> its icon, for the dense directory rows. */
export const componentIcons: Record<string, LucideIcon> = {
  // prompt-input
  "prompt-input": TextCursorInput,
  "prompt-input-attachments": Paperclip,
  "prompt-input-model-selector": ChevronsUpDown,
  "prompt-editor": Braces,
  // messages
  "streaming-message": TextCursor,
  "user-message": MessageCircle,
  "message-actions": Ellipsis,
  "error-message": MessageSquareWarning,
  "markdown-message": TextInitial,
  "streaming-markdown": Type,
  // reasoning
  reasoning: Brain,
  "thinking-indicator": LoaderCircle,
  "reasoning-steps": ListOrdered,
  // tool-calls
  "tool-call": Wrench,
  "search-tool-call": Globe,
  "code-execution": SquareTerminal,
  "generative-ui": Sparkles,
  // sources
  "source-card": FileText,
  "source-list": List,
  "citation-ui": Quote,
  "citation-popover": MessageSquareQuote,
  // agents
  "agent-status": Bot,
  "approval-request": ShieldCheck,
  "approval-gate": Hand,
  "agent-plan": Route,
  "agent-handoff": ArrowLeftRight,
  // feedback
  "response-rating": ThumbsUp,
  "inline-correction": PenLine,
  "output-comparison": GitCompare,
  "eval-results": ClipboardCheck,
  "edit-diff-view": FileDiff,
  // files
  "file-upload": Upload,
  "context-files": Files,
  "context-usage": ChartPie,
  // memory
  "memory-list": Database,
  "memory-suggestion": Lightbulb,
  "memory-chip": BookmarkCheck,
  "memory-toast": BellRing,
  // model-settings
  "model-selector": Cpu,
  "reasoning-level": Gauge,
  "tool-toggle": ToggleRight,
  "cost-meter": Coins,
  // safety
  "refusal-message": ShieldX,
  "moderation-flag": Flag,
  "confidence-answer": BadgeQuestionMark,
  // voice
  "voice-input": Mic,
  "voice-waveform": AudioWaveform,
  "voice-conversation": MicVocal,
  "voice-call-controls": PhoneOff,
};

/** Pattern slug -> its icon, for the pattern cards and their page headers. */
export const patternIcons: Record<string, LucideIcon> = {
  "ai-chat": MessagesSquare,
  "research-assistant": Telescope,
  "coding-agent": SquareTerminal,
  "voice-assistant": AudioLines,
  "model-preferences": SlidersHorizontal,
};

/** Falls back to a neutral mark so a new Component never renders a blank cell. */
export function iconFor(slug: string): LucideIcon {
  return componentIcons[slug] ?? Layers;
}

/** Pattern icon, with the same guarantee. */
export function patternIconFor(slug: string): LucideIcon {
  return patternIcons[slug] ?? Layers;
}

/** Category icon, with the same guarantee. */
export function categoryIconFor(slug: string): LucideIcon {
  return categoryIcons[slug] ?? Layers;
}
