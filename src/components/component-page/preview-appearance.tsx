"use client";

import { useState } from "react";
import { Sun, Moon } from "lucide-react";

export function PreviewAppearance({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  return (
    <section id="preview" className="mt-10 scroll-mt-24">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="text-base font-medium">Preview</h2>
        <div className="inline-flex rounded-full bg-(--primary-muted) p-1" role="group" aria-label="Preview appearance">
          <button type="button" aria-pressed={theme === "light"} onClick={() => setTheme("light")} className={`inline-flex min-h-7 items-center gap-1.5 rounded-full px-3 text-xs transition-colors ${theme === "light" ? "bg-(--card) text-(--foreground) shadow-sm" : "text-(--muted-foreground)"}`}><Sun size={13} aria-hidden="true" />Light</button>
          <button type="button" aria-pressed={theme === "dark"} onClick={() => setTheme("dark")} className={`inline-flex min-h-7 items-center gap-1.5 rounded-full px-3 text-xs transition-colors ${theme === "dark" ? "bg-(--card) text-(--foreground) shadow-sm" : "text-(--muted-foreground)"}`}><Moon size={13} aria-hidden="true" />Dark</button>
        </div>
      </div>
      <div data-theme={theme} className="preview-surface flex min-h-80 items-center justify-center overflow-x-auto rounded-xl border border-(--border) px-5 py-12 sm:px-10">
        <div className="w-full min-w-0 max-w-xl">{children}</div>
      </div>
    </section>
  );
}
