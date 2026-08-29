"use client";

import * as React from "react";
import { copyText } from "@/lib/clipboard";
import { trackEvent } from "@/lib/analytics";
import { buildIconPrompt } from "@/lib/agent-prompt";
import { AgentPromptCard } from "@/components/component-page/agent-prompt-card";

/**
 * The icon, editable.
 *
 * Size, stroke and colour are applied to the *rendered* SVG rather than by
 * re-invoking the Lucide component, because a Lucide component is a function
 * and cannot cross the RSC boundary as a prop — only the element can. Looking
 * it up by name on the client instead would mean shipping the icon set (2,034
 * of them) to change a stroke width.
 *
 * So the server renders it once, and this mutates attributes on the node it
 * produced. Everything the reader copies is serialised back out of that same
 * node with the current settings written in explicitly, which is exact by
 * construction: what you see is literally what lands on the clipboard.
 *
 * The project's lint rules (no setState in an effect, no ref reads during
 * render) shape the code below: the SVG/Data-URI snippets live in state and
 * are refreshed inside each control's event handler, where reading the DOM
 * and calling setState are both legal. They are never read during render.
 */
type Tone = { id: string; label: string; css: string; jsx: string | null };

const TONES: Tone[] = [
  { id: "current", label: "Inherit", css: "currentColor", jsx: null },
  { id: "primary", label: "Primary", css: "var(--primary)", jsx: "text-(--primary)" },
  { id: "muted", label: "Muted", css: "var(--muted-foreground)", jsx: "text-(--muted-foreground)" },
  { id: "success", label: "Success", css: "#10b981", jsx: "text-emerald-500" },
  { id: "danger", label: "Danger", css: "#ef4444", jsx: "text-red-500" },
];

/* Fixed hues for when an icon is a deliberate accent rather than a theme
   token — the 95% case stays semantic above, this covers the rest. */
const SWATCHES: { hex: string; name: string }[] = [
  { hex: "#ef4444", name: "Red" },
  { hex: "#f97316", name: "Orange" },
  { hex: "#f59e0b", name: "Amber" },
  { hex: "#10b981", name: "Emerald" },
  { hex: "#06b6d4", name: "Cyan" },
  { hex: "#3b82f6", name: "Blue" },
  { hex: "#8b5cf6", name: "Violet" },
  { hex: "#ec4899", name: "Pink" },
];

/* The contrast check this page exists for: an icon that survives its own
   stage may still vanish on the surface it ships to. `ink` is what Inherit
   resolves to on that surface. */
type StageBg = { id: string; label: string; cls: string; ink: string };
const STAGE_BGS: StageBg[] = [
  { id: "light", label: "Light", cls: "bg-white", ink: "#18181b" },
  { id: "dark", label: "Dark", cls: "bg-[#09090b]", ink: "#fafafa" },
  { id: "primary", label: "Primary", cls: "bg-(--primary)", ink: "var(--primary-foreground)" },
  { id: "muted", label: "Muted", cls: "bg-(--muted)", ink: "var(--foreground)" },
];

type Framework = "react" | "vue" | "svelte" | "svg" | "data-uri";
const FRAMEWORKS: { id: Framework; label: string }[] = [
  { id: "react", label: "React" },
  { id: "vue", label: "Vue" },
  { id: "svelte", label: "Svelte" },
  { id: "svg", label: "SVG" },
  { id: "data-uri", label: "Data URI" },
];

const COPY_EVENTS: Record<Framework, string> = {
  react: "copy_icon_jsx",
  vue: "copy_icon_vue",
  svelte: "copy_icon_svelte",
  svg: "copy_icon_svg",
  "data-uri": "copy_icon_data_uri",
};

export function IconEditor({
  name,
  concept,
  meaning,
  docsUrl,
  usedBy,
  children,
}: {
  /** Lucide's export name, e.g. "Wrench" — used for the import line. */
  name: string;
  /** The concept this glyph stands for, for the agent prompt. */
  concept: string;
  /** Why this glyph and not another. */
  meaning: string;
  docsUrl: string;
  /** Components on this site that use it for the same concept. */
  usedBy: string[];
  /** The icon element, already rendered by the server. */
  children: React.ReactNode;
}) {
  const holderRef = React.useRef<HTMLSpanElement>(null);
  const [size, setSize] = React.useState(48);
  const [stroke, setStroke] = React.useState(2);
  const [tone, setTone] = React.useState(TONES[0]);
  /** A fixed hex colour; when set it wins over the semantic tone. */
  const [custom, setCustom] = React.useState<string | null>(null);
  const [bg, setBg] = React.useState(STAGE_BGS[3]);
  const [framework, setFramework] = React.useState<Framework>("react");
  const [svgStr, setSvgStr] = React.useState("");
  const [copied, setCopied] = React.useState<string | null>(null);
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  /* Written to the node rather than held in React state and re-rendered:
     the element is the server's, and React does not own its attributes. */
  React.useEffect(() => {
    const svg = holderRef.current?.querySelector("svg");
    if (!svg) return;
    svg.setAttribute("width", String(size));
    svg.setAttribute("height", String(size));
    svg.setAttribute("stroke-width", String(stroke));
  }, [size, stroke]);

  function flash(which: string) {
    setCopied(which);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(null), 1400);
  }

  /** Resolve a tone to a paintable colour, event-time (theme-aware). */
  function resolvedStroke(t: Tone, hex: string | null): string | null {
    if (hex) return hex;
    if (t.css === "currentColor") return null;
    if (t.css.startsWith("var(")) {
      const v = getComputedStyle(document.documentElement)
        .getPropertyValue(t.css.slice(4, -1))
        .trim();
      return v || null;
    }
    return t.css;
  }

  /** Standalone markup at the given settings, minus our page classes. The
      node supplies the paths; every attribute is written from the values
      passed in, so this never depends on the effect above having run. */
  function buildMarkup(sz: number, sw: number, t: Tone, hex: string | null) {
    const el = holderRef.current?.querySelector("svg");
    if (!el) return "";
    const clone = el.cloneNode(true) as SVGSVGElement;
    clone.removeAttribute("class");
    clone.removeAttribute("aria-hidden");
    clone.removeAttribute("style");
    clone.setAttribute("width", String(sz));
    clone.setAttribute("height", String(sz));
    clone.setAttribute("stroke-width", String(sw));
    const strokePaint = resolvedStroke(t, hex);
    if (strokePaint) clone.setAttribute("stroke", strokePaint);
    return clone.outerHTML;
  }

  /* Every control change funnels through here so the SVG snippet tracks the
     stage even before its tab is opened. */
  function update(next: { size?: number; stroke?: number; tone?: Tone; custom?: string | null }) {
    const sz = next.size ?? size;
    const sw = next.stroke ?? stroke;
    const t = next.tone ?? tone;
    const hex = next.custom !== undefined ? next.custom : custom;
    if (next.size !== undefined) setSize(sz);
    if (next.stroke !== undefined) setStroke(sw);
    if (next.tone !== undefined) setTone(t);
    if (next.custom !== undefined) setCustom(hex);
    setSvgStr(buildMarkup(sz, sw, t, hex));
  }

  const reactSnippet = [
    `import { ${name} } from "lucide-react";`,
    "",
    `<${name}`,
    `  size={${size}}`,
    stroke !== 2 ? `  strokeWidth={${stroke}}` : null,
    !custom && tone.jsx ? `  className="${tone.jsx}"` : null,
    custom ? `  color="${custom}"` : null,
    `/>`,
  ]
    .filter((l) => l !== null)
    .join("\n");

  const vueAttrs = [
    `:size="${size}"`,
    stroke !== 2 ? `:stroke-width="${stroke}"` : null,
    !custom && tone.jsx ? `class="${tone.jsx}"` : null,
    custom ? `color="${custom}"` : null,
  ].filter((a) => a !== null);
  const vueSnippet = [
    `<script setup>`,
    `import { ${name} } from "lucide-vue-next";`,
    `</script>`,
    ``,
    `<template>`,
    `  <${name} ${vueAttrs.join(" ")} />`,
    `</template>`,
  ].join("\n");

  const svelteAttrs = [
    `size={${size}}`,
    stroke !== 2 ? `strokeWidth={${stroke}}` : null,
    !custom && tone.jsx ? `class="${tone.jsx}"` : null,
    custom ? `color="${custom}"` : null,
  ].filter((a) => a !== null);
  const svelteSnippet = [
    `<script>`,
    `  import { ${name} } from "lucide-svelte";`,
    `</script>`,
    ``,
    `<${name} ${svelteAttrs.join(" ")} />`,
  ].join("\n");

  const snippets: Record<Framework, string> = {
    react: reactSnippet,
    vue: vueSnippet,
    svelte: svelteSnippet,
    svg: svgStr,
    "data-uri": `data:image/svg+xml;utf8,${encodeURIComponent(svgStr)}`,
  };

  const prompt = React.useMemo(
    () =>
      buildIconPrompt({
        name,
        concept,
        meaning,
        docsUrl,
        size,
        stroke,
        toneClass: custom ? null : tone.jsx,
        toneLabel: tone.label,
        toneHex: custom,
        usedBy,
      }),
    [name, concept, meaning, docsUrl, size, stroke, tone, custom, usedBy],
  );

  async function copyActive() {
    if (framework === "svg" && !svgStr) update({});
    await copyText(snippets[framework]);
    trackEvent(COPY_EVENTS[framework], { label: name });
    flash("copy");
  }

  function kebab() {
    return name.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
  }

  function save(url: string, filename: string) {
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
  }

  function downloadSvg() {
    trackEvent("download_icon", { label: name });
    const blob = new Blob([svgStr || buildMarkup(size, stroke, tone, custom)], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    save(url, `${kebab()}.svg`);
    URL.revokeObjectURL(url);
  }

  /* A fixed 512px render, transparent background: the SVG scales losslessly,
     so the slider's size is about the preview, not the export. */
  async function downloadPng() {
    const src = holderRef.current?.querySelector("svg");
    if (!src) return;
    trackEvent("download_icon_png", { label: name });
    const { toPng } = await import("html-to-image");
    const host = document.createElement("div");
    host.style.cssText =
      "position:fixed;left:-9999px;top:0;width:512px;height:512px;display:grid;place-items:center;";
    host.style.color = getComputedStyle(holderRef.current!).color;
    const clone = src.cloneNode(true) as SVGSVGElement;
    clone.setAttribute("width", "512");
    clone.setAttribute("height", "512");
    clone.setAttribute("stroke-width", String(stroke));
    const strokePaint = resolvedStroke(tone, custom);
    if (strokePaint) clone.setAttribute("stroke", strokePaint);
    host.appendChild(clone);
    document.body.appendChild(host);
    try {
      save(await toPng(host), `${kebab()}.png`);
    } finally {
      host.remove();
    }
  }

  const btn =
    "rounded-lg border border-(--border) px-3 py-1.5 text-xs font-medium transition-colors hover:border-(--primary)/40 hover:bg-(--primary-muted) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--primary)";
  const pill = (active: boolean) =>
    `rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
      active
        ? "bg-(--foreground) text-(--background)"
        : "text-(--muted-foreground) hover:bg-(--muted) hover:text-(--foreground)"
    }`;

  /* Inherit takes its colour from the surface it sits on; anything else is
     explicit. */
  const ink = custom ?? (tone.css === "currentColor" ? bg.ink : tone.css);

  return (
    <div className="overflow-hidden rounded-xl border border-(--border)">
      <div className="grid lg:grid-cols-[1fr_260px]">
        {/* Stage */}
        <div
          className={`flex min-h-[280px] min-w-0 items-center justify-center border-(--border) p-8 transition-colors lg:border-r ${bg.cls}`}
        >
          <span
            ref={holderRef}
            style={{ color: ink }}
            className="grid place-items-center"
            /* A fixed box so changing the size does not move the icon —
               the reader is comparing sizes, not chasing a jumping target. */
          >
            {children}
          </span>
        </div>

        {/* Controls */}
        <div className="space-y-4 p-4">
          <Field label="Size" value={`${size}px`}>
            <input
              type="range"
              min={12}
              max={96}
              step={2}
              value={size}
              onChange={(e) => update({ size: Number(e.target.value) })}
              className="w-full accent-(--primary)"
              aria-label="Size"
            />
          </Field>

          <Field label="Stroke width" value={String(stroke)}>
            <input
              type="range"
              min={1}
              max={3}
              step={0.25}
              value={stroke}
              onChange={(e) => update({ stroke: Number(e.target.value) })}
              className="w-full accent-(--primary)"
              aria-label="Stroke width"
            />
          </Field>

          <div>
            <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-(--muted-foreground)">
              Colour
            </p>
            <div className="flex flex-wrap gap-1.5">
              {TONES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => update({ tone: t, custom: null })}
                  aria-pressed={!custom && t.id === tone.id}
                  className={pill(!custom && t.id === tone.id)}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              {SWATCHES.map((s) => (
                <button
                  key={s.hex}
                  type="button"
                  aria-label={s.name}
                  aria-pressed={custom === s.hex}
                  onClick={() => update({ custom: s.hex })}
                  className={`size-5 rounded-md transition-transform hover:scale-110 ${
                    custom === s.hex
                      ? "ring-2 ring-(--foreground) ring-offset-2 ring-offset-(--background)"
                      : "ring-1 ring-inset ring-black/10 dark:ring-white/20"
                  }`}
                  style={{ background: s.hex }}
                />
              ))}
              {/* One-off brand colours beyond the eight above. */}
              <label
                className="relative grid size-5 cursor-pointer place-items-center rounded-md border border-dashed border-(--muted-foreground) text-[10px] text-(--muted-foreground)"
                style={custom && !SWATCHES.some((s) => s.hex === custom) ? { background: custom } : undefined}
                title="Custom colour"
              >
                {custom && !SWATCHES.some((s) => s.hex === custom) ? "" : "+"}
                <input
                  type="color"
                  value={custom ?? "#7c3aed"}
                  onChange={(e) => update({ custom: e.target.value })}
                  className="absolute inset-0 cursor-pointer opacity-0"
                  aria-label="Custom colour"
                />
              </label>
            </div>
          </div>

          <div>
            <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-(--muted-foreground)">
              Background
            </p>
            <div className="flex flex-wrap gap-1.5">
              {STAGE_BGS.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setBg(b)}
                  aria-pressed={b.id === bg.id}
                  className={pill(b.id === bg.id)}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 border-t border-(--border) pt-3.5">
            <button type="button" onClick={downloadSvg} className={btn}>
              Download SVG
            </button>
            <button type="button" onClick={downloadPng} className={btn}>
              Download PNG
            </button>
          </div>
        </div>
      </div>

      {/* What you would paste, in the framework you would paste it into */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-(--border) px-3 py-2">
        <div aria-label="Snippet format" className="flex flex-wrap gap-0.5">
          {FRAMEWORKS.map((f) => (
            <button
              key={f.id}
              type="button"
              aria-pressed={f.id === framework}
              onClick={() => {
                setFramework(f.id);
                if (!svgStr) update({});
              }}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                f.id === framework
                  ? "bg-(--muted) text-(--foreground)"
                  : "text-(--muted-foreground) hover:text-(--foreground)"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <button type="button" onClick={copyActive} className={btn}>
          {copied === "copy" ? "Copied" : "Copy"}
        </button>
      </div>
      <pre
        className="overflow-x-auto border-t border-(--border) px-4 py-3.5 text-[13px] leading-6"
        style={{ background: "var(--code-bg)", color: "var(--code-fg)" }}
      >
        <code className="font-mono">{snippets[framework]}</code>
      </pre>

      {/* The same three settings, addressed to an agent instead of to a
          clipboard. It carries the one thing Lucide cannot tell it: that this
          concept is drawn with this glyph. */}
      <div className="border-t border-(--border)">
        <AgentPromptCard
          prompt={prompt}
          summary="Agent prompt"
          hint="Follows the size, stroke and colour above — adjust them and the prompt changes with it."
        />
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  children,
}: {
  label: string;
  value: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between">
        <span className="text-[11px] font-medium uppercase tracking-wide text-(--muted-foreground)">
          {label}
        </span>
        <span className="text-[11px] tabular-nums text-(--muted-foreground)">{value}</span>
      </div>
      {children}
    </div>
  );
}
