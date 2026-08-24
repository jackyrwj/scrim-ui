"use client";

import * as React from "react";
import { Section, Chip, Field, inputCls } from "../tool-ui";
import { CopyButton } from "@/components/component-page/copy-button";
import type { ThemeConfig, ThemeMode, ColorScheme } from "./types";
import { defaultConfig, COLOR_LABELS } from "./types";
import {
  deriveScheme,
  schemeToCssVars,
  schemeToTailwindConfig,
} from "./color-engine";
import { ModelIcon } from "@/components/brands/brand-icon";

function ChatPreview({ scheme }: { scheme: ColorScheme }) {
  return (
    <div
      className="overflow-hidden rounded-xl border shadow-sm"
      style={{ background: scheme.background, color: scheme.foreground, borderColor: scheme.inputBorder }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2 border-b px-4 py-2.5"
        style={{ borderColor: scheme.inputBorder }}
      >
        <div
          className="h-2.5 w-2.5 rounded-full"
          style={{ background: scheme.streamingCursor }}
        />
        <span className="text-sm font-medium">AI Assistant</span>
        <span
          className="ml-auto inline-flex items-center gap-1.5 text-xs"
          style={{ color: scheme.mutedText }}
        >
          <ModelIcon name="GPT-4o" size={11} tone="current" />
          GPT-4o
        </span>
      </div>

      {/* Messages */}
      <div className="space-y-3 p-4">
        {/* User message */}
        <div className="flex justify-end">
          <div
            className="max-w-[75%] rounded-2xl rounded-br-md px-3.5 py-2 text-sm"
            style={{ background: scheme.userBubble, color: scheme.userBubbleText }}
          >
            How does streaming work in AI chat?
          </div>
        </div>

        {/* Thinking indicator */}
        <div className="flex items-center gap-1.5 text-xs" style={{ color: scheme.thinkingIndicator }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
          Thinking for 2.3s
        </div>

        {/* Assistant message */}
        <div className="flex justify-start">
          <div
            className="max-w-[75%] rounded-2xl rounded-bl-md px-3.5 py-2 text-sm"
            style={{ background: scheme.assistantBubble, color: scheme.assistantBubbleText }}
          >
            Streaming delivers tokens incrementally so the user sees partial
            responses in real-time
            <span
              className="ml-0.5 inline-block h-4 w-0.5 animate-pulse"
              style={{ background: scheme.streamingCursor }}
            />
          </div>
        </div>

        {/* Tool call */}
        <div
          className="flex items-center gap-2 rounded-lg border px-3 py-2 text-xs"
          style={{ borderColor: scheme.toolCallAccent, color: scheme.toolCallAccent }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
          </svg>
          search_web("streaming protocol SSE")
        </div>

        {/* Source card */}
        <div
          className="rounded-lg border px-3 py-2 text-xs"
          style={{ borderColor: scheme.sourceCardBorder, color: scheme.mutedText }}
        >
          <div className="font-medium" style={{ color: scheme.foreground }}>
            MDN — Server-Sent Events
          </div>
          <div className="mt-0.5">developer.mozilla.org</div>
        </div>
      </div>

      {/* Input */}
      <div className="border-t p-3" style={{ borderColor: scheme.inputBorder }}>
        <div
          className="flex items-center rounded-xl border px-3 py-2"
          style={{
            background: scheme.inputBackground,
            borderColor: scheme.inputBorder,
            color: scheme.mutedText,
          }}
        >
          <span className="text-sm">Ask a follow-up...</span>
          <div
            className="ml-auto h-6 w-6 rounded-lg"
            style={{ background: scheme.streamingCursor }}
          />
        </div>
      </div>
    </div>
  );
}

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
