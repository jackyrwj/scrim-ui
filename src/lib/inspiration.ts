/**
 * Inspiration data — UI pattern breakdowns of products defining AI interfaces.
 *
 * Each article is an *evidence-driven* breakdown: element-by-element analysis,
 * design takeaways, and a closed loop back to our components. The analysis is
 * grounded in the product's public documentation — sections can carry a verbatim
 * quote from an official source (`evidence`), the article can include screenshots
 * of the cited official pages (`screenshots`) and a full list of sources
 * consulted (`sources`). Each section can also embed a *live demo* of the
 * matching component from our own library (via `elementSlug`), so the pattern is
 * always verifiable in the browser and always links to copyable code.
 */

export type InspirationEvidence = {
  /** Verbatim quote from the primary source. */
  quote: string;
  /** Short human label of the source, e.g. "OpenAI Help Center". */
  sourceLabel: string;
  /** Canonical URL of the source. */
  url: string;
};

export type InspirationScreenshot = {
  /** Public path to the image, e.g. /inspiration/chatgpt-citations-help.png */
  src: string;
  /** Accessible alt text. */
  alt: string;
  /** What the reader should notice in the shot. */
  caption: string;
  /** URL the screenshot was captured from. */
  source: string;
  /** Short label of the source page. */
  sourceLabel: string;
  /** ISO date the screenshot was captured. */
  accessed: string;
};

export type InspirationSection = {
  heading: string;
  /** Analysis points — concrete observations about the product's UI. */
  points: string[];
  /** Optional slug of a component in `src/showcase/registry.tsx` whose live
   *  demo illustrates the pattern being discussed. */
  elementSlug?: string;
  /** Verbatim quote from an official source that grounds this section. */
  evidence?: InspirationEvidence;
};

export type InspirationEntry = {
  slug: string;
  product: string;
  title: string;
  summary: string;
  sections: InspirationSection[];
  takeaways: string[];
  /** Component slugs to surface in the "Build it with our components" block. */
  componentSlugs: string[];
  /** Screenshots of the official pages cited in the article. */
  screenshots?: InspirationScreenshot[];
  /** Every source consulted, in order. */
  sources?: { label: string; url: string }[];
  /** Transparency note about the article's method. */
  disclaimer?: string;
};

export const inspirationEntries: InspirationEntry[] = [
  {
    slug: "chatgpt",
    product: "ChatGPT",
    title: "The streaming-first chat interface",
    summary:
      "OpenAI's ChatGPT defined the AI chat surface — streaming reveals, a composer that never leaves view, and citations that appear only once grounded.",
    disclaimer:
      "An independent reading of ChatGPT's interface, grounded in OpenAI's public documentation. Quotes are verbatim from the linked official pages; screenshots show the cited pages and were captured on 2026-08-16. The product UI may differ from what is shown.",
    sections: [
      {
        heading: "Streaming reveal",
        elementSlug: "streaming-message",
        points: [
          "The first token lands fast, then text streams into place with a blinking caret — momentum without a spinner.",
          "Send becomes Stop the moment generation starts: one control, two states, no second location to learn.",
          "While streaming, nothing else on the screen moves. The composer stays put and the message grows in place.",
        ],
        evidence: {
          quote:
            "we received the first token after 0.1 seconds, and subsequent tokens every ~0.01-0.02 seconds.",
          sourceLabel: "OpenAI Cookbook — How to stream completions",
          url: "https://developers.openai.com/cookbook/examples/how_to_stream_completions",
        },
      },
      {
        heading: "Composer-first layout",
        elementSlug: "prompt-input",
        points: [
          "The composer is always visible — never below the fold, never requiring a scroll to reach.",
          "Enter sends, Shift+Enter is a newline, slash opens commands. The keyboard is the primary path.",
          "Web search, voice and attachments live beside the input, not behind a menu.",
        ],
        evidence: {
          quote:
            "You can also click the web-search icon or use the “/Search” shortcut in supported experiences.",
          sourceLabel: "OpenAI Help Center — What is ChatGPT?",
          url: "https://help.openai.com/en/articles/12677804-what-is-chatgpt-faq",
        },
      },
      {
        heading: "Grounded citations",
        elementSlug: "citation-ui",
        points: [
          "Superscript numbers appear only after the answer is grounded — never while streaming.",
          "A small number sits at the end of a sentence; selecting it opens the source, hovering over it (desktop) previews it.",
          "A Sources list at the end of the response exposes everything the model consulted — which is often more than the inline citations show.",
        ],
        evidence: {
          quote:
            "ChatGPT responses that use search can include inline citations. Users can select a citation to view the source.",
          sourceLabel: "OpenAI Help Center — ChatGPT search for Enterprise and Edu",
          url: "https://help.openai.com/en/articles/10093903-chatgpt-search-for-enterprise-and-edu",
        },
      },
      {
        heading: "Model choice at the point of use",
        elementSlug: "prompt-input-model-selector",
        points: [
          "Switching models is one click from the composer, and your draft survives the switch.",
          "Each model surfaces its reasoning capability inline, so the choice reads as “which brain”, not “which settings screen”.",
        ],
      },
      {
        heading: "Graceful interruption",
        points: [
          "Stopping is one click and immediate; the partial answer stays visible and editable.",
          "Regenerate keeps context — the thread survives, only the turn re-rolls.",
        ],
      },
    ],
    takeaways: [
      "Put the composer where it can never scroll away — input always beats a scrolling window.",
      "Stream text in place with a caret; a visible stop control is the best progress indicator.",
      "Show citations only after grounding, attach them to sentences, and keep the hover card instant.",
      "Let users switch models and regenerate without losing their draft or the thread.",
    ],
    componentSlugs: ["prompt-input", "streaming-message", "citation-ui", "prompt-input-model-selector"],
    screenshots: [
      {
        src: "/inspiration/chatgpt-citations-help.png",
        alt: "OpenAI Help Center article describing how ChatGPT search renders inline citations and a Sources list",
        caption:
          "OpenAI's help center explains how search responses show inline citations, hover previews on desktop, and a Sources list.",
        source: "https://help.openai.com/en/articles/10093903-chatgpt-search-for-enterprise-and-edu",
        sourceLabel: "OpenAI Help Center",
        accessed: "2026-08-16",
      },
      {
        src: "/inspiration/chatgpt-web-search-docs.png",
        alt: "OpenAI API documentation for the web search tool, covering inline citations and the sources field",
        caption:
          "The API docs describe the same citations the product shows: inline url_citation annotations and a complete sources field.",
        source: "https://developers.openai.com/api/docs/guides/tools-web-search",
        sourceLabel: "OpenAI API docs",
        accessed: "2026-08-16",
      },
    ],
    sources: [
      {
        label: "OpenAI Help Center — What is ChatGPT? (FAQ)",
        url: "https://help.openai.com/en/articles/12677804-what-is-chatgpt-faq",
      },
      {
        label: "OpenAI Help Center — ChatGPT search for Enterprise and Edu",
        url: "https://help.openai.com/en/articles/10093903-chatgpt-search-for-enterprise-and-edu",
      },
      {
        label: "OpenAI API docs — Tools: web search",
        url: "https://developers.openai.com/api/docs/guides/tools-web-search",
      },
      {
        label: "OpenAI Cookbook — How to stream completions",
        url: "https://developers.openai.com/cookbook/examples/how_to_stream_completions",
      },
    ],
  },
  {
    slug: "claude",
    product: "Claude",
    title: "Reasoning traces, artifacts and a calmer visual language",
    summary:
      "Anthropic's Claude mainstreamed the thinking trace, artifacts that turn replies into canvases, and a warm low-contrast palette built for trust.",
    sections: [
      {
        heading: "Visible reasoning",
        elementSlug: "reasoning",
        points: [
          "The thinking trace collapses to a quiet header line — you see that it thought, and how long, without reading the thoughts.",
          "Expanding reveals step-by-step reasoning; the elapsed timer reads as progress, not impatience.",
          "Reasoning completes with a small check, not a fanfare — the outcome, not the process, stays central.",
        ],
      },
      {
        heading: "Artifacts over replies",
        points: [
          "When the answer is a document or app, Claude opens it beside the chat as a live canvas.",
          "The artifact becomes the interface; the chat stays the place to iterate on intent.",
          "Every edit re-rolls only the artifact — the conversation is the plan, the artifact is the product.",
        ],
      },
      {
        heading: "Restrained color",
        points: [
          "Warm neutrals and a single accent family — first terracotta, then violet; no neon, no gradient soup.",
          "Trust through calm: the interface recedes so the AI's work carries the attention.",
        ],
      },
      {
        heading: "Per-tool status, not JSON walls",
        elementSlug: "tool-call",
        points: [
          "Tool use renders as a compact status line — tool name, outcome, elapsed time.",
          "Inputs and outputs hide behind an expand/collapse; the result reads at a glance.",
        ],
      },
      {
        heading: "Draft-first composition",
        elementSlug: "prompt-input",
        points: [
          "Prompt editing stays inline with rich text; the draft is first-class, not a throwaway box.",
          "The composer communicates the product's personality before any answer does.",
        ],
      },
    ],
    takeaways: [
      "Show the work — reasoning, tools — but keep it collapsible and quiet: status over spectacle.",
      "When the answer is a document, give it a canvas; the chat edits intent, the canvas is the result.",
      "Warm, low-contrast palettes read as trustworthy for AI; one accent family is enough.",
      "Make every agent action auditable at a glance, with details one click away.",
    ],
    componentSlugs: ["reasoning", "tool-call", "prompt-input"],
  },
  {
    slug: "perplexity",
    product: "Perplexity",
    title: "Search and generation in one surface",
    summary:
      "Perplexity rebuilt search around an LLM — and its UI earns trust through visible tool calls, sentence-level citations and a persistent sources rail.",
    sections: [
      {
        heading: "Search as the default mode",
        elementSlug: "search-tool-call",
        points: [
          "Every query is a search; the tool call is shown as a small visible step, demystifying where the answer comes from.",
          "Elapsed time and result counts signal real work happening — not a magic answer.",
        ],
      },
      {
        heading: "Sentence-level citations",
        elementSlug: "citation-ui",
        points: [
          "Numbers attach to the claim, not the paragraph — a reader can verify the exact sentence.",
          "Hovering brings up the source card with domain, favicon and a snippet; credibility reads instantly.",
        ],
      },
      {
        heading: "The sources rail",
        elementSlug: "source-card",
        points: [
          "A persistent sidebar lists every source used, ranked by relevance, with expandable snippets.",
          "Sources persist across follow-ups, so later claims stay checkable against the same thread.",
        ],
      },
      {
        heading: "Follow-up flow",
        points: [
          "Suggested follow-ups keep the session moving; the thread reads like a conversation, not a query log.",
          "The composer is a single line — low friction, high volume — encouraging the next question.",
        ],
      },
    ],
    takeaways: [
      "Make the grounding visible: users trust what they can check, so show the search step.",
      "Attach citations to sentences, and keep the source card one hover away.",
      "Keep sources persistent across the whole thread — trust compounds turn by turn.",
      "A single-line composer with suggested follow-ups is the lowest-friction loop in AI UI.",
    ],
    componentSlugs: ["search-tool-call", "citation-ui", "source-card"],
  },
  {
    slug: "cursor",
    product: "Cursor",
    title: "The agentic editor that made agent state visible",
    summary:
      "Cursor turned coding into an agent task — and solved the trust problem with a persistent agent status, auditable tool calls and an explicit approval gate.",
    sections: [
      {
        heading: "Agent status, always in view",
        elementSlug: "agent-status",
        points: [
          "The agent's state — thinking, running, waiting — is a persistent quiet indicator, never a blocking modal.",
          "State changes announce themselves in place; the diff updates live as files change.",
        ],
      },
      {
        heading: "Tool calls you can audit",
        elementSlug: "tool-call",
        points: [
          "Every file read, write and shell command lists with its outcome — the agent's work is fully auditable.",
          "Expand to see the diff or command output; collapse to keep the flow.",
        ],
      },
      {
        heading: "The approval gate",
        elementSlug: "approval-request",
        points: [
          "Irreversible actions pause the agent until a human approves — the exact command is shown before it runs.",
          "Approve and deny are explicit and one click away; the default is to ask, not to act.",
        ],
      },
      {
        heading: "Diff-first communication",
        points: [
          "The agent communicates by editing, and the diff is the message — progress lives in the file tree, not a chat log.",
          "Chat scrolls out of the way; the workspace is the primary surface.",
        ],
      },
    ],
    takeaways: [
      "Keep agent state visible but quiet; announce changes in place, never in a modal.",
      "Auditability beats automation theater: show every action and its outcome.",
      "Gate irreversible actions behind explicit approval, with the exact command shown.",
      "Communicate by editing — make the diff the conversation, the workspace the surface.",
    ],
    componentSlugs: ["agent-status", "tool-call", "approval-request"],
  },
];

export function getInspirationEntry(slug: string): InspirationEntry | undefined {
  return inspirationEntries.find((entry) => entry.slug === slug);
}
