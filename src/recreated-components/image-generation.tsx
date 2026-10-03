"use client";

import { useEffect, useState } from "react";
import { ImageIcon, RefreshCw } from "lucide-react";

export function ImageGenerationState() {
  const [stage, setStage] = useState<"queued" | "generating" | "ready">("queued");
  useEffect(() => {
    if (stage === "ready") return;
    const timer = window.setTimeout(() => setStage(stage === "queued" ? "generating" : "ready"), stage === "queued" ? 650 : 2200);
    return () => window.clearTimeout(timer);
  }, [stage]);
  return <div className="w-full overflow-hidden rounded-2xl border border-(--border) bg-(--card) shadow-sm">
    <div className="flex items-center justify-between border-b border-(--border) px-4 py-3"><div className="flex items-center gap-2 text-sm font-medium"><ImageIcon size={16} aria-hidden="true" />Image generation</div><span role="status" className="text-xs capitalize text-(--muted-foreground)">{stage}</span></div>
    <div className={`relative flex aspect-[4/3] items-center justify-center overflow-hidden ${stage === "ready" ? "bg-[radial-gradient(circle_at_30%_30%,#e8a5ac,transparent_30%),radial-gradient(circle_at_72%_66%,#7c9eae,transparent_35%),linear-gradient(135deg,#e7d7c7,#ac98ae)]" : "bg-(--stage)"}`}>
      {stage !== "ready" && <div className="absolute inset-0 image-generation-shimmer bg-[linear-gradient(100deg,transparent_20%,rgba(255,255,255,.32)_50%,transparent_80%)]" aria-hidden="true" />}
      <div className="relative text-center">{stage === "ready" ? <span className="rounded-full bg-black/40 px-3 py-1 text-xs text-white">Preview ready</span> : <><ImageIcon size={28} className="mx-auto text-(--muted-foreground)" aria-hidden="true" /><p className="mt-3 text-xs text-(--muted-foreground)">{stage === "queued" ? "Queued…" : "Creating preview…"}</p></>}</div>
    </div>
    <div className="flex items-center justify-between gap-3 px-4 py-3"><p className="text-xs text-(--muted-foreground)">Preview uses a local gradient. Connect your image API for real output.</p><button type="button" onClick={() => setStage("queued")} className="inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-lg px-2 text-xs hover:bg-(--primary-muted) focus-visible:outline-2 focus-visible:outline-offset-2"><RefreshCw size={13} aria-hidden="true" />Retry</button></div>
    <style>{`@media (prefers-reduced-motion: no-preference) { @keyframes image-generation-shimmer { from { transform: translateX(-100%) } to { transform: translateX(100%) } } .image-generation-shimmer { animation: image-generation-shimmer 1.5s ease-in-out infinite; } }`}</style>
  </div>;
}
