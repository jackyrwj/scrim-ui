/* Server-safe: which tools have a scripted card demo. The lazy component
   map lives in tool-card-demo.tsx ("use client"), but the /tools page and
   ToolCard are server components and only need the yes/no — importing it
   from the client module would try to call a client function from the
   server. Keep the two lists in sync by editing both. */
export const TOOL_CARD_DEMO_SLUGS = [
  "chat-mockup",
  "model-switcher",
  "theme-generator",
  "token-counter",
  "voice-mockup",
  "response-diff",
  "screenshot-mockup",
  "prompt-generator",
  "voice-scripts",
  "pricing-calculator",
  "system-prompt-builder",
  "mcp-config-builder",
  "workshop",
  "playground",
] as const;

export function hasToolCardDemo(slug: string) {
  return (TOOL_CARD_DEMO_SLUGS as readonly string[]).includes(slug);
}
