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
  Activity,
  ArrowLeftRight,
  AtSign,
  AudioWaveform,
  AppWindow,
  Battery,
  BellRing,
  BookmarkCheck,
  Bot,
  Braces,
  Brain,
  ChevronsUpDown,
  CirclePause,
  CalendarClock,
  ClipboardCheck,
  Coins,
  Cpu,
  Database,
  Ellipsis,
  EyeOff,
  FileDiff,
  FileText,
  Files,
  Gauge,
  GitBranch,
  GitCompare,
  Globe,
  Hash,
  ImagePlay,
  Lightbulb,
  ListOrdered,
  LoaderCircle,
  MessageCircle,
  MessageSquare,
  MessageSquarePlus,
  MessageSquareQuote,
  MessageSquareWarning,
  Mic,
  MicOff,
  MicVocal,
  Network,
  Paperclip,
  Pencil,
  PenLine,
  PhoneOff,
  Pin,
  PlugZap,
  Quote,
  RefreshCw,
  RotateCcwClock,
  Route,
  Share2,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  Slash,
  Sparkles,
  Flag,
  BadgeQuestionMark,
  Square,
  SquareTerminal,
  TextCursor,
  TextCursorInput,
  TextInitial,
  Thermometer,
  ThumbsUp,
  ToggleRight,
  TriangleAlert,
  Upload,
  Volume2,
  WandSparkles,
  Wrench,
  Zap,
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
  {
    concept: "Prompt enhance",
    meaning: "One tap that rewrites a rough draft into a better prompt",
    icon: WandSparkles,
    category: "prompt-input",
    components: [],
  },
  {
    concept: "Slash command",
    meaning: "A typed shortcut to canned prompts and actions",
    icon: Slash,
    category: "prompt-input",
    components: [],
  },
  {
    concept: "Prompt template",
    meaning: "A saved prompt with {{variables}} to fill in",
    icon: Braces,
    category: "prompt-input",
    components: ["prompt-editor"],
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
  {
    concept: "Stop generation",
    meaning: "Halting a reply while it is still streaming",
    icon: Square,
    category: "messages",
    components: ["streaming-message", "prompt-input"],
  },
  {
    concept: "Edit message",
    meaning: "Changing a sent prompt and regenerating from it",
    icon: Pencil,
    category: "messages",
    components: ["user-message"],
  },
  {
    concept: "Response versions",
    meaning: "The 2/3 pager between regenerations of one answer",
    icon: GitBranch,
    category: "messages",
    components: ["response-versions"],
  },
  {
    concept: "Share conversation",
    meaning: "A link to this conversation for someone else",
    icon: Share2,
    category: "messages",
    components: ["message-actions"],
  },

  /* conversation */
  {
    concept: "Chat history",
    meaning: "Past conversations, grouped and searchable",
    icon: RotateCcwClock,
    category: "conversation",
    components: ["conversation-sidebar"],
  },
  {
    concept: "Pinned conversation",
    meaning: "Keeping a conversation at the top of the list",
    icon: Pin,
    category: "conversation",
    components: ["conversation-sidebar"],
  },
  {
    concept: "New chat",
    meaning: "Starting a fresh conversation",
    icon: MessageSquarePlus,
    category: "conversation",
    components: ["conversation-sidebar"],
  },
  {
    concept: "Artifact",
    meaning: "Generated output substantial enough to get its own panel",
    icon: AppWindow,
    category: "conversation",
    components: ["artifact-preview"],
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
  {
    concept: "Generative UI",
    meaning: "A component rendered from a tool result, not text",
    icon: Sparkles,
    category: "tool-calls",
    components: ["generative-ui"],
  },
  {
    concept: "Media generation",
    meaning: "An image, audio or video the model produced",
    icon: ImagePlay,
    category: "tool-calls",
    components: ["generated-media"],
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
  {
    concept: "Citation popover",
    meaning: "The passage behind a citation marker, on hover",
    icon: MessageSquareQuote,
    category: "sources",
    components: ["citation-popover"],
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
  {
    concept: "Agent plan",
    meaning: "The checklist an agent writes for itself",
    icon: Route,
    category: "agents",
    components: ["agent-plan"],
  },
  {
    concept: "Agent handoff",
    meaning: "One agent passing the task to another",
    icon: ArrowLeftRight,
    category: "agents",
    components: ["agent-handoff"],
  },
  {
    concept: "Agent timeline",
    meaning: "The activity log of a long agent run",
    icon: Activity,
    category: "agents",
    components: ["agent-run-timeline"],
  },
  {
    concept: "Multi-agent",
    meaning: "Several agents working in parallel",
    icon: Network,
    category: "agents",
    components: [],
  },
  {
    concept: "Interrupt agent",
    meaning: "Cutting into an agent mid-run to redirect it",
    icon: CirclePause,
    category: "agents",
    components: [],
  },
  {
    concept: "Scheduled agent",
    meaning: "An agent that runs on a timetable, not a prompt",
    icon: CalendarClock,
    category: "agents",
    components: [],
  },
  {
    concept: "Agent connector",
    meaning: "An external system the agent can act in, wired up",
    icon: PlugZap,
    category: "agents",
    components: [],
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
  {
    concept: "Context picker",
    meaning: "The @-mention menu for adding context",
    icon: AtSign,
    category: "files",
    components: ["context-picker"],
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
  {
    concept: "Voice call",
    meaning: "A live call with the assistant — mute, timer, end",
    icon: PhoneOff,
    category: "voice",
    components: ["voice-call-controls"],
  },
  {
    concept: "Read aloud",
    meaning: "The reply spoken as audio",
    icon: Volume2,
    category: "voice",
    components: [],
  },
  {
    concept: "Barge-in",
    meaning: "Talking over the assistant to cut it off",
    icon: MicOff,
    category: "voice",
    components: [],
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
  {
    concept: "Memory toast",
    meaning: "The receipt shown when a fact is saved",
    icon: BellRing,
    category: "memory",
    components: ["memory-toast"],
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
  {
    concept: "Cost",
    meaning: "What this reply or this conversation cost",
    icon: Coins,
    category: "model-settings",
    components: ["cost-meter"],
  },
  {
    concept: "Latency",
    meaning: "How long until the first token arrives",
    icon: Zap,
    category: "model-settings",
    components: [],
  },
  {
    concept: "Sampling",
    meaning: "How much randomness the model answers with",
    icon: Thermometer,
    category: "model-settings",
    components: [],
  },

  /* feedback */
  {
    concept: "Response rating",
    meaning: "Thumbs up or down on a reply, with a reason",
    icon: ThumbsUp,
    category: "feedback",
    components: ["response-rating", "message-actions"],
  },
  {
    concept: "Inline correction",
    meaning: "Fixing the answer where it is wrong",
    icon: PenLine,
    category: "feedback",
    components: ["inline-correction"],
  },
  {
    concept: "Output comparison",
    meaning: "Two answers side by side, labels hidden until picked",
    icon: GitCompare,
    category: "feedback",
    components: ["output-comparison"],
  },
  {
    concept: "Eval results",
    meaning: "Pass rates across a test suite",
    icon: ClipboardCheck,
    category: "feedback",
    components: ["eval-results"],
  },
  {
    concept: "Edit diff",
    meaning: "An AI-proposed edit, accepted or rejected per hunk",
    icon: FileDiff,
    category: "feedback",
    components: ["edit-diff-view"],
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
  {
    concept: "PII redaction",
    meaning: "Personal data stripped before the model sees it",
    icon: EyeOff,
    category: "safety",
    components: [],
  },
  {
    concept: "Prompt injection",
    meaning: "Instructions smuggled in through retrieved content",
    icon: ShieldAlert,
    category: "safety",
    components: [],
  },
  {
    concept: "Hallucination warning",
    meaning: "A flag on claims the model may have invented",
    icon: TriangleAlert,
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
