import * as React from "react";

type FrameProps = { children: React.ReactNode };

export function BrowserFrame({ children }: FrameProps) {
  return (
    <div className="overflow-hidden rounded-xl" style={{ background: "#1e1e1e" }}>
      {/* Title bar */}
      <div className="flex items-center gap-2 px-3 py-2">
        <div className="flex gap-1.5">
          <div className="h-3 w-3 rounded-full" style={{ background: "#ff5f57" }} />
          <div className="h-3 w-3 rounded-full" style={{ background: "#febc2e" }} />
          <div className="h-3 w-3 rounded-full" style={{ background: "#28c840" }} />
        </div>
        <div
          className="mx-2 flex-1 rounded-md px-3 py-1 text-center text-xs"
          style={{ background: "#2d2d2d", color: "#999" }}
        >
          localhost:3000
        </div>
      </div>
      {/* Content */}
      <div className="overflow-hidden">{children}</div>
    </div>
  );
}

export function IPhone15ProFrame({ children }: FrameProps) {
  return (
    <div
      className="relative overflow-hidden rounded-[2.5rem] border-[6px]"
      style={{ borderColor: "#1a1a1a", background: "#000", maxWidth: 320 }}
    >
      {/* Dynamic Island */}
      <div className="absolute left-1/2 top-2 z-10 h-[22px] w-[90px] -translate-x-1/2 rounded-full bg-black" />
      {/* Status bar */}
      <div
        className="flex items-center justify-between px-6 py-3 text-[10px] font-medium"
        style={{ background: "#000", color: "#fff" }}
      >
        <span>9:41</span>
        <div className="flex items-center gap-1">
          <svg width="14" height="10" viewBox="0 0 14 10" fill="white">
            <rect x="0" y="6" width="2.5" height="4" rx="0.5" />
            <rect x="3.5" y="4" width="2.5" height="6" rx="0.5" />
            <rect x="7" y="2" width="2.5" height="8" rx="0.5" />
            <rect x="10.5" y="0" width="2.5" height="10" rx="0.5" />
          </svg>
          <svg width="18" height="10" viewBox="0 0 18 10" fill="none" stroke="white" strokeWidth="1">
            <rect x="0.5" y="0.5" width="15" height="9" rx="2" />
            <rect x="16" y="3" width="1.5" height="4" rx="0.5" fill="white" />
            <rect x="2" y="2" width="10" height="6" rx="1" fill="white" />
          </svg>
        </div>
      </div>
      {/* Content */}
      <div className="overflow-hidden">{children}</div>
      {/* Home indicator */}
      <div className="flex justify-center py-2" style={{ background: "#000" }}>
        <div className="h-1 w-24 rounded-full bg-white/30" />
      </div>
    </div>
  );
}

export function MacBookFrame({ children }: FrameProps) {
  return (
    <div>
      {/* Screen */}
      <div
        className="overflow-hidden rounded-t-xl border-[8px]"
        style={{ borderColor: "#1a1a1a", background: "#1a1a1a" }}
      >
        {/* Camera */}
        <div className="flex justify-center py-1" style={{ background: "#1a1a1a" }}>
          <div className="h-2 w-2 rounded-full" style={{ background: "#333" }} />
        </div>
        <div className="overflow-hidden">{children}</div>
      </div>
      {/* Bottom chin */}
      <div
        className="mx-auto h-3 rounded-b-lg"
        style={{ background: "#2d2d2d", width: "110%", maxWidth: "110%", marginLeft: "-5%", marginRight: "-5%" }}
      />
      {/* Base */}
      <div
        className="mx-auto h-1 rounded-b"
        style={{ background: "#1a1a1a", width: "40%" }}
      />
    </div>
  );
}

export function IPadFrame({ children }: FrameProps) {
  return (
    <div
      className="overflow-hidden rounded-[1.2rem] border-[8px]"
      style={{ borderColor: "#1a1a1a", background: "#000" }}
    >
      {/* Camera */}
      <div className="flex justify-center py-1.5" style={{ background: "#000" }}>
        <div className="h-2 w-2 rounded-full" style={{ background: "#222" }} />
      </div>
      <div className="overflow-hidden">{children}</div>
      <div className="py-1" style={{ background: "#000" }} />
    </div>
  );
}

export function GenericPhoneFrame({ children }: FrameProps) {
  return (
    <div
      className="overflow-hidden rounded-[2rem] border-[5px]"
      style={{ borderColor: "#333", background: "#000", maxWidth: 300 }}
    >
      {/* Top speaker */}
      <div className="flex justify-center py-2" style={{ background: "#000" }}>
        <div className="h-1 w-12 rounded-full bg-white/20" />
      </div>
      <div className="overflow-hidden">{children}</div>
      <div className="py-2" style={{ background: "#000" }} />
    </div>
  );
}

export const FRAME_COMPONENTS: Record<string, React.ComponentType<FrameProps>> = {
  browser: BrowserFrame,
  iphone15pro: IPhone15ProFrame,
  macbook: MacBookFrame,
  ipad: IPadFrame,
  "generic-phone": GenericPhoneFrame,
};
