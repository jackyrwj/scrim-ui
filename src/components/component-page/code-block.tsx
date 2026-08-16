import * as React from "react";

export function CodeBlock({ code, lang = "tsx" }: { code: string; lang?: string }) {
  return (
    <div className="overflow-hidden rounded-xl border border-(--border) bg-zinc-950 dark:bg-zinc-900">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
        <span className="text-xs font-medium text-zinc-400">{lang}</span>
      </div>
      <pre className="max-h-[480px] overflow-auto p-4 text-[13px] leading-6 text-zinc-100">
        <code>{code}</code>
      </pre>
    </div>
  );
}
