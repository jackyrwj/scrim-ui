"use client";

import * as React from "react";
import { Section, Chip, inputCls } from "../tool-ui";
import { CopyButton } from "@/components/component-page/copy-button";
import type { ThemeConfig, ThemeMode, ColorScheme } from "./types";
import { defaultConfig, COLOR_LABELS } from "./types";
import {
  deriveScheme,
  schemeToCssVars,
  schemeToTailwindConfig,
} from "./color-engine";
import { ChatPreview } from "./chat-preview";

export function ThemeGenerator() {
  const [config, setConfig] = React.useState<ThemeConfig>(
    structuredClone(defaultConfig)
  );

  const scheme = React.useMemo(
    () => deriveScheme(config.brandColor, config.mode),
    [config.brandColor, config.mode]
  );

  const cssVars = React.useMemo(() => schemeToCssVars(scheme), [scheme]);
  const tailwindSnippet = React.useMemo(
    () => schemeToTailwindConfig(scheme),
    [scheme]
  );

  const schemeEntries = Object.entries(scheme) as [keyof ColorScheme, string][];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            AI Chat Theme Generator
          </h1>
          <p className="mt-1.5 max-w-xl text-sm text-(--muted-foreground)">
            Pick a brand color and get a full chat interface color scheme. Export
            as CSS variables or Tailwind config.
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
          <Section title="Brand Color">
            <div className="flex items-center gap-3">
              {/* Two controls edit one value, so each needs its own name —
                  the section heading above them cannot label both. */}
              <input
                type="color"
                aria-label="Brand color, swatch picker"
                value={config.brandColor}
                onChange={(e) =>
                  setConfig((c) => ({ ...c, brandColor: e.target.value }))
                }
                className="h-10 w-14 cursor-pointer rounded-lg border border-(--border)"
              />
              <input
                type="text"
                aria-label="Brand color, hex value"
                value={config.brandColor}
                onChange={(e) => {
                  const v = e.target.value;
                  if (/^#[0-9a-fA-F]{0,6}$/.test(v))
                    setConfig((c) => ({ ...c, brandColor: v }));
                }}
                className={inputCls + " font-mono uppercase"}
                maxLength={7}
              />
            </div>
          </Section>

          <Section title="Mode">
            <div className="flex gap-2">
              {(["light", "dark"] as ThemeMode[]).map((m) => (
                <Chip
                  key={m}
                  active={config.mode === m}
                  onClick={() => setConfig((c) => ({ ...c, mode: m }))}
                >
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </Chip>
              ))}
            </div>
          </Section>

          <Section title="Generated Palette">
            <div className="space-y-1.5">
              {schemeEntries.map(([key, value]) => (
                <div key={key} className="flex items-center gap-2 text-xs">
                  <div
                    className="h-5 w-5 shrink-0 rounded border border-(--border)"
                    style={{ background: value }}
                  />
                  <span className="text-(--muted-foreground)">
                    {COLOR_LABELS[key]}
                  </span>
                  <span className="ml-auto font-mono text-[10px] uppercase text-(--muted-foreground)">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </Section>
        </div>

        {/* Preview */}
        <div className="space-y-4">
          <div className="sticky top-6">
            <ChatPreview scheme={scheme} />

            <div className="mt-4 flex flex-wrap gap-2">
              <CopyButton code={cssVars} label="Copy CSS Variables" />
              <CopyButton code={tailwindSnippet} label="Copy Tailwind Config" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
