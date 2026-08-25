"use client";

import * as React from "react";
import { brandData, resolveModelBrand } from "@/lib/brands";
import { getPalette, getSizing, readableOn, withAlpha } from "./styles";
import type { ModelItem, ModelSwitcherConfig, SwitcherTheme } from "./types";

/* ------------------------------------------------------------------ */
/* Icons                                                               */
/* ------------------------------------------------------------------ */

function ChevronIcon({ size, open }: { size: number; open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width={size}
      height={size}
      style={{
        flexShrink: 0,
        transition: "transform 150ms ease",
        transform: open ? "rotate(180deg)" : "none",
      }}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function CheckIcon({ size }: { size: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      width={size}
      height={size}
      style={{ flexShrink: 0 }}
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function SearchIcon({ size }: { size: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width={size}
      height={size}
      style={{ flexShrink: 0 }}
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Shared bits                                                         */
/* ------------------------------------------------------------------ */

/**
 * The leading mark for a model row. A recognised model shows its provider's
 * logo; anything else falls back to the configurable color dot, because model
 * lists here are user-supplied and "My fine-tune" has no logo to show.
 */
function Dot({
  color,
  size,
  markSize,
  name,
  theme,
}: {
  color: string;
  size: number;
  markSize: number;
  name: string;
  theme: SwitcherTheme;
}) {
  const key = resolveModelBrand(name);
  if (key) {
    const data = brandData[key];
    return (
      <svg
        aria-hidden
        viewBox={data.viewBox}
        width={markSize}
        height={markSize}
        style={{ flexShrink: 0, fill: theme === "dark" ? data.dark : data.light }}
        dangerouslySetInnerHTML={{ __html: data.body }}
      />
    );
  }
  return (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: 999,
        background: color,
        flexShrink: 0,
      }}
    />
  );
}

function Badge({
  text,
  font,
  bg,
  color,
}: {
  text: string;
  font: number;
  bg: string;
  color: string;
}) {
  return (
    <span
      style={{
        borderRadius: 999,
        background: bg,
        color,
        fontSize: font,
        lineHeight: 1.6,
        padding: "0 8px",
        whiteSpace: "nowrap",
        flexShrink: 0,
      }}
    >
      {text}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Section header — a provider label above the first row of a group.   */
/* ------------------------------------------------------------------ */

function GroupLabel({ label, font, color }: { label: string; font: number; color: string }) {
  return (
    <li
      role="presentation"
      style={{
        margin: "8px 10px 2px",
        fontSize: font,
        fontWeight: 600,
        color,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        lineHeight: 1.4,
        listStyle: "none",
      }}
    >
      {label}
    </li>
  );
}

/* ------------------------------------------------------------------ */
/* Option row — used by the dropdown panel and the command list        */
/* ------------------------------------------------------------------ */

function OptionRow({
  model,
  active,
  config,
  onSelect,
}: {
  model: ModelItem;
  active: boolean;
  config: ModelSwitcherConfig;
  onSelect: (id: string) => void;
}) {
  const c = getPalette(config.theme);
  const s = getSizing(config.size);
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
        alignItems: config.showHints && model.hint ? "flex-start" : "center",
        gap: s.gap,
        padding: `${Math.round(s.height / 4)}px ${s.paddingX}px`,
        textAlign: "left",
        background: active || hover ? c.hover : "transparent",
        border: "none",
        cursor: "pointer",
        color: c.fg,
      }}
    >
      {config.showDots && (
        <span style={{ paddingTop: config.showHints && model.hint ? 5 : 0, display: "flex" }}>
          <Dot color={model.dot} size={s.dot} markSize={s.mark} name={model.name} theme={config.theme} />
        </span>
      )}
      <span style={{ minWidth: 0, flex: 1 }}>
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: s.font, fontWeight: 500 }}>{model.name}</span>
          {config.showCheck && active && (
            <span style={{ color: config.accent, display: "flex" }}>
              <CheckIcon size={s.font - 1} />
            </span>
          )}
        </span>
        {config.showHints && model.hint && (
          <span
            style={{
              display: "block",
              marginTop: 2,
              fontSize: s.hintFont,
              color: c.muted,
            }}
          >
            {model.hint}
          </span>
        )}
      </span>
      {config.showBadges && model.badge && (
        <Badge text={model.badge} font={s.badgeFont} bg={c.chip} color={c.chipText} />
      )}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Variants                                                            */
/* ------------------------------------------------------------------ */

function DropdownVariant({
  config,
  onSelect,
}: {
  config: ModelSwitcherConfig;
  onSelect: (id: string) => void;
}) {
  const c = getPalette(config.theme);
  const s = getSizing(config.size);
  const [open, setOpen] = React.useState(false);
  const selected =
    config.models.find((m) => m.id === config.selectedId) ?? config.models[0];

  if (!selected) return null;

  return (
    <div style={{ position: "relative", width: config.fullWidth ? "100%" : "auto" }}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        style={{
          display: "inline-flex",
          width: config.fullWidth ? "100%" : "auto",
          height: s.height,
          alignItems: "center",
          justifyContent: "space-between",
          gap: s.gap,
          borderRadius: config.radius,
          border: `1px solid ${c.border}`,
          background: c.bg,
          color: c.fg,
          padding: `0 ${s.paddingX}px`,
          fontSize: s.font,
          cursor: "pointer",
        }}
      >
        <span
          style={{ display: "inline-flex", minWidth: 0, alignItems: "center", gap: s.gap }}
        >
          {config.showDots && <Dot color={selected.dot} size={s.dot} markSize={s.mark} name={selected.name} theme={config.theme} />}
          {config.triggerPrefix && (
            <span style={{ color: c.muted }}>{config.triggerPrefix}</span>
          )}
          <span style={{ fontWeight: 500, whiteSpace: "nowrap" }}>{selected.name}</span>
          {config.showBadges && selected.badge && (
            <Badge text={selected.badge} font={s.badgeFont} bg={c.chip} color={c.chipText} />
          )}
        </span>
        <span style={{ color: c.muted, display: "flex" }}>
          <ChevronIcon size={s.font} open={open} />
        </span>
      </button>

      {open && (
        <>
          <div
            style={{ position: "fixed", inset: 0, zIndex: 10 }}
            onClick={() => setOpen(false)}
          />
          <ul
            role="listbox"
            style={{
              position: "absolute",
              zIndex: 20,
              top: "100%",
              left: 0,
              marginTop: 6,
              minWidth: config.fullWidth ? "100%" : 260,
              width: config.fullWidth ? "100%" : "max-content",
              maxWidth: 340,
              overflow: "hidden",
              borderRadius: config.radius + 2,
              border: `1px solid ${c.border}`,
              background: c.panel,
              boxShadow: c.shadow,
              listStyle: "none",
              margin: "6px 0 0",
              padding: 4,
            }}
          >
            {config.models.map((m, i) => {
              const header =
                m.group && (i === 0 || config.models[i - 1].group !== m.group);
              return (
                <React.Fragment key={m.id}>
                  {header && <GroupLabel label={m.group!} font={s.hintFont} color={c.muted} />}
                  <li style={{ borderRadius: config.radius, overflow: "hidden" }}>
                    <OptionRow
                      model={m}
                      active={m.id === selected.id}
                      config={config}
                      onSelect={(id) => {
                        onSelect(id);
                        setOpen(false);
                      }}
                    />
                  </li>
                </React.Fragment>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}

function SegmentedVariant({
  config,
  onSelect,
}: {
  config: ModelSwitcherConfig;
  onSelect: (id: string) => void;
}) {
  const c = getPalette(config.theme);
  const s = getSizing(config.size);

  return (
    <div
      role="radiogroup"
      style={{
        display: "flex",
        width: config.fullWidth ? "100%" : "auto",
        maxWidth: "100%",
        padding: 3,
        gap: 2,
        borderRadius: config.radius + 3,
        border: `1px solid ${c.border}`,
        background: c.chip,
        overflow: "hidden",
      }}
    >
      {config.models.map((m) => {
        const active = m.id === config.selectedId;
        return (
          <button
            key={m.id}
            type="button"
            role="radio"
            aria-checked={active}
            title={config.showHints ? m.hint : undefined}
            onClick={() => onSelect(m.id)}
            style={{
              display: "inline-flex",
              flex: config.fullWidth ? 1 : "0 1 auto",
              minWidth: 0,
              height: s.height,
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              borderRadius: config.radius,
              border: "none",
              background: active ? config.accent : "transparent",
              color: active ? readableOn(config.accent) : c.muted,
              padding: `0 ${s.paddingX}px`,
              fontSize: s.font,
              fontWeight: active ? 600 : 500,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              cursor: "pointer",
              transition: "background 150ms ease, color 150ms ease",
            }}
          >
            {config.showDots && !active && <Dot color={m.dot} size={s.dot} markSize={s.mark} name={m.name} theme={config.theme} />}
            {m.name}
            {config.showBadges && m.badge && (
              <Badge
                text={m.badge}
                font={s.badgeFont}
                bg={active ? withAlpha(readableOn(config.accent), 0.18) : c.bg}
                color={active ? readableOn(config.accent) : c.chipText}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

function PillsVariant({
  config,
  onSelect,
}: {
  config: ModelSwitcherConfig;
  onSelect: (id: string) => void;
}) {
  const c = getPalette(config.theme);
  const s = getSizing(config.size);

  return (
    <div
      role="radiogroup"
      style={{ display: "flex", flexWrap: "wrap", gap: s.gap, width: config.fullWidth ? "100%" : "auto" }}
    >
      {config.models.map((m) => {
        const active = m.id === config.selectedId;
        return (
          <button
            key={m.id}
            type="button"
            role="radio"
            aria-checked={active}
            title={config.showHints ? m.hint : undefined}
            onClick={() => onSelect(m.id)}
            style={{
              display: "inline-flex",
              height: s.height,
              alignItems: "center",
              gap: 6,
              borderRadius: 999,
              border: `1px solid ${active ? config.accent : c.border}`,
              background: active ? withAlpha(config.accent, 0.12) : c.bg,
              color: active ? config.accent : c.muted,
              padding: `0 ${s.paddingX + 2}px`,
              fontSize: s.font,
              fontWeight: active ? 600 : 500,
              whiteSpace: "nowrap",
              cursor: "pointer",
              transition: "background 150ms ease, color 150ms ease, border-color 150ms ease",
            }}
          >
            {config.showDots && <Dot color={active ? config.accent : m.dot} size={s.dot} markSize={s.mark} name={m.name} theme={config.theme} />}
            {m.name}
            {config.showCheck && active && <CheckIcon size={s.font - 1} />}
            {config.showBadges && m.badge && (
              <Badge text={m.badge} font={s.badgeFont} bg={c.chip} color={c.chipText} />
            )}
          </button>
        );
      })}
    </div>
  );
}

function CommandVariant({
  config,
  onSelect,
}: {
  config: ModelSwitcherConfig;
  onSelect: (id: string) => void;
}) {
  const c = getPalette(config.theme);
  const s = getSizing(config.size);
  const [query, setQuery] = React.useState("");

  const q = query.trim().toLowerCase();
  const matches = q
    ? config.models.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.hint.toLowerCase().includes(q) ||
          m.badge.toLowerCase().includes(q),
      )
    : config.models;

  return (
    <div
      style={{
        width: config.fullWidth ? "100%" : 320,
        maxWidth: "100%",
        overflow: "hidden",
        borderRadius: config.radius + 2,
        border: `1px solid ${c.border}`,
        background: c.panel,
        boxShadow: c.shadow,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: s.gap,
          borderBottom: `1px solid ${c.border}`,
          padding: `0 ${s.paddingX}px`,
          height: s.height + 6,
        }}
      >
        <span style={{ color: c.muted, display: "flex" }}>
          <SearchIcon size={s.font + 1} />
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
            color: c.fg,
            fontSize: s.font,
          }}
        />
      </div>
      <div role="listbox" style={{ padding: 4 }}>
        {matches.length === 0 ? (
          <p
            style={{
              margin: 0,
              padding: `${s.paddingX}px`,
              fontSize: s.hintFont,
              color: c.muted,
            }}
          >
            No models match “{query}”.
          </p>
        ) : (
          matches.map((m, i) => {
            const header =
              m.group && (i === 0 || matches[i - 1].group !== m.group);
            return (
              <React.Fragment key={m.id}>
                {header && <GroupLabel label={m.group!} font={s.hintFont} color={c.muted} />}
                <div style={{ borderRadius: config.radius, overflow: "hidden" }}>
                  <OptionRow
                    model={m}
                    active={m.id === config.selectedId}
                    config={config}
                    onSelect={onSelect}
                  />
                </div>
              </React.Fragment>
            );
          })
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Preview                                                             */
/* ------------------------------------------------------------------ */

export function SwitcherPreview({
  config,
  onSelect,
}: {
  config: ModelSwitcherConfig;
  onSelect: (id: string) => void;
}) {
  if (config.models.length === 0) {
    return (
      <p className="text-sm text-(--muted-foreground)">
        Add at least one model to see the switcher.
      </p>
    );
  }

  switch (config.variant) {
    case "segmented":
      return <SegmentedVariant config={config} onSelect={onSelect} />;
    case "pills":
      return <PillsVariant config={config} onSelect={onSelect} />;
    case "command":
      return <CommandVariant config={config} onSelect={onSelect} />;
    case "dropdown":
    default:
      return <DropdownVariant config={config} onSelect={onSelect} />;
  }
}
