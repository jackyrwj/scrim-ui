"use client";

import * as React from "react";
import { copyText } from "@/lib/clipboard";
import { trackEvent } from "@/lib/analytics";

/**
 * The icon, editable.
 *
 * Size, stroke and colour are applied to the *rendered* SVG rather than by
 * re-invoking the Lucide component, because a Lucide component is a function
 * and cannot cross the RSC boundary as a prop — only the element can. Looking
 * it up by name on the client instead would mean shipping the icon set (2,034
 * of them) to change a stroke width.
 *
 * So the server renders it once, and this mutates three attributes on the node
 * it produced. Everything the reader copies is then serialised straight back
 * out of that same node, which is exact by construction: what you see is
 * literally what lands on the clipboard.
 */
type Tone = { id: string; label: string; css: string; jsx: string | null };

const TONES: Tone[] = [
  { id: "current", label: "Inherit", css: "currentColor", jsx: null },
  { id: "primary", label: "Primary", css: "var(--primary)", jsx: "text-(--primary)" },
  { id: "muted", label: "Muted", css: "var(--muted-foreground)", jsx: "text-(--muted-foreground)" },
  { id: "success", label: "Success", css: "#10b981", jsx: "text-emerald-500" },
  { id: "danger", label: "Danger", css: "#ef4444", jsx: "text-red-500" },
];

export function IconEditor({
  name,
  children,
}: {
  /** Lucide's export name, e.g. "Wrench" — used for the import line. */
  name: string;
  /** The icon element, already rendered by the server. */
  children: React.ReactNode;
}) {
  const holderRef = React.useRef<HTMLSpanElement>(null);
  const [size, setSize] = React.useState(48);
  const [stroke, setStroke] = React.useState(2);
  const [tone, setTone] = React.useState(TONES[0]);
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

  /** Standalone markup, at the settings on screen, minus our page classes. */
  function markup() {
    const el = holderRef.current?.querySelector("svg");
    if (!el) return "";
    const clone = el.cloneNode(true) as SVGSVGElement;
    clone.removeAttribute("class");
    clone.removeAttribute("aria-hidden");
    clone.removeAttribute("style");
    if (tone.css !== "currentColor") clone.setAttribute("stroke", tone.css);
    return clone.outerHTML;
  }

  const jsx = [
    `import { ${name} } from "lucide-react";`,
    "",
    `<${name}`,
    `  size={${size}}`,
    stroke !== 2 ? `  strokeWidth={${stroke}}` : null,
    tone.jsx ? `  className="${tone.jsx}"` : null,
    `/>`,
  ]
    .filter((l) => l !== null)
    .join("\n");

  async function copy(kind: "svg" | "jsx") {
    await copyText(kind === "svg" ? markup() : jsx);
    trackEvent(kind === "svg" ? "copy_icon_svg" : "copy_icon_jsx", { label: name });
    flash(kind);
  }

  function download() {
    trackEvent("download_icon", { label: name });
    const url = URL.createObjectURL(new Blob([markup()], { type: "image/svg+xml" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `${name.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase()}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const btn =
    "rounded-lg border border-(--border) px-3 py-1.5 text-xs font-medium transition-colors hover:border-(--primary)/40 hover:bg-(--primary-muted) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--primary)";

  return (
    <div className="overflow-hidden rounded-xl border border-(--border)">
      <div className="grid lg:grid-cols-[1fr_260px]">
        {/* Stage */}
        <div className="flex min-h-[280px] min-w-0 items-center justify-center border-(--border) bg-(--muted)/30 p-8 lg:border-r">
          <span
            ref={holderRef}
            style={{ color: tone.css }}
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
              onChange={(e) => setSize(Number(e.target.value))}
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
              onChange={(e) => setStroke(Number(e.target.value))}
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
                  onClick={() => setTone(t)}
                  aria-pressed={t.id === tone.id}
                  className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                    t.id === tone.id
                      ? "bg-(--foreground) text-(--background)"
                      : "text-(--muted-foreground) hover:bg-(--muted) hover:text-(--foreground)"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 border-t border-(--border) pt-3.5">
            <button type="button" onClick={() => copy("svg")} className={btn}>
              {copied === "svg" ? "Copied" : "Copy SVG"}
            </button>
            <button type="button" onClick={() => copy("jsx")} className={btn}>
              {copied === "jsx" ? "Copied" : "Copy JSX"}
            </button>
            <button type="button" onClick={download} className={btn}>
              Download
            </button>
          </div>
        </div>
      </div>

      {/* What you would paste */}
      <pre
        className="overflow-x-auto border-t border-(--border) px-4 py-3.5 text-[13px] leading-6"
        style={{ background: "var(--code-bg)", color: "var(--code-fg)" }}
      >
        <code className="font-mono">{jsx}</code>
      </pre>
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
