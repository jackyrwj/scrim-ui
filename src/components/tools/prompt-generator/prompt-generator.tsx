"use client";

import * as React from "react";
import { CopyButton } from "@/components/component-page/copy-button";
import { Field, Section, Chip, inputCls, selectCls } from "../tool-ui";
import { BrandIcon } from "@/components/brands/brand-icon";
import {
  buildPrompt,
  defaultPromptConfig,
  INTERFACE_OPTIONS,
  ELEMENT_OPTIONS,
  PLATFORM_LABELS,
  type PromptConfig,
  type Platform,
  type AiElement,
} from "./build-prompt";

const MIN_PRODUCT_LENGTH = 10;

export function PromptGenerator() {
  const [config, setConfig] = React.useState<PromptConfig>(() => structuredClone(defaultPromptConfig));

  const product = config.product.trim();
  const short = product.length < MIN_PRODUCT_LENGTH;
  const prompt = buildPrompt(config);

  const selectedInterface =
    INTERFACE_OPTIONS.find((o) => o.value === config.interfaceType) ?? INTERFACE_OPTIONS[0];

  function toggleElement(element: AiElement) {
    setConfig((c) => ({
      ...c,
      elements: c.elements.includes(element)
        ? c.elements.filter((e) => e !== element)
        : [...c.elements, element],
    }));
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            AI Interface Prompt Generator
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-(--muted-foreground)">
            Describe your product, pick the screen type and the AI-UI elements you need, and get a
            copy-ready prompt for generating the interface in v0, Claude or Cursor. Generated
            locally, no signup.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setConfig(structuredClone(defaultPromptConfig))}
            className="inline-flex h-8 items-center rounded-lg border border-(--border) px-4 text-sm font-medium transition-colors hover:bg-(--muted)"
          >
            Reset
          </button>
          <CopyButton code={prompt} label="Copy prompt" disabled={short} />
        </div>
      </div>

      {/* Editor + preview */}
      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[340px_1fr]">
        <div className="space-y-5">
          {/* Product */}
          <Section title="Product">
            <Field label="What are you building?">
              <textarea
                value={config.product}
                onChange={(e) => setConfig({ ...config, product: e.target.value })}
                rows={4}
                placeholder="Describe your product in a sentence or two, e.g. An AI support assistant that helps users troubleshoot billing."
                className={`${inputCls} resize-y font-mono text-xs leading-5`}
              />
            </Field>
          </Section>

          {/* Interface type */}
          <Section title="Screen">
            <Field label="Interface type">
              <select
                value={config.interfaceType}
                onChange={(e) =>
                  setConfig({ ...config, interfaceType: e.target.value as PromptConfig["interfaceType"] })
                }
                className={selectCls}
              >
                {INTERFACE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Field>
            <p className="mt-2 text-xs leading-5 text-(--muted-foreground)">{selectedInterface.hint}</p>
          </Section>

          {/* Target platform */}
          <Section title="Target platform">
            <div className="flex flex-wrap gap-1.5">
              {(Object.keys(PLATFORM_LABELS) as Platform[]).map((platform) => (
                <Chip
                  key={platform}
                  active={config.platform === platform}
                  onClick={() => setConfig({ ...config, platform })}
                >
                  <BrandIcon name={PLATFORM_LABELS[platform]} size={12} tone="current" className="mr-1.5" />
                  {PLATFORM_LABELS[platform]}
                </Chip>
              ))}
            </div>
          </Section>

          {/* Optional */}
          <Section title="Optional">
            <div className="space-y-3">
              <Field label="Model name">
                <input
                  value={config.model}
                  onChange={(e) => setConfig({ ...config, model: e.target.value })}
                  placeholder="e.g. Claude Sonnet 4.5"
                  className={inputCls}
                />
              </Field>
              <Field label="Style">
                <input
                  value={config.style}
                  onChange={(e) => setConfig({ ...config, style: e.target.value })}
                  placeholder="e.g. Minimal, warm neutrals, large type"
                  className={inputCls}
                />
              </Field>
            </div>
          </Section>

          {/* Elements */}
          <Section title="AI-UI elements">
            <div className="space-y-2.5">
              {ELEMENT_OPTIONS.map((el) => (
                <div key={el.value} className="flex items-start justify-between gap-3">
                  <Chip
                    active={config.elements.includes(el.value)}
                    onClick={() => toggleElement(el.value)}
                  >
                    {el.label}
                  </Chip>
                  <span className="pt-1 text-right text-xs leading-4 text-(--muted-foreground)">
                    {el.hint}
                  </span>
                </div>
              ))}
            </div>
          </Section>
        </div>

        {/* Preview */}
        <div className="lg:sticky lg:top-20">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-(--muted-foreground)">
              Generated prompt
            </h2>
            <CopyButton code={prompt} label="Copy" disabled={short} />
          </div>
          {short ? (
            <p className="rounded-xl border border-dashed border-(--border) bg-(--muted)/30 px-4 py-8 text-center text-sm text-(--muted-foreground)">
              Describe your product in a sentence or two to generate the prompt.
            </p>
          ) : (
            <pre className="whitespace-pre-wrap rounded-xl border border-(--border) bg-(--muted)/40 p-4 font-mono text-xs leading-5 text-(--foreground)">
              {prompt}
            </pre>
          )}
          <p className="mt-2 text-center text-xs text-(--muted-foreground)">
            The prompt updates as you type — no need to press anything.
          </p>
        </div>
      </div>
    </div>
  );
}
