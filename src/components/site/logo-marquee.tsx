"use client";

import { BrandIcon } from "@/components/brands/brand-icon";

type Vendor = { name: string; blurb: string };

export function LogoMarquee({ vendors }: { vendors: Vendor[] }) {
  const items = [...vendors, ...vendors];

  return (
    <div className="logo-marquee relative overflow-hidden py-8 sm:py-10">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-(--background) to-transparent sm:w-24" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-(--background) to-transparent sm:w-24" />

      <div className="logo-marquee-track flex w-max gap-x-10 sm:gap-x-14">
        {items.map((v, i) => (
          <span
            key={`${v.name}-${i}`}
            title={v.blurb}
            className="flex shrink-0 items-center gap-2.5 text-(--muted-foreground) transition-colors hover:text-(--foreground)"
          >
            <BrandIcon name={v.name} size={20} />
            <span className="whitespace-nowrap text-sm font-medium">{v.name}</span>
          </span>
        ))}
      </div>

      <style>{`
        .logo-marquee-track {
          animation: marquee-scroll 30s linear infinite;
        }
        .logo-marquee:hover .logo-marquee-track {
          animation-play-state: paused;
        }
        @keyframes marquee-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
