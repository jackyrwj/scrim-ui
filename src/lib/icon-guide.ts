/**
 * Which Lucide icon to use for each AI-interface Concept.
 *
 * Lucide ships 2034 icons and no opinion about which of them means "tool call".
 * That opinion is the whole point of this file: the icons are theirs, the
 * mapping is ours, and the mapping is the part nobody else has.
 *
 * Every `icon` here must also be reachable from src/lib/icons.ts where a
 * Component uses the same Concept, so the directory and this guide never
 * disagree about what a thing looks like.
 */
import {
  AudioWaveform,
  Battery,
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
  Hash,
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
  RefreshCw,
  ShieldCheck,
  ShieldX,
  Flag,
  BadgeQuestionMark,
  SquareTerminal,
  TextCursor,
  TextCursorInput,
  TextInitial,
  ToggleRight,
  Upload,
  Wrench,
  type LucideIcon,
} from "lucide-react";

export type IconGuideEntry = {
  /** The Concept, in the words a builder would use. */
  concept: string;
  /** One line on what it means, so the pairing can be argued with. */
  meaning: string;
  icon: LucideIcon;
  /** Category slug, for grouping. */
  category: string;
  /** Components that express this Concept — rendered as links. */
  components: string[];
};

export const iconGuide: IconGuideEntry[] = [
  /* prompt-input */
  {
    concept: "Prompt input",
    meaning: "The composer a person types a prompt into",
    icon: TextCursorInput,
    category: "prompt-input",
    components: ["prompt-input"],
  },
  {
    concept: "Attachment",
    meaning: "A file clipped to a prompt or message",
    icon: Paperclip,
    category: "prompt-input",
    components: ["prompt-input-attachments", "file-upload"],
  },
  {
    concept: "Model picker",
    meaning: "Switching models mid-conversation",
    icon: ChevronsUpDown,
    category: "prompt-input",
    components: ["prompt-input-model-selector", "model-selector"],
  },

  /* messages */
  {
    concept: "Message",
    meaning: "A single turn in a conversation",
    icon: MessageSquare,
    category: "messages",
    components: ["user-message", "markdown-message"],
  },
  {
    concept: "Streaming",
    meaning: "A reply arriving token by token, caret trailing the text",
    icon: TextCursor,
    category: "messages",
    components: ["streaming-message"],
  },
  {
    concept: "User turn",
    meaning: "The person's side of the conversation",
    icon: MessageCircle,
    category: "messages",
    components: ["user-message"],
  },
  {
    concept: "Rendered reply",
    meaning: "Markdown output — headings, lists, code blocks",
    icon: TextInitial,
    category: "messages",
    components: ["markdown-message"],
  },
  {
    concept: "Message actions",
    meaning: "Copy, share and feedback under a reply",
    icon: Ellipsis,
    category: "messages",
    components: ["message-actions"],
  },
  {
    concept: "Regenerate",
    meaning: "Ask the model for another answer to the same prompt",
    icon: RefreshCw,
    category: "messages",
    components: ["message-actions"],
  },
  {
    concept: "Model error",
    meaning: "The model failed, refused, or was rate limited",
    icon: MessageSquareWarning,
    category: "messages",
    components: ["error-message"],
  },

  /* reasoning */
  {
    concept: "Reasoning",
    meaning: "The model's visible chain of thought",
    icon: Brain,
    category: "reasoning",
    components: ["reasoning", "reasoning-steps"],
  },
  {
    concept: "Thinking",
    meaning: "Working, before the first token arrives",
    icon: LoaderCircle,
    category: "reasoning",
    components: ["thinking-indicator"],
  },
  {
    concept: "Reasoning steps",
    meaning: "A trace broken into ordered, inspectable steps",
    icon: ListOrdered,
    category: "reasoning",
    components: ["reasoning-steps"],
  },
  {
    concept: "Reasoning effort",
    meaning: "How much the model should think before answering",
    icon: Gauge,
    category: "reasoning",
    components: ["reasoning-level"],
  },

  /* tool-calls */
  {
    concept: "Tool call",
    meaning: "The model invoking a tool",
    icon: Wrench,
    category: "tool-calls",
    components: ["tool-call"],
  },
  {
    concept: "Web search",
    meaning: "A search of the web, run as a tool call",
    icon: Globe,
    category: "tool-calls",
    components: ["search-tool-call"],
  },
  {
    concept: "Code execution",
    meaning: "Code run in a sandbox, with its output",
    icon: SquareTerminal,
    category: "tool-calls",
    components: ["code-execution"],
  },
  {
    concept: "Tool toggle",
    meaning: "Turning an individual tool on or off",
    icon: ToggleRight,
    category: "tool-calls",
    components: ["tool-toggle"],
  },

  /* sources */
  {
    concept: "Source",
    meaning: "A document the answer was grounded in",
    icon: FileText,
    category: "sources",
    components: ["source-card"],
  },
  {
    concept: "Citation",
    meaning: "An inline marker pointing at a source",
    icon: Quote,
    category: "sources",
    components: ["citation-ui"],
  },

  /* agents */
  {
    concept: "Agent",
    meaning: "An autonomous run working on its own",
    icon: Bot,
    category: "agents",
    components: ["agent-status"],
  },
  {
    concept: "Approval gate",
    meaning: "A step that waits for a human to allow or deny it",
    icon: ShieldCheck,
    category: "agents",
    components: ["approval-request"],
  },

  /* files */
  {
    concept: "File upload",
    meaning: "Getting a file into the conversation",
    icon: Upload,
    category: "files",
    components: ["file-upload"],
  },
  {
    concept: "Files in context",
    meaning: "What the model can currently read",
    icon: Files,
    category: "files",
    components: ["context-files"],
  },
  {
    concept: "Context window",
    meaning: "How much of the model's context budget is used",
    icon: Battery,
    category: "files",
    components: ["context-files"],
  },

  /* voice */
  {
    concept: "Voice input",
    meaning: "Speaking to the model instead of typing",
    icon: Mic,
    category: "voice",
    components: ["voice-input"],
  },
  {
    concept: "Waveform",
    meaning: "Live audio level while listening or speaking",
    icon: AudioWaveform,
    category: "voice",
    components: ["voice-waveform"],
  },
  {
    concept: "Voice conversation",
    meaning: "A spoken exchange with turns and replay",
    icon: MicVocal,
    category: "voice",
    components: ["voice-conversation"],
  },

  /* memory */
  {
    concept: "Memory",
    meaning: "Facts the assistant keeps about you",
    icon: Database,
    category: "memory",
    components: ["memory-list"],
  },
  {
    concept: "Memory suggestion",
    meaning: "The assistant proposing to remember something",
    icon: Lightbulb,
    category: "memory",
    components: ["memory-suggestion"],
  },
  {
    concept: "Saved to memory",
    meaning: "Confirmation that a fact was kept",
    icon: BookmarkCheck,
    category: "memory",
    components: ["memory-chip"],
  },

  /* model-settings */
  {
    concept: "Model",
    meaning: "The model itself, and choosing between them",
    icon: Cpu,
    category: "model-settings",
    components: ["model-selector"],
  },
  {
    concept: "Token",
    meaning: "The unit a model reads, writes and bills in",
    icon: Hash,
    category: "model-settings",
    components: [],
  },
  /* safety */
  {
    concept: "Refusal",
    meaning: "The assistant declining a request, with the redirect still on the table",
    icon: ShieldX,
    category: "safety",
    components: ["refusal-message"],
  },
  {
    concept: "Moderation flag",
    meaning: "The content filter interrupting a prompt or a stream",
    icon: Flag,
    category: "safety",
    components: ["moderation-flag"],
  },
  {
    concept: "Confidence",
    meaning: "How sure the answer is, flagged where the claim is made",
    icon: BadgeQuestionMark,
    category: "safety",
    components: ["confidence-answer"],
  },
];

/**
 * The URL slug for a concept, derived rather than stored.
 *
 * Same reasoning as resourceSlug: a second field to keep in sync is a field
 * that goes out of sync. The assertion below runs at module load, so two
 * concepts that collide fail the build rather than silently shadowing each
 * other at /icons/<slug>.
 */
export function iconSlug(concept: string): string {
  return concept
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

{
  const seen = new Map<string, string>();
  for (const entry of iconGuide) {
    const slug = iconSlug(entry.concept);
    const clash = seen.get(slug);
    if (clash) {
      throw new Error(
        `Two icon concepts share the slug "${slug}": "${clash}" and "${entry.concept}". Rename one.`,
      );
    }
    seen.set(slug, entry.concept);
  }
}

export function getIconEntry(slug: string): IconGuideEntry | undefined {
  return iconGuide.find((e) => iconSlug(e.concept) === slug);
}

/** The rest of the concepts in the same category — what a reader compares against. */
export function relatedIcons(entry: IconGuideEntry): IconGuideEntry[] {
  return iconGuide.filter((e) => e.category === entry.category && e.concept !== entry.concept);
}
