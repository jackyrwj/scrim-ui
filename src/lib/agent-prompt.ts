import {
  defaultValues,
  generateSnippet,
  matchesPreset,
  type ComponentControls,
  type ControlDef,
  type ControlValue,
  type ControlValues,
} from "./component-controls";

/**
 * The prompt a reader hands to a coding agent to get this component, in the
 * state they configured, into their own repo.
 *
 * Why this exists at all: the page already answers "what does this look like"
 * and "what code produces it", but the reader's next move is increasingly to
 * paste something into Claude Code or Cursor rather than to copy a file by
 * hand. A static "add the prompt-input component" line would be worse than
 * useless — the agent would install the component at its defaults and the
 * reader would then have to explain, in prose, the twelve controls they just
 * spent two minutes setting. So the prompt is generated from the same values
 * that drive the preview: move a control, and the instruction the agent
 * receives moves with it.
 *
 * What an agent needs that a human reading the page does not:
 *   - the install command, spelled out, with the reader's package manager
 *   - the path the file actually lands at, since the Usage snippet imports
 *     from a relative path that only makes sense inside this repo
 *   - which props are deliberate and which are just defaults, so it does not
 *     freeze incidental values into the call site
 *   - an explicit note that the handlers are stubs, or it will ship `() => {}`
 */
export type AgentPromptInput = {
  name: string;
  slug: string;
  description: string;
  registryUrl: string;
  docsUrl: string;
  installCommand: string;
  schema: ComponentControls;
  values: ControlValues;
};

/** How a value reads in prose. Strings are quoted so an empty one is visible
 *  as `""` rather than vanishing into the line. */
function describe(value: ControlValue): string {
  return typeof value === "string" ? JSON.stringify(value) : String(value);
}

/**
 * The props the reader actually chose.
 *
 * Everything the schema declares is in `values`, but most of it is untouched
 * default. Listing all of it would bury the two or three decisions that
 * matter under twenty that do not, and an agent reading the list has no way
 * to tell which is which — so the diff is the signal.
 */
function changedProps(schema: ComponentControls, values: ControlValues): ControlDef[] {
  const defaults = defaultValues(schema);
  return schema.controls.filter((c) => values[c.name] !== defaults[c.name]);
}

/**
 * One line describing a chosen prop.
 *
 * Some controls are editor inputs rather than props — `models` is edited as
 * `id | name | hint` lines and `derive` turns it into a MODELS array that the
 * snippet's preamble declares. Quoting the raw DSL string at an agent would
 * be a lie about the component's API, so those point at the snippet instead.
 */
function propLine(
  control: ControlDef,
  values: ControlValues,
  derivedProps: Record<string, string>,
): string {
  const derived = derivedProps[control.name];
  if (derived) {
    return `- \`${control.name}\` — ${control.label}: pass the \`${derived}\` value declared above the element. Keep its shape; the entries themselves are placeholder content to replace with real data.`;
  }
  return `- \`${control.name}\` = ${describe(values[control.name])} — ${control.label}`;
}

export function buildAgentPrompt(input: AgentPromptInput): string {
  const { name, slug, description, docsUrl, installCommand, schema, values } = input;

  const snippet = generateSnippet(schema, values);
  const preset = schema.presets.find((p) => matchesPreset(schema, p, values));
  const changed = changedProps(schema, values);
  const derivedProps = schema.derive?.(values)?.props ?? {};
  const handlers = schema.handlers ?? [];

  const lines: string[] = [];

  lines.push(
    `Add the ${name} component from the Scrim UI registry to this project and use it in the configuration described below.`,
    "",
    `${name} — ${description}`,
    "",
    "## 1. Install",
    "",
    "```bash",
    installCommand,
    "```",
    "",
    `This writes a single file to \`components/ui/${slug}.tsx\`. It is plain React + Tailwind with no runtime dependencies — no Radix, no CVA, nothing to add to package.json. If this project does not use the shadcn CLI, copy the source from ${docsUrl} to the same path by hand; nothing in the file depends on shadcn.`,
    "",
    "## 2. Use it",
    "",
    "```tsx",
    `import { ${schema.tag} } from "@/components/ui/${slug}";`,
    "",
    snippet.trimEnd(),
    "```",
    "",
  );

  lines.push("## 3. The configuration that matters", "");

  if (preset) {
    lines.push(`This is the component's "${preset.title}" state — ${preset.note}`, "");
  }

  if (changed.length > 0) {
    lines.push(
      "These props were set deliberately and should be preserved as written:",
      "",
      ...changed.map((c) => propLine(c, values, derivedProps)),
      "",
      "Every other prop is at its default; leave those off the call site rather than writing the default value out.",
      "",
    );
  } else {
    lines.push(
      "Every prop is at its default value. Keep the call site minimal — do not write out default values.",
      "",
    );
  }

  if (handlers.length > 0) {
    lines.push(
      `## 4. Wire the handlers`,
      "",
      `${handlers.map((h) => `\`${h}\``).join(", ")} ${handlers.length === 1 ? "is a stub" : "are stubs"} in the snippet above (\`() => {}\`). Connect ${handlers.length === 1 ? "it" : "them"} to this project's own state and data layer instead of shipping the empty function${handlers.length === 1 ? "" : "s"}.`,
      "",
    );
  }

  lines.push(`Reference: ${docsUrl}`);

  return lines.join("\n");
}

/* ------------------------------------------------------------------ */
/* Patterns                                                            */
/* ------------------------------------------------------------------ */

export type PatternPromptInput = {
  name: string;
  slug: string;
  description: string;
  docsUrl: string;
  installCommand: string;
  /** The components this screen is composed from, as shown on the page. */
  elements: { label: string; componentSlug?: string }[];
  usage: string[];
  mistakes: string[];
};

/**
 * The prompt for a whole screen rather than a single component.
 *
 * Deliberately not the component prompt with a different noun. A pattern has
 * no controls, so there is no configuration to track and nothing here moves
 * as the reader clicks — saying otherwise would be theatre. What a pattern
 * has instead is composition and editorial judgement: it is five components
 * arranged a particular way, and the reasons that arrangement works are
 * written down on the page as usage notes. An agent handed only "install the
 * ai-chat block" would reproduce the layout and none of the reasoning, then
 * cheerfully move the composer to the top of the screen.
 */
export function buildPatternPrompt(input: PatternPromptInput): string {
  const { name, slug, description, docsUrl, installCommand, elements, usage, mistakes } = input;
  const parts = elements.filter((e) => e.componentSlug);

  const lines: string[] = [
    `Add the ${name} pattern from the Scrim UI registry to this project — a complete screen, not a single component.`,
    "",
    `${name} — ${description}`,
    "",
    "## 1. Install",
    "",
    "```bash",
    installCommand,
    "```",
    "",
    `This writes the screen to \`components/blocks/${slug}.tsx\` and pulls in the components it is built from, each landing at \`components/ui/\`. Everything is plain React + Tailwind with no runtime dependencies. The imports in the block already point at those paths, so it compiles as installed.`,
    "",
  ];

  if (parts.length > 0) {
    lines.push(
      "## 2. What it is made of",
      "",
      ...parts.map((e) => `- \`${e.componentSlug}\` — ${e.label}`),
      "",
      "Each is a separate file you can edit or replace on its own; the block is the arrangement, not a monolith.",
      "",
    );
  }

  lines.push(
    "## 3. Rules this layout depends on",
    "",
    "Keep these when adapting the screen — they are the reasons it works, and they are easy to break while restyling:",
    "",
    ...usage.map((line) => `- ${line}`),
    "",
  );

  if (mistakes.length > 0) {
    lines.push(
      "## 4. Do not do these",
      "",
      ...mistakes.map((line) => `- ${line}`),
      "",
    );
  }

  lines.push(
    "The demo content in the file — messages, file names, model names — is placeholder. Replace it with this project's real data and wire the handlers to real state rather than shipping the stubs.",
    "",
    `Reference: ${docsUrl}`,
  );

  return lines.join("\n");
}

/* ------------------------------------------------------------------ */
/* Icons                                                               */
/* ------------------------------------------------------------------ */

export type IconPromptInput = {
  /** Lucide's export name, e.g. "Wrench". */
  name: string;
  /** The concept this icon stands for in an AI interface. */
  concept: string;
  /** Why this icon and not another. */
  meaning: string;
  docsUrl: string;
  size: number;
  stroke: number;
  /** Tailwind class for the chosen tone, or null for inherited colour. */
  toneClass: string | null;
  toneLabel: string;
  /** A fixed hex colour from the swatch palette; wins over toneClass. */
  toneHex?: string | null;
  /** Components on this site that use the icon for this concept. */
  usedBy: string[];
};

/**
 * The prompt for an icon.
 *
 * No install command: these are Lucide icons, and shipping them through this
 * registry would be repackaging someone else's library. `npm i lucide-react`
 * is the whole installation, and an agent already knows how to do that.
 *
 * What an agent cannot get from Lucide is the part this site actually
 * contributes — that *this* concept, in an AI interface, is drawn with *that*
 * glyph, at a stroke weight that sits correctly next to body text. Asked for
 * "an icon for tool use" an agent will pick something plausible and different
 * every time; the value here is the decision, plus the size and stroke the
 * reader just dialled in.
 */
export function buildIconPrompt(input: IconPromptInput): string {
  const { name, concept, meaning, docsUrl, size, stroke, toneClass, toneLabel, toneHex, usedBy } = input;

  const attrs = [`size={${size}}`, `strokeWidth={${stroke}}`];
  if (toneHex) attrs.push(`color="${toneHex}"`);
  else if (toneClass) attrs.push(`className="${toneClass}"`);

  const lines: string[] = [
    `Use the Lucide \`${name}\` icon for "${concept}" in this project's interface.`,
    "",
    `Why this one: ${meaning}`,
    "",
    "## Install",
    "",
    "```bash",
    "npm install lucide-react",
    "```",
    "",
    "## Use it",
    "",
    "```tsx",
    `import { ${name} } from "lucide-react";`,
    "",
    `<${name} ${attrs.join(" ")} />`,
    "```",
    "",
    "## Keep these",
    "",
    `- \`size={${size}}\` and \`strokeWidth={${stroke}}\` — the weight that sits correctly beside body text at this size. A default stroke of 2 at small sizes reads heavy next to text.`,
    toneHex
      ? `- \`color="${toneHex}"\` — a fixed accent colour set on the icon itself, not a theme token. It stays identical in light and dark themes; check it against both.`
      : toneClass
        ? `- \`${toneClass}\` — the ${toneLabel.toLowerCase()} tone this state calls for.`
        : `- No colour class: the icon inherits \`currentColor\` from its container, so it follows the surrounding text in both light and dark themes. Do not hardcode a hex value.`,
    `- Give it an accessible name when it stands alone (\`aria-label\`), or \`aria-hidden\` when it sits next to a text label that already says the same thing.`,
    "",
  ];

  if (usedBy.length > 0) {
    lines.push(
      `Used for this concept in: ${usedBy.join(", ")}. Use the same glyph across all of them — an interface that draws one concept two ways teaches the reader nothing.`,
      "",
    );
  }

  lines.push(`Reference: ${docsUrl}`);

  return lines.join("\n");
}
