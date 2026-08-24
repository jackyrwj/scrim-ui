export type MockupRole = "user" | "assistant";

export type MockupMessage = {
  id: string;
  role: MockupRole;
  text: string;
  /** Assistant-only: show a reasoning trace above this turn. */
  reasoning?: boolean;
  /** Assistant-only: show a tool call above this turn. */
  tools?: boolean;
  /** Assistant-only: show a sources list under this turn. */
  sources?: boolean;
};

import { type MockupDevice } from "../device-presets";
export type { MockupDevice };

export type MockupConfig = {
  /** Window title shown in the mockup header. */
  title: string;
  /** Small subtitle under the title. */
  subtitle: string;
  /** Model name shown as the header pill and in the composer selector. */
  modelName: string;
  device: MockupDevice;
  theme: "light" | "dark";
  /** Animate the last assistant message with a streaming reveal. */
  streaming: boolean;
  /** Show the composer at the bottom of the mockup. */
  showComposer: boolean;
  composerPlaceholder: string;
  showSearch: boolean;
  showTools: boolean;
  showAttachments: boolean;
  avatarLabel: string;
  messages: MockupMessage[];
};

let idSeq = 0;
export function newMessageId(): string {
  return `m${++idSeq}`;
}

export function createMessage(role: MockupRole, text = ""): MockupMessage {
  return { id: newMessageId(), role, text, reasoning: false, tools: false, sources: false };
}

export const defaultConfig: MockupConfig = {
  title: "Acme Assistant",
  subtitle: "AI research assistant",
  modelName: "Claude Sonnet",
  device: "desktop",
  theme: "light",
  streaming: false,
  showComposer: true,
  composerPlaceholder: "Ask anything…",
  showSearch: true,
  showTools: true,
  showAttachments: true,
  avatarLabel: "AI",
  messages: [
    createMessage("assistant", "Hi — I can search the web, reason through answers and cite my sources. What would you like to explore?"),
    createMessage("user", "What are the most important UI patterns for AI chat products?"),
    {
      ...createMessage(
        "assistant",
        /* No markdown in the sample text. The mockup renders through
           StreamingMessage, which takes a plain string by design — it is a
           component people copy, not a renderer — so `**Streaming**` came out
           with its asterisks showing, here and in the homepage hero that
           reuses this config. */
        "Three patterns separate a good AI chat from a great one:\n\n1. Streaming — reveal tokens as they arrive and offer a stop control.\n2. Grounding — cite sources inline so claims can be verified.\n3. Transparency — show tool calls and reasoning, don't hide the work.",
      ),
      reasoning: true,
      tools: true,
      sources: true,
    },
  ],
};
