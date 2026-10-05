"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import * as React from "react";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type UserMessageProps = {
  text: string;
  /** Shows an "Edited" chip next to the sender name. */
  edited?: boolean;
  showActions?: boolean;
  onCopy?: () => void;
  onEdit?: () => void;
  onRegenerate?: () => void;
  avatar?: React.ReactNode;
  className?: string;
};

/* ------------------------------------------------------------------ */
/* Icons                                                               */
/* ------------------------------------------------------------------ */

function CopyIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    </svg>
  );
}

function RegenerateIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
      <path d="M21 12a9 9 0 1 1-2.64-6.36L21 8" />
      <path d="M21 3v5h-5" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* UserMessage                                                         */
/* ------------------------------------------------------------------ */

export function UserMessage({
  text,
  edited = false,
  showActions = true,
  onCopy,
  onEdit,
  onRegenerate,
  avatar,
  className = "",
}: UserMessageProps) {
  const [copied, setCopied] = React.useState(false);

  const copy = () => {
    onCopy?.();
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className={`flex items-start justify-end gap-3 ${className}`}>
      <div className="min-w-0 max-w-[85%]">
        <div className="flex flex-wrap items-center justify-end gap-2">
          <span className="text-sm font-medium">You</span>
          {edited && (
            <Badge variant="secondary" className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              Edited
            </Badge>
          )}
        </div>

        <div className="mt-1.5 whitespace-pre-wrap rounded-xl bg-muted px-4 py-3 text-sm leading-6 text-foreground">
          {text}
        </div>

        {showActions && (onCopy || onEdit || onRegenerate) && (
          <div className="mt-2 flex items-center justify-end gap-1">
            {onCopy && (
              <Button variant="ghost" size="sm"
                type="button"
                onClick={copy}
                className="inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <CopyIcon />
                {copied ? "Copied" : "Copy"}
              </Button>
            )}
            {onEdit && (
              <Button variant="ghost" size="sm"
                type="button"
                onClick={onEdit}
                className="inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <EditIcon />
                Edit
              </Button>
            )}
            {onRegenerate && (
              <Button variant="ghost" size="sm"
                type="button"
                onClick={onRegenerate}
                className="inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <RegenerateIcon />
                Regenerate
              </Button>
            )}
          </div>
        )}
      </div>

      {avatar && <div className="shrink-0">{avatar}</div>}
    </div>
  );
}
