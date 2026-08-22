import { getPalette, getSizing, readableOn, withAlpha } from "./styles";
import type { ModelSwitcherConfig } from "./types";

/* ------------------------------------------------------------------ */
/* Emits a self-contained, dependency-free React component for the     */
/* current configuration. Style values are baked in from the same      */
/* helpers the live preview uses, so the export matches what you saw.  */
/* ------------------------------------------------------------------ */

const q = (value: string) => JSON.stringify(value);

function modelsBlock(config: ModelSwitcherConfig): string {
  return config.models
    .map(
      (m) =>
        `  { id: ${q(m.id)}, name: ${q(m.name)}, hint: ${q(m.hint)}, badge: ${q(
          m.badge,
        )}, dot: ${q(m.dot)} },`,
    )
    .join("\n");
}

function helpers(config: ModelSwitcherConfig): string {
  const c = getPalette(config.theme);
  const s = getSizing(config.size);
  const parts: string[] = [];

  if (config.showDots) {
    parts.push(`function Dot({ color }: { color: string }) {
  return (
    <span
      style={{ width: ${s.dot}, height: ${s.dot}, borderRadius: 999, background: color, flexShrink: 0 }}
    />
  );
}`);
  }

  if (config.showBadges) {
    parts.push(`function Badge({
  text,
  background = ${q(c.chip)},
  color = ${q(c.chipText)},
}: {
  text: string;
  background?: string;
  color?: string;
}) {
  return (
    <span
      style={{
        borderRadius: 999,
        background,
        color,
        fontSize: ${s.badgeFont},
        lineHeight: 1.6,
        padding: "0 8px",
        whiteSpace: "nowrap",
        flexShrink: 0,
      }}
    >
      {text}
    </span>
  );
}`);
  }

  if (config.variant === "dropdown") {
    parts.push(`function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width={${s.font}}
      height={${s.font}}
      style={{ flexShrink: 0, transition: "transform 150ms ease", transform: open ? "rotate(180deg)" : "none" }}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}`);
  }

  if (config.showCheck && config.variant !== "segmented") {
    parts.push(`function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      width={${s.font - 1}}
      height={${s.font - 1}}
      style={{ flexShrink: 0 }}
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}`);
  }

  if (config.variant === "command") {
    parts.push(`function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width={${s.font + 1}}
      height={${s.font + 1}}
      style={{ flexShrink: 0 }}
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}`);
  }

  return parts.join("\n\n");
}

/** The option row shared by the dropdown panel and the command list. */
function optionRow(config: ModelSwitcherConfig): string {
  const c = getPalette(config.theme);
  const s = getSizing(config.size);
  const rowPadY = Math.round(s.height / 4);
  const alignItems = config.showHints ? "flex-start" : "center";

  const dot = config.showDots
    ? `      <span style={{ display: "flex", paddingTop: ${config.showHints ? 5 : 0} }}>
        <Dot color={model.dot} />
      </span>\n`
    : "";

  const check = config.showCheck
    ? `          {active && (
            <span style={{ display: "flex", color: ${q(config.accent)} }}>
              <CheckIcon />
            </span>
          )}\n`
    : "";

  const hint = config.showHints
    ? `        {model.hint && (
          <span style={{ display: "block", marginTop: 2, fontSize: ${s.hintFont}, color: ${q(
            c.muted,
          )} }}>
            {model.hint}
          </span>
        )}\n`
    : "";

  const badge = config.showBadges
    ? `      {model.badge && <Badge text={model.badge} />}\n`
    : "";

  return `function OptionRow({
  model,
  active,
  onSelect,
}: {
  model: ModelItem;
  active: boolean;
  onSelect: (id: string) => void;
}) {
  const [hover, setHover] = React.useState(false);

  return (
    <button
      type="button"
      role="option"
      aria-selected={active}
      onClick={() => onSelect(model.id)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "flex",
        width: "100%",
        alignItems: ${q(alignItems)},
        gap: ${s.gap},
        padding: "${rowPadY}px ${s.paddingX}px",
        textAlign: "left",
        background: active || hover ? ${q(c.hover)} : "transparent",
        border: "none",
        borderRadius: ${config.radius},
        cursor: "pointer",
        color: ${q(c.fg)},
      }}
    >
${dot}      <span style={{ minWidth: 0, flex: 1 }}>
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: ${s.font}, fontWeight: 500 }}>{model.name}</span>
${check}        </span>
${hint}      </span>
${badge}    </button>
  );
}`;
}

function dropdownBody(config: ModelSwitcherConfig): string {
  const c = getPalette(config.theme);
  const s = getSizing(config.size);
  const width = config.fullWidth ? `"100%"` : `"auto"`;

  const dot = config.showDots ? `          <Dot color={selected.dot} />\n` : "";
  const prefix = config.triggerPrefix
    ? `          <span style={{ color: ${q(c.muted)} }}>${config.triggerPrefix}</span>\n`
    : "";
  const badge = config.showBadges
    ? `          {selected.badge && <Badge text={selected.badge} />}\n`
    : "";

  return `  const [open, setOpen] = React.useState(false);
  const selected = MODELS.find((m) => m.id === selectedId) ?? MODELS[0];

  return (
    <div style={{ position: "relative", width: ${width} }}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        style={{
          display: "inline-flex",
          width: ${width},
          height: ${s.height},
          alignItems: "center",
          justifyContent: "space-between",
          gap: ${s.gap},
          borderRadius: ${config.radius},
          border: "1px solid ${c.border}",
          background: ${q(c.bg)},
          color: ${q(c.fg)},
          padding: "0 ${s.paddingX}px",
          fontSize: ${s.font},
          cursor: "pointer",
        }}
      >
        <span style={{ display: "inline-flex", minWidth: 0, alignItems: "center", gap: ${s.gap} }}>
${dot}${prefix}          <span style={{ fontWeight: 500, whiteSpace: "nowrap" }}>{selected.name}</span>
${badge}        </span>
        <span style={{ display: "flex", color: ${q(c.muted)} }}>
          <ChevronIcon open={open} />
        </span>
      </button>

      {open && (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 10 }} onClick={() => setOpen(false)} />
          <ul
            role="listbox"
            style={{
              position: "absolute",
              zIndex: 20,
              top: "100%",
              left: 0,
              minWidth: ${config.fullWidth ? `"100%"` : "260"},
              width: ${config.fullWidth ? `"100%"` : `"max-content"`},
              maxWidth: 340,
              overflow: "hidden",
              borderRadius: ${config.radius + 2},
              border: "1px solid ${c.border}",
              background: ${q(c.panel)},
              boxShadow: "${c.shadow}",
              listStyle: "none",
              margin: "6px 0 0",
              padding: 4,
            }}
          >
            {MODELS.map((model) => (
              <li key={model.id}>
                <OptionRow
                  model={model}
                  active={model.id === selected.id}
                  onSelect={(id) => {
                    select(id);
                    setOpen(false);
                  }}
                />
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );`;
}

function segmentedBody(config: ModelSwitcherConfig): string {
  const c = getPalette(config.theme);
  const s = getSizing(config.size);
  const onAccent = readableOn(config.accent);

  const dot = config.showDots ? `            {!active && <Dot color={model.dot} />}\n` : "";
  const badge = config.showBadges
    ? `            {model.badge && (
              <Badge
                text={model.badge}
                background={active ? "${withAlpha(onAccent, 0.18)}" : ${q(c.bg)}}
                color={active ? ${q(onAccent)} : ${q(c.chipText)}}
              />
            )}\n`
    : "";

  return `  return (
    <div
      role="radiogroup"
      style={{
        display: "inline-flex",
        width: ${config.fullWidth ? `"100%"` : `"auto"`},
        padding: 3,
        gap: 2,
        borderRadius: ${config.radius + 3},
        border: "1px solid ${c.border}",
        background: ${q(c.chip)},
      }}
    >
      {MODELS.map((model) => {
        const active = model.id === selectedId;
        return (
          <button
            key={model.id}
            type="button"
            role="radio"
            aria-checked={active}
            title={model.hint}
            onClick={() => select(model.id)}
            style={{
              display: "inline-flex",
              flex: ${config.fullWidth ? "1" : `"0 0 auto"`},
              height: ${s.height},
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              borderRadius: ${config.radius},
              border: "none",
              background: active ? ${q(config.accent)} : "transparent",
              color: active ? ${q(onAccent)} : ${q(c.muted)},
              padding: "0 ${s.paddingX}px",
              fontSize: ${s.font},
              fontWeight: active ? 600 : 500,
              whiteSpace: "nowrap",
              cursor: "pointer",
              transition: "background 150ms ease, color 150ms ease",
            }}
          >
${dot}            {model.name}
${badge}          </button>
        );
      })}
    </div>
  );`;
}

function pillsBody(config: ModelSwitcherConfig): string {
  const c = getPalette(config.theme);
  const s = getSizing(config.size);

  const dot = config.showDots
    ? `            <Dot color={active ? ${q(config.accent)} : model.dot} />\n`
    : "";
  const check = config.showCheck ? `            {active && <CheckIcon />}\n` : "";
  const badge = config.showBadges ? `            {model.badge && <Badge text={model.badge} />}\n` : "";

  return `  return (
    <div role="radiogroup" style={{ display: "flex", flexWrap: "wrap", gap: ${s.gap} }}>
      {MODELS.map((model) => {
        const active = model.id === selectedId;
        return (
          <button
            key={model.id}
            type="button"
            role="radio"
            aria-checked={active}
            title={model.hint}
            onClick={() => select(model.id)}
            style={{
              display: "inline-flex",
              height: ${s.height},
              alignItems: "center",
              gap: 6,
              borderRadius: 999,
              border: active ? "1px solid ${config.accent}" : "1px solid ${c.border}",
              background: active ? "${withAlpha(config.accent, 0.12)}" : ${q(c.bg)},
              color: active ? ${q(config.accent)} : ${q(c.muted)},
              padding: "0 ${s.paddingX + 2}px",
              fontSize: ${s.font},
              fontWeight: active ? 600 : 500,
              whiteSpace: "nowrap",
              cursor: "pointer",
              transition: "background 150ms ease, color 150ms ease, border-color 150ms ease",
            }}
          >
${dot}            {model.name}
${check}${badge}          </button>
        );
      })}
    </div>
  );`;
}

function commandBody(config: ModelSwitcherConfig): string {
  const c = getPalette(config.theme);
  const s = getSizing(config.size);

  return `  const [query, setQuery] = React.useState("");

  const q = query.trim().toLowerCase();
  const matches = q
    ? MODELS.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.hint.toLowerCase().includes(q) ||
          m.badge.toLowerCase().includes(q),
      )
    : MODELS;

  return (
    <div
      style={{
        width: ${config.fullWidth ? `"100%"` : "320"},
        maxWidth: "100%",
        overflow: "hidden",
        borderRadius: ${config.radius + 2},
        border: "1px solid ${c.border}",
        background: ${q(c.panel)},
        boxShadow: "${c.shadow}",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: ${s.gap},
          borderBottom: "1px solid ${c.border}",
          padding: "0 ${s.paddingX}px",
          height: ${s.height + 6},
        }}
      >
        <span style={{ display: "flex", color: ${q(c.muted)} }}>
          <SearchIcon />
        </span>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search models..."
          aria-label="Search models"
          style={{
            flex: 1,
            border: "none",
            outline: "none",
            background: "transparent",
            color: ${q(c.fg)},
            fontSize: ${s.font},
          }}
        />
      </div>
      <div role="listbox" style={{ padding: 4 }}>
        {matches.map((model) => (
          <OptionRow
            key={model.id}
            model={model}
            active={model.id === selectedId}
            onSelect={select}
          />
        ))}
        {matches.length === 0 && (
          <p style={{ margin: 0, padding: ${s.paddingX}, fontSize: ${s.hintFont}, color: ${q(
            c.muted,
          )} }}>
            No models match your search.
          </p>
        )}
      </div>
    </div>
  );`;
}

export function generateCode(config: ModelSwitcherConfig): string {
  const needsOptionRow = config.variant === "dropdown" || config.variant === "command";
  const initialId = config.models[0]?.id ?? "";

  const body =
    config.variant === "segmented"
      ? segmentedBody(config)
      : config.variant === "pills"
        ? pillsBody(config)
        : config.variant === "command"
          ? commandBody(config)
          : dropdownBody(config);

  const blocks = [
    `"use client";

import * as React from "react";

/**
 * Model switcher — generated by the Model Switcher Builder.
 * https://ai-ui-resources.vercel.app/tools/model-switcher
 *
 * No dependencies beyond React. Colors are inlined so it drops into any
 * project; move them into your own tokens whenever you are ready.
 */

export type ModelItem = {
  id: string;
  name: string;
  hint: string;
  badge: string;
  dot: string;
};

export const MODELS: ModelItem[] = [
${modelsBlock(config)}
];`,
    helpers(config),
    needsOptionRow ? optionRow(config) : "",
    `export function ModelSwitcher({
  value,
  onChange,
}: {
  value?: string;
  onChange?: (id: string) => void;
}) {
  const [internalId, setInternalId] = React.useState(${q(config.selectedId || initialId)});
  const selectedId = value ?? internalId;

  function select(id: string) {
    setInternalId(id);
    onChange?.(id);
  }

${body}
}`,
  ];

  return blocks.filter(Boolean).join("\n\n") + "\n";
}
