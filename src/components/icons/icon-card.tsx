"use client";

import * as React from "react";
import Link from "next/link";
import { copyText } from "@/lib/clipboard";
import { trackEvent } from "@/lib/analytics";

/**
 * One row of the icon guide, with the three things people actually do with an
 * icon: copy its markup, copy the import, or save the file.
 *
 * The SVG is read back out of the DOM with `outerHTML` rather than being stored
 * as a string anywhere. The icon is already rendered on the page, so serialising
 * it is exact by construction and cannot drift from what the reader sees — and
 * it keeps `lucide-static` out of the dependency list just to obtain markup we
 * already have.
 *
 * The icon arrives as `children`, already rendered by the server. A Lucide
 * component is a function and cannot cross the RSC boundary as a prop; an
 * element can. That is also why the ref sits on the wrapper rather than the svg.
 */
export function IconCard({
  concept,
  slug,
  meaning,
  name,
  components,
  children,
}: {
  concept: string;
  /** Passed in rather than derived here, so the card stays a dumb renderer. */
  slug: string;
  /** Omitted by the homepage, which shows eight cards as a teaser and leaves
   *  the sentence to /icons and /icons/[slug] — where it is also the page's
   *  meta description. Nothing unique to the site is lost by dropping it. */
  meaning?: string;
  /** Lucide's export name, e.g. "Wrench". Used for the JSX snippet. */
  name: string;
  components: { slug: string; name: string }[];
  /** The rendered icon element, from the server. */
  children: React.ReactNode;
}) {
  const holderRef = React.useRef<HTMLSpanElement>(null);
  const [done, setDone] = React.useState<"svg" | "jsx" | null>(null);
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  function flash(which: "svg" | "jsx") {
    setDone(which);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setDone(null), 1400);
  }

  /** Standalone markup: strip the classes we style the page with. */
  function markup() {
    const el = holderRef.current?.querySelector("svg");
    if (!el) return "";
    const clone = el.cloneNode(true) as SVGSVGElement;
    clone.removeAttribute("class");
    clone.removeAttribute("aria-hidden");
    clone.setAttribute("width", "24");
    clone.setAttribute("height", "24");
    return clone.outerHTML;
  }

  async function copySvg() {
    await copyText(markup());
    trackEvent("copy_icon_svg", { label: name });
    flash("svg");
  }

  async function copyJsx() {
    await copyText(`import { ${name} } from "lucide-react";\n\n<${name} size={16} />`);
    trackEvent("copy_icon_jsx", { label: name });
    flash("jsx");
  }

  function download() {
    trackEvent("download_icon", { label: name });
    const blob = new Blob([markup()], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${name.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase()}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const btn =
    "relative z-10 rounded-md px-2 py-1 text-[11px] font-medium text-(--muted-foreground) transition-colors hover:bg-(--muted) hover:text-(--foreground) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--primary)";

  return (
    <div className="group relative flex flex-col gap-3 rounded-xl border border-(--border) bg-(--card) p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-(--primary)/40">
      <div className="flex items-start gap-3">
        <span
          ref={holderRef}
          className="mt-0.5 shrink-0 text-(--primary) transition-transform duration-300 group-hover:scale-115"
        >
          {children}
        </span>
        <div className="min-w-0">
          {/* Stretched link: the whole card opens the icon's page, while the
              copy buttons below stay separately clickable via z-10. */}
          <p className="text-sm font-medium">
            <Link href={`/icons/${slug}`} className="after:absolute after:inset-0 after:content-['']">
              {concept}
            </Link>
          </p>
          {/* Two lines, always: clamped so one long meaning cannot set the
              row's height, and reserved so the component tags below start at
              the same y in every card — a clamp alone still lets a short
              meaning ride up and knock the tag row out of line.

              CSS clipping, not a truncated string: the full text stays in the
              markup, so this costs nothing at /icons/[slug], where the same
              sentence is the page's meta description. */}
          {meaning && (
            <p className="mt-0.5 line-clamp-2 min-h-[2lh] text-xs leading-relaxed text-(--muted-foreground)">
              {meaning}
            </p>
          )}
        </div>
        {/* Full foreground, not muted: --muted-foreground on --muted measures
            4.39:1, under the 4.5:1 floor. It is also the name you copy, so it
            earns the contrast. */}
        <code className="ml-auto shrink-0 rounded-md bg-(--muted) px-1.5 py-0.5 font-mono text-[10px] text-(--foreground)">
          {name}
        </code>
      </div>

      {components.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {components.map((c) => (
            <Link
              key={c.slug}
              href={`/components/${c.slug}`}
              className="relative z-10 rounded-md border border-(--border) px-1.5 py-0.5 text-[10px] text-(--muted-foreground) transition-colors hover:border-(--primary)/40 hover:text-(--foreground)"
            >
              {c.name}
            </Link>
          ))}
        </div>
      )}

      <div className="-mx-1 mt-auto flex items-center gap-0.5 border-t border-(--border) pt-2.5">
        <button type="button" onClick={copySvg} className={btn}>
          {done === "svg" ? "Copied" : "Copy SVG"}
        </button>
        <button type="button" onClick={copyJsx} className={btn}>
          {done === "jsx" ? "Copied" : "Copy JSX"}
        </button>
        <button type="button" onClick={download} className={btn}>
          Download
        </button>
      </div>
    </div>
  );
}
