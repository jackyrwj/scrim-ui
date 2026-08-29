"use client";

import * as React from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { CopyButton } from "@/components/component-page/copy-button";
import { Chip, Field, inputCls, selectCls } from "../tool-ui";
import { generateCode } from "./generate-code";
import { modelPresets, vendorLineups } from "./presets";
import { getPalette } from "./styles";
import { SwitcherPreview } from "./switcher-preview";
import {
  SIZE_LABELS,
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
const ACCENTS = [
  { value: "#18181b", label: "Ink" },
  { value: "#2563eb", label: "Blue" },
  { value: "#7c3aed", label: "Violet" },
  { value: "#059669", label: "Emerald" },
  { value: "#dc2626", label: "Red" },
] as const;
const focusRing = " focus-visible:outline-2 focus-visible:outline-offset-2";

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (next: boolean) => void }) {
  return (
    <label className="inline-flex min-h-8 cursor-pointer items-center gap-2 rounded-lg border border-(--border) px-2.5 text-xs font-medium text-(--muted-foreground) has-checked:border-(--foreground) has-checked:text-(--foreground)">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="h-3.5 w-3.5 cursor-pointer accent-(--foreground)" />
      {label}
    </label>
  );
}

function IconButton({ label, disabled, destructive = false, onClick, children }: { label: string; disabled?: boolean; destructive?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors active:scale-[0.96] disabled:pointer-events-none disabled:opacity-25 ${destructive ? "text-(--muted-foreground) hover:bg-red-500/10 hover:text-red-600" : "text-(--muted-foreground) hover:bg-(--muted) hover:text-(--foreground)"}`}
    >
      {children}
    </button>
  );
}

function nextModelId(models: ModelItem[]): string {
  let n = models.length + 1;
  while (models.some((model) => model.id === `model-${n}`)) n += 1;
  return `model-${n}`;
}

export function ModelSwitcherTool() {
  const [config, setConfig] = React.useState<ModelSwitcherConfig>(() => structuredClone(defaultConfig));
  const [view, setView] = React.useState<"preview" | "code">("preview");
  const code = React.useMemo(() => generateCode(config), [config]);
  const palette = getPalette(config.theme);

  function update(patch: Partial<ModelSwitcherConfig>) {
    setConfig((current) => ({ ...current, ...patch }));
  }

  function updateModel(index: number, patch: Partial<ModelItem>) {
    setConfig((current) => {
      const models = current.models.map((model, i) => i === index ? { ...model, ...patch } : model);
      const wasSelected = current.models[index].id === current.selectedId;
      return { ...current, models, selectedId: wasSelected ? models[index].id : current.selectedId };
    });
  }

  function addModel() {
    setConfig((current) => ({
      ...current,
      models: [...current.models, { id: nextModelId(current.models), name: "New model", hint: "", badge: "", dot: "#71717a" }],
    }));
  }

  function removeModel(index: number) {
    setConfig((current) => {
      if (current.models.length <= 1) return current;
      const models = current.models.filter((_, i) => i !== index);
      return { ...current, models, selectedId: current.models[index].id === current.selectedId ? models[0].id : current.selectedId };
    });
  }

  function moveModel(index: number, delta: number) {
    setConfig((current) => {
      const target = index + delta;
      if (target < 0 || target >= current.models.length) return current;
      const models = [...current.models];
      const [item] = models.splice(index, 1);
      models.splice(target, 0, item);
      return { ...current, models };
    });
  }

  function applyStarter(value: string) {
    const [kind, id] = value.split(":");
    if (kind === "preset") {
      const preset = modelPresets.find((item) => item.id === id);
      if (!preset) return;
      setConfig((current) => ({ ...current, models: structuredClone(preset.models), selectedId: preset.selectedId }));
      return;
    }
    const lineup = vendorLineups.find((item) => item.vendor === id);
    if (!lineup) return;
    setConfig((current) => ({ ...current, models: structuredClone(lineup.models), selectedId: lineup.models[0].id }));
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-(--muted-foreground)">Component builder</p>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Model Switcher</h1>
          <p className="mt-1.5 max-w-xl text-sm text-(--muted-foreground)">Pick a layout, add your models, then copy a dependency-free React component.</p>
        </div>
        <button type="button" onClick={() => setConfig(structuredClone(defaultConfig))} className="inline-flex min-h-9 items-center rounded-lg border border-(--border) px-3 text-xs font-medium text-(--muted-foreground) transition-colors hover:text-(--foreground) active:scale-[0.96]">Reset</button>
      </div>

      <div className="mt-6 grid items-start gap-5 lg:grid-cols-[390px_minmax(0,1fr)]">
        <div className="overflow-hidden rounded-2xl border border-(--border) bg-(--card) shadow-[0_1px_2px_oklch(0_0_0/0.04)] lg:max-h-[680px]">
          <div className="space-y-5 overflow-y-auto p-4 lg:max-h-[680px] lg:p-5">
            <fieldset>
              <legend className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-(--muted-foreground)">Layout</legend>
              <div className="flex flex-wrap gap-2">
                {VARIANTS.map((variant) => <Chip key={variant} active={config.variant === variant} onClick={() => update({ variant })}>{VARIANT_LABELS[variant]}</Chip>)}
              </div>
            </fieldset>

            <fieldset className="border-t border-(--border) pt-5">
              <legend className="sr-only">Appearance</legend>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Size"><div className="flex gap-1.5">{SIZES.map((size) => <Chip key={size} active={config.size === size} onClick={() => update({ size })}>{SIZE_LABELS[size]}</Chip>)}</div></Field>
                <Field label="Theme"><div className="flex gap-1.5">{THEMES.map((theme) => <Chip key={theme} active={config.theme === theme} onClick={() => update({ theme })}>{theme === "light" ? "Light" : "Dark"}</Chip>)}</div></Field>
              </div>
              <div className="mt-4 grid grid-cols-[1fr_1.15fr] gap-4">
                <Field label="Accent">
                  <div className="flex min-h-8 items-center gap-2">
                    {ACCENTS.map((accent) => (
                      <button
                        key={accent.value}
                        type="button"
                        aria-label={`${accent.label} accent`}
                        aria-pressed={config.accent === accent.value}
                        title={accent.label}
                        onClick={() => update({ accent: accent.value })}
                        className="relative h-6 w-6 rounded-full outline-offset-2 transition-transform active:scale-[0.96]"
                        style={{ background: accent.value, boxShadow: config.accent === accent.value ? "0 0 0 2px var(--background), 0 0 0 4px var(--foreground)" : "inset 0 0 0 1px rgb(255 255 255 / 0.35)" }}
                      ><span className="sr-only">{accent.label}</span></button>
                    ))}
                  </div>
                </Field>
                <Field label={`Corner radius · ${config.radius}px`}><input type="range" min={0} max={20} value={config.radius} onChange={(event) => update({ radius: Number(event.target.value) })} className="h-8 w-full accent-(--foreground)" /></Field>
              </div>
              {config.variant === "dropdown" && <div className="mt-4"><Field label="Trigger prefix (optional)"><input type="text" value={config.triggerPrefix} onChange={(event) => update({ triggerPrefix: event.target.value })} placeholder="Model:" className={inputCls + focusRing} /></Field></div>}
            </fieldset>

            <fieldset className="border-t border-(--border) pt-5">
              <legend className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-(--muted-foreground)">Show</legend>
              <div className="flex flex-wrap gap-2">
                <Toggle label="Hints" checked={config.showHints} onChange={(showHints) => update({ showHints })} />
                <Toggle label="Badges" checked={config.showBadges} onChange={(showBadges) => update({ showBadges })} />
                <Toggle label="Logos" checked={config.showDots} onChange={(showDots) => update({ showDots })} />
                <Toggle label="Checkmark" checked={config.showCheck} onChange={(showCheck) => update({ showCheck })} />
                <Toggle label="Full width" checked={config.fullWidth} onChange={(fullWidth) => update({ fullWidth })} />
              </div>
            </fieldset>

            <section className="border-t border-(--border) pt-5" aria-labelledby="models-heading">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h2 id="models-heading" className="text-xs font-semibold uppercase tracking-wide text-(--muted-foreground)">Models <span className="ml-1 font-normal normal-case">{config.models.length}</span></h2>
                <button type="button" onClick={addModel} className="inline-flex min-h-8 items-center gap-1.5 rounded-lg border border-(--border) px-2.5 text-xs font-medium text-(--muted-foreground) transition-colors hover:text-(--foreground) active:scale-[0.96]"><Plus aria-hidden="true" size={14} strokeWidth={2} />Add model</button>
              </div>
              <select aria-label="Load a starter model set" value="" onChange={(event) => applyStarter(event.target.value)} className={selectCls + focusRing}>
                <option value="">Load a starter set…</option>
                <optgroup label="Presets">{modelPresets.map((preset) => <option key={preset.id} value={`preset:${preset.id}`}>{preset.label}</option>)}</optgroup>
                <optgroup label="Providers">{vendorLineups.map((lineup) => <option key={lineup.vendor} value={`vendor:${lineup.vendor}`}>{lineup.vendor}</option>)}</optgroup>
              </select>
              <div className="mt-3 space-y-2">
                {config.models.map((model, index) => (
                  <div key={model.id} className={`rounded-xl p-2.5 ${config.selectedId === model.id ? "bg-(--muted)" : "bg-(--background)"} shadow-[inset_0_0_0_1px_var(--border)]`}>
                    <div className="flex items-center gap-2">
                      <span aria-hidden="true" className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: model.dot }} />
                      <input type="text" value={model.name} onChange={(event) => updateModel(index, { name: event.target.value })} aria-label={`Model ${index + 1} name`} className={inputCls + " h-8 min-w-0 py-0 font-medium" + focusRing} />
                      <button type="button" aria-pressed={config.selectedId === model.id} onClick={() => update({ selectedId: model.id })} className={`min-h-8 shrink-0 rounded-lg px-2.5 text-xs font-medium transition-colors active:scale-[0.96] ${config.selectedId === model.id ? "bg-(--foreground) text-(--background)" : "border border-(--border) text-(--muted-foreground) hover:text-(--foreground)"}`}>{config.selectedId === model.id ? "Default" : "Set default"}</button>
                    </div>
                    <div className="mt-2 grid grid-cols-[minmax(0,1fr)_110px_auto] items-center gap-2">
                      <input type="text" value={model.hint} onChange={(event) => updateModel(index, { hint: event.target.value })} placeholder="Hint" aria-label={`${model.name} hint`} className={inputCls + " h-8 min-w-0 py-0 text-xs" + focusRing} />
                      <input type="text" value={model.badge} onChange={(event) => updateModel(index, { badge: event.target.value })} placeholder="Badge" aria-label={`${model.name} badge`} className={inputCls + " h-8 min-w-0 py-0 text-xs" + focusRing} />
                      <div className="flex">
                        <IconButton label={`Move ${model.name} up`} disabled={index === 0} onClick={() => moveModel(index, -1)}><ArrowUp aria-hidden="true" size={14} strokeWidth={2} /></IconButton>
                        <IconButton label={`Move ${model.name} down`} disabled={index === config.models.length - 1} onClick={() => moveModel(index, 1)}><ArrowDown aria-hidden="true" size={14} strokeWidth={2} /></IconButton>
                        <IconButton label={`Remove ${model.name}`} destructive disabled={config.models.length <= 1} onClick={() => removeModel(index)}><Trash2 aria-hidden="true" size={14} strokeWidth={2} /></IconButton>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>

        <div className="space-y-3 lg:sticky lg:top-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="inline-flex rounded-lg border border-(--border) p-0.5" role="group" aria-label="Preview mode">
              {(["preview", "code"] as const).map((mode) => <button key={mode} type="button" aria-pressed={view === mode} onClick={() => setView(mode)} className={`min-h-8 rounded-md px-3 text-xs font-medium transition-colors active:scale-[0.96] ${view === mode ? "bg-(--foreground) text-(--background)" : "text-(--muted-foreground) hover:text-(--foreground)"}`}>{mode === "preview" ? "Preview" : "Code"}</button>)}
            </div>
            <CopyButton code={code} label="Copy component" />
          </div>
          {view === "preview" ? (
            <div className="flex min-h-[420px] items-center justify-center rounded-2xl border border-(--border) p-8 shadow-[0_1px_2px_oklch(0_0_0/0.04)] lg:min-h-[620px]" style={{ background: palette.bg }}>
              <div style={{ width: config.fullWidth ? "100%" : "auto", maxWidth: "100%" }}><SwitcherPreview config={config} onSelect={(selectedId) => update({ selectedId })} /></div>
            </div>
          ) : (
            <pre className="max-h-[620px] min-h-[420px] overflow-auto rounded-2xl border border-(--border) bg-(--card) p-4 text-xs leading-6"><code>{code}</code></pre>
          )}
          <p className="text-xs leading-5 text-(--muted-foreground)">Live preview · plain React · no runtime dependencies</p>
        </div>
      </div>
    </div>
  );
}
