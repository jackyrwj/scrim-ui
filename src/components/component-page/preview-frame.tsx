import * as React from "react";

export function PreviewFrame({
  title,
  children,
  action,
}: {
  title?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-(--border) bg-(--card)">
      {(title || action) && (
        <div className="flex items-center justify-between border-b border-(--border) px-4 py-2.5">
          <span className="text-xs font-medium text-(--muted-foreground)">{title}</span>
          {action}
        </div>
      )}
      <div className="flex items-center justify-center bg-(--muted)/50 px-4 py-10 sm:px-8">
        <div className="w-full max-w-xl">{children}</div>
      </div>
    </div>
  );
}
