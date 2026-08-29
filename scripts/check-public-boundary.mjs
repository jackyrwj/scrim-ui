import * as fs from "node:fs";
import * as path from "node:path";

const root = process.cwd();
// No Pro components right now — the launch four (approval-gate, cost-meter,
// edit-diff-view, streaming-markdown) are free and live in src/showcase.
// Add slugs back when a Pro component ships.
const proComponents = [];
const proTemplates = [
  "agent-console",
  "ai-chat",
  "answer-engine",
  "generative-ui",
  "image-studio",
  "memory-chat",
  "rag-qa",
  "research-agent",
  "structured-extraction",
  "support-copilot",
  "voice-assistant",
];

const forbidden = [
  ...proComponents.map((slug) => path.join("src", "showcase", slug)),
  ...proTemplates.map((slug) => path.join("templates", slug)),
];
const present = forbidden.filter((relativePath) => fs.existsSync(path.join(root, relativePath)));

const registry = fs.readFileSync(path.join(root, "src", "showcase", "registry.tsx"), "utf8");
const imported = proComponents.filter((slug) => registry.includes(`./${slug}/`));

const catalogPath = path.join(root, "src", "lib", "pro-catalog.json");
const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8"));
const leakedContent = JSON.stringify(catalog).includes('"content"');

if (present.length > 0 || imported.length > 0 || leakedContent) {
  console.error("Public/private source boundary check failed.");
  if (present.length > 0) console.error(`Paid source paths still present:\n- ${present.join("\n- ")}`);
  if (imported.length > 0) console.error(`Paid showcases still imported: ${imported.join(", ")}`);
  if (leakedContent) console.error("The public Pro catalog appears to contain file contents.");
  process.exitCode = 1;
} else {
  console.log("Public/private source boundary is clean.");
}
