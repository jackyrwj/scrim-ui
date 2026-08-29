"use client";

import * as React from "react";
import { EditDiffView, type DiffSegment } from "./edit-diff-view";

/* The same edit the model would send: context verbatim, one edit segment per
   hunk, ids assigned before anything arrives. */
export const SEGMENTS: DiffSegment[] = [
  { type: "context", text: "# Getting started\n\n" },
  {
    type: "edit",
    id: "hunk-install",
    context: "Install command",
    original: "Run `npm install` and then `npm run dev` to start the development server on port 3000.",
    edited: "Run `pnpm install` and then `pnpm dev` to start the development server on port 3000.",
  },
  { type: "context", text: "\n## Limits\n\n" },
  {
    type: "edit",
    id: "hunk-limits",
    context: "Free tier",
    original: "The free tier includes 1,000 requests per month and community support.",
    edited:
      "The free tier includes 10,000 requests per month, community support, and access to the shared playground.",
  },
  { type: "context", text: "\n## Enterprise\n\n" },
  {
    type: "edit",
    id: "hunk-enterprise",
    context: "Enterprise",
    original: "Contact sales for on-premise deployment.",
    edited: "Contact sales for on-premise deployment, SSO, and audit logs.",
  },
];

const LAST_HUNK_FULL =
  "Contact sales for on-premise deployment, SSO, and audit logs.";

/** SEGMENTS with the last hunk still arriving: its replacement is truncated
 *  and it is not decidable yet. */
export function streamingSegments(arrived: number): DiffSegment[] {
  return [
    ...SEGMENTS.slice(0, -1),
    {
      type: "edit",
      id: "hunk-enterprise",
      context: "Enterprise",
      original: "Contact sales for on-premise deployment.",
      edited: LAST_HUNK_FULL.slice(0, arrived),
      complete: arrived >= LAST_HUNK_FULL.length,
    },
  ];
}

export function DemoDefault() {
  return <EditDiffView segments={SEGMENTS} fileName="docs/getting-started.md" />;
}

/* The last hunk streams in a few characters at a time, and its Accept/Reject
   buttons stay disabled until the replacement has finished arriving. */
export function DemoStreaming() {
  const [arrived, setArrived] = React.useState(0);

  React.useEffect(() => {
    let n = 0;
    const timer = setInterval(() => {
      n = Math.min(n + 2, LAST_HUNK_FULL.length);
      setArrived(n);
      if (n >= LAST_HUNK_FULL.length) clearInterval(timer);
    }, 50);
    return () => clearInterval(timer);
  }, []);

  const segments = React.useMemo(() => streamingSegments(arrived), [arrived]);

  return (
    <EditDiffView
      segments={segments}
      fileName="docs/getting-started.md"
      streaming={arrived < LAST_HUNK_FULL.length}
    />
  );
}

const CODE_SEGMENTS: DiffSegment[] = [
  { type: "context", text: "import { useEffect, useState } from \"react\";\n\n" },
  {
    type: "edit",
    id: "hunk-cleanup",
    context: "useDebouncedValue — missing cleanup",
    original:
      "  useEffect(() => {\n    const id = setTimeout(() => setDebounced(value), delay);\n  }, [value, delay]);",
    edited:
      "  useEffect(() => {\n    const id = setTimeout(() => setDebounced(value), delay);\n    return () => clearTimeout(id);\n  }, [value, delay]);",
  },
  { type: "context", text: "\n  return debounced;\n}\n" },
];

/* A code edit: the added line has no pair on the removed side, so it marks
   whole-line rather than guessing an alignment. */
export function DemoCodeEdit() {
  return <EditDiffView segments={CODE_SEGMENTS} fileName="lib/use-debounced-value.ts" />;
}

export function DemoWholeFile() {
  return (
    <EditDiffView
      segments={SEGMENTS}
      fileName="docs/getting-started.md"
      collapseContext={false}
    />
  );
}
