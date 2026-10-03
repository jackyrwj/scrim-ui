import catalog from "./aicss-catalog.json";

const categoryBySlug: Record<string, string> = {
  "code-block": "messages",
  "comparison-table": "messages",
  "data-table": "messages",
  "file-diff": "tool-calls",
  "inline-citations": "sources",
  "message-actions": "messages",
  orbs: "reasoning",
  "reasoning-effort": "model-settings",
  "secure-input": "prompt-input",
  "streaming-text": "messages",
  "text-response": "messages",
  "thinking-reasoning": "reasoning",
  "thinking-state": "reasoning",
};

export const aicssComponents = catalog.map((component) => ({
  ...component,
  sourceSlug: component.slug,
  slug: component.slug === "message-actions" ? "aicss-message-actions" : component.slug,
  category: categoryBySlug[component.slug],
}));

export function aicssComponentPath(slug: string) {
  return `/components/${slug}`;
}

export function getAicssComponent(slug: string) {
  return aicssComponents.find((component) => component.slug === slug);
}
