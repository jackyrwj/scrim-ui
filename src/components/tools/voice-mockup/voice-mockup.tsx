"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { toPng } from "html-to-image";
import { VoiceMockupPreview } from "./voice-mockup-preview";
import { CopyButton } from "@/components/component-page/copy-button";
import { Field, Section, inputCls, selectCls } from "../tool-ui";
import { DEVICE_OPTIONS } from "../device-presets";
import { generateCode } from "./generate-code";
import { voiceScripts, getVoiceScript } from "@/lib/voice-scripts";
import {
  defaultConfig,
  createTurn,
  STAGE_LABELS,
  type VoiceMockupConfig,
  type VoiceTurn,
  type VoiceTurnRole,
  type VoiceStage,
} from "./types";

/* ------------------------------------------------------------------ */
/* Turn editor                                                         */
/* ------------------------------------------------------------------ */

function TurnEditor({
  turn,
  index,
  total,
  onPatch,
  onMove,
  onDelete,
}: {
  turn: VoiceTurn;
  index: number;
  total: number;
  onPatch: (patch: Partial<VoiceTurn>) => void;
  onMove: (dir: -1 | 1) => void;
  onDelete: () => void;
}) {
  return (
    <div className="rounded-xl border border-(--border) bg-(--card) p-3">
      <div className="flex items-center gap-2">
        {/* The width lives on the wrapper: selectCls carries w-full,
            which outranks a w-28 on the same element and let the select
            push the move and delete buttons off the card. */}
        <div className="w-28 shrink-0">
          <select
            value={turn.role}
            onChange={(e) => onPatch({ role: e.target.value as VoiceTurnRole })}
            className={selectCls}
            aria-label="Turn role"
          >
            <option value="user">User</option>
            <option value="assistant">Assistant</option>
          </select>
        </div>
        <div className="flex flex-1 items-center justify-end gap-1">
          <button
            type="button"
            onClick={() => onMove(-1)}
            disabled={index === 0}
            aria-label="Move turn up"
            className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-(--border) text-(--muted-foreground) transition-colors hover:text-(--foreground) disabled:opacity-30"
          >
            ↑
          </button>
          <button
            type="button"
            onClick={() => onMove(1)}
            disabled={index === total - 1}
            aria-label="Move turn down"
            className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-(--border) text-(--muted-foreground) transition-colors hover:text-(--foreground) disabled:opacity-30"
          >
            ↓
          </button>
          <button
            type="button"
            onClick={onDelete}
            aria-label="Delete turn"
            className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-(--border) text-(--muted-foreground) transition-colors hover:border-red-300 hover:text-red-500"
          >
            ✕
          </button>
        </div>
      </div>

      <textarea
        value={turn.text}
        onChange={(e) => onPatch({ text: e.target.value })}
        rows={3}
        placeholder="Turn text…"
        className={`${inputCls} mt-2 resize-y font-mono text-xs leading-5`}
      />

      <div className="mt-2 grid grid-cols-2 gap-3">
        <Field label="Time">
          <input
            value={turn.time ?? ""}
            onChange={(e) => onPatch({ time: e.target.value || undefined })}
            placeholder="0:05"
            className={inputCls}
          />
        </Field>
        {turn.role === "assistant" && (
          <div className="flex items-end">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={!!turn.speaking}
                onChange={(e) => onPatch({ speaking: e.target.checked })}
                className="h-4 w-4 accent-(--foreground)"
              />
              Speaking indicator
            </label>
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* VoiceMockup — the tool                                              */
/* ------------------------------------------------------------------ */

export function VoiceMockup() {
  const searchParams = useSearchParams();
  const initialSlug = searchParams.get("script");
  const [config, setConfig] = React.useState<VoiceMockupConfig>(() => {
    const script = initialSlug ? getVoiceScript(initialSlug) : undefined;
    return structuredClone(script?.config ?? defaultConfig);
  });
  const [exporting, setExporting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [view, setView] = React.useState<"preview" | "code">("preview");
  const previewRef = React.useRef<HTMLDivElement>(null);

  const showReplySection =
    config.stage === "thinking" ||
    config.stage === "speaking" ||
    config.stage === "interrupted";

  function patchTurn(id: string, patch: Partial<VoiceTurn>) {
    setConfig((c) => ({
      ...c,
      turns: c.turns.map((t) =>
        t.id === id
          ? patch.role === "user"
            ? { ...t, ...patch, speaking: false }
            : { ...t, ...patch }
          : t,
      ),
    }));
  }

  function moveTurn(id: string, dir: -1 | 1) {
    setConfig((c) => {
      const index = c.turns.findIndex((t) => t.id === id);
      const target = index + dir;
      if (index < 0 || target < 0 || target >= c.turns.length) return c;
      const turns = [...c.turns];
      [turns[index], turns[target]] = [turns[target], turns[index]];
      return { ...c, turns };
    });
  }

  function deleteTurn(id: string) {
    setConfig((c) => ({ ...c, turns: c.turns.filter((t) => t.id !== id) }));
  }

  function addTurn(role: VoiceTurnRole) {
    setConfig((c) => ({ ...c, turns: [...c.turns, createTurn(role)] }));
  }

  function loadScript(slug: string) {
    const script = getVoiceScript(slug);
    if (script) setConfig(structuredClone(script.config));
  }

  async function exportPng() {
    const node = previewRef.current;
    if (!node || exporting) return;
    setExporting(true);
    setError(null);
    try {
      const dataUrl = await toPng(node, {
        pixelRatio: 2,
        cacheBust: true,
        backgroundColor: config.theme === "dark" ? "#09090b" : "#ffffff",
      });
      const link = document.createElement("a");
      link.download = "voice-mockup.png";
      link.href = dataUrl;
      link.click();
    } catch {
      setError(
        "Export failed. If this keeps happening, try exporting a smaller mockup or a different browser.",
      );
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Voice Assistant Mockup Generator
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-(--muted-foreground)">
            Compose a realistic voice assistant screen — listening, thinking, speaking and
            interrupted states — then export it as a PNG for your landing page or deck.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setConfig(structuredClone(defaultConfig))}
            className="inline-flex h-9 items-center rounded-lg border border-(--border) px-4 text-sm font-medium transition-colors hover:bg-(--muted)"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={exportPng}
            disabled={exporting}
            className="inline-flex h-9 items-center rounded-lg bg-(--foreground) px-5 text-sm font-medium text-(--background) transition-opacity hover:opacity-85 disabled:opacity-50"
          >
            {exporting ? "Exporting…" : "Export PNG"}
          </button>
        </div>
      </div>

      {error && (
        <p
          role="alert"
          className="mt-4 rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600 dark:border-red-900/60 dark:text-red-400"
        >
          {error}
        </p>
      )}

      {/* Editor + preview */}
      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[340px_1fr]">
        <div className="space-y-5">
          {/* Script presets */}
          <Section title="Script presets">
            <Field label="Load an example">
              <select
                value={initialSlug ?? ""}
                onChange={(e) => loadScript(e.target.value)}
                className={selectCls}
              >
                <option value="" disabled>
                  Choose a scenario…
                </option>
                {voiceScripts.map((script) => (
                  <option key={script.slug} value={script.slug}>
                    {script.name}
                  </option>
                ))}
              </select>
            </Field>
            <p className="mt-2 text-xs text-(--muted-foreground)">
              Browse all scripts on the{" "}
              <a
                href="/tools/voice-scripts"
                className="underline hover:text-(--foreground)"
              >
                Voice Conversation Script Library
              </a>
              .
            </p>
          </Section>

          {/* Canvas */}
          <Section title="Canvas">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Device">
                <select
                  value={config.device}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      device: e.target.value as VoiceMockupConfig["device"],
                    })
                  }
                  className={selectCls}
                >
                  {DEVICE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Theme">
                <select
                  value={config.theme}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      theme: e.target.value as VoiceMockupConfig["theme"],
                    })
                  }
                  className={selectCls}
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </Field>
            </div>
            <label className="mt-3 flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={config.showControls}
                onChange={(e) =>
                  setConfig({ ...config, showControls: e.target.checked })
                }
                className="h-4 w-4 accent-(--foreground)"
              />
              Show bottom controls
            </label>
          </Section>

          {/* Status */}
          <Section title="Status">
            <div className="space-y-3">
              <Field label="Stage">
                <select
                  value={config.stage}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      stage: e.target.value as VoiceStage,
                    })
                  }
                  className={selectCls}
                >
                  {(
                    [
                      "idle",
                      "listening",
                      "thinking",
                      "speaking",
                      "interrupted",
                    ] as VoiceStage[]
                  ).map((s) => (
                    <option key={s} value={s}>
                      {STAGE_LABELS[s]}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Elapsed time">
                <input
                  value={config.elapsedTime}
                  onChange={(e) =>
                    setConfig({ ...config, elapsedTime: e.target.value })
                  }
                  placeholder="0:00"
                  className={inputCls}
                />
              </Field>
              <Field label="Live transcript / hint">
                <input
                  value={config.liveTranscript}
                  onChange={(e) =>
                    setConfig({ ...config, liveTranscript: e.target.value })
                  }
                  placeholder="Listening…"
                  className={inputCls}
                />
              </Field>
            </div>
          </Section>

          {/* Reply */}
          {showReplySection && (
            <Section title="Live reply">
              <textarea
                value={config.assistantReply}
                onChange={(e) =>
                  setConfig({ ...config, assistantReply: e.target.value })
                }
                rows={4}
                placeholder="Assistant reply text…"
                className={`${inputCls} resize-y font-mono text-xs leading-5`}
              />
              <p className="mt-2 text-xs text-(--muted-foreground)">
                {config.stage === "speaking"
                  ? "Rendered with a streaming caret."
                  : config.stage === "interrupted"
                    ? 'Rendered with a "Stopped generating" chip.'
                    : "Rendered as full static text."}
              </p>
            </Section>
          )}

          {/* Header */}
          <Section title="Header">
            <div className="space-y-3">
              <Field label="Title">
                <input
                  value={config.title}
                  onChange={(e) =>
                    setConfig({ ...config, title: e.target.value })
                  }
                  className={inputCls}
                />
              </Field>
              <Field label="Subtitle">
                <input
                  value={config.subtitle}
                  onChange={(e) =>
                    setConfig({ ...config, subtitle: e.target.value })
                  }
                  className={inputCls}
                />
              </Field>
            </div>
          </Section>

          {/* Transcript */}
          <Section title="Transcript">
            <div className="space-y-2.5">
              {config.turns.map((turn, index) => (
                <TurnEditor
                  key={turn.id}
                  turn={turn}
                  index={index}
                  total={config.turns.length}
                  onPatch={(patch) => patchTurn(turn.id, patch)}
                  onMove={(dir) => moveTurn(turn.id, dir)}
                  onDelete={() => deleteTurn(turn.id)}
                />
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => addTurn("user")}
                className="flex-1 rounded-lg border border-(--border) px-3 py-2 text-xs font-medium transition-colors hover:bg-(--muted)"
              >
                + User turn
              </button>
              <button
                type="button"
                onClick={() => addTurn("assistant")}
                className="flex-1 rounded-lg border border-(--border) px-3 py-2 text-xs font-medium transition-colors hover:bg-(--muted)"
              >
                + Assistant turn
              </button>
            </div>
          </Section>
        </div>

        {/* Preview / Code */}
        <div className="lg:sticky lg:top-20">
          <div className="mb-3 flex items-center justify-between">
            <div className="inline-flex rounded-lg border border-(--border) p-0.5">
              <button
                type="button"
                onClick={() => setView("preview")}
                aria-pressed={view === "preview"}
                className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                  view === "preview"
                    ? "bg-(--foreground) text-(--background)"
                    : "text-(--muted-foreground) hover:text-(--foreground)"
                }`}
              >
                Preview
              </button>
              <button
                type="button"
                onClick={() => setView("code")}
                aria-pressed={view === "code"}
                className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                  view === "code"
                    ? "bg-(--foreground) text-(--background)"
                    : "text-(--muted-foreground) hover:text-(--foreground)"
                }`}
              >
                Code
              </button>
            </div>
            {view === "preview" && (
              <span className="text-xs text-(--muted-foreground)">
                {DEVICE_OPTIONS.find((o) => o.value === config.device)?.label}
              </span>
            )}
          </div>

          {view === "preview" ? (
            <>
              <div className="overflow-x-auto rounded-xl border border-(--border) bg-(--muted)/40 p-6">
                <div className="mx-auto w-fit">
                  <div ref={previewRef}>
                    <VoiceMockupPreview config={config} />
                  </div>
                </div>
              </div>
              <p className="mt-2 text-center text-xs text-(--muted-foreground)">
                Tip: choose Speaking for a screenshot with a streaming reply, or Thinking for a
                static intermediate state.
              </p>
            </>
          ) : (
            <div className="overflow-hidden rounded-xl border border-(--border)">
              <div className="flex items-center justify-between border-b border-(--border) bg-(--card) px-3 py-2">
                <span className="text-xs font-medium text-(--muted-foreground)">
                  Generated React component
                </span>
                <CopyButton code={generateCode(config)} label="Copy code" />
              </div>
              <pre className="max-h-[560px] overflow-auto bg-(--muted)/40 p-4 text-xs leading-5">
                <code className="font-mono text-(--foreground)">{generateCode(config)}</code>
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
