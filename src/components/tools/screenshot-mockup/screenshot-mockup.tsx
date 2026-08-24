"use client";

import * as React from "react";
import { toPng } from "html-to-image";
import { Section, Field, Chip, inputCls, selectCls } from "../tool-ui";
import type { ScreenshotConfig } from "./types";
import {
  defaultConfig,
  FRAME_OPTIONS,
  SHADOW_OPTIONS,
  SHADOW_CSS,
  MAX_FILE_SIZE,
} from "./types";
import { FRAME_COMPONENTS } from "./device-frames";

export function ScreenshotMockup() {
  const [config, setConfig] = React.useState<ScreenshotConfig>(
    structuredClone(defaultConfig)
  );
  const [dragOver, setDragOver] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const previewRef = React.useRef<HTMLDivElement>(null);
  const fileRef = React.useRef<HTMLInputElement>(null);

  function handleFile(file: File) {
    setError(null);
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError("File is too large. Max 10 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () =>
      setConfig((c) => ({ ...c, imageDataUrl: reader.result as string }));
    reader.readAsDataURL(file);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  async function exportPng() {
    if (!previewRef.current) return;
    try {
      const url = await toPng(previewRef.current, { pixelRatio: 2, cacheBust: true });
      const a = document.createElement("a");
      a.href = url;
      a.download = "screenshot-mockup.png";
      a.click();
    } catch {
      setError("Export failed. Try a smaller image.");
    }
  }

  const bgStyle: React.CSSProperties =
    config.background.type === "gradient"
      ? {
          background: `linear-gradient(${config.background.gradientAngle}deg, ${config.background.color1}, ${config.background.color2})`,
        }
      : { background: config.background.color1 };

  const FrameComponent = FRAME_COMPONENTS[config.frame];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Screenshot Device Mockup
          </h1>
          <p className="mt-1.5 max-w-xl text-sm text-(--muted-foreground)">
            Upload a screenshot, pick a device frame, and export a polished mockup
            PNG for your landing page or deck.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              setConfig(structuredClone(defaultConfig));
              setError(null);
            }}
            className="inline-flex h-8 items-center rounded-lg border border-(--border) px-3 text-xs font-medium text-(--muted-foreground) transition-colors hover:text-(--foreground)"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={exportPng}
            disabled={!config.imageDataUrl}
            className="inline-flex h-8 items-center rounded-lg bg-(--foreground) px-3 text-xs font-semibold text-(--background) transition-opacity disabled:opacity-40"
          >
            Export PNG
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="mt-8 grid gap-6 lg:grid-cols-[340px_1fr]">
        {/* Sidebar */}
        <div className="space-y-4">
          {/* Upload */}
          <Section title="Screenshot">
            {config.imageDataUrl ? (
              <div className="space-y-2">
                {/* eslint-disable-next-line @next/next/no-img-element --
                    the src is a data: URL the reader just picked from their own
                    disk. next/image has nothing to optimize (no remote fetch,
                    no known dimensions) and its wrapper markup would end up in
                    the html-to-image capture below. */}
                <img
                  src={config.imageDataUrl}
                  alt="Uploaded screenshot"
                  className="max-h-40 rounded-lg border border-(--border) object-contain"
                />
                <button
                  type="button"
                  onClick={() => setConfig((c) => ({ ...c, imageDataUrl: null }))}
                  className="text-xs text-red-500 hover:text-red-600"
                >
                  Remove image
                </button>
              </div>
            ) : (
              <div
                role="button"
                tabIndex={0}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                onClick={() => fileRef.current?.click()}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") fileRef.current?.click();
                }}
                className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-8 text-center transition-colors ${
                  dragOver
                    ? "border-(--foreground) bg-(--muted)/40"
                    : "border-(--border) hover:border-(--foreground)/50"
                }`}
              >
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="mb-2 text-(--muted-foreground)"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <p className="text-sm text-(--muted-foreground)">
                  Drop image or click to upload
                </p>
                <p className="mt-1 text-xs text-(--muted-foreground)">
                  PNG, JPG, WebP — max 10 MB
                </p>
              </div>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={onFileChange}
              className="hidden"
            />
            {error && (
              <p className="mt-2 text-xs text-red-500">{error}</p>
            )}
          </Section>

          {/* Frame */}
          <Section title="Device Frame">
            <Field label="Frame">
              <select
                value={config.frame}
                onChange={(e) =>
                  setConfig((c) => ({ ...c, frame: e.target.value as ScreenshotConfig["frame"] }))
                }
                className={selectCls}
              >
                {FRAME_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Field>
          </Section>

          {/* Background */}
          <Section title="Background">
            <div className="mb-3 flex gap-2">
              {(["solid", "gradient"] as const).map((t) => (
                <Chip
                  key={t}
                  active={config.background.type === t}
                  onClick={() =>
                    setConfig((c) => ({
                      ...c,
                      background: { ...c.background, type: t },
                    }))
                  }
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </Chip>
              ))}
            </div>
            <div className="space-y-3">
              <Field label={config.background.type === "gradient" ? "Color 1" : "Color"}>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={config.background.color1}
                    onChange={(e) =>
                      setConfig((c) => ({
                        ...c,
                        background: { ...c.background, color1: e.target.value },
                      }))
                    }
                    className="h-8 w-10 cursor-pointer rounded border border-(--border)"
                  />
                  <input
                    type="text"
                    value={config.background.color1}
                    onChange={(e) => {
                      if (/^#[0-9a-fA-F]{0,6}$/.test(e.target.value))
                        setConfig((c) => ({
                          ...c,
                          background: { ...c.background, color1: e.target.value },
                        }));
                    }}
                    className={inputCls + " font-mono uppercase"}
                    maxLength={7}
                  />
                </div>
              </Field>
              {config.background.type === "gradient" && (
                <>
                  <Field label="Color 2">
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={config.background.color2}
                        onChange={(e) =>
                          setConfig((c) => ({
                            ...c,
                            background: { ...c.background, color2: e.target.value },
                          }))
                        }
                        className="h-8 w-10 cursor-pointer rounded border border-(--border)"
                      />
                      <input
                        type="text"
                        value={config.background.color2}
                        onChange={(e) => {
                          if (/^#[0-9a-fA-F]{0,6}$/.test(e.target.value))
                            setConfig((c) => ({
                              ...c,
                              background: { ...c.background, color2: e.target.value },
                            }));
                        }}
                        className={inputCls + " font-mono uppercase"}
                        maxLength={7}
                      />
                    </div>
                  </Field>
                  <Field label={`Angle — ${config.background.gradientAngle}°`}>
                    <input
                      type="range"
                      min={0}
                      max={360}
                      value={config.background.gradientAngle}
                      onChange={(e) =>
                        setConfig((c) => ({
                          ...c,
                          background: {
                            ...c.background,
                            gradientAngle: Number(e.target.value),
                          },
                        }))
                      }
                      className="w-full"
                    />
                  </Field>
                </>
              )}
            </div>
          </Section>

          {/* Effects */}
          <Section title="Effects">
            <div className="space-y-3">
              <Field label="Shadow">
                <select
                  value={config.shadow}
                  onChange={(e) =>
                    setConfig((c) => ({
                      ...c,
                      shadow: e.target.value as ScreenshotConfig["shadow"],
                    }))
                  }
                  className={selectCls}
                >
                  {SHADOW_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label={`Padding — ${config.padding}px`}>
                <input
                  type="range"
                  min={0}
                  max={120}
                  value={config.padding}
                  onChange={(e) =>
                    setConfig((c) => ({ ...c, padding: Number(e.target.value) }))
                  }
                  className="w-full"
                />
              </Field>
              <Field label={`Rotation — ${config.rotation}°`}>
                <input
                  type="range"
                  min={-15}
                  max={15}
                  value={config.rotation}
                  onChange={(e) =>
                    setConfig((c) => ({ ...c, rotation: Number(e.target.value) }))
                  }
                  className="w-full"
                />
              </Field>
            </div>
          </Section>
        </div>

        {/* Preview */}
        <div className="sticky top-6">
          <div
            ref={previewRef}
            className="flex items-center justify-center overflow-hidden rounded-xl"
            style={{
              ...bgStyle,
              padding: config.padding,
              minHeight: 300,
            }}
          >
            {config.imageDataUrl ? (
              <div
                style={{
                  transform: `rotate(${config.rotation}deg)`,
                  boxShadow: SHADOW_CSS[config.shadow],
                  transition: "transform 0.2s, box-shadow 0.2s",
                  borderRadius: config.frame === "browser" ? 12 : undefined,
                  maxWidth: "100%",
                }}
              >
                <FrameComponent>
                  {/* eslint-disable-next-line @next/next/no-img-element --
                      same data: URL, and this subtree is exactly what
                      html-to-image serialises into the exported PNG. */}
                  <img
                    src={config.imageDataUrl}
                    alt="Screenshot"
                    style={{ display: "block", width: "100%", maxWidth: 640 }}
                  />
                </FrameComponent>
              </div>
            ) : (
              <div className="text-center text-sm text-white/60">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  className="mx-auto mb-3"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="m21 15-5-5L5 21" />
                </svg>
                Upload a screenshot to begin
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
