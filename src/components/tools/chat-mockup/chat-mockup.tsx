"use client";

import * as React from "react";
import { toPng } from "html-to-image";
import { MockupPreview } from "./mockup-preview";
import { Field, Section, Chip, inputCls, selectCls } from "../tool-ui";
import {
  defaultConfig,
  createMessage,
  DEVICE_OPTIONS,
  type MockupConfig,
  type MockupMessage,
  type MockupRole,
} from "./types";

/* ------------------------------------------------------------------ */
/* Message editor                                                      */
/* ------------------------------------------------------------------ */

function MessageEditor({
  msg,
  index,
  total,
  onPatch,
  onMove,
  onDelete,
}: {
  msg: MockupMessage;
  index: number;
  total: number;
  onPatch: (patch: Partial<MockupMessage>) => void;
  onMove: (dir: -1 | 1) => void;
  onDelete: () => void;
}) {
  return (
    <div className="rounded-xl border border-(--border) bg-(--card) p-3">
      <div className="flex items-center gap-2">
        <select
          value={msg.role}
          onChange={(e) => onPatch({ role: e.target.value as MockupRole })}
          className={`${selectCls} w-28 shrink-0`}
          aria-label="Message role"
        >
          <option value="user">User</option>
          <option value="assistant">Assistant</option>
        </select>
        <div className="flex flex-1 items-center justify-end gap-1">
          <button
            type="button"
            onClick={() => onMove(-1)}
            disabled={index === 0}
            aria-label="Move message up"
            className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-(--border) text-(--muted-foreground) transition-colors hover:text-(--foreground) disabled:opacity-30"
          >
            ↑
          </button>
          <button
            type="button"
            onClick={() => onMove(1)}
            disabled={index === total - 1}
            aria-label="Move message down"
            className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-(--border) text-(--muted-foreground) transition-colors hover:text-(--foreground) disabled:opacity-30"
          >
            ↓
          </button>
          <button
            type="button"
            onClick={onDelete}
            aria-label="Delete message"
            className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-(--border) text-(--muted-foreground) transition-colors hover:border-red-300 hover:text-red-500"
          >
            ✕
          </button>
        </div>
      </div>

      <textarea
        value={msg.text}
        onChange={(e) => onPatch({ text: e.target.value })}
        rows={3}
        placeholder="Message text…"
        className={`${inputCls} mt-2 resize-y font-mono text-xs leading-5`}
      />

      {msg.role === "assistant" && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          <Chip active={!!msg.reasoning} onClick={() => onPatch({ reasoning: !msg.reasoning })}>
            Reasoning
          </Chip>
          <Chip active={!!msg.tools} onClick={() => onPatch({ tools: !msg.tools })}>
            Tool call
          </Chip>
          <Chip active={!!msg.sources} onClick={() => onPatch({ sources: !msg.sources })}>
            Sources
          </Chip>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* ChatMockup — the tool                                               */
/* ------------------------------------------------------------------ */

export function ChatMockup() {
  const [config, setConfig] = React.useState<MockupConfig>(() => structuredClone(defaultConfig));
  const [exporting, setExporting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const previewRef = React.useRef<HTMLDivElement>(null);

  function patchMessage(id: string, patch: Partial<MockupMessage>) {
    setConfig((c) => ({
      ...c,
      messages: c.messages.map((m) =>
        m.id === id
          ? patch.role === "user"
            ? { ...m, ...patch, reasoning: false, tools: false, sources: false }
            : { ...m, ...patch }
          : m,
      ),
    }));
  }

  function moveMessage(id: string, dir: -1 | 1) {
    setConfig((c) => {
      const index = c.messages.findIndex((m) => m.id === id);
      const target = index + dir;
      if (index < 0 || target < 0 || target >= c.messages.length) return c;
      const messages = [...c.messages];
      [messages[index], messages[target]] = [messages[target], messages[index]];
      return { ...c, messages };
    });
  }

  function deleteMessage(id: string) {
    setConfig((c) => ({ ...c, messages: c.messages.filter((m) => m.id !== id) }));
  }

  function addMessage(role: MockupRole) {
    setConfig((c) => ({ ...c, messages: [...c.messages, createMessage(role)] }));
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
      link.download = "chat-mockup.png";
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
            AI Chat Mockup Generator
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-(--muted-foreground)">
            Compose a realistic AI chat screen — streaming replies, reasoning, tool calls and
            citations — then export it as a PNG for your landing page, deck or docs. Built from the
            site’s own components.
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
        <p role="alert" className="mt-4 rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600 dark:border-red-900/60 dark:text-red-400">
          {error}
        </p>
      )}

      {/* Editor + preview */}
      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[340px_1fr]">
        <div className="space-y-5">
          {/* Canvas */}
          <Section title="Canvas">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Device">
                <select
                  value={config.device}
                  onChange={(e) =>
                    setConfig({ ...config, device: e.target.value as MockupConfig["device"] })
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
                    setConfig({ ...config, theme: e.target.value as MockupConfig["theme"] })
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
                checked={config.streaming}
                onChange={(e) => setConfig({ ...config, streaming: e.target.checked })}
                className="h-4 w-4 accent-(--foreground)"
              />
              Animate the last reply (streaming caret)
            </label>
          </Section>

          {/* Header */}
          <Section title="Header">
            <div className="space-y-3">
              <Field label="Title">
                <input
                  value={config.title}
                  onChange={(e) => setConfig({ ...config, title: e.target.value })}
                  className={inputCls}
                />
              </Field>
              <Field label="Subtitle">
                <input
                  value={config.subtitle}
                  onChange={(e) => setConfig({ ...config, subtitle: e.target.value })}
                  className={inputCls}
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Model name">
                  <input
                    value={config.modelName}
                    onChange={(e) => setConfig({ ...config, modelName: e.target.value })}
                    className={inputCls}
                  />
                </Field>
                <Field label="Avatar label">
                  <input
                    value={config.avatarLabel}
                    onChange={(e) => setConfig({ ...config, avatarLabel: e.target.value })}
                    className={inputCls}
                  />
                </Field>
              </div>
            </div>
          </Section>

          {/* Composer */}
          <Section title="Composer">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={config.showComposer}
                onChange={(e) => setConfig({ ...config, showComposer: e.target.checked })}
                className="h-4 w-4 accent-(--foreground)"
              />
              Show composer
            </label>
            {config.showComposer && (
              <div className="mt-3 space-y-3">
                <Field label="Placeholder">
                  <input
                    value={config.composerPlaceholder}
                    onChange={(e) =>
                      setConfig({ ...config, composerPlaceholder: e.target.value })
                    }
                    className={inputCls}
                  />
                </Field>
                <div className="flex flex-wrap gap-1.5">
                  <Chip
                    active={config.showSearch}
                    onClick={() => setConfig({ ...config, showSearch: !config.showSearch })}
                  >
                    Search
                  </Chip>
                  <Chip
                    active={config.showTools}
                    onClick={() => setConfig({ ...config, showTools: !config.showTools })}
                  >
                    Tools
                  </Chip>
                  <Chip
                    active={config.showAttachments}
                    onClick={() =>
                      setConfig({ ...config, showAttachments: !config.showAttachments })
                    }
                  >
                    Attachments
                  </Chip>
                </div>
              </div>
            )}
          </Section>

          {/* Messages */}
          <Section title="Messages">
            <div className="space-y-2.5">
              {config.messages.map((msg, index) => (
                <MessageEditor
                  key={msg.id}
                  msg={msg}
                  index={index}
                  total={config.messages.length}
                  onPatch={(patch) => patchMessage(msg.id, patch)}
                  onMove={(dir) => moveMessage(msg.id, dir)}
                  onDelete={() => deleteMessage(msg.id)}
                />
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => addMessage("user")}
                className="flex-1 rounded-lg border border-(--border) px-3 py-2 text-xs font-medium transition-colors hover:bg-(--muted)"
              >
                + User message
              </button>
              <button
                type="button"
                onClick={() => addMessage("assistant")}
                className="flex-1 rounded-lg border border-(--border) px-3 py-2 text-xs font-medium transition-colors hover:bg-(--muted)"
              >
                + Assistant reply
              </button>
            </div>
          </Section>
        </div>

        {/* Preview */}
        <div className="lg:sticky lg:top-20">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-(--muted-foreground)">
              Live preview
            </h2>
            <span className="text-xs text-(--muted-foreground)">
              {DEVICE_OPTIONS.find((o) => o.value === config.device)?.label}
            </span>
          </div>
          <div className="overflow-x-auto rounded-xl border border-(--border) bg-(--muted)/40 p-6">
            <div className="mx-auto w-fit">
              <div ref={previewRef}>
                <MockupPreview config={config} />
              </div>
            </div>
          </div>
          <p className="mt-2 text-center text-xs text-(--muted-foreground)">
            Tip: turn off streaming for a fully rendered, clean screenshot.
          </p>
        </div>
      </div>
    </div>
  );
}
