/**
 * The AI concept icon set.
 *
 * Drawn to the Lucide spec — 24x24, 2px stroke, round cap/join, currentColor,
 * no fill — so these drop into a project already using Lucide and look native.
 * See docs/adr/0003-icon-set-on-the-lucide-spec.md for why, and CONTEXT.md for
 * what a Concept is.
 *
 * The inclusion rule: an icon earns its place only by naming a Concept this site
 * already has — a Category or a Component. One icon per Concept, never per
 * Component, so that no two silhouettes collide. That is why five message
 * Components produce three icons rather than five.
 */

export type IconConcept = {
  /** Icon name, kebab-case, used as the file name and the URL. */
  slug: string;
  /** What the icon means, one line. */
  meaning: string;
  /** The Category this Concept belongs to. */
  category: string;
  /** True when this is the Category's own icon (the ten homepage cards). */
  isCategoryIcon?: boolean;
  /** Component slugs this Concept covers — rendered as links on the icon page. */
  components: string[];
  /** SVG children. Stroke attributes live on the <svg>, never here. */
  body: string;
};

/** Speech bubble, shared by the message family so they stay one silhouette. */
const BUBBLE = "M20 14a2 2 0 0 1-2 2H8l-4 4V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2z";
/** Sheet of paper with a folded corner. */
const DOC = "M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z";
const DOC_FOLD = "M14 3v5h5";

export const iconConcepts: IconConcept[] = [
  /* ---- prompt-input ------------------------------------------------ */
  {
    slug: "prompt-input",
    meaning: "The composer a person types a prompt into",
    category: "prompt-input",
    isCategoryIcon: true,
    components: ["prompt-input", "prompt-input-model-selector"],
    body: `<rect x="2" y="5" width="20" height="14" rx="3"/><path d="M7 9.5v5"/><path d="M10.5 12h7"/>`,
  },
  {
    slug: "attachment",
    meaning: "A file clipped to a prompt or message",
    category: "prompt-input",
    components: ["prompt-input-attachments", "file-upload"],
    body: `<path d="M17 8v8a5 5 0 0 1-10 0V7a3 3 0 0 1 6 0v9a1 1 0 0 1-2 0V8"/>`,
  },

  /* ---- messages ---------------------------------------------------- */
  {
    slug: "message",
    meaning: "A single turn in a conversation",
    category: "messages",
    isCategoryIcon: true,
    components: ["user-message", "markdown-message", "message-actions"],
    body: `<path d="${BUBBLE}"/>`,
  },
  {
    slug: "streaming",
    meaning: "A reply arriving token by token, caret trailing the text",
    category: "messages",
    components: ["streaming-message"],
    body: `<path d="M4 8h15"/><path d="M4 15h7"/><path d="M13.5 12v6"/>`,
  },
  {
    slug: "regenerate",
    meaning: "Ask the model for another answer to the same prompt",
    category: "messages",
    components: ["message-actions"],
    body: `<path d="M21 12a9 9 0 1 1-2.6-6.4"/><path d="M21 3v5h-5"/><path d="M12 9.4 13 11l1.6 1-1.6 1-1 1.6-1-1.6L9.4 12 11 11z"/>`,
  },
  {
    slug: "model-error",
    meaning: "The model failed, refused, or was rate limited",
    category: "messages",
    components: ["error-message"],
    body: `<path d="${BUBBLE}"/><path d="M12 8v3"/><path d="M12 14h.01"/>`,
  },

  /* ---- reasoning --------------------------------------------------- */
  {
    slug: "reasoning",
    meaning: "The model's visible chain of thought",
    category: "reasoning",
    isCategoryIcon: true,
    components: ["reasoning", "reasoning-steps"],
    body: `<path d="M12 4.6a2.6 2.6 0 0 0-2.6 2.6A2.6 2.6 0 0 0 7.3 11a2.5 2.5 0 0 0 .4 4.4A2.6 2.6 0 0 0 12 19.4z"/><path d="M12 4.6a2.6 2.6 0 0 1 2.6 2.6A2.6 2.6 0 0 1 16.7 11a2.5 2.5 0 0 1-.4 4.4A2.6 2.6 0 0 1 12 19.4z"/>`,
  },
  {
    slug: "thinking",
    meaning: "Working, before the first token arrives",
    category: "reasoning",
    components: ["thinking-indicator"],
    body: `<circle cx="6" cy="13" r="1.4"/><circle cx="12" cy="11" r="1.4"/><circle cx="18" cy="13" r="1.4"/>`,
  },
  {
    slug: "reasoning-effort",
    meaning: "How much the model should think before answering",
    category: "reasoning",
    components: ["reasoning-level"],
    body: `<path d="M3.3 18a9 9 0 1 1 17.4 0"/><path d="m12 18 4.2-4.2"/>`,
  },

  /* ---- tool-calls -------------------------------------------------- */
  {
    slug: "tool-call",
    meaning: "The model invoking a tool",
    category: "tool-calls",
    isCategoryIcon: true,
    components: ["tool-call", "tool-toggle"],
    body: `<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>`,
  },
  {
    slug: "web-search",
    meaning: "A search of the web, run as a tool call",
    category: "tool-calls",
    components: ["search-tool-call"],
    body: `<circle cx="10" cy="10" r="7"/><path d="M3 10h14"/><ellipse cx="10" cy="10" rx="3.1" ry="7"/><path d="m15 15 6 6"/>`,
  },
  {
    slug: "code-execution",
    meaning: "Code run in a sandbox, with its output",
    category: "tool-calls",
    components: ["code-execution"],
    body: `<rect x="2" y="4" width="20" height="16" rx="3"/><path d="m6.5 9.5 3 2.5-3 2.5"/><path d="M12.5 15h5"/>`,
  },

  /* ---- sources ----------------------------------------------------- */
  {
    slug: "source",
    meaning: "A document the answer was grounded in",
    category: "sources",
    isCategoryIcon: true,
    components: ["source-card"],
    body: `<path d="${DOC}"/><path d="${DOC_FOLD}"/><path d="M9 13h6"/><path d="M9 17h4"/>`,
  },
  {
    slug: "citation",
    meaning: "An inline marker pointing at a source",
    category: "sources",
    components: ["citation-ui"],
    body: `<path d="M8 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h2"/><path d="M16 4h2a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-2"/><circle cx="12" cy="12" r="1.6"/>`,
  },

  /* ---- agents ------------------------------------------------------ */
  {
    slug: "agent",
    meaning: "An autonomous run working on its own",
    category: "agents",
    isCategoryIcon: true,
    components: ["agent-status"],
    body: `<rect x="4" y="8" width="16" height="12" rx="3"/><path d="M12 4.5V8"/><circle cx="12" cy="3" r="1.4"/><path d="M9 13h.01"/><path d="M15 13h.01"/>`,
  },
  {
    slug: "approval-gate",
    meaning: "A step that waits for a human to allow or deny it",
    category: "agents",
    components: ["approval-request"],
    body: `<path d="M12 3 4 6v6c0 4.5 3.3 7.9 8 9 4.7-1.1 8-4.5 8-9V6z"/><path d="m9 12 2 2 4-4"/>`,
  },

  /* ---- files ------------------------------------------------------- */
  {
    slug: "file",
    meaning: "Files the model can read",
    category: "files",
    isCategoryIcon: true,
    components: ["file-upload", "context-files"],
    body: `<path d="M10 2h5l4 4v9a2 2 0 0 1-2 2h-7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"/><path d="M15 2v4h4"/><path d="M16 17v3a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V7"/>`,
  },
  {
    slug: "context-window",
    meaning: "How much of the model's context budget is used",
    category: "files",
    components: ["context-files"],
    body: `<rect x="2" y="8" width="20" height="8" rx="2.5"/><path d="M7 8v8"/><path d="M12 8v8"/>`,
  },

  /* ---- voice ------------------------------------------------------- */
  {
    slug: "voice",
    meaning: "Speaking to the model instead of typing",
    category: "voice",
    isCategoryIcon: true,
    components: ["voice-input", "voice-conversation"],
    body: `<rect x="9" y="3" width="6" height="10" rx="3"/><path d="M5 11a7 7 0 0 0 14 0"/><path d="M12 18v3"/>`,
  },
  {
    slug: "waveform",
    meaning: "Live audio level while listening or speaking",
    category: "voice",
    components: ["voice-waveform"],
    body: `<path d="M4 10v4"/><path d="M8 7v10"/><path d="M12 4v16"/><path d="M16 7v10"/><path d="M20 10v4"/>`,
  },

  /* ---- memory ------------------------------------------------------ */
  {
    slug: "memory",
    meaning: "A fact the assistant keeps about you",
    category: "memory",
    isCategoryIcon: true,
    components: ["memory-list", "memory-suggestion", "memory-chip"],
    body: `<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M12 9 13.1 10.9 15 12l-1.9 1.1L12 15l-1.1-1.9L9 12l1.9-1.1z"/>`,
  },
  {
    slug: "forget",
    meaning: "Dropping a remembered fact",
    category: "memory",
    components: ["memory-list"],
    body: `<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M8.5 12h7"/>`,
  },

  /* ---- model-settings ---------------------------------------------- */
  {
    slug: "model",
    meaning: "The model itself, and choosing between them",
    category: "model-settings",
    isCategoryIcon: true,
    components: ["model-selector"],
    body: `<rect x="6" y="6" width="12" height="12" rx="2.5"/><rect x="10" y="10" width="4" height="4" rx="1"/><path d="M9.5 2.5V6"/><path d="M14.5 2.5V6"/><path d="M9.5 18v3.5"/><path d="M14.5 18v3.5"/><path d="M2.5 9.5H6"/><path d="M2.5 14.5H6"/><path d="M18 9.5h3.5"/><path d="M18 14.5h3.5"/>`,
  },
  {
    slug: "token",
    meaning: "Text split into the units a model is billed for",
    category: "model-settings",
    components: [],
    body: `<rect x="2" y="9" width="6" height="6" rx="1.5"/><rect x="9" y="9" width="5" height="6" rx="1.5"/><rect x="15" y="9" width="7" height="6" rx="1.5"/>`,
  },
];

/** The ten Category icons, in the order the homepage lists them. */
export const categoryIconOrder = [
  "prompt-input",
  "messages",
  "reasoning",
  "tool-calls",
  "sources",
  "agents",
  "files",
  "voice",
  "memory",
  "model-settings",
] as const;

export function getIcon(slug: string): IconConcept | undefined {
  return iconConcepts.find((i) => i.slug === slug);
}

/** The icon that represents a Category, for the homepage cards. */
export function getCategoryIcon(category: string): IconConcept | undefined {
  return iconConcepts.find((i) => i.category === category && i.isCategoryIcon);
}
