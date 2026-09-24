"use client";

import { useEffect, useRef } from "react";

const ZONE_KEY = "9ea9ed85a4b75afcfbf32355563700fb";
const SCRIPT_SRC = `https://www.highrevenueformat.com/${ZONE_KEY}/invoke.js`;

declare global {
  interface Window {
    atOptions?: {
      key: string;
      format: string;
      height: number;
      width: number;
      params: Record<string, never>;
    };
  }
}

export function AdsterraBanner() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    window.atOptions = {
      key: ZONE_KEY,
      format: "iframe",
      height: 90,
      width: 728,
      params: {},
    };

    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    host.appendChild(script);

    return () => {
      host.replaceChildren();
      delete window.atOptions;
    };
  }, []);

  return (
    <aside aria-label="Advertisement" className="mt-14 hidden flex-col items-center md:flex">
      <span className="mb-2 text-[10px] uppercase tracking-[0.16em] text-(--muted-foreground)">
        Advertisement
      </span>
      <div ref={hostRef} className="h-[90px] w-[728px] overflow-hidden" />
    </aside>
  );
}
