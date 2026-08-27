/**
 * Inspiration data — evidence-driven articles about AI interfaces.
 *
 * Two kinds live here:
 *  - `case-study`: UI pattern breakdowns of products defining AI interfaces.
 *    Element-by-element analysis of a product's interface (`product` is set).
 *  - `guide`: decision-oriented articles that answer one open question (e.g.
 *    "when should a reply stream vs. wait?") with concrete recommendations
 *    (`product` is omitted, the card/header reads "Guide" instead).
 *
 * Both kinds are evidence-driven: sections can carry a verbatim quote from an
 * official source (`evidence`), the article can include a full list of sources
 * consulted (`sources`), and each section can embed a *live demo* of the
 * matching component from our own library (via `elementSlug`), so the pattern
 * is always verifiable in the browser and always links to copyable code.
 */

export type InspirationEvidence = {
  /** Verbatim quote from the primary source. */
  quote: string;
  /** Short human label of the source, e.g. "OpenAI Help Center". */
  sourceLabel: string;
  /** Canonical URL of the source. */
  url: string;
};

export type InspirationSection = {
  heading: string;
  /** Analysis points — observations about the product's UI, or recommendations
   *  for a decision guide. */
  points: string[];
  /** Optional slug of a component in `src/showcase/registry.tsx` whose live
   *  demo illustrates the pattern being discussed. */
  elementSlug?: string;
  /** Verbatim quote from an official source that grounds this section. */
  evidence?: InspirationEvidence;
};

export type InspirationEntry = {
  slug: string;
  /** The product a case-study covers; omitted for decision guides. */
  product?: string;
  kind: "case-study" | "guide";
  title: string;
  summary: string;
  sections: InspirationSection[];
  takeaways: string[];
  /** Component slugs to surface in the "Build it with our components" block. */
  componentSlugs: string[];
  /** Every source consulted, in order. */
  sources?: { label: string; url: string }[];
  /** Transparency note about the article's method. */
  disclaimer?: string;
};

export const inspirationEntries: InspirationEntry[] = [
  {
    slug: "chatgpt",
    product: "ChatGPT",
    kind: "case-study",
    title: "The streaming-first chat interface",
    summary:
      "OpenAI's ChatGPT defined the AI chat surface — streaming reveals, a composer that never leaves view, and citations that appear only once grounded.",
    disclaimer:
      "An independent reading of ChatGPT's interface, grounded in OpenAI's public documentation. Quotes are verbatim from the linked official pages. The product UI may differ from what is described.",
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
    kind: "case-study",
    title: "Reasoning traces, artifacts and a calmer visual language",
    summary:
      "Anthropic's Claude mainstreamed the thinking trace, artifacts that turn replies into canvases, and a warm low-contrast palette built for trust.",
    disclaimer:
      "An independent reading of Claude's interface, grounded in Anthropic's public documentation. Quotes are verbatim from the linked official pages. The product UI may differ from what is described.",
    sections: [
      {
        heading: "Visible reasoning",
        elementSlug: "reasoning",
        points: [
          "The thinking trace collapses to a quiet header line — you see that it thought, and how long, without reading the thoughts.",
          "Expanding reveals step-by-step reasoning; the elapsed timer reads as progress, not impatience.",
          "Reasoning completes with a small check, not a fanfare — the outcome, not the process, stays central.",
        ],
        evidence: {
          quote:
            "Click the \"Thinking\" section to view Claude's thought process summary and problem-solving approach. Reviewing it can be valuable for verifying how Claude arrived at its conclusion.",
          sourceLabel: "Claude Help Center — Change the model, effort, and thinking settings",
          url: "https://support.claude.com/en/articles/8664678-change-the-model-effort-and-thinking-settings",
        },
      },
      {
        heading: "Artifacts over replies",
        points: [
          "When the answer is a document or app, Claude opens it beside the chat as a live canvas.",
          "The artifact becomes the interface; the chat stays the place to iterate on intent.",
          "Every edit re-rolls only the artifact — the conversation is the plan, the artifact is the product.",
        ],
        evidence: {
          quote:
            "When Claude creates an artifact, you'll see the content displayed in a dedicated window to the right of the main chat.",
          sourceLabel: "Claude Help Center — What are artifacts and how do I use them?",
          url: "https://support.claude.com/en/articles/9487310-what-are-artifacts-and-how-do-i-use-them",
        },
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
        evidence: {
          quote:
            "Shows detailed tool usage and execution, with a timestamp and the model used on each assistant message. Also expands MCP calls, which collapse to a single line like “Called slack 3 times” by default",
          sourceLabel: "Claude Code docs — Interactive mode (transcript viewer)",
          url: "https://code.claude.com/docs/en/interactive-mode",
        },
      },
      {
        heading: "Draft-first composition",
        elementSlug: "prompt-input",
        points: [
          "Prompt editing stays inline with rich text; the draft is first-class, not a throwaway box.",
          "The composer communicates the product's personality before any answer does.",
        ],
        evidence: {
          quote:
            "For Markdown documents, you can edit in place: highlight the text you want changed, click \"Edit with Claude,\" and type your request. Claude makes the edit right where you marked it, so you don't have to describe which section you mean in the chat.",
          sourceLabel: "Claude Help Center — What are artifacts and how do I use them?",
          url: "https://support.claude.com/en/articles/9487310-what-are-artifacts-and-how-do-i-use-them",
        },
      },
    ],
    takeaways: [
      "Show the work — reasoning, tools — but keep it collapsible and quiet: status over spectacle.",
      "When the answer is a document, give it a canvas; the chat edits intent, the canvas is the result.",
      "Warm, low-contrast palettes read as trustworthy for AI; one accent family is enough.",
      "Make every agent action auditable at a glance, with details one click away.",
    ],
    componentSlugs: ["reasoning", "tool-call", "prompt-input"],
    sources: [
      {
        label: "Claude Help Center — Change the model, effort, and thinking settings",
        url: "https://support.claude.com/en/articles/8664678-change-the-model-effort-and-thinking-settings",
      },
      {
        label: "Claude Help Center — What are artifacts and how do I use them?",
        url: "https://support.claude.com/en/articles/9487310-what-are-artifacts-and-how-do-i-use-them",
      },
      {
        label: "Claude Code docs — Interactive mode (transcript viewer)",
        url: "https://code.claude.com/docs/en/interactive-mode",
      },
    ],
  },
  {
    slug: "perplexity",
    product: "Perplexity",
    kind: "case-study",
    title: "Search and generation in one surface",
    summary:
      "Perplexity rebuilt search around an LLM — and its UI earns trust through visible tool calls, sentence-level citations and a persistent sources rail.",
    disclaimer:
      "An independent reading of Perplexity's interface, grounded in Perplexity's official documentation. Quotes are verbatim from the linked official pages. The product UI may differ from what is described.",
    sections: [
      {
        heading: "Search as the default mode",
        elementSlug: "search-tool-call",
        points: [
          "Every query is a search; the tool call is shown as a small visible step, demystifying where the answer comes from.",
          "Elapsed time and result counts signal real work happening — not a magic answer.",
        ],
        evidence: {
          quote:
            "Simply ask any question, and it searches the web to deliver accessible, conversational answers backed by verifiable sources.",
          sourceLabel: "Perplexity Help Center — What is Perplexity?",
          url: "https://www.perplexity.ai/help-center/en/articles/10352155-what-is-perplexity.html",
        },
      },
      {
        heading: "Sentence-level citations",
        elementSlug: "citation-ui",
        points: [
          "Numbers attach to the claim, not the paragraph — a reader can verify the exact sentence.",
          "Hovering brings up the source card with domain, favicon and a snippet; credibility reads instantly.",
        ],
        evidence: {
          quote:
            "Each answer includes numbered citations linking to the original sources, allowing you to easily verify the information or explore further.",
          sourceLabel: "Perplexity Help Center — How does Perplexity work?",
          url: "https://www.perplexity.ai/help-center/en/articles/10352895-how-does-perplexity-work.html",
        },
      },
      {
        heading: "The sources rail",
        elementSlug: "source-card",
        points: [
          "A persistent sidebar lists every source used, ranked by relevance, with expandable snippets.",
          "Sources persist across follow-ups, so later claims stay checkable against the same thread.",
        ],
        evidence: {
          quote: "Select or hover over a source in an answer to open its details.",
          sourceLabel: "Perplexity Help Center — Understanding source labels",
          url: "https://www.perplexity.ai/help-center/en/articles/20260806-understanding-source-labels.html",
        },
      },
      {
        heading: "Follow-up flow",
        points: [
          "Suggested follow-ups keep the session moving; the thread reads like a conversation, not a query log.",
          "The composer is a single line — low friction, high volume — encouraging the next question.",
        ],
        evidence: {
          quote:
            "You can ask follow-up questions, and Perplexity will remember the context of your previous queries, ensuring a seamless, flowing conversation.",
          sourceLabel: "Perplexity Help Center — How does Perplexity work?",
          url: "https://www.perplexity.ai/help-center/en/articles/10352895-how-does-perplexity-work.html",
        },
      },
    ],
    takeaways: [
      "Make the grounding visible: users trust what they can check, so show the search step.",
      "Attach citations to sentences, and keep the source card one hover away.",
      "Keep sources persistent across the whole thread — trust compounds turn by turn.",
      "A single-line composer with suggested follow-ups is the lowest-friction loop in AI UI.",
    ],
    componentSlugs: ["search-tool-call", "citation-ui", "source-card"],
    sources: [
      {
        label: "Perplexity Help Center — What is Perplexity?",
        url: "https://www.perplexity.ai/help-center/en/articles/10352155-what-is-perplexity.html",
      },
      {
        label: "Perplexity Help Center — How does Perplexity work?",
        url: "https://www.perplexity.ai/help-center/en/articles/10352895-how-does-perplexity-work.html",
      },
      {
        label: "Perplexity Help Center — Understanding source labels",
        url: "https://www.perplexity.ai/help-center/en/articles/20260806-understanding-source-labels.html",
      },
    ],
  },
  {
    slug: "cursor",
    product: "Cursor",
    kind: "case-study",
    title: "The agentic editor that made agent state visible",
    summary:
      "Cursor turned coding into an agent task — and solved the trust problem with a persistent agent status, auditable tool calls and an explicit approval gate.",
    disclaimer:
      "An independent reading of Cursor's interface, grounded in Cursor's official documentation. Quotes are verbatim from the linked official pages. The product UI may differ from what is described.",
    sections: [
      {
        heading: "Agent status, always in view",
        elementSlug: "agent-status",
        points: [
          "The agent's state — thinking, running, waiting — is a persistent quiet indicator, never a blocking modal.",
          "State changes announce themselves in place; the diff updates live as files change.",
        ],
        evidence: {
          quote: "Watch edits appear in the diff view as they happen.",
          sourceLabel: "Cursor docs — Agent mode",
          url: "https://cursor.com/help/ai-features/agent",
        },
      },
      {
        heading: "Tool calls you can audit",
        elementSlug: "tool-call",
        points: [
          "Every file read, write and shell command lists with its outcome — the agent's work is fully auditable.",
          "Expand to see the diff or command output; collapse to keep the flow.",
        ],
        evidence: {
          quote:
            "Cursor includes tools that help agents write code: reading files, editing files, running terminal commands, searching the web, and more.",
          sourceLabel: "Cursor docs — Agent Security",
          url: "https://cursor.com/docs/agent/security",
        },
      },
      {
        heading: "The approval gate",
        elementSlug: "approval-request",
        points: [
          "Irreversible actions pause the agent until a human approves — the exact command is shown before it runs.",
          "Approve and deny are explicit and one click away; the default is to ask, not to act.",
        ],
        evidence: {
          quote:
            "Run Modes control how the Cursor agent runs tool calls, and when Cursor interrupts you for approval.",
          sourceLabel: "Cursor docs — Run Modes",
          url: "https://cursor.com/docs/agent/security/run-modes",
        },
      },
      {
        heading: "Diff-first communication",
        points: [
          "The agent communicates by editing, and the diff is the message — progress lives in the file tree, not a chat log.",
          "Chat scrolls out of the way; the workspace is the primary surface.",
        ],
        evidence: {
          quote:
            "Agent's edits are applied as it works. Review them in the diff view and reject anything you don't want.",
          sourceLabel: "Cursor docs — Agent mode",
          url: "https://cursor.com/help/ai-features/agent",
        },
      },
    ],
    takeaways: [
      "Keep agent state visible but quiet; announce changes in place, never in a modal.",
      "Auditability beats automation theater: show every action and its outcome.",
      "Gate irreversible actions behind explicit approval, with the exact command shown.",
      "Communicate by editing — make the diff the conversation, the workspace the surface.",
    ],
    componentSlugs: ["agent-status", "tool-call", "approval-request"],
    sources: [
      {
        label: "Cursor docs — Agent mode",
        url: "https://cursor.com/help/ai-features/agent",
      },
      {
        label: "Cursor docs — Agent Security",
        url: "https://cursor.com/docs/agent/security",
      },
      {
        label: "Cursor docs — Run Modes",
        url: "https://cursor.com/docs/agent/security/run-modes",
      },
    ],
  },
  {
    slug: "notion-ai",
    product: "Notion AI",
    kind: "case-study",
    title: "The AI that stayed inside the document",
    summary:
      "Notion never built a chat destination. The model lives in the editor — space to draft, highlight to edit, accept or discard — and its answers cite the workspace pages they came from.",
    disclaimer:
      "An independent reading of Notion AI's interface, grounded in Notion's official help center. Quotes are verbatim from the linked official pages. The product UI may differ from what is described.",
    sections: [
      {
        heading: "Draft in place, not in a chat window",
        elementSlug: "prompt-input",
        points: [
          "The prompt appears on the page itself — press space on a new line and the AI writes directly into the document.",
          "Context comes from the workspace: @-mention pages, people and dates instead of pasting content into a side panel.",
        ],
        evidence: {
          quote:
            "To draft or generate new text, press the space key on a new line and enter a prompt. Notion AI writes directly on the page, and you can @-mention pages, people, and dates to give it context.",
          sourceLabel: "Notion Help Center — Use Notion AI to write better, more efficient notes and docs",
          url: "https://www.notion.com/help/guides/notion-ai-for-docs",
        },
      },
      {
        heading: "An edit is a review loop",
        elementSlug: "message-actions",
        points: [
          "Editing a selection is not an overwrite — the suggestion arrives as something you accept, discard, or send back for another try.",
          "The original text survives until the reader explicitly keeps the new one; the AI proposes, the writer disposes.",
        ],
        evidence: {
          quote:
            "Give it a prompt like fix grammar, make it shorter, or change the tone, then accept, discard, or ask it to try again.",
          sourceLabel: "Notion Help Center — Use Notion AI to write better, more efficient notes and docs",
          url: "https://www.notion.com/help/guides/notion-ai-for-docs",
        },
      },
      {
        heading: "One agent across the workspace and beyond",
        elementSlug: "search-tool-call",
        points: [
          "The same agent summarizes the page you're on or ranges across Notion and connected tools — the surface doesn't change, only the scope.",
          "Multi-step tasks run from the same entry point; there is no separate 'agent mode' to learn.",
        ],
        evidence: {
          quote:
            "Ask it to summarize the current page, find something across Notion and connected tools like Slack or Google Drive, or take a multi-step task from start to finish.",
          sourceLabel: "Notion Help Center — Use Notion AI to write better, more efficient notes and docs",
          url: "https://www.notion.com/help/guides/notion-ai-for-docs",
        },
      },
      {
        heading: "Answers cite the pages they came from",
        elementSlug: "citation-ui",
        points: [
          "Answers pulled from connected apps carry citations back to the original material — provenance is part of the answer, not an afterthought.",
          "The claim and its source travel together, so trust is checkable without leaving the thread.",
        ],
        evidence: {
          quote:
            "With Notion AI Connectors, your questions can also pull in relevant information from your connected apps, with citations to the sources used.",
          sourceLabel: "Notion Help Center — Notion AI Connectors overview",
          url: "https://www.notion.com/help/notion-ai-connectors",
        },
      },
      {
        heading: "Scope is a control, not a prompt trick",
        elementSlug: "context-files",
        points: [
          "An 'All sources' picker in the chat box narrows which page or source the AI analyzes — the user sets the boundary explicitly.",
          "Scoping is UI, not prompt engineering: the reader never has to write 'only look at X' and hope.",
        ],
        evidence: {
          quote:
            "Look for the All sources option at the bottom of your Notion AI chat box. Select the page or source you want Notion AI to analyze for a specific answer.",
          sourceLabel: "Notion Help Center — Everything you can do with Notion AI",
          url: "https://www.notion.com/help/guides/everything-you-can-do-with-notion-ai",
        },
      },
      {
        heading: "Citations you can inspect",
        elementSlug: "citation-popover",
        points: [
          "In AI Meeting Notes, hovering a citation previews the exact transcript snippet behind it — verification is a hover, not a hunt.",
          "Clicking jumps to the line in the transcript; the popover and the source never disagree because they are the same reference.",
        ],
        evidence: {
          quote:
            "You’ll also find citations to your transcript in your meeting notes summary. Hover over a citation to see the snippet of your transcript that’s been referenced.",
          sourceLabel: "Notion Help Center — Notion AI FAQs",
          url: "https://www.notion.com/help/notion-ai-faqs",
        },
      },
    ],
    takeaways: [
      "Put the model where the work already is; a separate chat window is a context switch you imposed on the user.",
      "AI edits should arrive as proposals with accept/discard — never silent overwrites.",
      "Citations belong in the answer itself, inspectable on hover and jumpable on click.",
      "Make scope an explicit control; 'All sources' beats praying the prompt was clear.",
    ],
    componentSlugs: ["prompt-input", "citation-ui", "citation-popover"],
    sources: [
      {
        label: "Notion Help Center — Use Notion AI to write better, more efficient notes and docs",
        url: "https://www.notion.com/help/guides/notion-ai-for-docs",
      },
      {
        label: "Notion Help Center — Notion AI Connectors overview",
        url: "https://www.notion.com/help/notion-ai-connectors",
      },
      {
        label: "Notion Help Center — Everything you can do with Notion AI",
        url: "https://www.notion.com/help/guides/everything-you-can-do-with-notion-ai",
      },
      {
        label: "Notion Help Center — Notion AI FAQs",
        url: "https://www.notion.com/help/notion-ai-faqs",
      },
    ],
  },
  {
    slug: "lovable",
    product: "Lovable",
    kind: "case-study",
    title: "Chat-first building with the code always in reach",
    summary:
      "Lovable builds apps from a conversation, but the interface keeps a way out of the chat: plan before build, visual edits without prompting, real code in a real editor, and a revert for everything.",
    disclaimer:
      "An independent reading of Lovable's interface, grounded in Lovable's official documentation. Quotes are verbatim from the linked official pages. The product UI may differ from what is described.",
    sections: [
      {
        heading: "Plan mode decides, Build mode executes",
        elementSlug: "approval-gate",
        points: [
          "Two chat modes separate deliberation from execution — Plan mode can inspect files and logs but never touches code until the plan is approved.",
          "The approval is the boundary: thinking is free, changing things costs a confirmation.",
        ],
        evidence: {
          quote: "Plan mode never modifies your code.",
          sourceLabel: "Lovable Docs — Plan mode",
          url: "https://docs.lovable.dev/features/plan-mode",
        },
      },
      {
        heading: "Edit the page, not the prompt",
        points: [
          "Visual edits target an element directly from the preview toolbar — click it, change the text in place, no prompt required.",
          "For targeted changes the selected element becomes the context; the chat is reserved for changes you can't point at.",
        ],
        evidence: {
          quote: "Use Edit text inline to change words on the page without writing a prompt.",
          sourceLabel: "Lovable Docs — Visual edits",
          url: "https://docs.lovable.dev/features/visual-edit",
        },
      },
      {
        heading: "Knowledge the agent can't forget",
        elementSlug: "memory-list",
        points: [
          "A plain-text knowledge field carries standing instructions with every message — conventions are written once, not repeated per chat.",
          "Persistent context is visible and editable, so the user always knows what the agent assumes.",
        ],
        evidence: {
          quote: "Knowledge is always included in context.",
          sourceLabel: "Lovable Docs — Knowledge",
          url: "https://docs.lovable.dev/features/knowledge",
        },
      },
      {
        heading: "Real code, one click away",
        points: [
          "The code editor exposes the actual generated code with manual edits applied instantly — the chat is an interface to real files, not a black box.",
          "GitHub sync runs both ways: Lovable commits to the repo, and pushes to the branch flow back into the project.",
        ],
        evidence: {
          quote: "Everything Lovable builds is real, standard code, and the code editor is where you see it.",
          sourceLabel: "Lovable Docs — Code mode",
          url: "https://docs.lovable.dev/features/code-mode",
        },
      },
      {
        heading: "Every change is revertible",
        points: [
          "Each agent change auto-creates a version; any earlier state can be previewed and restored without losing the conversation that produced it.",
          "Fearless iteration is a UI feature: the revert button is what makes 'just try it' safe to say.",
        ],
        evidence: {
          quote: "Every change Lovable makes to your project creates a version automatically.",
          sourceLabel: "Lovable Docs — Project history",
          url: "https://docs.lovable.dev/features/projects/history",
        },
      },
      {
        heading: "Publish is a snapshot, not a pipeline",
        points: [
          "One button in the editor's top-right deploys a snapshot of the current version to a live URL.",
          "Later edits stay private until republished — what users see is always a deliberate release.",
        ],
        evidence: {
          quote: "Each time you publish, Lovable deploys a snapshot of your project to a live URL.",
          sourceLabel: "Lovable Docs — Publish",
          url: "https://docs.lovable.dev/features/publish",
        },
      },
    ],
    takeaways: [
      "Separate deciding from doing: a plan mode that never modifies code earns the trust to execute later.",
      "Let users point at what they mean — visual edits beat prompt gymnastics for local changes.",
      "Persistent context should be visible and editable, not inferred and hidden.",
      "Versioning turns agent mistakes into a shrug; auto-version every change and make restore one click.",
    ],
    componentSlugs: ["approval-gate", "memory-list", "prompt-input"],
    sources: [
      {
        label: "Lovable Docs — Plan mode",
        url: "https://docs.lovable.dev/features/plan-mode",
      },
      {
        label: "Lovable Docs — Visual edits",
        url: "https://docs.lovable.dev/features/visual-edit",
      },
      {
        label: "Lovable Docs — Knowledge",
        url: "https://docs.lovable.dev/features/knowledge",
      },
      {
        label: "Lovable Docs — Code mode",
        url: "https://docs.lovable.dev/features/code-mode",
      },
      {
        label: "Lovable Docs — Project history",
        url: "https://docs.lovable.dev/features/projects/history",
      },
      {
        label: "Lovable Docs — Publish",
        url: "https://docs.lovable.dev/features/publish",
      },
    ],
  },
  {
    slug: "gemini",
    product: "Gemini",
    kind: "case-study",
    title: "The assistant that keeps its drafts on the table",
    summary:
      "Gemini treats one answer as a starting point: alternate drafts to flip between, sources a click away, tools you can invoke by name, and a research plan you edit before it runs.",
    disclaimer:
      "An independent reading of Gemini's interface, grounded in Google's official help pages. Quotes are verbatim from the linked official pages. The product UI may differ from what is described.",
    sections: [
      {
        heading: "One answer, several drafts",
        elementSlug: "output-comparison",
        points: [
          "For many prompts Gemini generates alternate drafts, and a control above the response lets the reader flip between them.",
          "The first answer is presented as a sample, not a verdict — regenerating is browsing, not admitting failure.",
        ],
        evidence: {
          quote:
            "For some prompts, you can review other drafts that Gemini creates. This option is only available for the latest response. Above the response, click View other drafts or Show drafts.",
          sourceLabel: "Google Help — Use Gemini Apps",
          url: "https://support.google.com/gemini/answer/13275745?hl=en",
        },
      },
      {
        heading: "Sources inline and in a side panel",
        elementSlug: "source-list",
        points: [
          "Source markers appear inside the response and a Sources button opens a side panel of links — two depths of verification.",
          "Skimmers get provenance in place; doubters get the full list without leaving the page.",
        ],
        evidence: {
          quote:
            "When sources are available, you can find the Sources button at the bottom of the response or in-line throughout the response. On the right, a side panel will open with the relevant links.",
          sourceLabel: "Google Help — View related sources from Gemini Apps",
          url: "https://support.google.com/gemini/answer/14143489?hl=en",
        },
      },
      {
        heading: "Tools you can call by name",
        elementSlug: "tool-call",
        points: [
          "Typing @ and picking an app forces the tool call — the user can invoke Gmail, Drive or YouTube directly instead of hoping the model infers it.",
          "Left alone, Gemini auto-invokes available apps; the @ is the explicit override.",
        ],
        evidence: {
          quote: "To specify an app for Gemini to use, enter @ and select the app.",
          sourceLabel: "Google Help — Use & manage Connected Apps in Gemini",
          url: "https://support.google.com/gemini/answer/13695044?hl=en",
        },
      },
      {
        heading: "Gems: saved behavior, not saved prompts",
        points: [
          "Gems package instructions and file knowledge into a reusable agent — customization is a named, editable object rather than a prompt pasted at the top of every chat.",
          "Gemini offers to rewrite weak instructions; the product helps write its own configuration.",
        ],
        evidence: {
          quote:
            "You can create and save Gems to customize responses in Gemini Apps to your specific needs.",
          sourceLabel: "Google Help — Use Gems in Gemini Apps",
          url: "https://support.google.com/gemini/answer/15146780?hl=en",
        },
      },
      {
        heading: "Deep Research shows the plan first",
        elementSlug: "agent-plan",
        points: [
          "Before running for minutes in the background, Deep Research presents an editable research plan — the user corrects the approach before the compute is spent.",
          "Long tasks announce their shape up front and notify on completion; waiting is designed, not endured.",
        ],
        evidence: {
          quote:
            "Gemini will create a research plan for your topic. To update the research plan before you create a report, click Edit plan.",
          sourceLabel: "Google Help — Use Deep Research in Gemini Apps",
          url: "https://support.google.com/gemini/answer/15719111?hl=en",
        },
      },
      {
        heading: "Uncertainty, said out loud",
        elementSlug: "confidence-answer",
        points: [
          "The product's own documentation instructs double-checking and describes disclaimers inside the experience — fallibility is part of the interface, not a footnote.",
          "The honest pattern: name the limitation where the answer is read, in language a non-engineer can act on.",
        ],
        evidence: {
          quote:
            "Gemini Apps can make mistakes. When using Gemini Apps, double-check responses and don’t rely on responses from Gemini Apps for professional advice.",
          sourceLabel: "Google Help — Use Gemini Apps",
          url: "https://support.google.com/gemini/answer/13275745?hl=en",
        },
      },
    ],
    takeaways: [
      "Offer drafts: presenting the first answer as one of several resets the reader's expectation of authority.",
      "Two depths of sources — inline markers for skimmers, a panel for doubters.",
      "Let users invoke tools explicitly (@app) instead of relying on model inference alone.",
      "For long tasks, show an editable plan before spending the compute.",
    ],
    componentSlugs: ["output-comparison", "agent-plan", "confidence-answer"],
    sources: [
      {
        label: "Google Help — Use Gemini Apps",
        url: "https://support.google.com/gemini/answer/13275745?hl=en",
      },
      {
        label: "Google Help — View related sources from Gemini Apps",
        url: "https://support.google.com/gemini/answer/14143489?hl=en",
      },
      {
        label: "Google Help — Use & manage Connected Apps in Gemini",
        url: "https://support.google.com/gemini/answer/13695044?hl=en",
      },
      {
        label: "Google Help — Use Gems in Gemini Apps",
        url: "https://support.google.com/gemini/answer/15146780?hl=en",
      },
      {
        label: "Google Help — Use Deep Research in Gemini Apps",
        url: "https://support.google.com/gemini/answer/15719111?hl=en",
      },
    ],
  },
  {
    slug: "replit",
    product: "Replit",
    kind: "case-study",
    title: "The agent that keeps a save point under every step",
    summary:
      "Replit Agent builds whole apps from a chat, and the interface answers the fear that creates: checkpoints you can roll back to, a plan you approve before building, and a preview running beside the conversation.",
    disclaimer:
      "An independent reading of Replit's interface, grounded in Replit's official documentation. Quotes are verbatim from the linked official pages. The product UI may differ from what is described.",
    sections: [
      {
        heading: "Checkpoints, in video-game terms",
        points: [
          "The Agent snapshots the whole project at milestones — files, config, and conversation context — without being asked.",
          "The docs explain recovery as a save point in a video game: recovery framing a non-developer already understands.",
        ],
        evidence: {
          quote:
            "Think of checkpoints as save points in a video game - you can always go back to a working version of your app.",
          sourceLabel: "Replit Docs — Checkpoints and Rollbacks",
          url: "https://docs.replit.com/features/version-control/checkpoints-and-rollbacks",
        },
      },
      {
        heading: "Rollback restores everything, not just code",
        points: [
          "One click in the Agent tab restores the entire environment to a previous checkpoint — including the AI conversation context that produced it.",
          "Reverting the state without reverting the conversation would lose the record of why; both travel together.",
        ],
        evidence: {
          quote:
            "Rollback functionality allows you to restore your Replit App to any previous checkpoint state with a single click.",
          sourceLabel: "Replit Docs — Checkpoints and Rollbacks",
          url: "https://docs.replit.com/features/version-control/checkpoints-and-rollbacks",
        },
      },
      {
        heading: "Plan mode before Build mode",
        points: [
          "A mode selector in the chat input separates ideation from execution — Plan mode guarantees nothing changes while you think.",
          "The guarantee is stated as a product promise, which is what makes brainstorming with an agent safe.",
        ],
        evidence: {
          quote:
            "Unlike Build mode, Plan mode focuses on planning and ideation, helping you think through projects before writing code.",
          sourceLabel: "Replit Docs — Plan Mode",
          url: "https://docs.replit.com/features/agent/plan-mode",
        },
      },
      {
        heading: "The plan is approved before the build",
        elementSlug: "agent-plan",
        points: [
          "Agent presents an ordered, editable task list and waits — building starts only after explicit approval.",
          "The user corrects the plan while corrections are still cheap: before the code exists.",
        ],
        evidence: {
          quote:
            "Agent creates an ordered task list you can review and refine. When you’re happy with the plan, approve it and Agent starts building.",
          sourceLabel: "Replit Docs — Replit Agent",
          url: "https://docs.replit.com/features/agent/overview",
        },
      },
      {
        heading: "The app runs beside the conversation",
        points: [
          "The Preview pane renders the running app with browser-like devtools, in the same workspace as the chat — testing never requires a context switch.",
          "Build and verify share one screen; the loop between 'change it' and 'see it' has no window-hopping in it.",
        ],
        evidence: {
          quote: "The Preview tool renders the page just as you would see in a browser.",
          sourceLabel: "Replit Docs — Preview",
          url: "https://docs.replit.com/features/editor/preview",
        },
      },
      {
        heading: "The agent tests in front of you",
        elementSlug: "agent-status",
        points: [
          "App testing is visible work: the agent's own cursor clicks around the app, exercising the interface it just built.",
          "Watching verification happen is worth more than a 'tested' badge — the reader can see what was actually tried.",
        ],
        evidence: {
          quote:
            "Watch Agent's cursor as it clicks around your app, testing functionality",
          sourceLabel: "Replit Docs — App Testing",
          url: "https://docs.replit.com/features/agent/app-testing",
        },
      },
    ],
    takeaways: [
      "Explain recovery in terms your audience already has — 'save point in a video game' beats 'snapshot restore'.",
      "Rollback must restore context as well as code, or the record of why disappears.",
      "Guarantee a no-side-effects mode for thinking; approval gates work because Plan mode made deciding safe.",
      "Let the user watch the agent verify its own work — visible testing beats a trust-me badge.",
    ],
    componentSlugs: ["agent-plan", "agent-status"],
    sources: [
      {
        label: "Replit Docs — Checkpoints and Rollbacks",
        url: "https://docs.replit.com/features/version-control/checkpoints-and-rollbacks",
      },
      {
        label: "Replit Docs — Plan Mode",
        url: "https://docs.replit.com/features/agent/plan-mode",
      },
      {
        label: "Replit Docs — Replit Agent",
        url: "https://docs.replit.com/features/agent/overview",
      },
      {
        label: "Replit Docs — Preview",
        url: "https://docs.replit.com/features/editor/preview",
      },
      {
        label: "Replit Docs — Publishing",
        url: "https://docs.replit.com/features/publishing/overview",
      },
      {
        label: "Replit Docs — App Testing",
        url: "https://docs.replit.com/features/agent/app-testing",
      },
    ],
  },
  {
    slug: "streaming-vs-full-reply",
    kind: "guide",
    title: "Streaming vs. waiting for the full reply",
    summary:
      "Most AI products stream by default — but streaming is a UX decision, not a protocol one. Here is when a streaming reveal earns its place, when a single rendered answer is better, and how to tell the difference.",
    disclaimer:
      "An independent guide, grounded in official documentation from OpenAI, Anthropic and the Vercel AI SDK. Quotes are verbatim from the linked official pages and verified against them.",
    sections: [
      {
        heading: "Why every chat streams",
        elementSlug: "streaming-message",
        points: [
          "Streaming turns wait time into reading time: the reply starts appearing while the model is still finishing it, so the user never stares at a spinner.",
          "A blinking caret reads as “actively producing” — the fastest honest progress indicator a text interface has.",
          "The composer keeps its place; the message grows in place. Nothing else on screen moves, so the only change is the answer arriving.",
        ],
        evidence: {
          quote:
            "Streaming responses lets you start printing or processing the beginning of the model’s output while it continues generating the full response.",
          sourceLabel: "OpenAI API docs — Streaming responses",
          url: "https://developers.openai.com/api/docs/guides/streaming-responses",
        },
      },
      {
        heading: "First token is the interface",
        points: [
          "Users judge speed by when text starts appearing, not when it finishes — time to first token dominates perceived performance.",
          "The ideal sequence is an instant send, a near-instant first token, then a steady stream that matches reading speed.",
          "If the first token is slow, streaming feels broken; the fix is faster start, not prettier animation.",
        ],
        evidence: {
          quote:
            "The single most effective approach, as it cuts the waiting time to a second or less. (ChatGPT would feel pretty different if you saw nothing until each response was done.)",
          sourceLabel: "OpenAI API docs — Latency optimization",
          url: "https://developers.openai.com/api/docs/guides/latency-optimization",
        },
      },
      {
        heading: "Stream with an off-ramp",
        points: [
          "Give users a way out mid-stream: the send button becomes a Stop control, and the partial answer stays visible and usable after stopping.",
          "Regenerate keeps the thread — only the turn re-rolls, the context survives.",
          "Treat speed as a product choice: some products need the stream to pace a tutorial, others need it instant and skippable.",
        ],
        evidence: {
          quote:
            "Canceling ongoing streams is often needed. For example, users might want to stop a stream when they realize that the response is not what they want.",
          sourceLabel: "Vercel AI SDK docs — Advanced: Stopping Streams",
          url: "https://ai-sdk.dev/docs/advanced/stopping-streams",
        },
      },
      {
        heading: "Structured output: wait for the schema",
        points: [
          "Render structured output (JSON, tables, forms) once it is parsed and validated — a half-typed row of JSON is worse than a moment of quiet.",
          "Schema guarantees apply to the finished object, not the stream: a partial object is data that may not conform yet.",
          "For exact output — code, contracts, numbers — stream the preview but keep the copy button waiting for the finished, validated result.",
        ],
        evidence: {
          quote:
            "Partial outputs streamed via streamText cannot be validated against your provided schema, as incomplete data may not yet conform to the expected structure.",
          sourceLabel: "Vercel AI SDK docs — Generating Structured Data",
          url: "https://ai-sdk.dev/docs/ai-sdk-core/generating-structured-data",
        },
      },
      {
        heading: "Citations: render when grounded",
        elementSlug: "citation-ui",
        points: [
          "Citations attach to completed claims; surfacing them mid-stream invites doubt about a claim that is still forming.",
          "The workable pattern is the hybrid: stream the prose, show a live citation counter, then render the full reference list once the stream completes.",
          "Long-form documents and artifacts are better revealed complete than typed out — the object is the deliverable, not the prose.",
        ],
        evidence: {
          quote:
            "For chat UIs, it’s useful to show a live citation counter as text streams in, then render the full reference list once the stream completes.",
          sourceLabel: "Perplexity docs — Streaming Citation Parsing",
          url: "https://docs.perplexity.ai/docs/cookbook/articles/streaming-citations/README",
        },
      },
      {
        heading: "A decision rule",
        points: [
          "Stream when the answer is prose and reading time roughly equals generation time — a chat answer, a summary, a first draft.",
          "Wait when the answer is data: structured, exact, or reference-heavy, where the interface renders an object rather than a paragraph.",
          "When in doubt, stream the text but gate anything the user will copy, quote or act on until the model has finished it.",
        ],
      },
    ],
    takeaways: [
      "Optimize time to first token over total time — the first visible word is what users experience as speed.",
      "Let streaming itself be the progress indicator: a caret and a Stop control beat any spinner.",
      "Render structured output and citations only when complete and valid, even if the surrounding prose streams.",
      "Let users interrupt at any moment and keep the partial answer — interruption with retention is what makes streaming feel safe.",
    ],
    componentSlugs: ["streaming-message", "prompt-input", "citation-ui", "reasoning"],
    sources: [
      {
        label: "OpenAI API docs — Streaming responses",
        url: "https://developers.openai.com/api/docs/guides/streaming-responses",
      },
      {
        label: "OpenAI API docs — Latency optimization",
        url: "https://developers.openai.com/api/docs/guides/latency-optimization",
      },
      {
        label: "Vercel AI SDK docs — Advanced: Stopping Streams",
        url: "https://ai-sdk.dev/docs/advanced/stopping-streams",
      },
      {
        label: "Vercel AI SDK docs — Generating Structured Data",
        url: "https://ai-sdk.dev/docs/ai-sdk-core/generating-structured-data",
      },
      {
        label: "Perplexity docs — Streaming Citation Parsing",
        url: "https://docs.perplexity.ai/docs/cookbook/articles/streaming-citations/README",
      },
    ],
  },
  {
    slug: "when-to-pause-for-approval",
    kind: "guide",
    title: "When should an AI agent pause for approval?",
    summary:
      "The moment a tool call becomes consequential, an agent needs a human gate. Here is when to pause, what to show in the approval prompt, and how to keep approval from turning into a rubber stamp.",
    disclaimer:
      "An independent guide, grounded in official documentation from Anthropic, OpenAI and Cursor. Quotes are verbatim from the linked official pages and verified against them.",
    sections: [
      {
        heading: "Pause at checkpoints, not every step",
        elementSlug: "agent-status",
        points: [
          "The approved pattern is to pause at checkpoints or when the agent hits a blocker — never after every tool call.",
          "Pausing constantly turns a helpful agent into a babysitter: users start clicking Approve without reading, and the gate stops meaning anything.",
          "An always-visible status keeps the user oriented between gates, so the occasional pause lands as a deliberate beat instead of a surprise.",
        ],
        evidence: {
          quote:
            "Agents can then pause for human feedback at checkpoints or when encountering blockers.",
          sourceLabel: "Anthropic — Building effective agents",
          url: "https://www.anthropic.com/engineering/building-effective-agents",
        },
      },
      {
        heading: "Gate the sensitive class, let the rest run",
        elementSlug: "approval-request",
        points: [
          "The gate is about consequences, not confidence: money, credentials, deletions, publishing — anything with a real-world side effect needs a human in the loop.",
          "Routine, reversible actions such as reading a file, searching or drafting should never require approval; friction that adds nothing trains users to ignore it.",
          "Scope the pause to the one sensitive call rather than the whole task, so the human decision stays small and specific.",
        ],
        evidence: {
          quote:
            "Use the human-in-the-loop (HITL) flow to pause agent execution until a person approves or rejects sensitive tool calls.",
          sourceLabel: "OpenAI — Agents SDK: Human in the loop",
          url: "https://openai.github.io/openai-agents-python/human_in_the_loop/",
        },
      },
      {
        heading: "Show the exact action, not an intent summary",
        elementSlug: "tool-call",
        points: [
          "The approval prompt must name the concrete action — the tool, its arguments, the command that will run.",
          "A paraphrase invites rubber-stamping; the exact proposal lets the human actually audit before they click.",
          "Surface the details inside the request itself: the human should not have to expand a menu to see what they are approving.",
        ],
        evidence: {
          quote:
            "If the approval rule requires approval and no decision for that tool call is stored, execution pauses, and RunResult.interruptions (or RunResultStreaming.interruptions) contains ToolApprovalItem entries with details such as agent.name, tool_name, and arguments.",
          sourceLabel: "OpenAI — Agents SDK: Human in the loop",
          url: "https://openai.github.io/openai-agents-python/human_in_the_loop/",
        },
      },
      {
        heading: "Safety overrides prior approval",
        elementSlug: "approval-request",
        points: [
          "Pre-approval is a convenience, not a blank check — a sign of risk re-raises the gate even for actions the user already allowlisted.",
          "Suspicious commands, dangerous paths and unknown binaries should ask again no matter what the user approved before.",
          "The asymmetry is deliberate: err toward asking when the stakes are real, and toward trusting when they are not.",
        ],
        evidence: {
          quote:
            "Suspicious bash commands require manual approval even if previously allowlisted",
          sourceLabel: "Claude Code docs — Security",
          url: "https://code.claude.com/docs/en/security",
        },
      },
      {
        heading: "The human reviews the proposal itself",
        elementSlug: "approval-request",
        points: [
          "Responsibility lives with the human, so what gets reviewed must be the actual code and commands — not a summary of what the agent intends.",
          "Make the review surface the working artifact — diff, command, payload — so approval is an informed yes.",
          "The approve action should feel like a decision, not a formality: one explicit control, with the consequence named.",
        ],
        evidence: {
          quote:
            "You’re responsible for reviewing proposed code and commands for safety before approval.",
          sourceLabel: "Claude Code docs — Security",
          url: "https://code.claude.com/docs/en/security",
        },
      },
      {
        heading: "Make the gate configurable",
        elementSlug: "approval-request",
        points: [
          "When the agent interrupts you is a setting, not a fixed behavior — users should tune how often they are asked.",
          "A run mode that asks more or less lets each user pick the autonomy level that fits the task at hand.",
          "Default to asking, and let the user relax the gate for trusted, repeatable work.",
        ],
        evidence: {
          quote:
            "Run Modes control how the Cursor agent runs tool calls, and when Cursor interrupts you for approval.",
          sourceLabel: "Cursor docs — Run Modes",
          url: "https://cursor.com/docs/agent/security/run-modes",
        },
      },
      {
        heading: "A decision rule",
        points: [
          "Pause when the action is irreversible, has real-world side effects, or could misrepresent the user — approve everything else automatically.",
          "When you do pause, show the exact action, name the consequence, and keep Approve and Deny one click apart.",
          "Pre-approval lowers friction; risk re-raises it. When in doubt, ask.",
        ],
      },
    ],
    takeaways: [
      "Pause at checkpoints, not after every step — the gate is for high-consequence actions.",
      "Show the exact command, tool call or payload in the approval — never a paraphrase the human cannot audit.",
      "Make approval one explicit decision — Approve/Deny — with the consequence named.",
      "Default to asking; let risk and user preference relax the gate, never a false sense of safety.",
    ],
    componentSlugs: ["approval-request", "agent-status", "tool-call"],
    sources: [
      {
        label: "Anthropic — Building effective agents",
        url: "https://www.anthropic.com/engineering/building-effective-agents",
      },
      {
        label: "Anthropic — Claude Code security docs",
        url: "https://code.claude.com/docs/en/security",
      },
      {
        label: "Cursor docs — Run Modes",
        url: "https://cursor.com/docs/agent/security/run-modes",
      },
      {
        label: "OpenAI — Agents SDK: Human in the loop",
        url: "https://openai.github.io/openai-agents-python/human_in_the_loop/",
      },
    ],
  },
  {
    slug: "long-task-progress",
    kind: "guide",
    title: "Keeping users oriented during long-running agent tasks",
    summary:
      "A task that runs for minutes needs more than a spinner: live progress, visible steps, and an escape hatch. Here is how the products that ship long-running agents keep users oriented — and in control.",
    disclaimer:
      "An independent guide, grounded in official documentation from OpenAI, Anthropic and the Vercel AI SDK. Quotes are verbatim from the linked official pages and verified against them.",
    sections: [
      {
        heading: "Stream the work, don’t announce it",
        elementSlug: "streaming-message",
        points: [
          "Live progress beats a working state: the end-user should see progress updates and partial responses as the task runs, not one big reveal at the end.",
          "Streaming is not just for chat — any long agent run can push what it has so far instead of hiding it until completion.",
          "Partial output is honest progress; a spinner is a promise.",
        ],
        evidence: {
          quote:
            "Streaming lets you subscribe to updates of the agent run as it proceeds. This can be useful for showing the end-user progress updates and partial responses.",
          sourceLabel: "OpenAI — Agents SDK: Streaming",
          url: "https://openai.github.io/openai-agents-python/streaming/",
        },
      },
      {
        heading: "The UI updates itself as results arrive",
        elementSlug: "streaming-message",
        points: [
          "The interface should update automatically as new messages and results arrive — the user never refreshes, never polls, never asks.",
          "Arrival-driven updates are the difference between an agent that feels alive and one that feels stuck.",
          "Because updates are incremental, the last change is always visible proof the task is moving.",
        ],
        evidence: {
          quote:
            "It enables the streaming of chat messages from your AI provider, manages the chat state, and updates the UI automatically as new messages are received.",
          sourceLabel: "Vercel AI SDK — useChat reference",
          url: "https://ai-sdk.dev/docs/reference/ai-sdk-ui/use-chat",
        },
      },
      {
        heading: "Mark the step boundaries",
        elementSlug: "reasoning-steps",
        points: [
          "Long tasks decompose into steps; surface them as discrete, numbered units that complete one by one rather than one amorphous wait.",
          "A step indicator that ticks — “Step 3 of 7”, each finished step checked — reads as progress the way a spinner cannot.",
          "Only render the steps you know about: when the protocol says a step completed, mark it, and don’t fake progress you don’t have.",
        ],
        evidence: {
          quote:
            "A part indicating that a step (i.e., one LLM API call in the backend) has been completed.",
          sourceLabel: "Vercel AI SDK — Stream Protocols",
          url: "https://ai-sdk.dev/docs/ai-sdk-ui/stream-protocol",
        },
      },
      {
        heading: "Never make the user wait for the turn to finish",
        elementSlug: "agent-status",
        points: [
          "A long-running agent must be interruptible mid-turn — the user can redirect without waiting for completion or starting over.",
          "Esc stops the running work and returns control; the interface waits for the next instruction instead of continuing on its own.",
          "Interrupting is steering, not abandoning — the context survives the interruption.",
        ],
        evidence: {
          quote:
            "You can redirect Claude at any point without waiting for the turn to finish or starting over: Press Esc to stop Claude immediately. The running tool call is canceled and Claude waits for your next instruction.",
          sourceLabel: "Claude Code docs — How Claude Code works",
          url: "https://code.claude.com/docs/en/how-claude-code-works",
        },
      },
      {
        heading: "Autonomy with an open door",
        elementSlug: "agent-status",
        points: [
          "Even when the agent works through a multi-step loop autonomously, the human stays part of the loop and can interrupt at any point to steer.",
          "Present the task as guided by the user, not running away from them — control never leaves the human’s hands.",
          "Status UI should read as “working, but ready to be steered”, not “busy, wait”.",
        ],
        evidence: {
          quote:
            "You’re part of this loop too. You can interrupt at any point to steer Claude in a different direction, provide additional context, or ask it to try a different approach. Claude works autonomously but stays responsive to your input.",
          sourceLabel: "Claude Code docs — How Claude Code works",
          url: "https://code.claude.com/docs/en/how-claude-code-works",
        },
      },
      {
        heading: "Preserve progress, never force a restart",
        elementSlug: "code-execution",
        points: [
          "Restarting long work from scratch is expensive and frustrating — design so partial progress survives errors and interruptions.",
          "Keep what the agent produced and the state it needs; give users a resume path instead of a redo.",
          "When a step fails, show what completed, what failed and what will be retried — never a blank slate.",
        ],
        evidence: {
          quote:
            "When errors occur, we can't just restart from the beginning: restarts are expensive and frustrating for users.",
          sourceLabel: "Anthropic Engineering — How we built our multi-agent research system",
          url: "https://www.anthropic.com/engineering/multi-agent-research-system",
        },
      },
      {
        heading: "A decision rule",
        points: [
          "If a task runs longer than a couple of seconds, stream real progress: what it is doing, what step it is on, what it has produced so far.",
          "Keep users in control at every moment — interruptible, steerable, resumable — and never force a full restart.",
          "Progress you can see builds trust; a spinner you can’t tell apart from a hang builds anxiety.",
        ],
      },
    ],
    takeaways: [
      "Stream real progress — partial output, step boundaries, arrival-driven updates — instead of a static working state.",
      "Break long tasks into visible, completable steps and mark each one done.",
      "Keep users in control: interruptible mid-turn, steerable, and never forced to restart from scratch.",
      "When a step fails, show what completed and what will be retried.",
    ],
    componentSlugs: ["streaming-message", "reasoning-steps", "agent-status", "code-execution"],
    sources: [
      {
        label: "OpenAI — Agents SDK: Streaming",
        url: "https://openai.github.io/openai-agents-python/streaming/",
      },
      {
        label: "Vercel AI SDK — useChat reference",
        url: "https://ai-sdk.dev/docs/reference/ai-sdk-ui/use-chat",
      },
      {
        label: "Vercel AI SDK — Stream Protocols",
        url: "https://ai-sdk.dev/docs/ai-sdk-ui/stream-protocol",
      },
      {
        label: "Claude Code docs — How Claude Code works",
        url: "https://code.claude.com/docs/en/how-claude-code-works",
      },
      {
        label: "Anthropic Engineering — How we built our multi-agent research system",
        url: "https://www.anthropic.com/engineering/multi-agent-research-system",
      },
    ],
  },
  {
    slug: "interrupting-the-agent",
    kind: "guide",
    title: "Interrupting the agent: stop controls done right",
    summary:
      "Every long-running agent needs a way out — but a stop button that discards work is as bad as none. Here is how real products handle interruption: non-destructively, cleanly, and with the partial work kept.",
    disclaimer:
      "An independent guide, grounded in official documentation from Anthropic, OpenAI and the Vercel AI SDK. Quotes are verbatim from the linked official pages and verified against them.",
    sections: [
      {
        heading: "Stop is an off-ramp, not a kill-switch",
        elementSlug: "message-actions",
        points: [
          "The interrupt control stops the current response or tool call mid-turn so the user can redirect — the work done so far is kept, not discarded.",
          "A stop that preserves partial work turns an escape hatch into a steering wheel: the user can read what arrived, keep it, and redirect.",
          "The distinction is the product: killing a run loses trust, keeping it invites iteration.",
        ],
        evidence: {
          quote:
            "Stop the current response or tool call mid-turn so you can redirect. Claude keeps the work done so far.",
          sourceLabel: "Claude Code docs — Interactive mode",
          url: "https://code.claude.com/docs/en/interactive-mode",
        },
      },
      {
        heading: "Cancellation cleans up — and keeps the partial work",
        elementSlug: "streaming-message",
        points: [
          "When a stream is aborted, the app is expected to persist partial results and clean up resources — cancelling is not the same as erasing.",
          "The abort path should be as deliberate as the run path: what to save, what to close, what to release.",
          "A cancel that silently drops the half-finished answer teaches users not to cancel.",
        ],
        evidence: {
          quote:
            "When streams are aborted, you may need to perform cleanup operations such as persisting partial results or cleaning up resources.",
          sourceLabel: "Vercel AI SDK — Advanced: Stopping Streams",
          url: "https://ai-sdk.dev/docs/advanced/stopping-streams",
        },
      },
      {
        heading: "A stop button can be a lie",
        elementSlug: "message-actions",
        points: [
          "Without explicit cancellation support, stop() only stops the client-side stream — the server-side generation may keep running in the background.",
          "A stop control that doesn’t actually stop is worse than none: the user thinks the work is dead while it keeps burning tokens.",
          "Wire the stop all the way through — client, transport, server — or don’t label it Stop.",
        ],
        evidence: {
          quote:
            "Without supportsCancellation, stop() still stops the client-side stream but the server-side generation may continue.",
          sourceLabel: "Vercel AI SDK — Advanced: Stopping Streams",
          url: "https://ai-sdk.dev/docs/advanced/stopping-streams",
        },
      },
      {
        heading: "Define the stopping conditions",
        elementSlug: "reasoning-steps",
        points: [
          "Long-running agents should carry stopping conditions — a maximum number of iterations, a budget, a goal reached — so they know when to stop on their own.",
          "A stopping condition is control you don’t have to be present to exercise; it bounds runaway work.",
          "Show the condition in the status UI when you can — “Max 10 steps” tells the user the run is bounded, not endless.",
        ],
        evidence: {
          quote:
            "it’s also common to include stopping conditions (such as a maximum number of iterations) to maintain control.",
          sourceLabel: "Anthropic — Building effective agents",
          url: "https://www.anthropic.com/engineering/building-effective-agents",
        },
      },
      {
        heading: "Interrupt without being asked",
        elementSlug: "voice-input",
        points: [
          "Interruption can be automatic: the interface detects the user’s speech, cancels the in-flight response, and starts a new one without a visible control at all.",
          "Voice interruption is the purest form of steering — the user’s input itself is the stop signal, so the UI just has to not get in the way.",
          "The lesson generalizes: any strong new input can cancel the old task, as long as the partial work is kept.",
        ],
        evidence: {
          quote:
            "Realtime API handles interruptions when VAD is enabled, in that it detects user speech, cancels the ongoing response, and starts a new one.",
          sourceLabel: "OpenAI — Realtime API conversations",
          url: "https://developers.openai.com/api/docs/guides/realtime-conversations",
        },
      },
      {
        heading: "Keep the played, drop the unplayed",
        elementSlug: "streaming-message",
        points: [
          "One concrete retention model: on interruption, keep what was already played and remove only the unplayed remainder of the response.",
          "Truncating the last response keeps the conversation coherent — the user sees what the agent got out, and the dead tail is pruned.",
          "Retention is a spectrum — some products keep everything, some trim to the played portion; pick the model that keeps the user’s context intact.",
        ],
        evidence: {
          quote:
            "We call this truncating the model’s last response, i.e. removing the unplayed portion of the model’s last response from the conversation.",
          sourceLabel: "OpenAI — Realtime API conversations",
          url: "https://developers.openai.com/api/docs/guides/realtime-conversations",
        },
      },
      {
        heading: "A decision rule",
        points: [
          "Give every long-running agent a stop control — and make the stop actually stop the work on the server, not just hide it.",
          "Make interruption non-destructive: keep the partial work, trim the unplayed tail, and let the user pick up from there.",
          "Prefer automatic interruption when the user’s next input can serve as the stop signal — the cleanest stop control is the one the user never has to find.",
        ],
      },
    ],
    takeaways: [
      "A stop control that discards work is worse than none — interruption should keep the partial work done so far.",
      "Make the stop real end-to-end: a button that only hides the stream while the server keeps generating is a lie.",
      "Bound long tasks with stopping conditions so they know when to stop without a human watching.",
      "Strong new user input can be its own stop signal — the cleanest interrupt is the one the user never has to find.",
    ],
    componentSlugs: ["message-actions", "streaming-message", "reasoning-steps", "voice-input"],
    sources: [
      {
        label: "Claude Code docs — Interactive mode",
        url: "https://code.claude.com/docs/en/interactive-mode",
      },
      {
        label: "Vercel AI SDK — Advanced: Stopping Streams",
        url: "https://ai-sdk.dev/docs/advanced/stopping-streams",
      },
      {
        label: "Anthropic — Building effective agents",
        url: "https://www.anthropic.com/engineering/building-effective-agents",
      },
      {
        label: "OpenAI — Realtime API conversations",
        url: "https://developers.openai.com/api/docs/guides/realtime-conversations",
      },
    ],
  },
];

export function getInspirationEntry(slug: string): InspirationEntry | undefined {
  return inspirationEntries.find((entry) => entry.slug === slug);
}

/** Decision guides that reference a component, for the component page's
 *  up-link block (guides link down via componentSlugs; this is the reverse
 *  edge, so internal linking is a two-way street). */
export function getGuidesForComponent(componentSlug: string): InspirationEntry[] {
  return inspirationEntries.filter(
    (entry) => entry.kind === "guide" && entry.componentSlugs.includes(componentSlug),
  );
}
