import * as React from "react";
import { brandData, resolveBrand, resolveModelBrand, type BrandData } from "@/lib/brands";

type Tone = "brand" | "muted" | "current";

/**
 * Tones:
 * - `brand` (default) — the official brand color, adjusted per appearance so
 *   black wordmarks don't vanish on our dark background and pale marks don't
 *   wash out on white. The two values ride in as custom properties and
 *   `.brand-mark` in globals.css picks the right one; see src/lib/brands.ts.
 * - `muted` — the theme's muted foreground, for dense lists where fifty
 *   competing brand colors would read as noise.
 * - `current` — inherits the surrounding text color, for marks inside an
 *   already-colored pill or an inverted chip.
 */
function toneClass(tone: Tone) {
  if (tone === "current") return "text-current";
  if (tone === "muted") return "text-(--muted-foreground)";
  return "brand-mark";
}

function Mark({
  data,
  size,
  tone,
  label,
  className,
}: {
  data: BrandData;
  size: number;
  tone: Tone;
  label?: string;
  className: string;
}) {
  const cls = toneClass(tone);
  return (
    <svg
      {...(label ? { role: "img", "aria-label": label } : { "aria-hidden": true })}
      viewBox={data.viewBox}
      width={size}
      height={size}
      style={
        cls === "brand-mark"
          ? ({ "--brand-light": data.light, "--brand-dark": data.dark } as React.CSSProperties)
          : undefined
      }
      className={`shrink-0 fill-current ${cls} ${className}`}
      dangerouslySetInnerHTML={{ __html: data.body }}
    />
  );
}

/**
 * Brand logo for a product name. Renders an inline SVG, or a two-letter avatar
 * for brands we don't ship a mark for. Pure component — safe in server and
 * client contexts.
 *
 * Decorative by default: every call site puts the mark next to the brand name
 * in text, so labelling the SVG too would just say the name twice. Pass
 * `label` when the mark stands alone.
 */
export function BrandIcon({
  name,
  size = 20,
  tone = "brand",
  label,
  className = "",
}: {
  name: string;
  size?: number;
  tone?: Tone;
  label?: string;
  className?: string;
}) {
  const key = resolveBrand(name);
  const data = key ? brandData[key] : undefined;

  if (!data) {
    // The avatar fallback never takes a brand color — there is no mark to
    // color, and inventing one would imply a logo we don't have.
    const initials = name.trim().slice(0, 2).toUpperCase();
    return (
      <span
        {...(label ? { role: "img", "aria-label": label } : { "aria-hidden": true })}
        // Initials sit at ~8px inside a muted chip, so they take the full
        // foreground color — muted-on-muted at that size fails contrast.
        className={`inline-flex shrink-0 select-none items-center justify-center rounded-md bg-(--muted) font-bold ${
          tone === "current" ? "text-current" : "text-(--foreground)"
        } ${className}`}
        style={{ width: size, height: size, fontSize: Math.max(8, size * 0.42) }}
      >
        {initials}
      </span>
    );
  }

  return <Mark data={data} size={size} tone={tone} label={label} className={className} />;
}

/**
 * Provider mark for a MODEL name — "Claude Opus 5", "GPT-5.6 Sol", "Gemini 3.1 Pro".
 * Resolves through the model-prefix table rather than the exact brand lookup.
 *
 * Renders nothing for a name we can't place, because model lists are often
 * user-supplied (the mockup and switcher builders let you type any name) and a
 * two-letter avatar next to "My fine-tune" reads as a broken logo rather than a
 * deliberate blank.
 */
export function ModelIcon({
  name,
  size = 14,
  tone = "brand",
  className = "",
}: {
  name: string;
  size?: number;
  tone?: Tone;
  className?: string;
}) {
  const key = resolveModelBrand(name);
  if (!key) return null;
  return <Mark data={brandData[key]} size={size} tone={tone} className={className} />;
}

/**
 * Inject a provider mark into each option of a model list, resolved from each
 * option's own name. Model lists are defined as plain data all over the site;
 * this keeps the icon next to the name it is derived from instead of repeating
 * `icon: <ModelIcon name="..." />` on every entry.
 */
export function withModelIcons<T extends { name: string }>(
  options: readonly T[],
  size = 14,
): (T & { icon: React.ReactNode })[] {
  return options.map((o) => ({ ...o, icon: <ModelIcon name={o.name} size={size} /> }));
}
