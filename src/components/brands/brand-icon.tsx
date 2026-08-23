import * as React from "react";
import { brandData, resolveBrand } from "@/lib/brands";

/**
 * Brand logo for a product name. Renders an inline SVG (theme-aware, uses the
 * muted foreground color so it reads in light + dark) or a two-letter avatar
 * for brands we don't ship a mark for. Pure component — safe in server and
 * client contexts.
 *
 * Decorative by default: every call site puts the mark next to the brand name
 * in text, so labelling the SVG too would just say the name twice. Pass
 * `label` when the mark stands alone.
 *
 * `tone="current"` inherits the surrounding text color instead of the muted
 * one, for marks inside an already-colored pill or an inverted chip.
 */
export function BrandIcon({
  name,
  size = 20,
  tone = "muted",
  label,
  className = "",
}: {
  name: string;
  size?: number;
  tone?: "muted" | "current";
  label?: string;
  className?: string;
}) {
  const key = resolveBrand(name);
  const data = key ? brandData[key] : undefined;
  const color = tone === "current" ? "text-current" : "text-(--muted-foreground)";
  const a11y = label
    ? ({ role: "img", "aria-label": label } as const)
    : ({ "aria-hidden": true } as const);

  if (!data) {
    const initials = name.trim().slice(0, 2).toUpperCase();
    return (
      <span
        {...a11y}
        className={`inline-flex shrink-0 select-none items-center justify-center rounded-md bg-(--muted) font-bold ${color} ${className}`}
        style={{ width: size, height: size, fontSize: Math.max(8, size * 0.42) }}
      >
        {initials}
      </span>
    );
  }

  return (
    <svg
      {...a11y}
      viewBox={data.viewBox}
      width={size}
      height={size}
      className={`shrink-0 fill-current ${color} ${className}`}
      dangerouslySetInnerHTML={{ __html: data.body }}
    />
  );
}
