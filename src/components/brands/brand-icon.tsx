import * as React from "react";
import { brandData, resolveBrand } from "@/lib/brands";

/**
 * Brand logo for a product name. Renders an inline SVG (theme-aware, uses the
 * muted foreground color so it reads in light + dark) or a two-letter avatar
 * for brands we don't ship an SVG for. Pure component — safe in server and
 * client contexts.
 */
export function BrandIcon({
  name,
  size = 20,
  className = "",
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  const key = resolveBrand(name);
  const data = key ? brandData[key] : undefined;

  if (!data) {
    const initials = name.trim().slice(0, 2).toUpperCase();
    return (
      <span
        aria-hidden
        className={`inline-flex shrink-0 select-none items-center justify-center rounded-md bg-(--muted) font-bold text-(--muted-foreground) ${className}`}
        style={{ width: size, height: size, fontSize: Math.max(8, size * 0.42) }}
      >
        {initials}
      </span>
    );
  }

  return (
    <svg
      viewBox={data.viewBox}
      width={size}
      height={size}
      role="img"
      aria-label={name}
      className={`shrink-0 fill-current text-(--muted-foreground) ${className}`}
      dangerouslySetInnerHTML={{ __html: data.body }}
    />
  );
}
