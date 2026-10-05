"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import * as React from "react";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type ApprovalState = "pending" | "approved" | "denied";

export type ApprovalRequestProps = {
  title: string;
  requester?: string;
  description?: string;
  detail?: string;
  status?: ApprovalState;
  onAllow?: () => void;
  onDeny?: () => void;
  className?: string;
};

/* ------------------------------------------------------------------ */
/* Icons                                                               */
/* ------------------------------------------------------------------ */

function ShieldIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16" {...props}>
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="12" height="12" {...props}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function XIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="12" height="12" {...props}>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* ApprovalRequest                                                     */
/* ------------------------------------------------------------------ */

export function ApprovalRequest({
  title,
  requester,
  description,
  detail,
  status = "pending",
  onAllow,
  onDeny,
  className = "",
}: ApprovalRequestProps) {
  return (
    <Card className={`gap-0 py-0 rounded-xl border border-border bg-card p-4 ${className}`}>
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400">
          <ShieldIcon />
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground">{title}</p>
          {requester && (
            <p className="mt-0.5 text-xs text-muted-foreground">{requester} is requesting approval</p>
          )}
          {description && (
            <p className="mt-1.5 text-sm leading-5 text-muted-foreground">
              {description}
            </p>
          )}
          {detail && (
            <pre className="mt-2 overflow-x-auto rounded-lg bg-muted p-2.5 font-mono text-xs leading-5 text-foreground">
              {detail}
            </pre>
          )}

          {status === "pending" ? (
            <div className="mt-3 flex items-center gap-2">
              <Button variant="default" size="sm"
                type="button"
                onClick={onAllow}

                className="inline-flex h-8 items-center gap-1.5 rounded-md bg-primary px-3.5 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90"
              >
                <CheckIcon />
                Allow
              </Button>
              <Button variant="outline" size="sm"
                type="button"
                onClick={onDeny}
                className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border px-3.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted"
              >
                <XIcon />
                Deny
              </Button>
              <span className="ml-auto text-xs text-muted-foreground">Auto-deny in 4:32</span>
            </div>
          ) : (
            <p
              className={`mt-3 inline-flex items-center gap-1.5 text-xs font-medium ${
                status === "approved"
                  ? /* -700 in light: emerald-600 on white is 3.65:1 at 12px. */
                    "text-emerald-700 dark:text-emerald-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {status === "approved" ? <CheckIcon /> : <XIcon />}
              {status === "approved" ? "Approved — action executed" : "Denied — action blocked"}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
