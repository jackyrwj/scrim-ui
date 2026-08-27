/**
 * The prop schema behind a component's Explorer.
 *
 * The idea this replaces: every component page had a hand-written list of
 * variants, each one a `DemoX()` function in demos.tsx, and the code you could
 * copy for a variant was that function's source, recovered at build time by
 * re-reading the file (see the old lib/variant-source.ts). Code and component
 * were two separate artefacts that happened to agree.
 *
 * Here they are one thing. A component declares its props as data; from a set
 * of values the Explorer renders *both* the live component and the snippet
 * that produces it. Move a control and the code moves with it, because there
 * is only one source of truth. Variants survive as named presets — a variant
 * was only ever "these props" — so picking one both drives the preview and
 * shows you the props that got you there.
 *
 * What a schema deliberately cannot express: anything that is not a prop.
 * Icons, arrays of records and other React nodes go in `fixed` (rendered into
 * the snippet verbatim) with any helper source they need in `preamble`. The
 * escape hatch is explicit so it stays visible when it is used.
 */

export type ControlDef =
  | { kind: "text"; name: string; label: string; value: string; multiline?: boolean }
  | { kind: "boolean"; name: string; label: string; value: boolean }
  | { kind: "number"; name: string; label: string; value: number; min?: number; max?: number; step?: number }
  | { kind: "enum"; name: string; label: string; value: string; options: { value: string; label: string }[] };

export type ControlValue = string | number | boolean;
export type ControlValues = Record<string, ControlValue>;

/** A prop that belongs in the generated snippet but has no control — an icon
 *  element, a record array, anything whose value is an expression. */
export type FixedProp = {
  name: string;
  /** Source text placed inside `{...}`, e.g. `<SearchIcon />` or `FILES`. */
  expr: string;
};

/** A named set of control values. What used to be a "variant". */
export type Preset = {
  id: string;
  title: string;
  /** The editorial line explaining why this state matters. */
  note: string;
  values: ControlValues;
};

export type ComponentControls = {
  /** JSX tag to emit, e.g. "ToolCall". */
  tag: string;
  /** Module the tag is imported from in the generated snippet. */
  importFrom: string;
  controls: ControlDef[];
  fixed?: FixedProp[];
  /** Handler props emitted as `onThing={() => {}}` — they have no UI, but
   *  leaving them out of the snippet would hide that the component takes them. */
  handlers?: string[];
  /** Source pasted above the snippet: helper components, record arrays. */
  preamble?: string;
  /**
   * Contributes source that depends on the current values.
   *
   * Needed by components whose main prop is a collection: the reader edits a
   * list, and both the preamble (`const ITEMS = [...]`) and the prop that
   * points at it have to follow. Keeping this a function the schema supplies
   * lets the generator stay ignorant of any particular component's shape.
   */
  derive?: (values: ControlValues) => { preamble?: string; props?: Record<string, string> };
  /**
   * Replaces generated output entirely, for a component whose interesting
   * states are compositions rather than prop sets — citation markers inline
   * in prose versus the same markers plus a source list, say. Everything else
   * about the Explorer still applies; only the snippet is hand-written.
   */
  snippet?: (values: ControlValues) => string;
  presets: Preset[];
  /** Props whose change should remount the component rather than update it —
   *  anything a `defaultX` prop seeds, or an animation that should replay. */
  remountOn?: string[];
};

/** Every control's declared value, i.e. the schema's own defaults. */
export function defaultValues(schema: ComponentControls): ControlValues {
  return Object.fromEntries(schema.controls.map((c) => [c.name, c.value]));
}

/** Values for a preset: the defaults, with the preset's overrides on top. */
export function presetValues(schema: ComponentControls, preset: Preset): ControlValues {
  return { ...defaultValues(schema), ...preset.values };
}

/** Does this set of values match the preset exactly? Used to keep a preset
 *  chip highlighted only while the reader has not edited away from it. */
export function matchesPreset(
  schema: ComponentControls,
  preset: Preset,
  values: ControlValues,
): boolean {
  const target = presetValues(schema, preset);
  return schema.controls.every((c) => values[c.name] === target[c.name]);
}

/* ------------------------------------------------------------------ */
/* Snippet generation                                                  */
/* ------------------------------------------------------------------ */

function quote(text: string): string {
  // A string with newlines or a quote in it reads better as a template
  // literal than as an escaped double-quoted string.
  if (text.includes("\n") || text.includes('"')) {
    return "{`" + text.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${") + "`}";
  }
  return `"${text}"`;
}

/**
 * Render one prop as it should appear in JSX.
 *
 * Returns null for props worth omitting: a false boolean, and an empty string
 * on an optional prop. The snippet should read like something a person would
 * write, and nobody writes `edited={false}`.
 */
function renderProp(control: ControlDef, value: ControlValue): string | null {
  switch (control.kind) {
    case "boolean":
      // `edited` rather than `edited={true}` — the JSX shorthand.
      return value ? control.name : null;
    case "number":
      return `${control.name}={${value}}`;
    case "text":
      if (value === "") return null;
      return `${control.name}=${quote(String(value))}`;
    case "enum":
      return `${control.name}=${quote(String(value))}`;
  }
}

/**
 * The snippet for a set of values: preamble, then the element.
 *
 * Formatting follows what the repo's own source looks like — one prop per
 * line once there is more than one, two-space indent, self-closing.
 */
export function generateSnippet(schema: ComponentControls, values: ControlValues): string {
  if (schema.snippet) return schema.snippet(values);

  const props: string[] = [];
  const derived = schema.derive?.(values);
  const derivedProps = derived?.props ?? {};

  for (const control of schema.controls) {
    /* A control that `derive` also emits is an editor input, not a prop: the
       reader edits `models` as `id | name | hint` lines and derive turns that
       into a MODELS array in the preamble. Emitting both put the same
       attribute on the element twice — the raw DSL string and the array —
       which is not valid JSX. The derived form wins; the control's own value
       has already done its job by producing it. */
    if (control.name in derivedProps) continue;
    const rendered = renderProp(control, values[control.name] ?? control.value);
    if (rendered) props.push(rendered);
  }
  for (const f of schema.fixed ?? []) {
    props.push(`${f.name}={${f.expr}}`);
  }
  for (const [name, expr] of Object.entries(derivedProps)) {
    props.push(`${name}={${expr}}`);
  }
  for (const h of schema.handlers ?? []) {
    props.push(`${h}={() => {}}`);
  }

  const element =
    props.length === 0
      ? `<${schema.tag} />`
      : props.length === 1 && !props[0].includes("\n")
        ? `<${schema.tag} ${props[0]} />`
        : `<${schema.tag}\n${props.map((p) => "  " + p.replace(/\n/g, "\n  ")).join("\n")}\n/>`;

  const preamble = [schema.preamble, derived?.preamble]
    .filter(Boolean)
    .map((p) => p!.trim())
    .join("\n\n");

  return preamble ? `${preamble}\n\n${element}\n` : `${element}\n`;
}

/** The import line the snippet assumes, shown above it. `tag` may name more
 *  than one export, for a component that ships a set. */
export function importLine(schema: ComponentControls): string {
  return `import { ${schema.tag} } from "${schema.importFrom}";`;
}
