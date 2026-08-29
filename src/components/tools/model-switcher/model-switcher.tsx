"use client";

import * as React from "react";
import { CopyButton } from "@/components/component-page/copy-button";
import { Chip, Field, Section, inputCls, selectCls } from "../tool-ui";
import { VendorPicker } from "../vendor-picker";
import { generateCode } from "./generate-code";
import { modelPresets, vendorLineups } from "./presets";
import { getPalette } from "./styles";
import { SwitcherPreview } from "./switcher-preview";
import {
  SIZE_LABELS,
  VARIANT_HINTS,
  VARIANT_LABELS,
  defaultConfig,
  type ModelItem,
  type ModelSwitcherConfig,
  type SwitcherSize,
  type SwitcherTheme,
  type SwitcherVariant,
} from "./types";

const VARIANTS: SwitcherVariant[] = ["dropdown", "segmented", "pills", "command"];
const SIZES: SwitcherSize[] = ["sm", "md", "lg"];
const THEMES: SwitcherTheme[] = ["light", "dark"];
const DOT_COLORS = ["#7c3aed", "#d97757", "#0ea5e9", "#10b981", "#f59e0b", "#ef4444", "#71717a"];

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 py-1 text-sm">
      <span className="text-(--muted-foreground)">{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 cursor-pointer accent-(--foreground)"
      />
    </label>
  );
}

function nextModelId(models: ModelItem[]): string {
  let n = models.length + 1;
  while (models.some((m) => m.id === `model-${n}`)) n += 1;
  return `model-${n}`;
}

export function ModelSwitcherTool() {
  const [config, setConfig] = React.useState<ModelSwitcherConfig>(() =>
    structuredClone(defaultConfig),
  );
  const [view, setView] = React.useState<"preview" | "code">("preview");

  const code = React.useMemo(() => generateCode(config), [config]);
  const palette = getPalette(config.theme);

  function update(patch: Partial<ModelSwitcherConfig>) {
    setConfig((c) => ({ ...c, ...patch }));
  }

  function updateModel(index: number, patch: Partial<ModelItem>) {
    setConfig((c) => {
      const models = c.models.map((m, i) => (i === index ? { ...m, ...patch } : m));
      const wasSelected = c.models[index].id === c.selectedId;
      return {
        ...c,
        models,
        selectedId: wasSelected ? models[index].id : c.selectedId,
      };
    });
  }

  function addModel() {
    setConfig((c) => ({
      ...c,
      models: [
        ...c.models,
        { id: nextModelId(c.models), name: "New model", hint: "", badge: "", dot: "#71717a" },
      ],
    }));
  }

  function removeModel(index: number) {
    setConfig((c) => {
      if (c.models.length <= 1) return c;
      const models = c.models.filter((_, i) => i !== index);
      const removedSelected = c.models[index].id === c.selectedId;
      return {
        ...c,
        models,
        selectedId: removedSelected ? models[0].id : c.selectedId,
      };
    });
  }

  function moveModel(index: number, delta: number) {
    setConfig((c) => {
      const target = index + delta;
      if (target < 0 || target >= c.models.length) return c;
      const models = [...c.models];
      const [item] = models.splice(index, 1);
      models.splice(target, 0, item);
      return { ...c, models };
    });
  }

  function applyPreset(presetId: string) {
    const preset = modelPresets.find((p) => p.id === presetId);
    if (!preset) return;
    setConfig((c) => ({
      ...c,
      models: structuredClone(preset.models),
      selectedId: preset.selectedId,
    }));
  }

  function applyVendorLineup(vendor: string) {
    const lineup = vendorLineups.find((v) => v.vendor === vendor);
    if (!lineup) return;
    setConfig((c) => ({
      ...c,
      models: structuredClone(lineup.models),
      selectedId: lineup.models[0].id,
    }));
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Model Switcher Builder
          </h1>
          <p className="mt-1.5 max-w-xl text-sm text-(--muted-foreground)">
            Design the control that lets people pick a model — dropdown, segmented, pills or a
            command list. Tune it live, then copy a dependency-free React component.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setConfig(structuredClone(defaultConfig))}
          className="inline-flex h-8 items-center rounded-lg border border-(--border) px-3 text-xs font-medium text-(--muted-foreground) transition-colors hover:text-(--foreground)"
        >
          Reset
        </button>
      </div>

      {/* Body */}
      <div className="mt-8 grid gap-6 lg:grid-cols-[340px_1fr]">
        {/* Sidebar */}
        <div className="space-y-4">
          <Section title="Variant">
            <div className="flex flex-wrap gap-2">
              {VARIANTS.map((v) => (
                <Chip
                  key={v}
                  active={config.variant === v}
                  onClick={() => update({ variant: v })}
                >
                  {VARIANT_LABELS[v]}
                </Chip>
              ))}
            </div>
            <p className="mt-3 text-xs leading-5 text-(--muted-foreground)">
              {VARIANT_HINTS[config.variant]}
            </p>
          </Section>

          <Section title="Style">
            <div className="space-y-3">
              <Field label="Size">
                <div className="flex gap-2">
                  {SIZES.map((s) => (
                    <Chip key={s} active={config.size === s} onClick={() => update({ size: s })}>
                      {SIZE_LABELS[s]}
                    </Chip>
                  ))}
                </div>
              </Field>

              <Field label="Theme">
                <div className="flex gap-2">
                  {THEMES.map((t) => (
                    <Chip key={t} active={config.theme === t} onClick={() => update({ theme: t })}>
                      {t === "light" ? "Light" : "Dark"}
                    </Chip>
                  ))}
                </div>
              </Field>

              <Field label="Accent color">
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={config.accent}
                    onChange={(e) => update({ accent: e.target.value })}
                    className="h-10 w-14 cursor-pointer rounded-lg border border-(--border)"
                  />
                  <input
                    type="text"
                    value={config.accent}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (/^#[0-9a-fA-F]{0,6}$/.test(v)) update({ accent: v });
                    }}
                    maxLength={7}
                    className={inputCls + " font-mono uppercase"}
                  />
                </div>
              </Field>

              <Field label={`Corner radius — ${config.radius}px`}>
                <input
                  type="range"
                  min={0}
                  max={20}
                  value={config.radius}
                  onChange={(e) => update({ radius: Number(e.target.value) })}
                  className="w-full accent-(--foreground)"
                />
              </Field>

              {config.variant === "dropdown" && (
                <Field label="Trigger prefix (optional)">
                  <input
                    type="text"
                    value={config.triggerPrefix}
                    onChange={(e) => update({ triggerPrefix: e.target.value })}
                    placeholder="Model:"
                    className={inputCls}
                  />
                </Field>
              )}
            </div>
          </Section>

          <Section title="Details">
            <div className="space-y-0.5">
              <Toggle
                label="Model hints"
                checked={config.showHints}
                onChange={(v) => update({ showHints: v })}
              />
              <Toggle
                label="Badges"
                checked={config.showBadges}
                onChange={(v) => update({ showBadges: v })}
              />
              <Toggle
                label="Model marks"
                checked={config.showDots}
                onChange={(v) => update({ showDots: v })}
              />
              <Toggle
                label="Check on selected"
                checked={config.showCheck}
                onChange={(v) => update({ showCheck: v })}
              />
              <Toggle
                label="Full width"
                checked={config.fullWidth}
                onChange={(v) => update({ fullWidth: v })}
              />
            </div>
          </Section>

          <Section title="Models">
            <Field label="Start from a provider">
              <VendorPicker
                vendors={vendorLineups.map((v) => v.vendor)}
                onSelect={applyVendorLineup}
              />
            </Field>

            <div className="mt-3">
              <Field label="Start from a preset">
              <select
                value=""
                onChange={(e) => applyPreset(e.target.value)}
                className={selectCls}
              >
                <option value="">Choose a preset...</option>
                {modelPresets.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
              </Field>
            </div>

            <div className="mt-3 space-y-3">
              {config.models.map((model, i) => (
                <div
                  key={model.id}
                  className="rounded-lg border border-(--border) bg-(--background) p-3"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={model.dot}
                      onChange={(e) => updateModel(i, { dot: e.target.value })}
                      aria-label={`${model.name} color`}
                      title="Fallback dot color — a recognised model name shows its provider's logo instead"
                      list="model-dot-colors"
                      className="h-7 w-7 shrink-0 cursor-pointer rounded-md border border-(--border)"
                    />
                    <input
                      type="text"
                      value={model.name}
                      onChange={(e) => updateModel(i, { name: e.target.value })}
                      aria-label="Model name"
                      className={inputCls + " h-8 py-0 font-medium"}
                    />
                    <div className="flex shrink-0 gap-0.5">
                      <button
                        type="button"
                        onClick={() => moveModel(i, -1)}
                        disabled={i === 0}
                        aria-label="Move up"
                        className="h-7 w-6 rounded-md text-xs text-(--muted-foreground) transition-colors hover:text-(--foreground) disabled:opacity-30"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => moveModel(i, 1)}
                        disabled={i === config.models.length - 1}
                        aria-label="Move down"
                        className="h-7 w-6 rounded-md text-xs text-(--muted-foreground) transition-colors hover:text-(--foreground) disabled:opacity-30"
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        onClick={() => removeModel(i)}
                        disabled={config.models.length <= 1}
                        aria-label="Remove model"
                        className="h-7 w-6 rounded-md text-xs text-(--muted-foreground) transition-colors hover:text-red-500 disabled:opacity-30"
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  <input
                    type="text"
                    value={model.hint}
                    onChange={(e) => updateModel(i, { hint: e.target.value })}
                    placeholder="Hint — what this model is good at"
                    aria-label="Model hint"
                    className={inputCls + " mt-2 h-8 py-0 text-xs"}
                  />

                  <div className="mt-2 flex items-center gap-2">
                    <input
                      type="text"
                      value={model.badge}
                      onChange={(e) => updateModel(i, { badge: e.target.value })}
                      placeholder="Badge (optional)"
                      aria-label="Model badge"
                      className={inputCls + " h-8 py-0 text-xs"}
                    />
                    <button
                      type="button"
                      onClick={() => update({ selectedId: model.id })}
                      className={`h-8 shrink-0 rounded-lg px-2.5 text-xs font-medium transition-colors ${
                        config.selectedId === model.id
                          ? "bg-(--foreground) text-(--background)"
                          : "border border-(--border) text-(--muted-foreground) hover:text-(--foreground)"
                      }`}
                    >
                      {config.selectedId === model.id ? "Selected" : "Select"}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <datalist id="model-dot-colors">
              {DOT_COLORS.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>

            <button
              type="button"
              onClick={addModel}
              className="mt-3 inline-flex h-8 w-full items-center justify-center rounded-lg border border-dashed border-(--border) text-xs font-medium text-(--muted-foreground) transition-colors hover:text-(--foreground)"
            >
              + Add model
            </button>
          </Section>
        </div>

        {/* Preview / Code */}
        <div className="space-y-4">
          <div className="sticky top-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="inline-flex rounded-lg border border-(--border) p-0.5">
                {(["preview", "code"] as const).map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setView(v)}
                    className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                      view === v
                        ? "bg-(--foreground) text-(--background)"
                        : "text-(--muted-foreground) hover:text-(--foreground)"
                    }`}
                  >
                    {v === "preview" ? "Preview" : "Code"}
                  </button>
                ))}
              </div>
              <CopyButton code={code} label="Copy component" />
            </div>

            {view === "preview" ? (
              <div
                className="flex min-h-[320px] items-center justify-center rounded-xl border border-(--border) p-8"
                style={{ background: palette.bg }}
              >
                <div style={{ width: config.fullWidth ? "100%" : "auto", maxWidth: "100%" }}>
                  <SwitcherPreview
                    config={config}
                    onSelect={(id) => update({ selectedId: id })}
                  />
                </div>
              </div>
            ) : (
              <pre className="max-h-[70vh] overflow-auto rounded-xl border border-(--border) bg-(--card) p-4 text-xs leading-6">
                <code>{code}</code>
              </pre>
            )}

            <p className="text-xs leading-5 text-(--muted-foreground)">
              The preview is live — click a model to switch it. The exported component is plain
              React with inline styles, so it works in any project without extra dependencies.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
