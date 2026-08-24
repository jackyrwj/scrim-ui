"use client";

import * as React from "react";
import {
  defaultValues,
  generateSnippet,
  importLine,
  matchesPreset,
  presetValues,
  type ComponentControls,
  type ControlDef,
  type ControlValues,
} from "@/lib/component-controls";
import { tokenize } from "@/lib/code-highlight";
import { CodeTokens } from "./code-block";
import { CodeCopyButton } from "./code-copy-button";

/**
 * One surface where a component, its props and its source are the same thing.
 *
 * The page this replaces showed a hero preview, then a list of variants each
 * with its own collapsed code, then — for three components out of thirty — a
 * separate playground. The reader had to hold "this preview" and "that code"
 * together in their head, and the code was dead text: you could not change it
 * and see what happened.
 *
 * Now: presets across the top (the old variants), controls down the side, and
 * a Preview/Code pair of tabs. Every edit regenerates both. Copy takes exactly
 * what is on screen.
 *
 * Not a code *editor*. Sandpack or react-live would let the reader type real
 * JSX, at the cost of shipping a bundler or an eval runtime — a megabyte or
 * so of client JS on a site whose whole promise is a dependency-free file you
 * paste into your own project. Controls give the same "change it and watch"
 * loop, stay type-safe, and cost nothing to load.
 */
type TabId = "preview" | "usage";

const TABS: { id: TabId; label: string }[] = [
  { id: "preview", label: "Preview" },
  { id: "usage", label: "Usage" },
];

export function ComponentExplorer({
  schema,
  render,
}: {
  schema: ComponentControls;
  /** Builds the live element from the current values. Passed in rather than
   *  looked up so the component itself is statically imported by the page and
   *  the Explorer stays generic. */
  render: (values: ControlValues, remountKey: string) => React.ReactNode;
}) {
  const initial = React.useMemo(
    () => (schema.presets[0] ? presetValues(schema, schema.presets[0]) : defaultValues(schema)),
    [schema],
  );
  const [values, setValues] = React.useState<ControlValues>(initial);
  const [tab, setTab] = React.useState<TabId>("preview");
  const [run, setRun] = React.useState(0);

  const set = React.useCallback((name: string, value: ControlValues[string]) => {
    setValues((v) => ({ ...v, [name]: value }));
  }, []);

  const snippet = React.useMemo(() => generateSnippet(schema, values), [schema, values]);
  const tokens = React.useMemo(() => tokenize(snippet), [snippet]);

  // A component seeded by a `defaultOpen`-style prop will not react to that
  // prop changing, so those edits remount it instead of updating it.
  const remountKey = [
    run,
    ...(schema.remountOn ?? []).map((n) => String(values[n])),
  ].join(":");

  const activePreset = schema.presets.find((p) => matchesPreset(schema, p, values));
  const note = activePreset?.note;

  return (
    <div className="overflow-hidden rounded-xl border border-(--border)">
      {/* Presets — the old variants, now one click each */}
      {schema.presets.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 border-b border-(--border) bg-(--muted)/40 px-3 py-2.5">
          {schema.presets.map((p) => {
            const active = activePreset?.id === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setValues(presetValues(schema, p))}
                aria-pressed={active}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                  active
                    ? "bg-(--foreground) text-(--background)"
                    : "text-(--muted-foreground) hover:bg-(--muted) hover:text-(--foreground)"
                }`}
              >
                {p.title}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => {
              setValues(initial);
              setRun((r) => r + 1);
            }}
            className="ml-auto rounded-lg px-2 py-1 text-xs text-(--muted-foreground) transition-colors hover:bg-(--muted) hover:text-(--foreground)"
          >
            Reset
          </button>
        </div>
      )}

      <div className="grid lg:grid-cols-[1fr_260px]">
        {/* Stage */}
        <div className="min-w-0 border-(--border) lg:border-r">
          <div className="flex items-center gap-1 border-b border-(--border) px-3 py-2">
            {/* "Usage", not "Code": the page carries two code surfaces and
                they answer different questions. This one is the call site —
                the few lines you write in your own app, which follow the
                controls. The section further down is the component file you
                paste into your repo. Naming them both "Code" made one look
                like a duplicate of the other. */}
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                aria-pressed={tab === t.id}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                  tab === t.id
                    ? "bg-(--muted) text-(--foreground)"
                    : "text-(--muted-foreground) hover:text-(--foreground)"
                }`}
              >
                {t.label}
              </button>
            ))}
            <span className="ml-auto truncate pl-2 text-[11px] text-(--muted-foreground)">
              {note}
            </span>
          </div>

          {tab === "preview" ? (
            <div className="flex min-h-[300px] items-center justify-center bg-(--muted)/30 px-4 py-8 sm:px-6">
              <div className="w-full max-w-xl">{render(values, remountKey)}</div>
            </div>
          ) : (
            <div
              className="group relative min-h-[300px]"
              style={{ background: "var(--code-bg)", color: "var(--code-fg)" }}
            >
              <div className="absolute right-2 top-2 z-10">
                <CodeCopyButton code={`${importLine(schema)}\n\n${snippet}`} label="Copy snippet" />
              </div>
              {/* Background on the pre itself — see the note in code-block.tsx. */}
              <pre
                className="overflow-x-auto px-4 py-3.5 text-[13px] leading-6"
                style={{ background: "var(--code-bg)" }}
              >
                <code className="font-mono">
                  <span className="tok-comment">{importLine(schema)}</span>
                  {"\n\n"}
                  <CodeTokens tokens={tokens} />
                </code>
              </pre>
              <p className="px-4 pb-3.5 text-[11px] text-(--tok-comment)">
                This is the call site. The component itself is in{" "}
                <a href="#source" className="underline underline-offset-2">
                  Component source
                </a>{" "}
                below.
              </p>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="space-y-3.5 p-4">
          <p className="text-[11px] font-medium uppercase tracking-wide text-(--muted-foreground)">
            Props
          </p>
          {schema.controls.map((c) => (
            <Control key={c.name} def={c} value={values[c.name]} onChange={set} />
          ))}
          {(schema.handlers?.length ?? 0) > 0 && (
            <p className="border-t border-(--border) pt-3 text-[11px] leading-5 text-(--muted-foreground)">
              Also takes{" "}
              {schema.handlers!.map((h, i) => (
                <React.Fragment key={h}>
                  {i > 0 && ", "}
                  <code className="font-mono">{h}</code>
                </React.Fragment>
              ))}
              .
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-(--border) bg-(--background) px-2.5 py-1.5 text-xs outline-none transition-colors focus:border-(--foreground)";

function Control({
  def,
  value,
  onChange,
}: {
  def: ControlDef;
  value: ControlValues[string];
  onChange: (name: string, value: ControlValues[string]) => void;
}) {
  const id = React.useId();

  if (def.kind === "boolean") {
    return (
      <label htmlFor={id} className="flex cursor-pointer items-center justify-between gap-3">
        <span className="text-xs text-(--muted-foreground)">{def.label}</span>
        <input
          id={id}
          type="checkbox"
          checked={Boolean(value)}
          onChange={(e) => onChange(def.name, e.target.checked)}
          className="size-4 shrink-0 accent-(--primary)"
        />
      </label>
    );
  }

  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-xs text-(--muted-foreground)">
        {def.label}
      </label>
      {def.kind === "enum" ? (
        <select
          id={id}
          value={String(value)}
          onChange={(e) => onChange(def.name, e.target.value)}
          className={`${inputCls} appearance-none`}
        >
          {def.options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      ) : def.kind === "number" ? (
        <input
          id={id}
          type="range"
          min={def.min ?? 0}
          max={def.max ?? 100}
          step={def.step ?? 1}
          value={Number(value)}
          onChange={(e) => onChange(def.name, Number(e.target.value))}
          className="w-full accent-(--primary)"
        />
      ) : def.multiline ? (
        <textarea
          id={id}
          rows={4}
          value={String(value)}
          onChange={(e) => onChange(def.name, e.target.value)}
          className={`${inputCls} resize-y font-mono leading-5`}
        />
      ) : (
        <input
          id={id}
          type="text"
          value={String(value)}
          onChange={(e) => onChange(def.name, e.target.value)}
          className={inputCls}
        />
      )}
      {def.kind === "number" && (
        <span className="mt-0.5 block text-right text-[11px] tabular-nums text-(--muted-foreground)">
          {String(value)}
        </span>
      )}
    </div>
  );
}
