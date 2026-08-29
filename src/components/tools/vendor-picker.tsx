"use client";

import { BrandIcon } from "@/components/brands/brand-icon";

/* Vendor logo buttons shared by the /tools pages — the functional successor
   of the old homepage logo marquee. Two modes: pass `active` for a toggle
   group (pricing calculator, token counter), or omit it for one-shot action
   buttons (model switcher's "start from a provider" lineup loader). */
export function VendorPicker<T extends string>({
  vendors,
  active,
  onSelect,
}: {
  vendors: readonly T[];
  active?: ReadonlySet<T>;
  onSelect: (vendor: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {vendors.map((v) => {
        const isActive = active?.has(v) ?? false;
        return (
          <button
            key={v}
            type="button"
            onClick={() => onSelect(v)}
            {...(active ? { "aria-pressed": isActive } : {})}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors ${
              active && isActive
                ? "border-(--foreground) text-(--foreground)"
                : "border-(--border) text-(--muted-foreground) hover:text-(--foreground)"
            }`}
          >
            <BrandIcon
              name={v}
              size={14}
              tone={!active || isActive ? "brand" : "muted"}
            />
            {v}
          </button>
        );
      })}
    </div>
  );
}
